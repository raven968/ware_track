<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Orders\StoreOrderRequest;
use App\Http\Requests\Orders\UpdateOrderRequest;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Spatie\RouteAttributes\Attributes\{Get, Middleware, Post, Prefix};

#[Prefix('orders')]
#[Middleware('auth:sanctum')]
class OrderController extends Controller
{
    public function __construct(
        protected OrderService $service
    ) {}

    #[Get('/')]
    public function index(): JsonResponse
    {
        return response()->json($this->service->list());
    }

    #[Post('/')]
    public function store(StoreOrderRequest $request): JsonResponse
    {
        $order = $this->service->create($request->validated(), $request->user());

        return response()->json([
            'message' => __('messages.order_created'),
            'data' => $order,
        ], 201);
    }

    #[Get('{order}')]
    public function show(Order $order): JsonResponse
    {
        return response()->json($order->load('items.product', 'customer'));
    }

    #[Put('{order}')]
    public function update(UpdateOrderRequest $request, Order $order): JsonResponse
    {
        $updatedOrder = $this->service->update($order, $request->validated(), $request->user());

        return response()->json([
            'message' => __('messages.order_updated'),
            'data' => $updatedOrder,
        ]);
    }

    #[Delete('{order}')]
    public function destroy(Order $order): JsonResponse
    {
        $this->service->delete($order, request()->user());

        return response()->json([
            'message' => __('messages.order_deleted'),
        ]);
    }
}
