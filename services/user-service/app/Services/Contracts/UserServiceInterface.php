<?php

namespace App\Services\Contracts;

use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

interface UserServiceInterface
{
    public function getAllUsers(array $filters = []): LengthAwarePaginator;
    public function getUserById(int $id): ?User;
    public function createUser(array $data, int $createdByUserId): User;
    public function updateUser(int $id, array $data): User;
    public function deleteUser(int $id): void;
}