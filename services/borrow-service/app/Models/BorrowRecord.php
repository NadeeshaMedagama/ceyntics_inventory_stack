<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BorrowRecord extends Model
{
    protected $fillable = [
        'item_id',
        'item_name',
        'item_code',
        'borrower_name',
        'contact',
        'borrow_date',
        'expected_return_date',
        'qty_borrowed',
        'returned_at',
        'status',
        'notes',
        'created_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'borrow_date' => 'date',
            'expected_return_date' => 'date',
            'returned_at' => 'datetime',
            'qty_borrowed' => 'integer',
        ];
    }
}