<?php

namespace App\Services\Contracts;

interface AuditPublisherInterface
{
    public function publish(
        string $action,
        string $entityType,
        int|string $entityId,
        int|string $userId,
        array $oldValues,
        array $newValues,
        array $metadata = []
        ): void;
}