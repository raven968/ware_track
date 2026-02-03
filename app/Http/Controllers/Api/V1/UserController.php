<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Users\StoreUserRequest;
use App\Http\Requests\Users\UpdateUserRequest;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Silber\Bouncer\Database\Role;
use Spatie\RouteAttributes\Attributes\{Delete, Get, Middleware, Post, Prefix, Put};

#[Prefix('users')]
#[Middleware('auth:sanctum')]
class UserController extends Controller
{
    public function __construct(
        protected UserService $service
    ) {}

    #[Get('/')]
    #[Middleware('can:view-users')]
    public function index(): JsonResponse
    {
        // Eager load roles for display
        $users = $this->service->list();
        $users->getCollection()->transform(function ($user) {
            $user->load('roles');
            return $user;
        });
        return response()->json($users);
    }

    #[Post('/')]
    #[Middleware('can:create-users')]
    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = $this->service->create($request->validated());

        return response()->json([
            'message' => __('messages.user_created'),
            'data' => $user->load('roles'),
        ], 201);
    }

    #[Get('roles/list')]
    #[Middleware('can:view-users')]
    public function roles(): JsonResponse
    {
        return response()->json(Role::all());
    }

    #[Get('{user}')]
    #[Middleware('can:view-users')]
    public function show(User $user): JsonResponse
    {
        return response()->json($user->load('roles'));
    }

    #[Put('{user}')]
    #[Middleware('can:update-users')]
    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $updatedUser = $this->service->update($user, $request->validated());

        return response()->json([
            'message' => __('messages.user_updated'),
            'data' => $updatedUser->load('roles'),
        ]);
    }

    #[Delete('{user}')]
    #[Middleware('can:delete-users')]
    public function destroy(User $user): JsonResponse
    {
        $this->service->delete($user);

        return response()->json(null, 204);
    }
}

