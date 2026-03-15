<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'name'          => $this->name,
            'code'          => $this->code,
            'quantity'      => $this->quantity,
            'serial_number' => $this->serial_number,
            'image_url'     => $this->image_path
                                 ? asset('storage/' . $this->image_path)
                                 : null,
            'description'   => $this->description,
            'status'        => $this->status,
            'place'         => $this->whenLoaded('place', fn() => [
                'id'       => $this->place->id,
                'name'     => $this->place->name,
                'cupboard' => $this->place->cupboard ? [
                    'id'   => $this->place->cupboard->id,
                    'name' => $this->place->cupboard->name,
                ] : null,
            ]),
            'created_at'    => $this->created_at?->toISOString(),
            'updated_at'    => $this->updated_at?->toISOString(),
        ];
    }
}