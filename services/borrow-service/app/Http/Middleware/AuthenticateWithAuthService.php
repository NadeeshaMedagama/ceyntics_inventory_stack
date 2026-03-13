<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateWithAuthService
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        try {
            $response = Http::timeout(5)
                ->withToken($token)
                ->post(config('services.auth.url') . '/api/v1/auth/validate-token');

            if (!$response->successful() || !$response->json('valid')) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            $request->attributes->set('auth_user', $response->json('user'));
        }
        catch (\Exception) {
            return response()->json(['message' => 'Auth service unavailable.'], 503);
        }

        return $next($request);
    }
}