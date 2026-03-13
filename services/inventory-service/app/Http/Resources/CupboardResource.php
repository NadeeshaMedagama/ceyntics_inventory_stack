<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CupboardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'description' => $this->description,
            'location'    => $this->location,
            'places_count' => $this->whenCounted('places'),
            'places'      => PlaceResource::collection($this->whenLoaded('places')),
            'created_at'  => $this->created_at?->toISOString(),
        ];
    }
}