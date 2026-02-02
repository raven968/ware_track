<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\Categories\StoreCategoryRequest;
use App\Http\Requests\Categories\UpdateCategoryRequest;
use Spatie\RouteAttributes\Attributes\{Delete, Get, Middleware, Post, Prefix, Put};

#[Prefix('categories')]
#[Middleware('auth:sanctum')]
class CategoryController extends Controller
{
    public function __construct(
        protected CategoryService $service
    ) {}

    #[Get('/')]
    #[Middleware('can:view-categories')]
    public function index(): JsonResponse
    {
        return response()->json($this->service->list());
    }

    #[Post('/')]
    #[Middleware('can:create-categories')]
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = $this->service->create($request->validated());

        return response()->json([
            'message' => __('messages.category_created'),
            'data' => $category,
        ], 201);
    }

    #[Get('{category}')]
    #[Middleware('can:view-categories')]
    public function show(Category $category): JsonResponse
    {
        return response()->json($category->load('parent', 'children'));
    }

    #[Put('{category}')]
    #[Middleware('can:update-categories')]
    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $updatedCategory = $this->service->update($category, $request->validated());

        return response()->json([
            'message' => __('messages.category_updated'),
            'data' => $updatedCategory,
        ]);
    }

    #[Delete('{category}')]
    #[Middleware('can:delete-categories')]
    public function destroy(Category $category): JsonResponse
    {
        $this->service->delete($category);

        return response()->json(null, 204);
    }
}
