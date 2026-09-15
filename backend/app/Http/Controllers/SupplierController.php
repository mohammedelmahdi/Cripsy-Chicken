<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SupplierController extends Controller
{
    /**
     * Handles both /suppliers and /purchases listing endpoints
     */
    public function index(Request $request)
    {
        $restaurantId = $request->user()->restaurant_id;

        // If route is purchases
        if (Str::contains($request->path(), 'purchases')) {
            $purchases = Purchase::where('restaurant_id', $restaurantId)
                ->with(['supplier', 'items.ingredient'])
                ->orderBy('purchase_date', 'desc')
                ->get();
            return response()->json($purchases);
        }

        $suppliers = Supplier::where('restaurant_id', $restaurantId)
            ->orderBy('name', 'asc')
            ->get();
        return response()->json($suppliers);
    }

    /**
     * Handles creating a new supplier or new purchase log
     */
    public function store(Request $request)
    {
        $restaurantId = $request->user()->restaurant_id;

        if (Str::contains($request->path(), 'purchases')) {
            $validated = $request->validate([
                'supplier_id' => 'required|uuid|exists:suppliers,id',
                'purchase_date' => 'required|date',
                'total_amount' => 'required|numeric',
                'items' => 'required|array',
                'items.*.ingredient_id' => 'required|uuid|exists:ingredients,id',
                'items.*.quantity' => 'required|numeric',
                'items.*.unit_cost' => 'required|numeric',
            ]);

            $count = Purchase::where('restaurant_id', $restaurantId)->count() + 1;
            $purchaseNum = 'PO-' . date('Ymd') . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);

            $purchase = Purchase::create([
                'restaurant_id' => $restaurantId,
                'supplier_id' => $validated['supplier_id'],
                'purchase_number' => $purchaseNum,
                'status' => 'PENDING',
                'total_amount' => $validated['total_amount'],
                'purchase_date' => $validated['purchase_date'],
            ]);

            foreach ($validated['items'] as $item) {
                PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'ingredient_id' => $item['ingredient_id'],
                    'quantity' => $item['quantity'],
                    'unit_cost' => $item['unit_cost'],
                    'subtotal' => $item['quantity'] * $item['unit_cost'],
                ]);
            }

            return response()->json($purchase->load('items'), 201);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'current_balance' => 'nullable|numeric',
        ]);

        $validated['restaurant_id'] = $restaurantId;
        $supplier = Supplier::create($validated);

        return response()->json($supplier, 201);
    }

    public function show(Request $request, $id)
    {
        $restaurantId = $request->user()->restaurant_id;

        if (Str::contains($request->path(), 'purchases')) {
            $purchase = Purchase::where('restaurant_id', $restaurantId)
                ->with(['supplier', 'items.ingredient'])
                ->findOrFail($id);
            return response()->json($purchase);
        }

        $supplier = Supplier::where('restaurant_id', $restaurantId)->findOrFail($id);
        return response()->json($supplier);
    }

    public function update(Request $request, $id)
    {
        $restaurantId = $request->user()->restaurant_id;

        if (Str::contains($request->path(), 'purchases')) {
            $purchase = Purchase::where('restaurant_id', $restaurantId)->findOrFail($id);
            $validated = $request->validate([
                'status' => 'required|string|in:PENDING,PAID,CANCELLED',
            ]);
            $purchase->update($validated);
            return response()->json($purchase);
        }

        $supplier = Supplier::where('restaurant_id', $restaurantId)->findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'contact_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'current_balance' => 'nullable|numeric',
        ]);

        $supplier->update($validated);
        return response()->json($supplier);
    }

    public function destroy(Request $request, $id)
    {
        $restaurantId = $request->user()->restaurant_id;

        if (Str::contains($request->path(), 'purchases')) {
            $purchase = Purchase::where('restaurant_id', $restaurantId)->findOrFail($id);
            $purchase->delete();
            return response()->json(['success' => true]);
        }

        $supplier = Supplier::where('restaurant_id', $restaurantId)->findOrFail($id);
        $supplier->delete();
        return response()->json(['success' => true]);
    }

    public function balanceHistory(Request $request, $id)
    {
        $restaurantId = $request->user()->restaurant_id;
        $supplier = Supplier::where('restaurant_id', $restaurantId)->findOrFail($id);

        // Simple history matching purchase order bills
        $purchases = Purchase::where('restaurant_id', $restaurantId)
            ->where('supplier_id', $supplier->id)
            ->orderBy('purchase_date', 'desc')
            ->get()
            ->map(function ($p) {
                return [
                    'date' => $p->purchase_date,
                    'reference' => $p->purchase_number,
                    'type' => 'BILL',
                    'amount' => (float) $p->total_amount,
                    'status' => $p->status,
                ];
            });

        return response()->json([
            'supplier' => $supplier,
            'history' => $purchases,
        ]);
    }
}
