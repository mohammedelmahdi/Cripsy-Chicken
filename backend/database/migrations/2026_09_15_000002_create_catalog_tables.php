<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. CATEGORIES
        Schema::create('categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('restaurant_id')->constrained('restaurants')->onDelete('cascade');
            $table->string('name');
            $table->string('slug');
            $table->string('icon')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['restaurant_id', 'sort_order']);
        });

        // 2. PRODUCTS
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('restaurant_id')->constrained('restaurants')->onDelete('cascade');
            $table->foreignUuid('category_id')->constrained('categories')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('track_stock')->default(false);
            $table->decimal('current_stock', 10, 2)->default(0.00);
            $table->timestamps();

            $table->index(['restaurant_id', 'category_id', 'is_active']);
        });

        // 3. PRODUCT_SIZES
        Schema::create('product_sizes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name'); // Solo, Medium, Large, Family
            $table->timestamps();
        });

        // 4. MODIFIER_GROUPS
        Schema::create('modifier_groups', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('restaurant_id')->constrained('restaurants')->onDelete('cascade');
            $table->string('name'); // e.g. Sauces, Extras, Cheese
            $table->integer('min_selections')->default(0);
            $table->integer('max_selections')->default(1);
            $table->timestamps();
        });

        // 5. MODIFIER_OPTIONS
        Schema::create('modifier_options', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('modifier_group_id')->constrained('modifier_groups')->onDelete('cascade');
            $table->string('name');
            $table->decimal('price_adjustment', 10, 2)->default(0.00);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 6. PRODUCT_PRICES (Supports size-specific and order-type specific variations)
        Schema::create('product_prices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('product_id')->constrained('products')->onDelete('cascade');
            $table->foreignUuid('size_id')->nullable()->constrained('product_sizes')->onDelete('cascade');
            $table->string('order_type', 30)->nullable(); // COUNTER, DINE_IN, DELIVERY, ONLINE
            $table->decimal('price', 10, 2);
            $table->timestamps();

            $table->index(['product_id', 'size_id', 'order_type']);
        });

        // 7. PRODUCT_MODIFIER_GROUPS
        Schema::create('product_modifier_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('product_id')->constrained('products')->onDelete('cascade');
            $table->foreignUuid('modifier_group_id')->constrained('modifier_groups')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_modifier_groups');
        Schema::dropIfExists('product_prices');
        Schema::dropIfExists('modifier_options');
        Schema::dropIfExists('modifier_groups');
        Schema::dropIfExists('product_sizes');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
    }
};
