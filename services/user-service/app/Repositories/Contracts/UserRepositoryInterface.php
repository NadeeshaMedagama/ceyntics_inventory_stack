<?php

namespace App\Repositories\Contracts;

use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

interface UserRepositoryInterface
{
    public function paginate(array $filters): LengthAwarePaginator;
    public function findById(int $id): ?User;
    public function findOrFail(int $id): User;
    public function create(array $data): User;
    public function update(User $user, array $data): User;
    public function delete(User $user): void;
}