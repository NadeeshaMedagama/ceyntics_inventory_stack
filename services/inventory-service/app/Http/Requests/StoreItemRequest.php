<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:100', 'unique:items,code'],
            'quantity' => ['required', 'integer', 'min:0'],
            'serial_number' => ['sometimes', 'nullable', 'string', 'max:255'],
            'image' => ['sometimes', 'nullable', 'image', 'max:5120'],
            'description' => ['sometimes', 'nullable', 'string'],
            'place_id' => ['sometimes', 'nullable', 'integer', 'exists:places,id'],
            'status' => ['sometimes', 'in:in-store,borrowed,damaged,missing'],
        ];
    }
}