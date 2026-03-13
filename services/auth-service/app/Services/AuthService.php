<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\UserAuthRepositoryInterface;
use App\Services\Contracts\AuthServiceInterface;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;

/**
 * AuthService — Concrete implementation of AuthServiceInterface
 * Single Responsibility: Handles authentication business logic only
 */
class AuthService implements AuthServiceInterface
{
    public function __construct(
        private readonly UserAuthRepositoryInterface $userRepository
    ) {}

    public function login(string $email, string $password): ?array
    {
        $user = $this->userRepository->findByEmail($email);

        if (!$user || !Hash::check($password, $user->password)) {
            return null;
        }

        if (!$user->is_active) {
            return null;
        }

        // Revoke old tokens
        $user->tokens()->delete();

        $token = $user->createToken('auth_token', ['*'], now()->addDays(7));

        return [
            'access_token' => $token->plainTextToken,
            'token_type'   => 'Bearer',
            'expires_in'   => 604800, // 7 days in seconds
            'user' => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role,
            ],
        ];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }

    public function getCurrentUser(User $user): array
    {
        return [
            'id'    => $user->id,
            'name'  => $user->name,
            'email' => $user->email,
            'role'  => $user->role,
        ];
    }

    public function validateToken(string $token): ?array
    {
        // Sanctum token format: id|plaintext
        $accessToken = PersonalAccessToken::findToken($token);

        if (!$accessToken) {
            return null;
        }

        // Check expiry
        if ($accessToken->expires_at && $accessToken->expires_at->isPast()) {
            return null;
        }

        $user = $accessToken->tokenable;

        if (!$user || !$user->is_active) {
            return null;
        }

        return [
            'id'    => $user->id,
            'name'  => $user->name,
            'email' => $user->email,
            'role'  => $user->role,
        ];
    }
}