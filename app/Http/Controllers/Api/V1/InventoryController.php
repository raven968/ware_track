<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\InventoryAdjustmentRequest;
use App\Services\InventoryService;
use Spatie\RouteAttributes\Attributes\Post;
use Spatie\RouteAttributes\Attributes\Prefix;
use Spatie\RouteAttributes\Attributes\Middleware;

#[Prefix('inventory')]
#[Middleware('auth:sanctum')]
class InventoryController extends Controller
{
    public function __construct(
        protected InventoryService $service
    ) {}

    #[Post('add-stock')]
    public function addStock(InventoryAdjustmentRequest $request)
    {
        $result = $this->service->addStock($request->validated(), $request->user());

        return response()->json($result);
    }

    #[Post('remove-stock')]
    public function removeStock(InventoryAdjustmentRequest $request)
    {
        $result = $this->service->removeStock($request->validated(), $request->user());

        return response()->json($result);
    }
}
