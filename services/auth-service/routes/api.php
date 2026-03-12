<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1/auth')->group(function () {
    Route::post('/login', [\App\Http\Controllers\V1\AuthController::class , 'login']);
    Route::post('/logout', [\App\Http\Controllers\V1\AuthController::class , 'logout'])
        ->middleware('auth:sanctum');
    Route::get('/me', [\App\Http\Controllers\V1\AuthController::class , 'me'])
        ->middleware('auth:sanctum');
    // Internal endpoint for other services to validate tokens
    Route::post('/validate-token', [\App\Http\Controllers\V1\AuthController::class , 'validateToken']);
});