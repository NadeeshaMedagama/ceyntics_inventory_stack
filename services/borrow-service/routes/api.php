<?php

use App\Http\Middleware\AuthenticateWithAuthService;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware([AuthenticateWithAuthService::class])->group(function () {
    Route::get('borrow-records', [\App\Http\Controllers\V1\BorrowRecordController::class , 'index']);
    Route::post('borrow-records', [\App\Http\Controllers\V1\BorrowRecordController::class , 'store']);
    Route::get('borrow-records/{id}', [\App\Http\Controllers\V1\BorrowRecordController::class , 'show']);
    Route::put('borrow-records/{id}', [\App\Http\Controllers\V1\BorrowRecordController::class , 'update']);
    Route::post('borrow-records/{id}/return', [\App\Http\Controllers\V1\BorrowRecordController::class , 'returnItem']);
});