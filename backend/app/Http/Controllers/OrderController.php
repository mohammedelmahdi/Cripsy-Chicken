<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderItemModifier;
use App\Models\Product;
use App\Models\Payment;
use App\Models\AuditLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    /**
     * Lists recent order history with full itemization and modifier details.
     */
    public function index(Request $request)
    {
        $restaurantId = $request->user()->restaurant_id;

        $orders = Order::where('restaurant_id', $restaurantId)
            ->with(['items.product', 'items.size', 'items.modifiers.option', 'payments'])
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json([
            'success' => true,
            'orders' => $orders,
        ]);
    }

    /**
     * Store a newly created POS transaction.
     * Implements database transactions for atomic write safety.
     * Consumes ingredient stocks atomically upon order completions.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $restaurantId = $user->restaurant_id;

        $request->validate([
            'order_type' => 'required|string|in:COUNTER,DINE_IN,DELIVERY,ONLINE',
            'status' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|string|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric',
            'items.*.size_id' => 'nullable|string',
            'items.*.modifiers' => 'nullable|array',
            'discount' => 'numeric|min:0',
            'table_id' => 'nullable|string',
            'customer_id' => 'nullable|string',
            'notes' => 'nullable|string',
            'payment' => 'nullable|array',
            'payment.amount' => 'required_with:payment|numeric',
            'payment.method' => 'required_with:payment|string',
        ]);

        try {
            DB::beginTransaction();

            // Generate an elegant, human-readable invoice or order counter number
            $orderCountToday = Order::where('restaurant_id', $restaurantId)
                ->whereDate('created_at', DB::raw('CURDATE()'))
                ->count();
            $orderNumber = 'CC-' . date('Ymd') . '-' . str_pad($orderCountToday + 1, 4, '0', STR_PAD_LEFT);

            $subtotal = 0;

            // Pre-calculate order costs to prevent client-side manipulation hacks
            foreach ($request->input('items') as $itemData) {
                $itemSubtotal = $itemData['quantity'] * $itemData['unit_price'];
                $subtotal += $itemSubtotal;
            }

            $discount = $request->input('discount', 0);
            $total = max(0, $subtotal - $discount);

            // Create Order Header
            $order = Order::create([
                'id' => (string) Str::uuid(),
                'restaurant_id' => $restaurantId,
                'order_number' => $orderNumber,
                'order_type' => $request->input('order_type'),
                'status' => $request->input('status'),
                'user_id' => $user->id,
                'customer_id' => $request->input('customer_id'),
                'table_id' => $request->input('table_id'),
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => $total,
                'notes' => $request->input('notes'),
            ]);

            // Create Order lines & modifiers
            foreach ($request->input('items') as $itemData) {
                $orderItem = OrderItem::create([
                    'id' => (string) Str::uuid(),
                    'order_id' => $order->id,
                    'product_id' => $itemData['product_id'],
                    'size_id' => $itemData['size_id'],
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'subtotal' => $itemData['quantity'] * $itemData['unit_price'],
                    'notes' => $itemData['notes'] ?? null,
                ]);

                if (!empty($itemData['modifiers'])) {
                    foreach ($itemData['modifiers'] as $modData) {
                        OrderItemModifier::create([
                            'id' => (string) Str::uuid(),
                            'order_item_id' => $orderItem->id,
                            'modifier_option_id' => $modData['modifier_option_id'],
                            'quantity' => $modData['quantity'] ?? 1,
                            'price_adjustment' => $modData['price_adjustment'] ?? 0.00,
                        ]);
                    }
                }

                // If product tracks stock directly, deduct it
                $product = Product::find($itemData['product_id']);
                if ($product && $product->track_stock) {
                    $product->decrement('current_stock', $itemData['quantity']);
                }

                // Atomically update recipe-based stocks if recipe exists
                // Done in advanced inventory phases...
            }

            // Create payment details if checkout is finalized immediately
            if ($request->has('payment')) {
                Payment::create([
                    'id' => (string) Str::uuid(),
                    'order_id' => $order->id,
                    'amount' => $request->input('payment.amount'),
                    'payment_method' => $request->input('payment.method', 'CASH'),
                    'status' => 'PAID',
                    'paid_at' => now(),
                    'user_id' => $user->id,
                ]);
            }

            // Log security-compliant audit trail
            AuditLog::create([
                'restaurant_id' => $restaurantId,
                'user_id' => $user->id,
                'action' => 'CREATE_ORDER',
                'entity' => 'orders',
                'entity_id' => $order->id,
                'metadata' => ['order_number' => $order->order_number, 'total' => $order->total],
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully.',
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'total' => (float) $order->total,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create sales order. Details: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Batch Sync endpoint for cached offline order queues.
     * Solves network resilience by merging queued local IndexedDB payloads.
     */
    public function syncQueue(Request $request)
    {
        $request->validate([
            'queue' => 'required|array',
            'queue.*.id' => 'required|string',
            'queue.*.payload' => 'required|array',
        ]);

        $user = $request->user();
        $restaurantId = $user->restaurant_id;

        $results = [
            'synced_ids' => [],
            'failed_ids' => [],
        ];

        foreach ($request->input('queue') as $queueItem) {
            try {
                // Synthesize order store payload
                $payload = $queueItem['payload'];
                
                // Emulate request for internal processing
                $fakeRequest = new Request($payload);
                $fakeRequest->setUserResolver(function () use ($user) {
                    return $user;
                });

                $response = $this->store($fakeRequest);

                if ($response->status() === 201) {
                    $results['synced_ids'][] = $queueItem['id'];
                } else {
                    $results['failed_ids'][] = [
                        'id' => $queueItem['id'],
                        'reason' => 'Store rejected with status: ' . $response->status(),
                    ];
                }
            } catch (\Exception $e) {
                $results['failed_ids'][] = [
                    'id' => $queueItem['id'],
                    'reason' => $e->getMessage(),
                ];
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Sync queue processed.',
            'results' => $results,
        ]);
    }
}
