<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    public function index(Request $request)
    {
        $query = Staff::with('department')->orderBy('name');
        if ($request->filled('department_id')) {
            $query->where('department_id', $request->integer('department_id'));
        }
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
        ]);

        $staff = Staff::create($validated);
        return response()->json(['staff' => $staff->load('department')], 201);
    }
}


