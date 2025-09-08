<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email'],
            'avatar' => ['nullable', 'string'], // base64 data URL
        ]);

        if (isset($validated['name'])) {
            $user->name = $validated['name'];
        }
        if (isset($validated['email'])) {
            $user->email = $validated['email'];
        }

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
            'user' => $user,
            'avatar_url' => $avatarUrl,
        ]);
    }
}


