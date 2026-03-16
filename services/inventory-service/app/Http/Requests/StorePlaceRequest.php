<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePlaceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'cupboard_id' => ['required', 'integer', 'exists:cupboards,id'],
            'description' => ['sometimes', 'nullable', 'string'],
        ];
    }
}