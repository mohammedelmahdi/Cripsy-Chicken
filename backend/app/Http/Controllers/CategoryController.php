<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $restaurantId = $request->user()->restaurant_id;
        $categories = Category::where('restaurant_id', $restaurantId)
            ->orderBy('sort_order', 'asc')
            ->get();

        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $restaurantId = $request->user()->restaurant_id;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'icon' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
        ]);

        $validated['restaurant_id'] = $restaurantId;
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category = Category::create($validated);

        return response()->json($category, 201);
    }

    public function show(Request $request, $id)
    {
        $restaurantId = $request->user()->restaurant_id;
        $category = Category::where('restaurant_id', $restaurantId)->findOrFail($id);

        return response()->json($category);
    }

    public function update(Request $request, $id)
    {
        $restaurantId = $request->user()->restaurant_id;
        $category = Category::where('restaurant_id', $restaurantId)->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'icon' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
        ]);

        if (isset($validated['name']) && empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category->update($validated);

        return response()->json($category);
    }

    public function destroy(Request $request, $id)
    {
        $restaurantId = $request->user()->restaurant_id;
        $category = Category::where('restaurant_id', $restaurantId)->findOrFail($id);
        $category->delete();

        return response()->json(['success' => true]);
    }
}
