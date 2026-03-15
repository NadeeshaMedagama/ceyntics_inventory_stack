<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePlaceRequest;
use App\Http\Resources\PlaceResource;
use App\Models\Place;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlaceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $places = Place::with('cupboard')
            ->when($request->cupboard_id, fn($q, $id) => $q->where('cupboard_id', $id))
            ->withCount('items')
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => PlaceResource::collection($places->items()),
            'meta' => ['total' => $places->total(), 'last_page' => $places->lastPage()],
        ]);
    }

    public function store(StorePlaceRequest $request): JsonResponse
    {
        $place = Place::create($request->validated());
        return response()->json(['data' => new PlaceResource($place->load('cupboard'))], 201);
    }

    public function show(int $id): JsonResponse
    {
        $place = Place::with(['cupboard', 'items'])->findOrFail($id);
        return response()->json(['data' => new PlaceResource($place)]);
    }

    public function update(StorePlaceRequest $request, int $id): JsonResponse
    {
        $place = Place::findOrFail($id);
        $place->update($request->validated());
        return response()->json(['data' => new PlaceResource($place->fresh('cupboard'))]);
    }

    public function destroy(int $id): JsonResponse
    {
        Place::findOrFail($id)->delete();
        return response()->json(['message' => 'Place deleted.']);
    }
}