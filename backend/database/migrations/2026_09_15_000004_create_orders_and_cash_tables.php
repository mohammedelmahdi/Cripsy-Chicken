<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. ORDERS
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('restaurant_id')->constrained('restaurants')->onDelete('cascade');
            $table->string('order_number')->unique();
            $table->string('order_type', 30); // COUNTER, DINE_IN, DELIVERY, ONLINE
            $table->string('status', 30); // NEW, ACCEPTED, PREPARING, READY, COMPLETED, CANCELLED, REJECTED
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignUuid('customer_id')->nullable()->constrained('customers')->onDelete('set null');
            $table->foreignUuid('table_id')->nullable()->constrained('tables')->onDelete('set null');
            $table->decimal('subtotal', 10, 2);
            $table->decimal('discount', 10, 2)->default(0.00);
            $table->decimal('total', 10, 2);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['restaurant_id', 'status', 'order_type']);
        });

        // 2. ORDER_ITEMS
        Schema::create('order_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignUuid('product_id')->constrained('products')->onDelete('cascade');
            $table->foreignUuid('size_id')->nullable()->constrained('product_sizes')->onDelete('set null');
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2); // Preserves exact historical checkout price
            $table->decimal('subtotal', 10, 2);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 3. ORDER_ITEM_MODIFIERS
        Schema::create('order_item_modifiers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_item_id')->constrained('order_items')->onDelete('cascade');
            $table->foreignUuid('modifier_option_id')->constrained('modifier_options')->onDelete('cascade');
            $table->integer('quantity')->default(1);
            $table->decimal('price_adjustment', 10, 2);
            $table->timestamps();
        });

        // 4. ONLINE_ORDERS
        Schema::create('online_orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_id')->constrained('orders')->onDelete('cascade');
            $table->string('customer_phone');
            $table->string('customer_name');
            $table->string('rejection_reason')->nullable();
            $table->timestamps();
        });

        // 5. PAYMENTS
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_id')->constrained('orders')->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->string('payment_method', 30)->default('CASH'); // CASH
            $table->string('status', 30)->default('PAID'); // PAID, REFUNDED
            $table->timestamp('paid_at')->useCurrent();
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // 6. CASH_SESSIONS
        Schema::create('cash_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('restaurant_id')->constrained('restaurants')->onDelete('cascade');
            $table->foreignUuid('opened_by_user_id')->constrained('users')->onDelete('cascade');
            $table->foreignUuid('closed_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('opened_at')->useCurrent();
            $table->timestamp('closed_at')->nullable();
            $table->decimal('opening_cash', 10, 2);
            $table->decimal('closing_cash_expected', 10, 2)->nullable();
            $table->decimal('closing_cash_actual', 10, 2)->nullable();
            $table->decimal('difference', 10, 2)->nullable();
            $table->string('status', 20)->default('OPEN'); // OPEN, CLOSED
            $table->timestamps();

            $table->index(['restaurant_id', 'status']);
        });

        // 7. CASH_MOVEMENTS
        Schema::create('cash_movements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('cash_session_id')->constrained('cash_sessions')->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->string('type', 20); // CASH_IN, CASH_OUT
            $table->string('reason');
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // 8. PROMOTIONS
        Schema::create('promotions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('restaurant_id')->constrained('restaurants')->onDelete('cascade');
            $table->string('name');
            $table->string('type', 30); // PERCENTAGE, FIXED
            $table->decimal('value', 10, 2);
            $table->string('code')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promotions');
        Schema::dropIfExists('cash_movements');
        Schema::dropIfExists('cash_sessions');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('online_orders');
        Schema::dropIfExists('order_item_modifiers');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
