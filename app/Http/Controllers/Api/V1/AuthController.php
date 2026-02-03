<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\RouteAttributes\Attributes\{Get, Post, Prefix};

#[Prefix('auth')]
class AuthController extends Controller
{
    public function __construct(
        protected AuthService $service
    ) {}

    #[Post('register')]
    public function register(RegisterRequest $request): JsonResponse
    {
        $token = $this->service->register($request->validated());

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    #[Post('login')]
    public function login(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $token = $this->service->login($validated['email'], $validated['password']);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $this->service->getAuthenticatedUser($validated['email']),
        ]);
    }

    #[Post('logout', middleware: 'auth:sanctum')]
    public function logout(Request $request): JsonResponse
    {
        $this->service->logout($request->user());

        return response()->json(['message' => 'Logged out successfully']);
    }

    #[Get('me', middleware: 'auth:sanctum')]
    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }
}
