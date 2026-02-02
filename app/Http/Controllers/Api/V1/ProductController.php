<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\Products\StoreProductRequest;
use App\Http\Requests\Products\UpdateProductRequest;
use Spatie\RouteAttributes\Attributes\{Delete, Get, Middleware, Post, Prefix, Put};

#[Prefix('products')]
#[Middleware('auth:sanctum')]
class ProductController extends Controller
{
    public function __construct(
        protected ProductService $service
    ) {}

    #[Get('/')]
    #[Middleware('can:view-products')]
    public function index(): JsonResponse
    {
        return response()->json($this->service->list());
    }

    #[Post('/')]
    #[Middleware('can:create-products')]
    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = $this->service->create($request->validated());

        return response()->json([
            'message' => __('messages.product_created'),
            'data' => $product,
        ], 201);
    }

    #[Get('{product}')]
    #[Middleware('can:view-products')]
    public function show(Product $product): JsonResponse
    {
        return response()->json($product->load('priceLists'));
    }

    #[Put('{product}')]
    #[Middleware('can:update-products')]
    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $updatedProduct = $this->service->update($product, $request->validated());

        return response()->json([
            'message' => __('messages.product_updated'),
            'data' => $updatedProduct,
        ]);
    }

    #[Delete('{product}')]
    #[Middleware('can:delete-products')]
    public function destroy(Product $product): JsonResponse
    {
        $this->service->delete($product);

        return response()->json(null, 204);
    }
}
