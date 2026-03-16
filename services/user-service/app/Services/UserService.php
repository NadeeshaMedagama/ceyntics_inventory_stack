<?php

namespace App\Services;

use App\Events\UserCreated;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Services\Contracts\UserServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;

class UserService implements UserServiceInterface
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository
    ) {}

    public function getAllUsers(array $filters = []): LengthAwarePaginator
    {
        return $this->userRepository->paginate($filters);
    }

    public function getUserById(int $id): ?User
    {
        return $this->userRepository->findById($id);
    }

    public function createUser(array $data, int $createdByUserId): User
    {
        $user = $this->userRepository->create([
            'name'       => $data['name'],
            'email'      => $data['email'],
            'password'   => Hash::make($data['password']),
            'role'       => $data['role'] ?? 'staff',
            'is_active'  => $data['is_active'] ?? true,
            'created_by' => $createdByUserId,
        ]);

        event(new UserCreated($user, $createdByUserId));

        return $user;
    }

    public function updateUser(int $id, array $data): User
    {
        $user = $this->userRepository->findOrFail($id);

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        return $this->userRepository->update($user, $data);
    }

    public function deleteUser(int $id): void
    {
        $user = $this->userRepository->findOrFail($id);
        $this->userRepository->delete($user);
    }
}