<?php

namespace App\Providers;

use App\Repositories\Contracts\ItemRepositoryInterface;
use App\Repositories\EloquentItemRepository;
use App\Services\Contracts\AuditPublisherInterface;
use App\Services\Contracts\ItemServiceInterface;
use App\Services\HttpAuditPublisher;
use App\Services\ItemService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(ItemRepositoryInterface::class , EloquentItemRepository::class);
        $this->app->bind(ItemServiceInterface::class , ItemService::class);
        $this->app->bind(AuditPublisherInterface::class , HttpAuditPublisher::class);
    }

    public function boot(): void
    {
    }
}