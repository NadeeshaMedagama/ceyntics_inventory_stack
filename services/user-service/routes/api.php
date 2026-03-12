<?php

use App\Http\Middleware\AuthenticateWithAuthService;
use App\Http\Middleware\RequireAdminRole;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware([AuthenticateWithAuthService::class])->group(function () {
    Route::prefix('users')->group(function () {
            Route::get('/', [\App\Http\Controllers\V1\UserController::class , 'index'])
                ->middleware(RequireAdminRole::class);
            Route::post('/', [\App\Http\Controllers\V1\UserController::class , 'store'])
                ->middleware(RequireAdminRole::class);
            Route::get('/{id}', [\App\Http\Controllers\V1\UserController::class , 'show'])
                ->middleware(RequireAdminRole::class);
            Route::put('/{id}', [\App\Http\Controllers\V1\UserController::class , 'update'])
                ->middleware(RequireAdminRole::class);
            Route::delete('/{id}', [\App\Http\Controllers\V1\UserController::class , 'destroy'])
                ->middleware(RequireAdminRole::class);
        }
        );
    });