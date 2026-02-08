<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Pagination\LengthAwarePaginator;

class CategoryService
{
    public function list(int $perPage = 15): LengthAwarePaginator
    {
        $query = Category::with('parent');

        if (request()->has('search')) {
            $query->search(request('search'));
        }

        return $query->latest()->paginate($perPage);
    }

    public function create(array $data): Category
    {
        return Category::create($data);
    }

    public function update(Category $category, array $data): Category
    {
        $category->update($data);
        return $category->refresh();
    }

    public function delete(Category $category): void
    {
        $category->delete();
    }
}
