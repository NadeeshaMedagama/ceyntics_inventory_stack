<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cupboard extends Model
{
    use SoftDeletes;

    protected $fillable = ['name', 'description', 'location'];

    public function places(): HasMany
    {
        return $this->hasMany(Place::class);
    }
}