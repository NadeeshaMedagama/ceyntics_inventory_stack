<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Place extends Model
{
    use SoftDeletes;

    protected $fillable = ['name', 'cupboard_id', 'description'];

    public function cupboard(): BelongsTo
    {
        return $this->belongsTo(Cupboard::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(Item::class);
    }
}