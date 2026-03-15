<?php

namespace App\Services;

use App\Models\Item;
use App\Repositories\Contracts\ItemRepositoryInterface;
use App\Services\Contracts\AuditPublisherInterface;
use App\Services\Contracts\ItemServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;

class ItemService implements ItemServiceInterface
{
    public function __construct(
        private readonly ItemRepositoryInterface  $itemRepository,
        private readonly AuditPublisherInterface  $auditPublisher
    ) {}

    public function getAllItems(array $filters): LengthAwarePaginator
    {
        return $this->itemRepository->paginate($filters);
    }

    public function getItem(int $id): Item
    {
        return $this->itemRepository->findOrFail($id);
    }

    public function createItem(array $data, string $authUserId): Item
    {
        // Handle image upload
        if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
            $data['image_path'] = $data['image']->store('items', 'public');
            unset($data['image']);
        }

        $data['created_by_user_id'] = $authUserId;

        $item = $this->itemRepository->create($data);

        $this->auditPublisher->publish(
            'item.created', 'Item', $item->id, $authUserId,
            [], $item->toArray()
        );

        return $item;
    }

    public function updateItem(int $id, array $data, string $authUserId): Item
    {
        $item = $this->itemRepository->findOrFail($id);
        $oldValues = $item->toArray();

        // Handle image replacement
        if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
            if ($item->image_path) Storage::disk('public')->delete($item->image_path);
            $data['image_path'] = $data['image']->store('items', 'public');
            unset($data['image']);
        }

        $updated = $this->itemRepository->update($item, $data);

        $this->auditPublisher->publish(
            'item.updated', 'Item', $id, $authUserId,
            $oldValues, $updated->toArray()
        );

        return $updated;
    }

    public function deleteItem(int $id): void
    {
        $item = $this->itemRepository->findOrFail($id);
        $this->itemRepository->delete($item);
    }

    public function adjustQuantity(int $id, string $operation, int $amount, string $authUserId): Item
    {
        $item = $this->itemRepository->findOrFail($id);
        $oldQty = $item->quantity;

        $newQty = match ($operation) {
            'increment' => $oldQty + $amount,
            'decrement' => max(0, $oldQty - $amount),
            default     => throw ValidationException::withMessages(['operation' => 'Must be increment or decrement']),
        };

        $updated = $this->itemRepository->update($item, ['quantity' => $newQty]);

        $this->auditPublisher->publish(
            'item.quantity_changed', 'Item', $id, $authUserId,
            ['quantity' => $oldQty], ['quantity' => $newQty]
        );

        return $updated;
    }

    public function adjustQuantityDirect(int $id, int $newQuantity): Item
    {
        $item = $this->itemRepository->findOrFail($id);
        return $this->itemRepository->update($item, ['quantity' => $newQuantity]);
    }
}