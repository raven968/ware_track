<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Warehouses\StoreWarehouseRequest;
use App\Http\Requests\Warehouses\UpdateWarehouseRequest;
use App\Models\Warehouse;
use Spatie\RouteAttributes\Attributes\Get;
use Spatie\RouteAttributes\Attributes\Post;
use Spatie\RouteAttributes\Attributes\Put;
use Spatie\RouteAttributes\Attributes\Delete;
use Spatie\RouteAttributes\Attributes\Prefix;
use Spatie\RouteAttributes\Attributes\Middleware;

#[Prefix('warehouses')]
#[Middleware('auth:sanctum')]
class WarehouseController extends Controller
{
    #[Get('/')]
    #[Middleware('can:view-warehouses')]
    public function index()
    {
        return response()->json(Warehouse::all());
    }

    #[Post('/')]
    #[Middleware('can:create-warehouses')]
    public function store(StoreWarehouseRequest $request)
    {
        $warehouse = Warehouse::create($request->validated());
        return response()->json([
            'message' => __('messages.warehouse_created'),
            'data' => $warehouse,
        ], 201);
    }

    #[Get('{warehouse}')]
    #[Middleware('can:view-warehouses')]
    public function show(Warehouse $warehouse)
    {
        return response()->json($warehouse);
    }

    #[Put('{warehouse}')]
    #[Middleware('can:update-warehouses')]
    public function update(UpdateWarehouseRequest $request, Warehouse $warehouse)
    {
        $warehouse->update($request->validated());
        return response()->json([
            'message' => __('messages.warehouse_updated'),
            'data' => $warehouse,
        ]);
    }

    #[Delete('{warehouse}')]
    #[Middleware('can:delete-warehouses')]
    public function destroy(Warehouse $warehouse)
    {
        $warehouse->delete();
        return response()->json(null, 204);
    }
}
