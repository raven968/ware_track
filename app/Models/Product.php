<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'name',
        'active',
        'category_id',
        'sku',
        'description',
        'barcode',
        'min_stock',
    ];

    public function category(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function priceLists(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(PriceList::class)
            ->withPivot('price')
            ->withTimestamps();
    }

    public function warehouses(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Warehouse::class, 'product_warehouse')
            ->withPivot('stock')
            ->withTimestamps();
    }

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
        ];
    }
}
