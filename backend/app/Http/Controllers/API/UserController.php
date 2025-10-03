<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        \Log::info('Profile update request', [
            'user_id' => $user->id,
            'data' => $request->except(['avatar'])
        ]);

        $validated = $request->validate([
            'position' => ['nullable', 'string', 'max:255'],
            'department' => ['nullable', 'string', 'max:255'],
            'office' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'avatar' => ['nullable', 'string'], // base64 data URL
        ]);

        // Users can only update their office info, not name or email
        // Name and email are managed by administrators
        if (isset($validated['position'])) {
            $user->position = $validated['position'];
        }
        if (isset($validated['department'])) {
            $user->department = $validated['department'];
        }
        if (isset($validated['office'])) {
            $user->office = $validated['office'];
        }
        if (isset($validated['phone'])) {
            $user->phone = $validated['phone'];
        }

        // Handle avatar upload
        if (!empty($validated['avatar'])) {
            // Save base64 to storage/public/avatars
            $data = $validated['avatar'];
            if (preg_match('/^data:image\/(\w+);base64,/', $data, $type)) {
                $data = substr($data, strpos($data, ',') + 1);
                $type = strtolower($type[1]);
                $data = base64_decode($data);
                $filename = 'avatars/'.uniqid('avatar_').'.'.$type;
                Storage::disk('public')->put($filename, $data);
                $user->avatar_path = $filename;
            }
        }

        $user->save();

        $avatarUrl = null;
        if ($user->avatar_path) {
            $avatarUrl = asset('storage/'.$user->avatar_path);
        }
        
        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user,
            'avatar_url' => $avatarUrl,
        ]);
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'confirmed', Password::defaults()],
        ]);

        $user = $request->user();

        // Verify current password
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect.',
                'errors' => ['current_password' => ['The current password is incorrect.']]
            ], 422);
        }

        // Update password
        $user->password = Hash::make($validated['password']);
        $user->save();

        return response()->json([
            'message' => 'Password updated successfully.'
        ]);
    }
}


