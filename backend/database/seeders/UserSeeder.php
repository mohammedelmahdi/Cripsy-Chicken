<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $restaurantId = 'cc-restaurant-uuid-1';

        $staff = [
            [
                'id' => 'usr-1',
                'name' => 'Karim (Cashier)',
                'role' => 'CASHIER',
                'pin' => '1234',
            ],
            [
                'id' => 'usr-2',
                'name' => 'Amine (Manager)',
                'role' => 'MANAGER',
                'pin' => '9999',
            ],
            [
                'id' => 'usr-3',
                'name' => 'Sofia (Admin)',
                'role' => 'ADMIN',
                'pin' => '0000',
            ],
            [
                'id' => 'usr-4',
                'name' => 'Yacine (Chef)',
                'role' => 'KITCHEN',
                'pin' => '5555',
            ],
        ];

        foreach ($staff as $item) {
            $role = Role::where('name', $item['role'])->first();
            
            User::firstOrCreate(
                ['id' => $item['id']],
                [
                    'restaurant_id' => $restaurantId,
                    'role_id' => $role->id,
                    'name' => $item['name'],
                    'pin_hash' => Hash::make($item['pin']),
                    'is_active' => true,
                ]
            );
        }
    }
}
