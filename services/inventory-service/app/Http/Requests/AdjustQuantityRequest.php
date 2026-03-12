<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdjustQuantityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'operation' => ['required', 'in:increment,decrement'],
            'amount' => ['required', 'integer', 'min:1'],
        ];
    }
}