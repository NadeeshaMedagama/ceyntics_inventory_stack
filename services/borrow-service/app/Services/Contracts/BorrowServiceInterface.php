<?php

namespace App\Services\Contracts;

use App\Models\BorrowRecord;
use Illuminate\Pagination\LengthAwarePaginator;

interface BorrowServiceInterface
{
    public function getAll(array $filters): LengthAwarePaginator;
    public function getById(int $id): BorrowRecord;
    public function createBorrow(array $data, int $userId): BorrowRecord;
    public function returnItem(int $id, int $userId, ?string $notes): BorrowRecord;
}