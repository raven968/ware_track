<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
            'active' => 'boolean',
        ]);

        $category = $this->service->create($validated);

        return response()->json($category, 201);
    }

    #[Get('{category}')]
    public function show(Category $category): JsonResponse
    {
        return response()->json($category->load('parent', 'children'));
    }

    #[Put('{category}')]
    public function update(Request $request, Category $category): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'parent_id' => 'nullable|exists:categories,id|not_in:' . $category->id, // Prevent self-parenting
            'active' => 'boolean',
        ]);

        $updatedCategory = $this->service->update($category, $validated);

        return response()->json($updatedCategory);
    }

    #[Delete('{category}')]
    public function destroy(Category $category): JsonResponse
    {
        $this->service->delete($category);

        return response()->json(null, 204);
    }
}
