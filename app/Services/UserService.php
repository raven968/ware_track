<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;
use Silber\Bouncer\BouncerFacade as Bouncer;

class UserService
{
    public function list(int $perPage = 15): LengthAwarePaginator
    {
        return User::latest()->paginate($perPage);
    }

    public function create(array $data): User
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'locale' => $data['locale'] ?? 'en',
        ]);

        if (isset($data['role'])) {
            Bouncer::assign($data['role'])->to($user);
        }

        return $user;
    }

    public function update(User $user, array $data): User
    {
        $payload = [
            'name' => $data['name'],
            'email' => $data['email'],
            'locale' => $data['locale'] ?? $user->locale,
        ];

        if (!empty($data['password'])) {
            $payload['password'] = Hash::make($data['password']);
        }

        $user->update($payload);

        if (isset($data['role'])) {
            // Remove all existing roles and assign new one
            $user->roles()->detach();
            Bouncer::assign($data['role'])->to($user);
        }

        return $user->refresh();
    }

    public function delete(User $user): void
    {
        $user->delete();
    }
}
