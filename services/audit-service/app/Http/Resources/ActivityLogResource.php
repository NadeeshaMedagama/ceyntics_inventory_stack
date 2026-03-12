<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'service'     => $this->service,
            'action'      => $this->action,
            'entity_type' => $this->entity_type,
            'entity_id'   => $this->entity_id,
            'user_id'     => $this->user_id,
            'user_name'   => $this->user_name,
            'old_values'  => $this->old_values,
            'new_values'  => $this->new_values,
            'metadata'    => $this->metadata,
            'created_at'  => $this->created_at?->toISOString(),
        ];
    }
}