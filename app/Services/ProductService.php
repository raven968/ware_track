<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Pagination\LengthAwarePaginator;

class ProductService
{
    public function list(int $perPage = 15): LengthAwarePaginator
    {
        return Product::with('priceLists')->latest()->paginate($perPage);
    }

    public function create(array $data): Product
    {
        $product = Product::create($data);

        if (isset($data['prices'])) {
            $this->syncPrices($product, $data['prices']);
        }

        return $product->load('priceLists');
    }

    public function update(Product $product, array $data): Product
    {
        $product->update($data);

        if (isset($data['prices'])) {
            $this->syncPrices($product, $data['prices']);
        }

        return $product->refresh()->load('priceLists');
    }

    protected function syncPrices(Product $product, array $prices): void
    {
        $syncData = [];
        foreach ($prices as $priceData) {
            $syncData[$priceData['price_list_id']] = ['price' => $priceData['price']];
        }
        $product->priceLists()->sync($syncData);
    }

    public function delete(Product $product): void
    {
        $product->delete();
    }
}
