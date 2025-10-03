<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Office;
use Illuminate\Http\Request;

class OfficeController extends Controller
{
    /**
     * Display a listing of offices
     */
    public function index()
    {
        $offices = Office::withCount('users')
            ->orderBy('name')
            ->get();

        return response()->json($offices);
    }

    /**
     * Store a newly created office
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:offices',
            'code' => 'nullable|string|max:50|unique:offices',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'is_active' => 'boolean'
        ]);

        $office = Office::create($validated);

        return response()->json([
            'message' => 'Office created successfully',
            'office' => $office
        ], 201);
    }

    /**
     * Display the specified office
     */
    public function show(Office $office)
    {
        $office->load('users');
        return response()->json($office);
    }

    /**
     * Update the specified office
     */
    public function update(Request $request, Office $office)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:offices,name,' . $office->id,
            'code' => 'nullable|string|max:50|unique:offices,code,' . $office->id,
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'is_active' => 'boolean'
        ]);

        $office->update($validated);

        return response()->json([
            'message' => 'Office updated successfully',
            'office' => $office
        ]);
    }

    /**
     * Remove the specified office
     */
    public function destroy(Office $office)
    {
        // Check if office has users
        if ($office->users()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete office with assigned staff members',
                'users_count' => $office->users()->count()
            ], 422);
        }

        $office->delete();

        return response()->json([
            'message' => 'Office deleted successfully'
        ]);
    }

    /**
     * Get staff members by office
     */
    public function getStaff(Office $office)
    {
        $staff = $office->users()
            ->select('id', 'name', 'email', 'position', 'phone')
            ->get();

        return response()->json($staff);
    }
}
