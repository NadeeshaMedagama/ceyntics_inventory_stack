<?php

namespace App\Repositories;

use App\Models\Item;
use App\Repositories\Contracts\ItemRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentItemRepository implements ItemRepositoryInterface
{
    public function paginate(array $filters): LengthAwarePaginator
    {
        return Item::query()
            ->with(['place.cupboard'])
            ->when($filters['status'] ?? null, fn($q, $s) => $q->where('status', $s))
            ->when($filters['place_id'] ?? null, fn($q, $id) => $q->where('place_id', $id))
            ->when($filters['search'] ?? null, fn($q, $s) => $q->where(function ($q) use ($s) {
            $q->where('name', 'ilike', "%{$s}%")
                ->orWhere('code', 'ilike', "%{$s}%")
                ->orWhere('serial_number', 'ilike', "%{$s}%");
        }
        ))
            ->latest()
            ->paginate(15);
    }

    public function findById(int $id): ?Item
    {
        return Item::with(['place.cupboard'])->find($id);
    }

    public function findOrFail(int $id): Item
    {
        return Item::with(['place.cupboard'])->findOrFail($id);
    }

    public function findByCode(string $code): ?Item
    {
        return Item::where('code', $code)->first();
    }

    public function create(array $data): Item
    {
        return Item::create($data);
    }

    public function update(Item $item, array $data): Item
    {
        $item->update($data);
        return $item->fresh(['place.cupboard']);
    }

    public function delete(Item $item): void
    {
        $item->delete();
    }
}