<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
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
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $token = $this->service->register($validated);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    #[Post('login')]
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $token = $this->service->login($validated['email'], $validated['password']);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
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
