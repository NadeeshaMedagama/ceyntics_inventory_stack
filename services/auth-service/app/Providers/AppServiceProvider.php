<?php

namespace App\Providers;

use App\Repositories\Contracts\UserAuthRepositoryInterface;
use App\Repositories\EloquentUserAuthRepository;
use App\Services\AuthService;
use App\Services\Contracts\AuthServiceInterface;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Dependency Inversion Principle — bind interfaces to concrete implementations
     */
    public function register(): void
    {
        // Repository binding
        $this->app->bind(
            UserAuthRepositoryInterface::class ,
            EloquentUserAuthRepository::class
        );

        // Service binding
        $this->app->bind(
            AuthServiceInterface::class ,
            AuthService::class
        );
    }

    public function boot(): void
    {
    //
    }
}