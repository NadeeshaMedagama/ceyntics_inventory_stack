<?php

namespace App\Services;

use App\Services\Contracts\AuditPublisherInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * HttpAuditPublisher — fires audit events to the audit-service over HTTP
 * Open/Closed: New audit destinations can be added without modifying callers
 */
class HttpAuditPublisher implements AuditPublisherInterface
{
    public function publish(
        string $action,
        string $entityType,
        int|string $entityId,
        int|string $userId,
        array $oldValues,
        array $newValues,
        array $metadata = []
        ): void
    {
        $auditUrl = config('services.audit.url');

        if (!$auditUrl)
            return;

        // Fire-and-forget: don't let audit failures break inventory operations
        rescue(function () use ($auditUrl, $action, $entityType, $entityId, $userId, $oldValues, $newValues, $metadata) {
            Http::timeout(3)->post("{$auditUrl}/api/v1/events", [
                'service' => 'inventory-service',
                'action' => $action,
                'entity_type' => $entityType,
                'entity_id' => $entityId,
                'user_id' => $userId,
                'old_values' => $oldValues,
                'new_values' => $newValues,
                'metadata' => $metadata,
            ]);
        }, fn($e) => Log::warning("Audit publish failed: {$e->getMessage()}"));
    }
}