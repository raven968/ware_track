<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\PriceListService;
use Illuminate\Http\JsonResponse;
use Spatie\RouteAttributes\Attributes\Get;
use Spatie\RouteAttributes\Attributes\Prefix;
use Spatie\RouteAttributes\Attributes\Middleware;

#[Prefix('price-lists')]
#[Middleware('auth:sanctum')]
class PriceListController extends Controller
{
    public function __construct(
        protected PriceListService $service
    ) {}

    #[Get('/')]
    public function index(): JsonResponse
    {
        return response()->json($this->service->listActive());
    }
}
