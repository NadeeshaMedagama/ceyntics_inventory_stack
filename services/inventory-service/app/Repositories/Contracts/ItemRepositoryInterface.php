<?php

namespace App\Repositories\Contracts;

use App\Models\Item;
use Illuminate\Pagination\LengthAwarePaginator;

interface ItemRepositoryInterface
{
    public function paginate(array $filters): LengthAwarePaginator;
    public function findById(int $id): ?Item;
    public function findOrFail(int $id): Item;
    public function findByCode(string $code): ?Item;
    public function create(array $data): Item;
    public function update(Item $item, array $data): Item;
    public function delete(Item $item): void;
}