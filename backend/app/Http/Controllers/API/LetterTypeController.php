<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\LetterType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LetterTypeController extends Controller
{
    /**
     * Display a listing of letter types
     */
    public function index()
    {
        $letterTypes = LetterType::active()->get();
        
        return response()->json($letterTypes);
    }

    /**
     * Store a newly created letter type (admin only)
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        if (!$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255|unique:letter_types',
            'description' => 'nullable|string',
            'template_fields' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $letterType = LetterType::create($request->all());

        return response()->json([
            'letter_type' => $letterType,
            'message' => 'Letter type created successfully'
        ], 201);
    }

    /**
     * Display the specified letter type
     */
    public function show(LetterType $letterType)
    {
        return response()->json($letterType);
    }

    /**
     * Update the specified letter type (admin only)
     */
    public function update(Request $request, LetterType $letterType)
    {
        $user = Auth::user();
        
        if (!$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:letter_types,name,' . $letterType->id,
            'description' => 'nullable|string',
            'template_fields' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $letterType->update($request->all());

        return response()->json([
            'letter_type' => $letterType,
            'message' => 'Letter type updated successfully'
        ]);
    }

    /**
     * Remove the specified letter type (admin only)
     */
    public function destroy(LetterType $letterType)
    {
        $user = Auth::user();
        
        if (!$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $letterType->delete();

        return response()->json([
            'message' => 'Letter type deleted successfully'
        ]);
    }
}
