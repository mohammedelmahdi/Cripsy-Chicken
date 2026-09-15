<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\TableController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OnlineOrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\CashSessionController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\AuditLogController;

/*
|--------------------------------------------------------------------------
| API Routes — Cripsy Chicken POS (Phase 1)
|--------------------------------------------------------------------------
*/

// Authentication
Route::post('/auth/login', [AuthController::class, 'login']);

// Authenticated Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Catalog & Products
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('products', ProductController::class);
    Route::get('/products/prices', [ProductController::class, 'prices']);

    // Ingredients & Recipe-based Stock Inventory
    Route::get('/ingredients', [InventoryController::class, 'indexIngredients']);
    Route::post('/ingredients', [InventoryController::class, 'storeIngredient']);
    Route::get('/inventory/stock', [InventoryController::class, 'fetchStock']);
    Route::post('/inventory/adjust', [InventoryController::class, 'adjustStock']);

    // Suppliers & Sourcing Purchases
    Route::apiResource('suppliers', SupplierController::class);
    Route::get('/suppliers/{id}/balance', [SupplierController::class, 'balanceHistory']);
    Route::apiResource('purchases', SupplierController::class); // Reuses supplier context for purchases

    // Minor Cash register disbursements
    Route::apiResource('expenses', ExpenseController::class);

    // Dynamic Floor Layout tables
    Route::apiResource('tables', TableController::class);
    Route::put('/tables/{id}/status', [TableController::class, 'updateStatus']);

    // Customer Relationship Directories
    Route::apiResource('customers', CustomerController::class);

    // Sales Orders, Items, & Modifiers
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);
    Route::post('/orders/{id}/refund', [OrderController::class, 'refund']);
    Route::post('/orders/sync', [OrderController::class, 'syncQueue']);

    // Online Ordering dispatch queue
    Route::get('/online-orders', [OnlineOrderController::class, 'index']);
    Route::post('/online-orders/{id}/accept', [OnlineOrderController::class, 'accept']);
    Route::post('/online-orders/{id}/reject', [OnlineOrderController::class, 'reject']);

    // Transactional payments
    Route::post('/payments', [PaymentController::class, 'store']);

    // Cash Register & Drawer Reconciliation
    Route::get('/cash-sessions/status', [CashSessionController::class, 'status']);
    Route::post('/cash-sessions/open', [CashSessionController::class, 'open']);
    Route::post('/cash-sessions/close', [CashSessionController::class, 'close']);
    Route::post('/cash-sessions/movements', [CashSessionController::class, 'recordMovement']);

    // BI Business Intelligence analytics
    Route::get('/reports/kpi', [ReportController::class, 'kpis']);
    Route::get('/reports/sales-share', [ReportController::class, 'salesChannelShare']);
    Route::get('/reports/top-products', [ReportController::class, 'topSellingProducts']);

    // Staff Pin Management (Manager & Admin access roles)
    Route::apiResource('staff', StaffController::class);
    Route::post('/staff/{id}/reset-pin', [StaffController::class, 'resetPin']);

    // Configuration
    Route::get('/settings', [SettingsController::class, 'show']);
    Route::put('/settings', [SettingsController::class, 'update']);

    // Security compliance ledger
    Route::get('/audit-logs', [AuditLogController::class, 'index']);
});
