<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Letter;
use Illuminate\Support\Facades\Auth;

class LetterController extends Controller
{
    /**
     * Display a listing of letters
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        if ($user->isAdmin()) {
            // Admin can see all letters
            $letters = Letter::with(['user', 'letterType'])->latest()->paginate(15);
        } else {
            // Staff can only see their own letters
            $letters = Letter::with(['user', 'letterType'])
                ->where('user_id', $user->id)
                ->latest()
                ->paginate(15);
        }

        return response()->json($letters);
    }

    /**
     * Store a newly created letter
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'letter_type_id' => 'nullable|exists:letter_types,id',
            'fields' => 'nullable|array',
            'status' => 'nullable|string|in:draft,pending,approved,rejected',
        ]);

        $fields = (array) $request->input('fields', []);
        $title = trim((string) $request->input('title'));
        $content = trim((string) $request->input('content'));

        $letter = Letter::create([
            'user_id' => $user->id,
            'title' => $title,
            'content' => $content,
            'letter_type_id' => $request->input('letter_type_id'),
            'fields' => $fields,
            'status' => $request->input('status', 'draft'),
        ]);

        return response()->json([
            'letter' => $letter->load(['user', 'letterType']),
            'message' => 'Letter created successfully'
        ], 201);
    }

    /**
     * Display the specified letter
     */
    public function show(Letter $letter)
    {
        $user = Auth::user();
        
        // Check if user can view this letter
        if (!$user->isAdmin() && $letter->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($letter->load(['user', 'letterType']));
    }

    /**
     * Update the specified letter
     */
    public function update(Request $request, Letter $letter)
    {
        $user = Auth::user();
        
        // Check if user can edit this letter
        if (!$user->isAdmin() && $letter->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
            'status' => 'sometimes|required|string|in:draft,pending,approved,rejected',
            'fields' => 'sometimes|nullable|array',
        ]);

        $letter->update($request->only(['title', 'content', 'status', 'fields']));

        return response()->json([
            'letter' => $letter->load(['user', 'letterType']),
            'message' => 'Letter updated successfully'
        ]);
    }

    /**
     * Remove the specified letter
     */
    public function destroy(Letter $letter)
    {
        $user = Auth::user();
        
        // Only admin can delete letters
        if (!$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $letter->delete();

        return response()->json([
            'message' => 'Letter deleted successfully'
        ]);
    }

    /**
     * Change letter status (admin only)
     */
    public function changeStatus(Request $request, Letter $letter)
    {
        $user = Auth::user();
        
        if (!$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'status' => 'required|string|in:draft,pending,approved,rejected',
        ]);

        $letter->update(['status' => $request->status]);

        return response()->json([
            'letter' => $letter->load(['user', 'letterType']),
            'message' => 'Letter status updated successfully'
        ]);
    }
}
