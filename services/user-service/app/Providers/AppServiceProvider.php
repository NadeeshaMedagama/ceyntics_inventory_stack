<?php

namespace App\Providers;

use App\Events\UserCreated;
use App\Listeners\SendUserCreatedToAuditService;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\EloquentUserRepository;
use App\Services\Contracts\UserServiceInterface;
use App\Services\UserService;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // DIP — bind abstractions to concrete implementations
        $this->app->bind(UserRepositoryInterface::class , EloquentUserRepository::class);
        $this->app->bind(UserServiceInterface::class , UserService::class);
    }

    public function boot(): void
    {
        // Register event listeners
        Event::listen(UserCreated::class , SendUserCreatedToAuditService::class);
    }
}