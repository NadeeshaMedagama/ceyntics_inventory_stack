<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'code' => ['sometimes', 'string', 'max:100', 'unique:items,code,' . $this->route('item')],
            'quantity' => ['sometimes', 'integer', 'min:0'],
            'serial_number' => ['sometimes', 'nullable', 'string', 'max:255'],
            'image' => ['sometimes', 'nullable', 'image', 'max:5120'],
            'description' => ['sometimes', 'nullable', 'string'],
            'place_id' => ['sometimes', 'nullable', 'integer', 'exists:places,id'],
            'status' => ['sometimes', 'in:in-store,borrowed,damaged,missing'],
        ];
    }
}