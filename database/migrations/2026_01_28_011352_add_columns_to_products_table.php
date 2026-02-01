<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('sku')->unique()->after('id');
            $table->text('description')->nullable();
            $table->string('barcode')->nullable();
            $table->integer('min_stock')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn(['category_id', 'sku', 'description', 'barcode', 'min_stock']);
        });
    }
};
