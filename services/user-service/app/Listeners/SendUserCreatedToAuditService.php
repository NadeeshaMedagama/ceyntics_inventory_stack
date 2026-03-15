<?php

namespace App\Listeners;

use App\Events\UserCreated;
use Illuminate\Support\Facades\Http;

class SendUserCreatedToAuditService
{
    public function handle(UserCreated $event): void
    {
        $auditUrl = config('services.audit.url');

        if (!$auditUrl)
            return;

        rescue(fn() => Http::timeout(3)->post("{$auditUrl}/api/v1/events", [
        'service' => 'user-service',
        'action' => 'user.created',
        'entity_type' => 'User',
        'entity_id' => $event->user->id,
        'user_id' => $event->createdByUserId,
        'new_values' => [
        'name' => $event->user->name,
        'email' => $event->user->email,
        'role' => $event->user->role,
        ],
        ]));
    }
}