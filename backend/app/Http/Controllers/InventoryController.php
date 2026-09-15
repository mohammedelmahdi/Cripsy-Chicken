<?php

namespace App\Http\Controllers;

use App\Models\Ingredient;
use App\Models\InventoryMovement;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function indexIngredients(Request $request)
    {
        $restaurantId = $request->user()->restaurant_id;
        $ingredients = Ingredient::where('restaurant_id', $restaurantId)->get();

        return response()->json($ingredients);
    }

    public function storeIngredient(Request $request)
    {
        $restaurantId = $request->user()->restaurant_id;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'current_stock' => 'nullable|numeric',
            'min_stock_level' => 'nullable|numeric',
            'unit' => 'nullable|string|max:15',
        ]);

        $validated['restaurant_id'] = $restaurantId;
        $ingredient = Ingredient::create($validated);

        return response()->json($ingredient, 201);
    }

    public function fetchStock(Request $request)
    {
        $restaurantId = $request->user()->restaurant_id;
        $ingredients = Ingredient::where('restaurant_id', $restaurantId)->get();

        return response()->json($ingredients->map(function ($item) {
            return [
                'id' => $item->id,
                'name' => $item->name,
                'currentStock' => (float) $item->current_stock,
                'minLevel' => (float) $item->min_stock_level,
                'unit' => $item->unit,
                'trackStock' => true,
            ];
        }));
    }

    public function adjustStock(Request $request)
    {
        $restaurantId = $request->user()->restaurant_id;

        $validated = $request->validate([
            'productId' => 'required|string', // Could be ingredient_id or product_id
            'quantity' => 'required|numeric|min:0.01',
            'type' => 'required|string|in:addition,subtraction',
            'reason' => 'nullable|string',
        ]);

        // Attempt to find ingredient by id
        $ingredient = Ingredient::where('restaurant_id', $restaurantId)
            ->where('id', $validated['productId'])
            ->first();

        if ($ingredient) {
            $qty = (float) $validated['quantity'];
            if ($validated['type'] === 'addition') {
                $ingredient->current_stock += $qty;
            } else {
                $ingredient->current_stock = max(0, $ingredient->current_stock - $qty);
            }
            $ingredient->save();

            // Record movement
            InventoryMovement::create([
                'restaurant_id' => $restaurantId,
                'ingredient_id' => $ingredient->id,
                'movement_type' => $validated['type'] === 'addition' ? 'STOCK_IN' : 'STOCK_OUT',
                'quantity' => $qty,
                'reason' => $validated['reason'] ?? 'Manual adjustment',
                'user_id' => $request->user()->id,
            ]);

            return response()->json([
                'success' => true,
                'newStock' => (float) $ingredient->current_stock,
            ]);
        }

        return response()->json(['success' => false, 'message' => 'Ingredient not found'], 404);
    }
}
