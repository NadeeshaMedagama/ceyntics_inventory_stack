<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityLogResource;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    /**
     * Receive audit events from other microservices (internal endpoint)
     */
    public function receiveEvent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'service' => ['required', 'string'],
            'action' => ['required', 'string'],
            'entity_type' => ['required', 'string'],
            'entity_id' => ['required'],
            'user_id' => ['sometimes', 'nullable'],
            'user_name' => ['sometimes', 'nullable', 'string'],
            'old_values' => ['sometimes', 'nullable', 'array'],
            'new_values' => ['sometimes', 'nullable', 'array'],
            'metadata' => ['sometimes', 'nullable', 'array'],
        ]);

        ActivityLog::create([
            'service' => $validated['service'],
            'action' => $validated['action'],
            'entity_type' => $validated['entity_type'],
            'entity_id' => $validated['entity_id'],
            'user_id' => $validated['user_id'] ?? null,
            'user_name' => $validated['user_name'] ?? null,
            'old_values' => $validated['old_values'] ?? null,
            'new_values' => $validated['new_values'] ?? null,
            'metadata' => $validated['metadata'] ?? null,
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Event received.'], 201);
    }

    /**
     * List audit logs — admin only (enforced via middleware)
     */
    public function index(Request $request): JsonResponse
    {
        $logs = ActivityLog::query()
            ->when($request->service, fn($q, $s) => $q->where('service', $s))
            ->when($request->action, fn($q, $a) => $q->where('action', $a))
            ->when($request->entity_type, fn($q, $e) => $q->where('entity_type', $e))
            ->when($request->user_id, fn($q, $u) => $q->where('user_id', $u))
            ->when($request->date_from, fn($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($request->date_to, fn($q, $d) => $q->whereDate('created_at', '<=', $d))
            ->orderByDesc('created_at')
            ->paginate(25);

        return response()->json([
            'data' => ActivityLogResource::collection($logs->items()),
            'meta' => ['total' => $logs->total(), 'last_page' => $logs->lastPage(), 'current_page' => $logs->currentPage()],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $log = ActivityLog::findOrFail($id);
        return response()->json(['data' => new ActivityLogResource($log)]);
    }
}