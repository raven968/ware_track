<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\RouteAttributes\Attributes\{Delete, Get, Middleware, Post, Prefix, Put};

#[Prefix('products')]
#[Middleware('auth:sanctum')]
class ProductController extends Controller
{
    public function __construct(
        protected ProductService $service
    ) {}

    #[Get('/')]
    public function index(): JsonResponse
    {
        return response()->json($this->service->list());
    }

    #[Post('/')]
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|unique:products,sku',
            'category_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'barcode' => 'nullable|string',
            'min_stock' => 'integer|min:0',
            'active' => 'boolean',
        ]);

        $product = $this->service->create($validated);

        return response()->json($product, 201);
    }

    #[Get('{product}')]
    public function show(Product $product): JsonResponse
    {
        return response()->json($product);
    }

    #[Put('{product}')]
    public function update(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'sku' => 'string|unique:products,sku,' . $product->id,
            'category_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'barcode' => 'nullable|string',
            'min_stock' => 'integer|min:0',
            'active' => 'boolean',
        ]);

        $updatedProduct = $this->service->update($product, $validated);

        return response()->json($updatedProduct);
    }

    #[Delete('{product}')]
    public function destroy(Product $product): JsonResponse
    {
        $this->service->delete($product);

        return response()->json(null, 204);
    }
}
