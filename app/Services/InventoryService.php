<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Warehouse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use App\Models\User;

class InventoryService
{
    public function addStock(array $data, User $user): array
    {
        return DB::transaction(function () use ($data, $user) {
            $product = Product::findOrFail($data['product_id']);
            $warehouse = Warehouse::findOrFail($data['warehouse_id']);
            $quantity = $data['quantity'];

            // Update pivot (create if not exists, increment if exists)
            $existing_stock = $product->warehouses()->find($warehouse->id)?->pivot->stock ?? 0;
            $new_stock = $existing_stock + $quantity;

            $product->warehouses()->syncWithoutDetaching([
                $warehouse->id => ['stock' => $new_stock]
            ]);

            // Log using the new model method
            $product->logMovement(
                'in',
                $quantity,
                $warehouse->id,
                $user->id,
                $data['comment'] ?? null
            );

            return [
                'message' => 'Stock added successfully',
                'current_stock' => $new_stock,
            ];
        });
    }

    public function removeStock(array $data, User $user): array
    {
        return DB::transaction(function () use ($data, $user) {
            $product = Product::findOrFail($data['product_id']);
            $warehouse = Warehouse::findOrFail($data['warehouse_id']);
            $quantity = $data['quantity'];

            $existing_entry = $product->warehouses()->find($warehouse->id);
            $existing_stock = $existing_entry?->pivot->stock ?? 0;

            if ($existing_stock < $quantity) {
                throw ValidationException::withMessages([
                    'quantity' => ['Insufficient stock in this warehouse. Current stock: ' . $existing_stock],
                ]);
            }

            $new_stock = $existing_stock - $quantity;

            $product->warehouses()->syncWithoutDetaching([
                $warehouse->id => ['stock' => $new_stock]
            ]);

            // Log using the new model method
            $product->logMovement(
                'out',
                $quantity,
                $warehouse->id,
                $user->id,
                $data['comment'] ?? null
            );

            return [
                'message' => 'Stock removed successfully',
                'current_stock' => $new_stock,
            ];
        });
    }
}
