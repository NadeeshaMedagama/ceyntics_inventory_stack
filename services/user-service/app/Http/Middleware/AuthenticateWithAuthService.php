<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

/**
 * AuthenticateWithAuthService
 * Validates bearer token by calling auth-service /api/v1/auth/validate-token
 * Injects authenticated user into request attributes
 */
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

            // Inject user into request for downstream use
            $request->attributes->set('auth_user', $response->json('user'));
        }
        catch (\Exception $e) {
            return response()->json(['message' => 'Auth service unavailable.'], 503);
        }

        return $next($request);
    }
}