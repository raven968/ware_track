<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Warehouse extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'name',
        'location',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
        ];
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_warehouse')
            ->withPivot('stock')
            ->withTimestamps();
    }
}
