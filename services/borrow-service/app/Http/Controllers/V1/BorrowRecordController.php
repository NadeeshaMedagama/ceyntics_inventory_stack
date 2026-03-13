<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBorrowRequest;
use App\Http\Requests\ReturnItemRequest;
use App\Http\Resources\BorrowRecordResource;
use App\Services\Contracts\BorrowServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BorrowRecordController extends Controller
{
    public function __construct(
        private readonly BorrowServiceInterface $borrowService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $records = $this->borrowService->getAll($request->only(['status', 'search']));
        return response()->json([
            'data' => BorrowRecordResource::collection($records->items()),
            'meta' => ['total' => $records->total(), 'last_page' => $records->lastPage(), 'current_page' => $records->currentPage()],
        ]);
    }

    public function store(StoreBorrowRequest $request): JsonResponse
    {
        $authUser = $request->attributes->get('auth_user');
        $record = $this->borrowService->createBorrow($request->validated(), $authUser['id']);
        return response()->json(['data' => new BorrowRecordResource($record)], 201);
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->borrowService->getById($id);
        return response()->json(['data' => new BorrowRecordResource($record)]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $record = $this->borrowService->getById($id);
        $record->update($request->only(['notes', 'expected_return_date', 'contact']));
        return response()->json(['data' => new BorrowRecordResource($record->fresh())]);
    }

    public function returnItem(ReturnItemRequest $request, int $id): JsonResponse
    {
        $authUser = $request->attributes->get('auth_user');
        $record = $this->borrowService->returnItem($id, $authUser['id'], $request->validated('notes'));
        return response()->json(['data' => new BorrowRecordResource($record), 'message' => 'Item returned successfully.']);
    }
}