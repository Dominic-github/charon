<?php

namespace Tests\Feature;

use App\Models\User;
use Laravel\Sanctum\PersonalAccessToken;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

use function Tests\create_user;

class ProxyAuthTest extends TestCase
{
    public function setUp(): void
    {
        parent::setUp();

        config([
            'charon.proxy_auth.enabled' => true,
            'charon.proxy_auth.allow_list' => ['192.168.1.0/24'],
            'charon.proxy_auth.user_header' => 'remote-user',
            'charon.proxy_auth.preferred_name_header' => 'remote-preferred-name',
        ]);
    }

    protected function tearDown(): void
    {
        config([
            'charon.proxy_auth.enabled' => false,
            'charon.proxy_auth.allow_list' => [],
            'charon.proxy_auth.user_header' => 'remote-user',
            'charon.proxy_auth.preferred_name_header' => 'remote-preferred-name',
        ]);

        parent::tearDown();
    }

    #[Test]
    public function proxyAuthenticateNewUser(): void
    {
        $response = $this->get('/', [
            'REMOTE_ADDR' => '192.168.1.127',
            'remote-user' => '123456',
            'remote-preferred-name' => 'Bruce Dickinson',
        ]);

        $response->assertOk();
        $response->assertViewHas('token');

        /** @var array $token */
        $token = $response->viewData('token');

        self::assertNotNull(PersonalAccessToken::findToken($token['token']));

        self::assertDatabaseHas(User::class, [
            'email' => '123456@reverse.proxy',
            'name' => 'Bruce Dickinson',
            'sso_id' => '123456',
            'sso_provider' => 'Reverse Proxy',
        ]);
    }

    #[Test]
    public function proxyAuthenticateExistingUser(): void
    {
        $user = create_user([
            'sso_id' => '123456',
            'sso_provider' => 'Reverse Proxy',
        ]);

        $response = $this->get('/', [
            'REMOTE_ADDR' => '192.168.1.127',
            'remote-user' => '123456',
            'remote-preferred-name' => 'Bruce Dickinson',
        ]);

        $response->assertOk();
        $response->assertViewHas('token');

        /** @var array $token */
        $token = $response->viewData('token');

        self::assertTrue($user->is(PersonalAccessToken::findToken($token['token'])->tokenable));
    }

    #[Test]
    public function proxyAuthenticateWithDisallowedIp(): void
    {
        $response = $this->get('/', [
            'REMOTE_ADDR' => '255.168.1.127',
            'remote-user' => '123456',
            'remote-preferred-name' => 'Bruce Dickinson',
        ]);

        $response->assertOk();

        self::assertNull($response->viewData('token'));
    }
}
