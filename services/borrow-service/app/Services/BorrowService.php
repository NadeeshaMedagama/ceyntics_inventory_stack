<?php

namespace App\Services;

use App\Models\BorrowRecord;
use App\Services\Contracts\BorrowServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BorrowService implements BorrowServiceInterface
{
    public function getAll(array $filters): LengthAwarePaginator
    {
        return BorrowRecord::query()
            ->when($filters['status'] ?? null, fn($q, $s) => $q->where('status', $s))
            ->when($filters['search'] ?? null, fn($q, $s) => $q->where(function ($q) use ($s) {
            $q->where('borrower_name', 'ilike', "%{$s}%")
                ->orWhere('item_name', 'ilike', "%{$s}%")
                ->orWhere('item_code', 'ilike', "%{$s}%");
        }
        ))
            ->latest()
            ->paginate(15);
    }

    public function getById(int $id): BorrowRecord
    {
        return BorrowRecord::findOrFail($id);
    }

    public function createBorrow(array $data, int $userId): BorrowRecord
    {
        // Fetch item details from inventory-service
        $inventoryUrl = config('services.inventory.url');
        $itemResponse = Http::timeout(5)->withHeaders([
            'X-Internal-Service' => 'borrow-service',
        ])->get("{$inventoryUrl}/api/v1/items/{$data['item_id']}");

        if (!$itemResponse->successful()) {
            abort(422, 'Item not found in inventory service.');
        }

        $item = $itemResponse->json('data');

        if ($item['quantity'] < $data['qty_borrowed']) {
            abort(422, "Insufficient stock. Available: {$item['quantity']}");
        }

        // Create borrow record
        $record = BorrowRecord::create([
            'item_id' => $item['id'],
            'item_name' => $item['name'],
            'item_code' => $item['code'],
            'borrower_name' => $data['borrower_name'],
            'contact' => $data['contact'],
            'borrow_date' => $data['borrow_date'],
            'expected_return_date' => $data['expected_return_date'],
            'qty_borrowed' => $data['qty_borrowed'],
            'notes' => $data['notes'] ?? null,
            'status' => 'active',
            'created_by_user_id' => $userId,
        ]);

        // Reduce stock in inventory-service
        rescue(fn() => Http::timeout(5)->post("{$inventoryUrl}/api/v1/items/{$item['id']}/adjust-quantity", [
        'operation' => 'decrement',
        'amount' => $data['qty_borrowed'],
        ]));

        // Update item status to borrowed if all stock is out
        if (($item['quantity'] - $data['qty_borrowed']) === 0) {
            rescue(fn() => Http::timeout(5)->put("{$inventoryUrl}/api/v1/items/{$item['id']}", [
            'status' => 'borrowed',
            ]));
        }

        // Publish audit event
        $this->publishAuditEvent('borrow.created', $record, $userId);

        return $record;
    }

    public function returnItem(int $id, int $userId, ?string $notes): BorrowRecord
    {
        $record = BorrowRecord::findOrFail($id);

        if ($record->status === 'returned') {
            abort(422, 'Item has already been returned.');
        }

        $record->update([
            'status' => 'returned',
            'returned_at' => now(),
            'notes' => $notes ?? $record->notes,
        ]);

        // Restore stock in inventory-service
        $inventoryUrl = config('services.inventory.url');
        rescue(fn() => Http::timeout(5)->post("{$inventoryUrl}/api/v1/items/{$record->item_id}/adjust-quantity", [
        'operation' => 'increment',
        'amount' => $record->qty_borrowed,
        ]));

        // Set item back to in-store
        rescue(fn() => Http::timeout(5)->put("{$inventoryUrl}/api/v1/items/{$record->item_id}", [
        'status' => 'in-store',
        ]));

        $this->publishAuditEvent('borrow.returned', $record, $userId);

        return $record->fresh();
    }

    private function publishAuditEvent(string $action, BorrowRecord $record, int $userId): void
    {
        $auditUrl = config('services.audit.url');
        if (!$auditUrl)
            return;

        rescue(fn() => Http::timeout(3)->post("{$auditUrl}/api/v1/events", [
        'service' => 'borrow-service',
        'action' => $action,
        'entity_type' => 'BorrowRecord',
        'entity_id' => $record->id,
        'user_id' => $userId,
        'new_values' => $record->toArray(),
        ]), fn($e) => Log::warning("Audit event failed: {$e->getMessage()}"));
    }
}