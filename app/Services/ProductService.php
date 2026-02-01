<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Pagination\LengthAwarePaginator;

class ProductService
{
    public function list(int $perPage = 15): LengthAwarePaginator
    {
        return Product::latest()->paginate($perPage);
    }

    public function create(array $data): Product
    {
        return Product::create($data);
    }

    public function update(Product $product, array $data): Product
    {
        $product->update($data);
        return $product->refresh();
    }

    public function delete(Product $product): void
    {
        $product->delete();
    }
}
