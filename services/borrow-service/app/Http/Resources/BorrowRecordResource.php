<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BorrowRecordResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                   => $this->id,
            'item_id'              => $this->item_id,
            'item_name'            => $this->item_name,
            'item_code'            => $this->item_code,
            'borrower_name'        => $this->borrower_name,
            'contact'              => $this->contact,
            'borrow_date'          => $this->borrow_date?->toDateString(),
            'expected_return_date' => $this->expected_return_date?->toDateString(),
            'qty_borrowed'         => $this->qty_borrowed,
            'returned_at'          => $this->returned_at?->toISOString(),
            'status'               => $this->status,
            'notes'                => $this->notes,
            'created_at'           => $this->created_at?->toISOString(),
        ];
    }
}