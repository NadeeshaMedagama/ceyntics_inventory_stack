<?php

namespace App\Providers;

use App\Services\BorrowService;
use App\Services\Contracts\BorrowServiceInterface;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(BorrowServiceInterface::class , BorrowService::class);
    }

    public function boot(): void
    {
    }
}