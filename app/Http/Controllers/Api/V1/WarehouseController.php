<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreWarehouseRequest;
use App\Http\Requests\UpdateWarehouseRequest;
use App\Models\Warehouse;
use Spatie\RouteAttributes\Attributes\Get;
use Spatie\RouteAttributes\Attributes\Post;
use Spatie\RouteAttributes\Attributes\Put;
use Spatie\RouteAttributes\Attributes\Delete;
use Spatie\RouteAttributes\Attributes\Prefix;

#[Prefix('warehouses')]
class WarehouseController extends Controller
{
    #[Get('/')]
    public function index()
    {
        return response()->json(Warehouse::all());
    }

    #[Post('/')]
    public function store(StoreWarehouseRequest $request)
    {
        $warehouse = Warehouse::create($request->validated());
        return response()->json($warehouse, 201);
    }

    #[Get('{warehouse}')]
    public function show(Warehouse $warehouse)
    {
        return response()->json($warehouse);
    }

    #[Put('{warehouse}')]
    public function update(UpdateWarehouseRequest $request, Warehouse $warehouse)
    {
        $warehouse->update($request->validated());
        return response()->json($warehouse);
    }

    #[Delete('{warehouse}')]
    public function destroy(Warehouse $warehouse)
    {
        $warehouse->delete();
        return response()->json(null, 204);
    }
}
