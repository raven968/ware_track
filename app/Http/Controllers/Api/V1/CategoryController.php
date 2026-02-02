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
    public function index(): JsonResponse
    {
        return response()->json($this->service->list());
    }

    #[Post('/')]
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = $this->service->create($request->validated());

        return response()->json([
            'message' => 'Category created successfully',
            'data' => $category,
        ], 201);
    }

    #[Get('{category}')]
    public function show(Category $category): JsonResponse
    {
        return response()->json($category->load('parent', 'children'));
    }

    #[Put('{category}')]
    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $updatedCategory = $this->service->update($category, $request->validated());

        return response()->json([
            'message' => 'Category updated successfully',
            'data' => $updatedCategory,
        ]);
    }

    #[Delete('{category}')]
    public function destroy(Category $category): JsonResponse
    {
        $this->service->delete($category);

        return response()->json(null, 204);
    }
}
