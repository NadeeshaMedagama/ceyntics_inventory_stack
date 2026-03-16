<?php

namespace App\Repositories\Contracts;

use App\Models\User;

/**
 * UserAuthRepositoryInterface — ISP: only auth-related data access
 */
interface UserAuthRepositoryInterface
{
    public function findByEmail(string $email): ?User;
}