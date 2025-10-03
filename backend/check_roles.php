<?php

// Quick diagnostic script to check role-based access setup
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\LetterType;
use App\Models\User;

echo "===========================================\n";
echo "Role-Based Access Diagnostic\n";
echo "===========================================\n\n";

// Check if allowed_roles column exists
echo "1. Checking database schema...\n";
try {
    $letterType = LetterType::first();
    if ($letterType) {
        $attributes = $letterType->getAttributes();
        if (array_key_exists('allowed_roles', $attributes)) {
            echo "   ✓ allowed_roles column EXISTS\n";
        } else {
            echo "   ✗ allowed_roles column MISSING\n";
            echo "   → Run: php artisan migrate\n";
        }
    } else {
        echo "   ⚠ No letter types found\n";
        echo "   → Run: php artisan db:seed --class=LetterTypeSeeder\n";
    }
} catch (Exception $e) {
    echo "   ✗ Error: " . $e->getMessage() . "\n";
}

echo "\n2. Checking letter types...\n";
$types = LetterType::all();
foreach ($types as $type) {
    echo "   - {$type->name}\n";
    if ($type->allowed_roles) {
        echo "     Allowed roles: " . implode(', ', $type->allowed_roles) . "\n";
    } else {
        echo "     ⚠ No role restrictions (accessible to all)\n";
    }
}

if ($types->isEmpty()) {
    echo "   ✗ No letter types found\n";
    echo "   → Run: php artisan db:seed --class=LetterTypeSeeder\n";
}

echo "\n3. Checking users...\n";
$users = User::take(5)->get();
foreach ($users as $user) {
    echo "   - {$user->email} (role: {$user->role})\n";
}

if ($users->isEmpty()) {
    echo "   ✗ No users found\n";
    echo "   → Run: php artisan users:import storage/users_sample.csv\n";
}

echo "\n===========================================\n";
echo "Next Steps:\n";
echo "===========================================\n";

$hasAllowedRoles = false;
foreach ($types as $type) {
    if ($type->allowed_roles) {
        $hasAllowedRoles = true;
        break;
    }
}

if (!$hasAllowedRoles) {
    echo "1. Run migration:\n";
    echo "   php artisan migrate\n\n";
    echo "2. Re-seed letter types:\n";
    echo "   php artisan db:seed --class=LetterTypeSeeder\n\n";
}

if ($users->isEmpty()) {
    echo "3. Import users:\n";
    echo "   php artisan users:import storage/users_sample.csv\n\n";
}

if ($hasAllowedRoles && !$users->isEmpty()) {
    echo "✓ Everything looks good!\n";
    echo "  Clear browser cache and try again.\n\n";
}

echo "===========================================\n";
