<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Retrives the complete menu list grouped by categories.
     * Incorporates nested sizing structures and related modifiers.
     */
    public function index(Request $request)
    {
        $restaurantId = $request->user()->restaurant_id;

        $categories = Category::where('restaurant_id', $restaurantId)
            ->orderBy('sort_order', 'asc')
            ->get();

        $products = Product::where('restaurant_id', $restaurantId)
            ->where('is_active', true)
            ->with(['prices.size', 'modifierGroups.options' => function($query) {
                $query->where('is_active', true);
            }])
            ->get();

        // Format into a standard clean API response matching client expectations
        $menu = $categories->map(function ($category) use ($products) {
            return [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'icon' => $category->icon,
                'products' => $products->where('category_id', $category->id)->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'description' => $product->description,
                        'track_stock' => $product->track_stock,
                        'current_stock' => $product->current_stock,
                        'prices' => $product->prices->map(function ($price) {
                            return [
                                'size_id' => $price->size_id,
                                'size_name' => $price->size ? $price->size->name : null,
                                'order_type' => $price->order_type,
                                'price' => (float) $price->price,
                            ];
                        }),
                        'modifiers' => $product->modifierGroups->map(function ($group) {
                            return [
                                'id' => $group->id,
                                'name' => $group->name,
                                'min_selections' => $group->min_selections,
                                'max_selections' => $group->max_selections,
                                'options' => $group->options->map(function ($option) {
                                    return [
                                        'id' => $option->id,
                                        'name' => $option->name,
                                        'price' => (float) $option->price_adjustment,
                                    ];
                                }),
                            ];
                        }),
                    ];
                })->values()->toArray(),
            ];
        });

        return response()->json([
            'success' => true,
            'menu' => $menu,
        ]);
    }
}
