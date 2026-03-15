<?php

namespace App\Services\Contracts;

use App\Models\Item;
use Illuminate\Pagination\LengthAwarePaginator;

interface ItemServiceInterface
{
    public function getAllItems(array $filters): LengthAwarePaginator;
    public function getItem(int $id): Item;
    public function createItem(array $data, string $authUserId): Item;
    public function updateItem(int $id, array $data, string $authUserId): Item;
    public function deleteItem(int $id): void;
    public function adjustQuantity(int $id, string $operation, int $amount, string $authUserId): Item;
    public function adjustQuantityDirect(int $id, int $newQuantity): Item;
}