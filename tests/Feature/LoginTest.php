<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

use function Tests\create_user;

class LoginTest extends TestCase
{
    #[Test]
    public function logInSuccess(): void
    {
        create_user([
            'email' => 'charon@charon.dev',
            'password' => Hash::make('Secret123.'),
        ]);

        $this->post('api/me', [
            'email' => 'charon@charon.dev',
            'password' => 'Secret123.',
        ])
            ->assertOk()
            ->assertJsonStructure([
                'token',
                'audio-token',
            ]);
    }

    #[Test]
    public function logInFailureWithWrongPassword(): void
    {
        create_user([
            'email' => 'charon@charon.dev',
            'password' => Hash::make('Secret123.'),
        ]);

        $this->post('api/me', [
            'email' => 'charon@charon.dev',
            'password' => 'wrong-secret',
        ])
            ->assertUnauthorized();
    }

}
