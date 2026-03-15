<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * RequireAdminRole — checks role from injected auth_user attribute
 */
class RequireAdminRole
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->attributes->get('auth_user');

        if (!$user || $user['role'] !== 'admin') {
            return response()->json(['message' => 'Forbidden. Admin access required.'], 403);
        }

        return $next($request);
    }
}