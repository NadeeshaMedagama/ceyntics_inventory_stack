<?php

use App\Http\Middleware\AuthenticateWithAuthService;
use App\Http\Middleware\RequireAdminOrStaffRole;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware([AuthenticateWithAuthService::class])->group(function () {

    // ── Cupboards ──────────────────────────────────────────
    Route::apiResource('cupboards', \App\Http\Controllers\V1\CupboardController::class);

    // ── Places ─────────────────────────────────────────────
    Route::apiResource('places', \App\Http\Controllers\V1\PlaceController::class);

    // ── Items ──────────────────────────────────────────────
    Route::apiResource('items', \App\Http\Controllers\V1\ItemController::class);
    Route::post('items/{id}/adjust-quantity',
    [\App\Http\Controllers\V1\ItemController::class , 'adjustQuantity']);

    // ── Dashboard stats ────────────────────────────────────
    Route::get('stats', [\App\Http\Controllers\V1\StatsController::class , 'index']);
});