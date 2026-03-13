<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create default Admin user
        User::firstOrCreate(
        ['email' => 'admin@ceyntics.com'],
        [
            'name' => 'Ceyntics Admin',
            'password' => Hash::make('Admin@1234!'),
            'role' => 'admin',
            'is_active' => true,
        ]
        );

        $this->command->info('✅ Admin user seeded: admin@ceyntics.com / Admin@1234!');
    }
}