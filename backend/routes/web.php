<?php
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Letters pages
    Route::get('letters', function () {
        return Inertia::render('letters/index');
    })->name('letters.index');

    Route::get('letters/create', function () {
        return Inertia::render('letters/create');
    })->name('letters.create');

    Route::get('letters/{id}', function ($id) {
        return Inertia::render('letters/show', [
            'id' => (int) $id,
        ]);
    })->name('letters.show');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
