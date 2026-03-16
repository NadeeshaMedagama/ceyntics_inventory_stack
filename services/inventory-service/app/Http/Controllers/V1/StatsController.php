<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ItemResource;
use App\Repositories\Contracts\ItemRepositoryInterface;
use App\Models\Cupboard;
use App\Models\Item;
use Illuminate\Http\JsonResponse;

class StatsController extends Controller
{
    public function __construct(
        private readonly ItemRepositoryInterface $itemRepository
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => [
                'total_items'     => Item::count(),
                'total_cupboards' => Cupboard::count(),
                'by_status'       => Item::selectRaw('status, count(*) as count')
                                        ->groupBy('status')
                                        ->pluck('count', 'status'),
                'low_stock'       => Item::where('quantity', '<=', 5)
                                        ->where('status', 'in-store')
                                        ->count(),
            ],
        ]);
    }
}