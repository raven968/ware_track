<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create User
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        // Create Category
        $category = \App\Models\Category::create([
            'name' => 'Electronics',
            'active' => true,
        ]);

        // Create Products
        \App\Models\Product::create([
            'name' => 'iPhone 15',
            'sku' => 'IPHONE-15',
            'category_id' => $category->id,
            'description' => 'Latest Apple flagship',
            'min_stock' => 10,
            'active' => true,
        ]);

        \App\Models\Product::create([
            'name' => 'Samsung S24',
            'sku' => 'SAMSUNG-S24',
            'category_id' => $category->id,
            'description' => 'Samsung Galaxy S24 Ultra',
            'min_stock' => 5,
            'active' => true,
        ]);
    }
}
