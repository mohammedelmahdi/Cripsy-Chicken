<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'order_id' => 'required|uuid|exists:orders,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string|max:30',
        ]);

        $restaurantId = $request->user()->restaurant_id;

        // Verify the order belongs to this restaurant
        $order = Order::where('restaurant_id', $restaurantId)->findOrFail($request->order_id);

        $payment = DB::transaction(function () use ($request, $order) {
            $payment = Payment::create([
                'order_id' => $order->id,
                'amount' => $request->amount,
                'payment_method' => $request->payment_method,
                'status' => 'PAID',
                'user_id' => $request->user()->id,
                'paid_at' => now(),
            ]);

            // Mark order as COMPLETED (or appropriate status)
            $order->update(['status' => 'COMPLETED']);

            return $payment;
        });

        return response()->json([
            'success' => true,
            'payment' => $payment,
            'order_status' => 'COMPLETED',
        ], 201);
    }
}
