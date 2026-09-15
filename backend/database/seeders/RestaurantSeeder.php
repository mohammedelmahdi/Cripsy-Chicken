<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Restaurant;

class RestaurantSeeder extends Seeder
{
    public function run(): void
    {
        Restaurant::firstOrCreate(
            ['slug' => 'crispy-chicken-algiers'],
            [
                'id' => 'cc-restaurant-uuid-1',
                'name' => 'Crispy Chicken Algiers',
                'phone' => '+213 21 00 00 00',
                'address' => 'Didouche Mourad, Algiers, Algeria',
                'logo_path' => '/assets/crispy_logo.png',
                'currency' => 'DA',
                'default_language' => 'en',
                'timezone' => 'Africa/Algiers',
            ]
        );
    }
}
