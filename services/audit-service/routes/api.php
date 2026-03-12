<?php

use App\Http\Middleware\AuthenticateWithAuthService;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Internal event receiver — no auth required (called by other services)
    Route::post('events', [\App\Http\Controllers\V1\ActivityLogController::class , 'receiveEvent']);
});

Route::prefix('v1')->middleware([AuthenticateWithAuthService::class])->group(function () {
    // Admin query endpoint
    Route::get('audit-logs', [\App\Http\Controllers\V1\ActivityLogController::class , 'index']);
    Route::get('audit-logs/{id}', [\App\Http\Controllers\V1\ActivityLogController::class , 'show']);
});