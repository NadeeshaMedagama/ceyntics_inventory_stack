<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCupboardRequest;
use App\Http\Resources\CupboardResource;
use App\Models\Cupboard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CupboardController extends Controller
{
    public function index(): JsonResponse
    {
        $cupboards = Cupboard::withCount('places')->latest()->paginate(20);
        return response()->json([
            'data' => CupboardResource::collection($cupboards->items()),
            'meta' => ['total' => $cupboards->total(), 'last_page' => $cupboards->lastPage()],
        ]);
    }

    public function store(StoreCupboardRequest $request): JsonResponse
    {
        $cupboard = Cupboard::create($request->validated());
        return response()->json(['data' => new CupboardResource($cupboard)], 201);
    }

    public function show(int $id): JsonResponse
    {
        $cupboard = Cupboard::with('places')->findOrFail($id);
        return response()->json(['data' => new CupboardResource($cupboard)]);
    }

    public function update(StoreCupboardRequest $request, int $id): JsonResponse
    {
        $cupboard = Cupboard::findOrFail($id);
        $cupboard->update($request->validated());
        return response()->json(['data' => new CupboardResource($cupboard->fresh())]);
    }

    public function destroy(int $id): JsonResponse
    {
        Cupboard::findOrFail($id)->delete();
        return response()->json(['message' => 'Cupboard deleted.']);
    }
}