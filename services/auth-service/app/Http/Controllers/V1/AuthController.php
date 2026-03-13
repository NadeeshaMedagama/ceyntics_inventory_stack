<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Services\Contracts\AuthServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * AuthController — Thin controller; delegates all logic to AuthService (SRP)
 */
class AuthController extends Controller
{
    public function __construct(
        private readonly AuthServiceInterface $authService
    ) {}

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login(
            $request->validated('email'),
            $request->validated('password')
        );

        if (!$result) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 401);
        }

        return response()->json($result, 200);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return response()->json(['message' => 'Logged out successfully.'], 200);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->authService->getCurrentUser($request->user()),
        ], 200);
    }

    /**
     * Internal endpoint — validates token and returns user payload
     * Used by other microservices for token verification
     */
    public function validateToken(Request $request): JsonResponse
    {
        $token = $request->bearerToken() ?? $request->input('token');

        if (!$token) {
            return response()->json(['valid' => false, 'message' => 'No token provided.'], 401);
        }

        $result = $this->authService->validateToken($token);

        if (!$result) {
            return response()->json(['valid' => false, 'message' => 'Invalid or expired token.'], 401);
        }

        return response()->json(['valid' => true, 'user' => $result], 200);
    }
}
