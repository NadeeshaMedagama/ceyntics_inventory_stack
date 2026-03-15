<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreItemRequest;
use App\Http\Requests\UpdateItemRequest;
use App\Http\Requests\AdjustQuantityRequest;
use App\Http\Resources\ItemResource;
use App\Services\Contracts\ItemServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ItemController extends Controller
{
    public function __construct(
        private readonly ItemServiceInterface $itemService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $items = $this->itemService->getAllItems(
            $request->only(['status', 'place_id', 'search'])
        );

        return response()->json([
            'data' => ItemResource::collection($items->items()),
            'meta' => [
                'current_page' => $items->currentPage(),
                'last_page'    => $items->lastPage(),
                'per_page'     => $items->perPage(),
                'total'        => $items->total(),
            ],
        ]);
    }

    public function store(StoreItemRequest $request): JsonResponse
    {
        $authUser = $request->attributes->get('auth_user');
        $item = $this->itemService->createItem($request->validated(), $authUser['id']);

        return response()->json(['data' => new ItemResource($item)], 201);
    }

    public function show(int $id): JsonResponse
    {
        $item = $this->itemService->getItem($id);
        return response()->json(['data' => new ItemResource($item)]);
    }

    public function update(UpdateItemRequest $request, int $id): JsonResponse
    {
        $authUser = $request->attributes->get('auth_user');
        $item = $this->itemService->updateItem($id, $request->validated(), $authUser['id']);

        return response()->json(['data' => new ItemResource($item)]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->itemService->deleteItem($id);
        return response()->json(['message' => 'Item deleted.']);
    }

    public function adjustQuantity(AdjustQuantityRequest $request, int $id): JsonResponse
    {
        $authUser = $request->attributes->get('auth_user');
        $item = $this->itemService->adjustQuantity(
            $id,
            $request->validated('operation'),
            $request->validated('amount'),
            $authUser['id']
        );

        return response()->json(['data' => new ItemResource($item)]);
    }
}