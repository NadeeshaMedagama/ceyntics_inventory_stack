<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlaceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'description' => $this->description,
            'cupboard_id' => $this->cupboard_id,
            'cupboard'    => $this->whenLoaded('cupboard', fn() => [
                'id'   => $this->cupboard->id,
                'name' => $this->cupboard->name,
            ]),
            'items_count' => $this->whenCounted('items'),
            'created_at'  => $this->created_at?->toISOString(),
        ];
    }
}