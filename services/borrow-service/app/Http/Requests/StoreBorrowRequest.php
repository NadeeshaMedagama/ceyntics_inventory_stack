<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBorrowRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'item_id' => ['required', 'integer'],
            'borrower_name' => ['required', 'string', 'max:255'],
            'contact' => ['required', 'string', 'max:255'],
            'borrow_date' => ['required', 'date'],
            'expected_return_date' => ['required', 'date', 'after_or_equal:borrow_date'],
            'qty_borrowed' => ['required', 'integer', 'min:1'],
            'notes' => ['sometimes', 'nullable', 'string'],
        ];
    }
}