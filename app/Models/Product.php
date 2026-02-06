<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

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

    public function logMovement(string $type, int $quantity, int $warehouse_id, int $user_id, ?string $comment = null): ProductMovementLog
    {
        return ProductMovementLog::create([
            'user_id' => $user_id,
            'product_id' => $this->id,
            'warehouse_id' => $warehouse_id,
            'type' => $type,
            'quantity' => $quantity,
            'comment' => $comment,
        ]);
    }

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
        ];
    }

    protected function prices(): \Illuminate\Database\Eloquent\Casts\Attribute
    {
        return \Illuminate\Database\Eloquent\Casts\Attribute::make(
            get: fn () => $this->priceLists->pluck('pivot.price', 'name'),
        );
    }

    public function scopeSearch(\Illuminate\Database\Eloquent\Builder $query, string $term): void
    {
        $query->where(function ($q) use ($term) {
            $q->where('name', 'ilike', "%{$term}%")
              ->orWhere('sku', 'ilike', "%{$term}%")
              ->orWhere('barcode', 'ilike', "%{$term}%")
              ->orWhereHas('category', function ($q) use ($term) {
                  $q->where('name', 'ilike', "%{$term}%");
              });
        });
    }
}
