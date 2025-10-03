<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        if (!$user) {
            \Log::warning('AdminMiddleware: No authenticated user');
            return response()->json(['message' => 'Access denied. Authentication required.'], 401);
        }
        
        if (!$user->isAdmin()) {
            \Log::warning('AdminMiddleware: User is not admin', [
                'user_id' => $user->id,
                'user_role' => $user->role,
                'user_email' => $user->email
            ]);
            return response()->json([
                'message' => 'Access denied. Admin role required.',
                'your_role' => $user->role
            ], 403);
        }

        return $next($request);
    }
}
