<?php

namespace App\Http\Controllers;

use App\Models\Restaurant;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function show(Request $request)
    {
        $restaurantId = $request->user()->restaurant_id;
        $restaurant = Restaurant::findOrFail($restaurantId);

        return response()->json($restaurant);
    }

    public function update(Request $request)
    {
        $restaurantId = $request->user()->restaurant_id;
        $restaurant = Restaurant::findOrFail($restaurantId);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'logo_path' => 'nullable|string',
            'currency' => 'nullable|string|max:10',
            'default_language' => 'nullable|string|max:10',
            'timezone' => 'nullable|string|max:100',
        ]);

        $restaurant->update($validated);

        return response()->json($restaurant);
    }
}
