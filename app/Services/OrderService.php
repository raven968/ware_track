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
            $warehouse_id = $data['warehouse_id']; // Order comes from a specific warehouse

            // Create Order Shell
            $order = Order::create([
                'customer_id' => $data['customer_id'],
                'warehouse_id' => $warehouse_id,
                'user_id' => $user->id,
                'status' => 'pending',
                'total' => 0, // Calculate later
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($items as $item) {
                $product = Product::findOrFail($item['product_id']);
                
                // Deduct Stock
                $this->inventoryService->removeStock([
                    'product_id' => $product->id,
                    'warehouse_id' => $warehouse_id,
                    'quantity' => $item['quantity'],
                    'comment' => "Order #{$order->id} created"
                ], $user);

                // Assuming price comes from product or specific price list (using product price for now)
                // In a real app, we might have price_lists table, but keeping it simple as requested.
                // Let's assume the request sends the unit_price or we fetch it? 
                // Creating a simplified version where request has price or we trust backend.
                // Since Product model doesn't strictly have a 'price' column (it's in price_list_product pivot?), 
                // let's assume the request carries the price OR for safety we should fetch it.
                // Given the context schema check (Product table), I don't see a price column in the earlier file view.
                // Checking `2026_01_28_012125_create_price_list_product_table.php` suggests prices are in lists.
                // For this iteration, I will assume the frontend sends the `unit_price` verified, 
                // OR simpler: add a `price` to Product? 
                // User said "Order flow".
                // I will use the `unit_price` from the request for now to unblock, 
                // assuming the frontend selected a price list.
                
                $unit_price = $item['unit_price'];
                $line_total = $unit_price * $item['quantity'];
                
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
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
            if (isset($data['notes'])) {
                $order->update(['notes' => $data['notes']]);
            }

            // 2. Sync Items
            $warehouse_id = $order->warehouse_id;
            $existing_items = $order->items->keyBy('product_id');
            $new_items = collect($data['items'])->keyBy('product_id');
            $total = 0;

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
                $unit_price = $new_item_data['unit_price'];
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
