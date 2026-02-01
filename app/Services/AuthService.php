<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\{Auth, Hash};
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function register(array $data): string
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        return $user->createToken('auth_token')->plainTextToken;
    }

    public function login(string $email, string $password): string
    {
        $user = User::where('email', $email)->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales son incorrectas.'],
            ]);
        }

        return $user->createToken('auth_token')->plainTextToken;
    }

    public function logout(User $user): void
    {
        $user->tokens()->delete();
    }
}
