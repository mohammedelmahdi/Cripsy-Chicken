<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. INGREDIENTS
        Schema::create('ingredients', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('restaurant_id')->constrained('restaurants')->onDelete('cascade');
            $table->string('name');
            $table->decimal('current_stock', 10, 2)->default(0.00);
            $table->decimal('min_stock_level', 10, 2)->default(0.00);
            $table->string('unit', 15)->default('PCS'); // KG, PCS, Liters
            $table->timestamps();

            $table->index(['restaurant_id']);
        });

        // 2. RECIPES
        Schema::create('recipes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('product_id')->constrained('products')->onDelete('cascade');
            $table->foreignUuid('size_id')->nullable()->constrained('product_sizes')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['product_id', 'size_id']);
        });

        // 3. RECIPE_ITEMS
        Schema::create('recipe_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('recipe_id')->constrained('recipes')->onDelete('cascade');
            $table->foreignUuid('ingredient_id')->constrained('ingredients')->onDelete('cascade');
            $table->decimal('quantity_required', 10, 2);
            $table->timestamps();
        });

        // 4. INVENTORY_MOVEMENTS
        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('restaurant_id')->constrained('restaurants')->onDelete('cascade');
            $table->foreignUuid('ingredient_id')->nullable()->constrained('ingredients')->onDelete('cascade');
            $table->foreignUuid('product_id')->nullable()->constrained('products')->onDelete('cascade');
            $table->string('movement_type', 30); // STOCK_IN, STOCK_OUT, WASTAGE, ADJUSTMENT, SALE_CONSUMPTION
            $table->decimal('quantity', 10, 2);
            $table->string('reason')->nullable();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->index(['restaurant_id', 'movement_type']);
        });

        // 5. SUPPLIERS
        Schema::create('suppliers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('restaurant_id')->constrained('restaurants')->onDelete('cascade');
            $table->string('name');
            $table->string('contact_name')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->string('category')->nullable();
            $table->decimal('current_balance', 10, 2)->default(0.00);
            $table->timestamps();
        });

        // 6. PURCHASES
        Schema::create('purchases', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('restaurant_id')->constrained('restaurants')->onDelete('cascade');
            $table->foreignUuid('supplier_id')->constrained('suppliers')->onDelete('cascade');
            $table->string('purchase_number')->unique();
            $table->string('status', 30)->default('PENDING'); // PENDING, PAID, CANCELLED
            $table->decimal('total_amount', 10, 2);
            $table->date('purchase_date');
            $table->timestamps();
        });

        // 7. PURCHASE_ITEMS
        Schema::create('purchase_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('purchase_id')->constrained('purchases')->onDelete('cascade');
            $table->foreignUuid('ingredient_id')->constrained('ingredients')->onDelete('cascade');
            $table->decimal('quantity', 10, 2);
            $table->decimal('unit_cost', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->timestamps();
        });

        // 8. EXPENSE_CATEGORIES
        Schema::create('expense_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('restaurant_id')->constrained('restaurants')->onDelete('cascade');
            $table->string('name');
            $table->timestamps();
        });

        // 9. EXPENSES
        Schema::create('expenses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('restaurant_id')->constrained('restaurants')->onDelete('cascade');
            $table->foreignUuid('expense_category_id')->constrained('expense_categories')->onDelete('cascade');
            $table->text('description')->nullable();
            $table->decimal('amount', 10, 2);
            $table->date('date');
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index(['restaurant_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
        Schema::dropIfExists('expense_categories');
        Schema::dropIfExists('purchase_items');
        Schema::dropIfExists('purchases');
        Schema::dropIfExists('suppliers');
        Schema::dropIfExists('inventory_movements');
        Schema::dropIfExists('recipe_items');
        Schema::dropIfExists('recipes');
        Schema::dropIfExists('ingredients');
    }
};
