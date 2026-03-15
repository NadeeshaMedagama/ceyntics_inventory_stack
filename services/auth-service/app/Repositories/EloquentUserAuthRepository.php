<?php

namespace App\Repositories;

use App\Models\User;
use App\Repositories\Contracts\UserAuthRepositoryInterface;

/**
 * EloquentUserAuthRepository — Concrete Eloquent implementation
 * Liskov: Can be swapped with any other implementation
 */
class EloquentUserAuthRepository implements UserAuthRepositoryInterface
{
    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }
}