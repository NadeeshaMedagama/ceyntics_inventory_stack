<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'unique:users,email,' . $this->route('id')],
            'password' => ['sometimes', 'string', Password::min(8)->mixedCase()->numbers()->symbols()],
            'role' => ['sometimes', 'in:admin,staff'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}