<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserManagementController extends Controller
{
    /**
     * Get all users (admin only)
     */
    public function index(Request $request)
    {
        $users = User::select('id', 'name', 'email', 'role', 'position', 'department', 'office', 'phone', 'created_at')
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($users);
    }

    /**
     * Update user role (admin only)
     */
    public function updateRole(Request $request, User $user)
    {
        $request->validate([
            'role' => 'required|in:admin,executive,staff',
        ]);

        $user->role = $request->role;
        $user->save();

        return response()->json([
            'message' => 'User role updated successfully',
            'user' => $user
        ]);
    }

    /**
     * Bulk import users from CSV
     */
    public function bulkImport(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:10240', // Max 10MB
        ]);

        $file = $request->file('file');
        $path = $file->getRealPath();
        
        $handle = fopen($path, 'r');
        $header = fgetcsv($handle); // Read header row
        
        if (!$header || !in_array('email', $header)) {
            fclose($handle);
            return response()->json([
                'message' => 'Invalid CSV format. Required columns: name, email, password, role',
                'error' => 'Invalid format'
            ], 422);
        }

        $imported = 0;
        $updated = 0;
        $errors = [];
        $row = 1;

        while (($data = fgetcsv($handle)) !== false) {
            $row++;

            // Map CSV columns to array
            $userData = array_combine($header, $data);

            // Validate required fields
            $validator = Validator::make($userData, [
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'password' => 'required|string|min:8',
                'role' => 'required|in:admin,executive,staff',
            ]);

            if ($validator->fails()) {
                $errors[] = [
                    'row' => $row,
                    'email' => $userData['email'] ?? 'unknown',
                    'error' => $validator->errors()->first()
                ];
                continue;
            }

            try {
                // Check if user exists
                $user = User::where('email', $userData['email'])->first();

                if ($user) {
                    // Update existing user
                    $user->update([
                        'name' => $userData['name'],
                        'role' => $userData['role'],
                        'position' => $userData['position'] ?? null,
                        'department' => $userData['department'] ?? null,
                        'office' => $userData['office'] ?? null,
                        'phone' => $userData['phone'] ?? null,
                    ]);
                    $updated++;
                } else {
                    // Create new user
                    User::create([
                        'name' => $userData['name'],
                        'email' => $userData['email'],
                        'password' => Hash::make($userData['password']),
                        'role' => $userData['role'],
                        'position' => $userData['position'] ?? null,
                        'department' => $userData['department'] ?? null,
                        'office' => $userData['office'] ?? null,
                        'phone' => $userData['phone'] ?? null,
                    ]);
                    $imported++;
                }
            } catch (\Exception $e) {
                $errors[] = [
                    'row' => $row,
                    'email' => $userData['email'] ?? 'unknown',
                    'error' => $e->getMessage()
                ];
            }
        }

        fclose($handle);

        return response()->json([
            'message' => 'Import completed',
            'summary' => [
                'imported' => $imported,
                'updated' => $updated,
                'errors' => count($errors),
                'total' => $imported + $updated + count($errors)
            ],
            'errors' => $errors
        ]);
    }

    /**
     * Update user profile information (admin only)
     * Note: This endpoint is for admins to update staff office info only
     * Name and email should be updated through the user's own settings
     */
    public function updateProfile(Request $request, User $user)
    {
        $request->validate([
            'position' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'office' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
        ]);

        // Only update office-related information, not name or email
        $user->update($request->only(['position', 'department', 'office', 'phone']));
        
        // Refresh the model to get updated data
        $user->refresh();
        
        \Log::info('User profile updated', [
            'user_id' => $user->id,
            'office' => $user->office,
            'position' => $user->position
        ]);

        return response()->json([
            'message' => 'User profile updated successfully',
            'user' => $user
        ]);
    }

    /**
     * Update user basic info (name, email) - admin only
     */
    public function updateBasicInfo(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
        ]);

        $user->update($request->only(['name', 'email']));

        return response()->json([
            'message' => 'User information updated successfully',
            'user' => $user
        ]);
    }

    /**
     * Delete user (admin only)
     */
    public function destroy(User $user)
    {
        // Prevent deleting yourself
        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'You cannot delete your own account',
                'error' => 'Self-deletion not allowed'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }

    /**
     * Download sample CSV template
     */
    public function downloadTemplate()
    {
        $csv = "name,email,password,role,position,department,office,phone\n";
        $csv .= "John Doe,john.doe@university.edu,password123,executive,Dean,Administration,Jimma University,+251-xxx\n";
        $csv .= "Jane Smith,jane.smith@university.edu,password123,staff,Professor,Computer Science,Jimma University,+251-yyy\n";

        return response($csv, 200)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="users_template.csv"');
    }
}
