<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function __construct(
        protected InventoryService $inventoryService
    ) {}

    public function create(array $data, User $user): Order
    {
        return DB::transaction(function () use ($data, $user) {
            $total = 0;
            $items = $data['items'];
            $warehouse_id = $data['warehouse_id'];
            $price_list_id = $data['price_list_id'];

            // Fetch Prices
            $product_ids = collect($items)->pluck('product_id');
            $prices = DB::table('price_list_product')
                ->where('price_list_id', $price_list_id)
                ->whereIn('product_id', $product_ids)
                ->pluck('price', 'product_id');

            // Validate all products have prices
            foreach ($product_ids as $id) {
                if (!$prices->has($id)) {
                    throw new \Exception("Price missing for product ID: {$id} in selected Price List.");
                }
            }

            // Create Order Shell
            $order = Order::create([
                'customer_id' => $data['customer_id'],
                'warehouse_id' => $warehouse_id,
                'price_list_id' => $price_list_id,
                'user_id' => $user->id,
                'status' => 'pending',
                'total' => 0,
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($items as $item) {
                $product_id = $item['product_id'];
                $quantity = $item['quantity'];
                
                // Deduct Stock
                $this->inventoryService->removeStock([
                    'product_id' => $product_id,
                    'warehouse_id' => $warehouse_id,
                    'quantity' => $quantity,
                    'comment' => "Order #{$order->id} created"
                ], $user);
                
                $unit_price = $prices->get($product_id);
                $line_total = $unit_price * $quantity;
                
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product_id,
                    'quantity' => $quantity,
                    'unit_price' => $unit_price,
                    'total' => $line_total,
                ]);

                $total += $line_total;
            }

            $order->update(['total' => $total]);

            return $order->load('items', 'customer');
        });
    }

    public function update(Order $order, array $data, User $user): Order
    {
        return DB::transaction(function () use ($order, $data, $user) {
            // 1. Update basic info
            $updateData = [];
            if (isset($data['notes'])) $updateData['notes'] = $data['notes'];
            
            // Only update price list if provided (it is required in request but good to be safe)
            if (isset($data['price_list_id'])) $updateData['price_list_id'] = $data['price_list_id'];
            
            if (!empty($updateData)) {
                $order->update($updateData);
            }

            // 2. Sync Items
            $warehouse_id = $order->warehouse_id;
            $price_list_id = $data['price_list_id'];
            $existing_items = $order->items->keyBy('product_id');
            $new_items = collect($data['items'])->keyBy('product_id');
            $total = 0;

            // Fetch Prices
            $product_ids = $new_items->pluck('product_id');
            $prices = DB::table('price_list_product')
                ->where('price_list_id', $price_list_id)
                ->whereIn('product_id', $product_ids)
                ->pluck('price', 'product_id');

             // Validate all products have prices
             foreach ($product_ids as $id) {
                if (!$prices->has($id)) {
                    throw new \Exception("Price missing for product ID: {$id} in selected Price List.");
                }
            }

            // Handle Removed Items
            foreach ($existing_items as $product_id => $existing_item) {
                if (!$new_items->has($product_id)) {
                    // Refund Stock
                    $this->inventoryService->addStock([
                        'product_id' => $existing_item->product_id,
                        'warehouse_id' => $warehouse_id,
                        'quantity' => $existing_item->quantity,
                        'comment' => "Order #{$order->id} item removed"
                    ], $user);
                    
                    $existing_item->delete();
                }
            }

            // Handle New/Updated Items
            foreach ($new_items as $product_id => $new_item_data) {
                $quantity = $new_item_data['quantity'];
                $unit_price = $prices->get($product_id); // Fetch from DB
                $line_total = $quantity * $unit_price;

                if ($existing_items->has($product_id)) {
                    // Update existing
                    $existing_item = $existing_items->get($product_id);
                    $diff = $quantity - $existing_item->quantity;

                    if ($diff > 0) {
                        // Needed more
                        $this->inventoryService->removeStock([
                            'product_id' => $product_id,
                            'warehouse_id' => $warehouse_id,
                            'quantity' => $diff,
                            'comment' => "Order #{$order->id} item updated (+)"
                        ], $user);
                    } elseif ($diff < 0) {
                        // Returning some
                        $this->inventoryService->addStock([
                            'product_id' => $product_id,
                            'warehouse_id' => $warehouse_id,
                            'quantity' => abs($diff),
                            'comment' => "Order #{$order->id} item updated (-)"
                        ], $user);
                    }

                    $existing_item->update([
                        'quantity' => $quantity,
                        'unit_price' => $unit_price,
                        'total' => $line_total
                    ]);
                } else {
                    // Create new
                    $this->inventoryService->removeStock([
                        'product_id' => $product_id,
                        'warehouse_id' => $warehouse_id,
                        'quantity' => $quantity,
                        'comment' => "Order #{$order->id} item added"
                    ], $user);

                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $product_id,
                        'quantity' => $quantity,
                        'unit_price' => $unit_price,
                        'total' => $line_total
                    ]);
                }
                $total += $line_total;
            }

            $order->update(['total' => $total]);

            return $order->load('items', 'customer');
        });
    }

    public function delete(Order $order, User $user): void
    {
        DB::transaction(function () use ($order, $user) {
            foreach ($order->items as $item) {
                // Return stock
                $this->inventoryService->addStock([
                    'product_id' => $item->product_id,
                    'warehouse_id' => $order->warehouse_id,
                    'quantity' => $item->quantity,
                    'comment' => "Order #{$order->id} deleted"
                ], $user);
            }
            
            $order->items()->delete();
            $order->delete();
        });
    }

    public function list()
    {
        return Order::with(['customer', 'items.product'])->latest()->paginate(15);
    }
}
