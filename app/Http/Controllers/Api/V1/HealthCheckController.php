<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Spatie\RouteAttributes\Attributes\Get;

class HealthCheckController extends Controller
{
    #[Get('health')]
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'timestamp' => now(),
        ]);
    }
}
