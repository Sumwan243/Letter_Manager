<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\LetterTypeController;
use App\Http\Controllers\API\LetterController;
use App\Http\Controllers\API\LetterTemplateController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\UserManagementController;
use App\Http\Controllers\API\DepartmentController;
use App\Http\Controllers\API\StaffController;

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Letter type routes (admin only for create/update/delete)
    Route::get('/letter-types', [LetterTypeController::class, 'index']);
    Route::get('/letter-types/{letterType}', [LetterTypeController::class, 'show']);
    
    // Letter routes
    Route::get('/letters', [LetterController::class, 'index']);
    Route::post('/letters', [LetterController::class, 'store']);
    Route::get('/letters/{letter}', [LetterController::class, 'show']);
    Route::put('/letters/{letter}', [LetterController::class, 'update']);
    Route::patch('/letters/{letter}/status', [LetterController::class, 'changeStatus']);

    // Letter template routes
    Route::apiResource('letter-templates', LetterTemplateController::class);
    // Departments
    Route::get('/departments', [DepartmentController::class, 'index']);
    Route::post('/departments', [DepartmentController::class, 'store']);

    // Staff
    Route::get('/staff', [StaffController::class, 'index']); // accepts ?department_id=
    Route::post('/staff', [StaffController::class, 'store']);
    Route::delete('/staff/{staff}', [StaffController::class, 'destroy']);

    // Profile
    Route::post('/profile', [UserController::class, 'updateProfile']);
    Route::put('/password', [UserController::class, 'updatePassword']);
    
    // Admin-only routes
    // Users list - accessible to all authenticated users (for dropdowns)
    Route::get('/users', [UserManagementController::class, 'index']);
    
    // Office Management - READ access for all authenticated users (staff need this for letter creation)
    Route::get('/offices', [\App\Http\Controllers\API\OfficeController::class, 'index']);
    Route::get('/offices/{office}', [\App\Http\Controllers\API\OfficeController::class, 'show']);
    Route::get('/offices/{office}/staff', [\App\Http\Controllers\API\OfficeController::class, 'getStaff']);
    
    Route::middleware('admin')->group(function () {
        Route::post('/letter-types', [LetterTypeController::class, 'store']);
        Route::put('/letter-types/{letterType}', [LetterTypeController::class, 'update']);
        Route::delete('/letter-types/{letterType}', [LetterTypeController::class, 'destroy']);
        Route::delete('/letters/{letter}', [LetterController::class, 'destroy']);
        
        // User Management (admin only)
        Route::put('/users/{user}/role', [UserManagementController::class, 'updateRole']);
        Route::put('/users/{user}/profile', [UserManagementController::class, 'updateProfile']);
        Route::put('/users/{user}/basic-info', [UserManagementController::class, 'updateBasicInfo']);
        Route::delete('/users/{user}', [UserManagementController::class, 'destroy']);
        Route::post('/users/bulk-import', [UserManagementController::class, 'bulkImport']);
        Route::get('/users/download-template', [UserManagementController::class, 'downloadTemplate']);
        
        // Office Management - WRITE access (admin only)
        Route::post('/offices', [\App\Http\Controllers\API\OfficeController::class, 'store']);
        Route::put('/offices/{office}', [\App\Http\Controllers\API\OfficeController::class, 'update']);
        Route::delete('/offices/{office}', [\App\Http\Controllers\API\OfficeController::class, 'destroy']);
    });
});