<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductSize;
use App\Models\ProductPrice;
use App\Models\ModifierGroup;
use App\Models\ModifierOption;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $restaurantId = 'cc-restaurant-uuid-1';

        // 1. Create Sizing options
        $sizeSolo = ProductSize::firstOrCreate(['id' => 'sz-solo'], ['name' => 'Solo']);
        $sizeMedium = ProductSize::firstOrCreate(['id' => 'sz-medium'], ['name' => 'Medium Menu']);
        $sizeLarge = ProductSize::firstOrCreate(['id' => 'sz-large'], ['name' => 'Large Menu']);

        // 2. Base Categories
        $categories = [
            [
                'id' => 'cat-burgers',
                'name' => 'Burgers',
                'slug' => 'burgers',
                'icon' => 'Beef',
                'sort_order' => 1,
            ],
            [
                'id' => 'cat-tacos',
                'name' => 'Tacos',
                'slug' => 'tacos',
                'icon' => 'Triangle',
                'sort_order' => 2,
            ],
            [
                'id' => 'cat-drinks',
                'name' => 'Drinks',
                'slug' => 'drinks',
                'icon' => 'CupSoda',
                'sort_order' => 3,
            ],
            [
                'id' => 'cat-extras',
                'name' => 'Extras',
                'slug' => 'extras',
                'icon' => 'PlusCircle',
                'sort_order' => 4,
            ]
        ];

        foreach ($categories as $cat) {
            Category::firstOrCreate(
                ['id' => $cat['id']],
                [
                    'restaurant_id' => $restaurantId,
                    'name' => $cat['name'],
                    'slug' => $cat['slug'],
                    'icon' => $cat['icon'],
                    'sort_order' => $cat['sort_order'],
                ]
            );
        }

        // 3. Create Sauce Modifier Group
        $sauceGroup = ModifierGroup::firstOrCreate(
            ['id' => 'grp-sauces'],
            [
                'restaurant_id' => $restaurantId,
                'name' => 'Select Sauce',
                'min_selections' => 0,
                'max_selections' => 2,
            ]
        );

        $sauces = [
            ['id' => 'opt-mayo', 'name' => 'Mayonnaise', 'price' => 0.00],
            ['id' => 'opt-ketchup', 'name' => 'Ketchup', 'price' => 0.00],
            ['id' => 'opt-harissa', 'name' => 'Algerian Harissa', 'price' => 0.00],
            ['id' => 'opt-cheesy', 'name' => 'Warm Cheese Sauce', 'price' => 50.00],
        ];

        foreach ($sauces as $s) {
            ModifierOption::firstOrCreate(
                ['id' => $s['id']],
                [
                    'modifier_group_id' => $sauceGroup->id,
                    'name' => $s['name'],
                    'price_adjustment' => $s['price'],
                    'is_active' => true,
                ]
            );
        }

        // 4. Products & prices
        // Product 1: Crispy Classic Burger
        $burger1 = Product::firstOrCreate(
            ['id' => 'prod-burger-classic'],
            [
                'restaurant_id' => $restaurantId,
                'category_id' => 'cat-burgers',
                'name' => 'Crispy Classic Burger',
                'description' => 'Crispy golden chicken fillet, premium lettuce, mayo and melted cheese.',
                'is_active' => true,
                'track_stock' => true,
                'current_stock' => 120.00,
            ]
        );

        ProductPrice::firstOrCreate(['id' => 'pr-bc-solo'], [
            'product_id' => $burger1->id,
            'size_id' => $sizeSolo->id,
            'price' => 550.00,
        ]);
        ProductPrice::firstOrCreate(['id' => 'pr-bc-medium'], [
            'product_id' => $burger1->id,
            'size_id' => $sizeMedium->id,
            'price' => 750.00,
        ]);
        ProductPrice::firstOrCreate(['id' => 'pr-bc-large'], [
            'product_id' => $burger1->id,
            'size_id' => $sizeLarge->id,
            'price' => 850.00,
        ]);

        $burger1->modifierGroups()->syncWithoutDetaching([$sauceGroup->id]);

        // Product 2: Crispy Volcano Burger (Spicy)
        $burger2 = Product::firstOrCreate(
            ['id' => 'prod-burger-volcano'],
            [
                'restaurant_id' => $restaurantId,
                'category_id' => 'cat-burgers',
                'name' => 'Crispy Volcano Burger',
                'description' => 'Fiery spicy crispy chicken fillet, spicy relish, jalapeños, and magma sauce.',
                'is_active' => true,
                'track_stock' => true,
                'current_stock' => 85.00,
            ]
        );

        ProductPrice::firstOrCreate(['id' => 'pr-bv-solo'], [
            'product_id' => $burger2->id,
            'size_id' => $sizeSolo->id,
            'price' => 600.00,
        ]);
        ProductPrice::firstOrCreate(['id' => 'pr-bv-medium'], [
            'product_id' => $burger2->id,
            'size_id' => $sizeMedium->id,
            'price' => 800.00,
        ]);

        $burger2->modifierGroups()->syncWithoutDetaching([$sauceGroup->id]);

        // Product 3: French Tacos (Double)
        $tacos1 = Product::firstOrCreate(
            ['id' => 'prod-tacos-double'],
            [
                'restaurant_id' => $restaurantId,
                'category_id' => 'cat-tacos',
                'name' => 'French Tacos Double',
                'description' => 'Two crispy tenders, french fries, and our signature warm cheesy sauce folded in a tortilla.',
                'is_active' => true,
                'track_stock' => false,
                'current_stock' => 0.00,
            ]
        );

        ProductPrice::firstOrCreate(['id' => 'pr-td-solo'], [
            'product_id' => $tacos1->id,
            'size_id' => null,
            'price' => 700.00,
        ]);

        $tacos1->modifierGroups()->syncWithoutDetaching([$sauceGroup->id]);

        // Product 4: Algerian Hamoud Boualem Soda
        $drink1 = Product::firstOrCreate(
            ['id' => 'prod-drink-hamoud'],
            [
                'restaurant_id' => $restaurantId,
                'category_id' => 'cat-drinks',
                'name' => 'Hamoud Boualem 33cl',
                'description' => 'Traditional refreshing Algerian lemonade soda.',
                'is_active' => true,
                'track_stock' => true,
                'current_stock' => 300.00,
            ]
        );

        ProductPrice::firstOrCreate(['id' => 'pr-dh-solo'], [
            'product_id' => $drink1->id,
            'size_id' => null,
            'price' => 120.00,
        ]);
    }
}
