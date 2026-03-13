<?php

namespace App\Services\Contracts;

use App\Models\User;

/**
 * AuthServiceInterface — DIP: high-level modules depend on this abstraction
 */
interface AuthServiceInterface
{
    public function login(string $email, string $password): ?array;
    public function logout(User $user): void;
    public function getCurrentUser(User $user): array;
    public function validateToken(string $token): ?array;
}