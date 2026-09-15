<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function kpis(Request $request)
    {
        $restaurantId = $request->user()->restaurant_id;

        // Fetch metrics for Completed orders belonging to this branch
        $ordersQuery = Order::where('restaurant_id', $restaurantId)
            ->whereIn('status', ['COMPLETED', 'PAID']);

        $totalSales = (float) $ordersQuery->sum('total');
        $totalCount = $ordersQuery->count();
        $averageBasket = $totalCount > 0 ? round($totalSales / $totalCount, 2) : 0.00;

        // Fetch active order count (e.g. preparing, ready)
        $activeOrders = Order::where('restaurant_id', $restaurantId)
            ->whereIn('status', ['NEW', 'ACCEPTED', 'PREPARING', 'READY'])
            ->count();

        return response()->json([
            'totalSales' => $totalSales,
            'totalCount' => $totalCount,
            'averageBasket' => $averageBasket,
            'activeOrders' => $activeOrders,
        ]);
    }

    public function salesChannelShare(Request $request)
    {
        $restaurantId = $request->user()->restaurant_id;

        $shares = Order::where('restaurant_id', $restaurantId)
            ->whereIn('status', ['COMPLETED', 'PAID'])
            ->select('order_type', DB::raw('SUM(total) as total_sales'))
            ->groupBy('order_type')
            ->get();

        $formatted = $shares->map(function ($item) {
            return [
                'name' => $item->order_type === 'COUNTER' ? 'Counter' : ($item->order_type === 'DINE_IN' ? 'Dine In' : ($item->order_type === 'DELIVERY' ? 'Delivery' : 'Online')),
                'value' => (float) $item->total_sales,
            ];
        });

        return response()->json($formatted);
    }

    public function topSellingProducts(Request $request)
    {
        $restaurantId = $request->user()->restaurant_id;

        $topItems = OrderItem::whereHas('order', function ($query) use ($restaurantId) {
                $query->where('restaurant_id', $restaurantId)
                    ->whereIn('status', ['COMPLETED', 'PAID']);
            })
            ->select('product_id', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(subtotal) as total_revenue'))
            ->groupBy('product_id')
            ->with('product')
            ->orderBy('total_qty', 'desc')
            ->take(5)
            ->get();

        $formatted = $topItems->map(function ($item) {
            return [
                'name' => $item->product->name ?? 'Unknown Item',
                'sales' => (int) $item->total_qty,
                'revenue' => (float) $item->total_revenue,
            ];
        });

        return response()->json($formatted);
    }
}
