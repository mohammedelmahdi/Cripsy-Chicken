<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. RESTAURANTS
        Schema::create('restaurants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('logo_path')->nullable();
            $table->string('currency', 10)->default('DZD');
            $table->string('default_language', 5)->default('en');
            $table->string('timezone')->default('UTC');
            $table->timestamps();
        });

        // 2. ROLES
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // ADMIN, MANAGER, CASHIER, KITCHEN
            $table->timestamps();
        });

        // 3. USERS
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('restaurant_id')->constrained('restaurants')->onDelete('cascade');
            $table->foreignId('role_id')->constrained('roles')->onDelete('restrict');
            $table->string('name');
            $table->string('pin_hash'); // NEVER plaintext
            $table->boolean('is_active')->default(true);
            $table->rememberToken();
            $table->timestamps();

            $table->index(['restaurant_id', 'is_active']);
        });

        // 4. TABLES
        Schema::create('tables', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('restaurant_id')->constrained('restaurants')->onDelete('cascade');
            $table->string('name');
            $table->integer('capacity')->default(4);
            $table->string('status', 30)->default('AVAILABLE'); // AVAILABLE, OCCUPIED, RESERVED
            $table->integer('position_x')->default(0);
            $table->integer('position_y')->default(0);
            $table->timestamps();

            $table->index(['restaurant_id', 'status']);
        });

        // 5. CUSTOMERS
        Schema::create('customers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('restaurant_id')->constrained('restaurants')->onDelete('cascade');
            $table->string('name');
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['restaurant_id', 'phone']);
        });

        // 6. AUDIT_LOGS
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('restaurant_id')->constrained('restaurants')->onDelete('cascade');
            $table->foreignUuid('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('action'); // LOGIN, LOGOUT, CREATE_ORDER, etc.
            $table->string('entity')->nullable(); // orders, products, etc.
            $table->string('entity_id')->nullable();
            $table->json('metadata')->nullable(); // logs change data safely
            $table->timestamp('created_at')->useCurrent();

            $table->index(['restaurant_id', 'action']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('tables');
        Schema::dropIfExists('users');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('restaurants');
    }
};
