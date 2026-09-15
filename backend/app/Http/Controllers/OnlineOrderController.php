<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OnlineOrder;
use Illuminate\Http\Request;

class OnlineOrderController extends Controller
{
    public function index(Request $request)
    {
        $restaurantId = $request->user()->restaurant_id;

        // Fetch orders of type ONLINE which are in 'NEW' or pending status
        $orders = Order::where('restaurant_id', $restaurantId)
            ->where('order_type', 'ONLINE')
            ->whereIn('status', ['NEW', 'PENDING'])
            ->with(['items.product', 'items.modifiers', 'customer'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    public function accept(Request $request, $id)
    {
        $restaurantId = $request->user()->restaurant_id;

        $order = Order::where('restaurant_id', $restaurantId)
            ->where('order_type', 'ONLINE')
            ->findOrFail($id);

        $order->update(['status' => 'ACCEPTED']);

        return response()->json([
            'success' => true,
            'message' => 'Online order accepted and pushed to preparation queue.',
            'order' => $order
        ]);
    }

    public function reject(Request $request, $id)
    {
        $restaurantId = $request->user()->restaurant_id;

        $order = Order::where('restaurant_id', $restaurantId)
            ->where('order_type', 'ONLINE')
            ->findOrFail($id);

        $validated = $request->validate([
            'reason' => 'nullable|string|max:255',
        ]);

        $order->update(['status' => 'REJECTED']);

        // Update or create detailed rejection notes
        OnlineOrder::updateOrCreate(
            ['order_id' => $order->id],
            [
                'customer_phone' => $order->customer->phone ?? 'N/A',
                'customer_name' => $order->customer->name ?? 'N/A',
                'rejection_reason' => $validated['reason'] ?? 'Rejected by staff',
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Online order rejected.',
            'order' => $order
        ]);
    }
}
