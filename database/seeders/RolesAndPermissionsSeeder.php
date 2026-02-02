<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Silber\Bouncer\BouncerFacade as Bouncer;
use App\Models\User;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define Abilities
        Bouncer::allow('admin')->toOwnEverything();

        Bouncer::allow('manager')->to([
            'view-products',
            'create-products',
            'update-products',
            'delete-products',
            'view-orders',
            'create-orders',
            'update-orders',
            'view-customers',
            'create-customers',
            'update-customers',
            'view-warehouses',
            'create-warehouses',
            'update-warehouses',
            'delete-warehouses',
            'view-categories',
            'create-categories',
            'update-categories',
            'delete-categories',
        ]);

        Bouncer::allow('staff')->to([
            'view-products',
            'view-orders',
            'create-orders',
            'view-customers',
            'view-warehouses',
            'view-categories',
        ]);

        // Assign Role to First User (if exists)
        $admin = User::first();
        if ($admin) {
            Bouncer::assign('admin')->to($admin);
        }
    }
}
