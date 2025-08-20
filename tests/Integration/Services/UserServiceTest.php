<?php

namespace Tests\Integration\Services;

use App\Models\User;
use App\Exceptions\UserProspectUpdateDeniedException;
use App\Services\UserService;
use App\Values\SsoUser;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Two\User as SocialiteUser;
use PHPUnit\Framework\Attributes\Test;
use Mockery;
use Tests\TestCase;

use function Tests\create_admin;
use function Tests\create_user;
use function Tests\create_user_prospect;
use function Tests\read_as_data_url;
use function Tests\test_path;

class UserServiceTest extends TestCase
{
    private UserService $service;

    public function setUp(): void
    {
        parent::setUp();

        $this->service = app(UserService::class);
    }

    #[Test]
    public function createUser(): void
    {
        $user = $this->service->createUser(
            name: 'Bruce Dickinson',
            email: 'bruce@dickison.com',
            plainTextPassword: 'FearOfTheDark',
            isAdmin: true,
            avatar: read_as_data_url(test_path('fixtures/cover.png')),
        );

        $this->assertModelExists($user);
        self::assertTrue(Hash::check('FearOfTheDark', $user->password));
        self::assertTrue($user->is_admin);
        self::assertFileExists(user_avatar_path($user->getRawOriginal('avatar')));
    }

    #[Test]
    public function createUserWithEmptyAvatarHasGravatar(): void
    {
        $user = $this->service->createUser(
            name: 'Bruce Dickinson',
            email: 'bruce@dickison.com',
            plainTextPassword: 'FearOfTheDark',
            isAdmin: false
        );

        $this->assertModelExists($user);
        self::assertTrue(Hash::check('FearOfTheDark', $user->password));
        self::assertFalse($user->is_admin);
        self::assertStringStartsWith('https://www.gravatar.com/avatar/', $user->avatar);
    }

    #[Test]
    public function createUserWithNoPassword(): void
    {
        $user = $this->service->createUser(
            name: 'Bruce Dickinson',
            email: 'bruce@dickison.com',
            plainTextPassword: '',
            isAdmin: false
        );

        $this->assertModelExists($user);
        self::assertEmpty($user->password);
    }

    #[Test]
    public function updateUser(): void
    {
        $user = create_user();

        $this->service->updateUser(
            user: $user,
            name: 'Steve Harris',
            email: 'steve@iron.com',
            password: 'TheTrooper',
            isAdmin: true,
            avatar: read_as_data_url(test_path('fixtures/cover.png'))
        );

        $user->refresh();

        self::assertSame('Steve Harris', $user->name);
        self::assertSame('steve@iron.com', $user->email);
        self::assertTrue(Hash::check('TheTrooper', $user->password));
        self::assertTrue($user->is_admin);
        self::assertFileExists(user_avatar_path($user->getRawOriginal('avatar')));
    }

    #[Test]
    public function updateUserWithoutSettingPasswordOrAdminStatus(): void
    {
        $user = create_admin(['password' => Hash::make('TheTrooper')]);

        $this->service->updateUser(
            user: $user,
            name: 'Steve Harris',
            email: 'steve@iron.com'
        );

        $user->refresh();

        self::assertSame('Steve Harris', $user->name);
        self::assertSame('steve@iron.com', $user->email);
        self::assertTrue(Hash::check('TheTrooper', $user->password));
        self::assertTrue($user->is_admin);
    }

    #[Test]
    public function updateProspectUserIsNotAllowed(): void
    {
        $this->expectException(UserProspectUpdateDeniedException::class);

        $this->service->updateUser(
            user: create_user_prospect(),
            name: 'Steve Harris',
            email: 'steve@iron.com'
        );
    }

    #[Test]
    public function createUserViaSsoProvider(): void
    {
        $user = $this->service->createUser(
            name: 'Bruce Dickinson',
            email: 'bruce@dickison.com',
            plainTextPassword: '',
            isAdmin: false,
            avatar: 'https://lh3.googleusercontent.com/a/vatar',
            ssoId: '123',
            ssoProvider: 'Google'
        );

        $this->assertModelExists($user);
        self::assertSame('Google', $user->sso_provider);
        self::assertSame('123', $user->sso_id);
        self::assertSame('https://lh3.googleusercontent.com/a/vatar', $user->avatar);
    }

    #[Test]
    public function createUserFromSso(): void
    {
        $this->assertDatabaseMissing(User::class, ['email' => 'bruce@iron.com']);

        $socialiteUser = Mockery::mock(SocialiteUser::class, [
            'getId' => '123',
            'getEmail' => 'bruce@iron.com',
            'getName' => 'Bruce Dickinson',
            'getAvatar' => 'https://lh3.googleusercontent.com/a/vatar',
        ]);

        $user = $this->service->createOrUpdateUserFromSso(SsoUser::fromSocialite($socialiteUser, 'Google'));

        $this->assertModelExists($user);

        self::assertSame('Google', $user->sso_provider);
        self::assertSame('Bruce Dickinson', $user->name);
        self::assertSame('bruce@iron.com', $user->email);
        self::assertSame('123', $user->sso_id);
        self::assertSame('https://lh3.googleusercontent.com/a/vatar', $user->avatar);
    }

    #[Test]
    public function updateUserFromSsoId(): void
    {
        $user = create_user([
            'email' => 'bruce@iron.com',
            'name' => 'Bruce Dickinson',
            'sso_id' => '123',
            'sso_provider' => 'Google',
        ]);

        $socialiteUser = Mockery::mock(SocialiteUser::class, [
            'getId' => '123',
            'getEmail' => 'steve@iron.com',
            'getName' => 'Steve Harris',
            'getAvatar' => 'https://lh3.googleusercontent.com/a/vatar',
        ]);

        $this->service->createOrUpdateUserFromSso(SsoUser::fromSocialite($socialiteUser, 'Google'));
        $user->refresh();

        self::assertSame('Bruce Dickinson', $user->name); // Name should not be updated
        self::assertSame('https://lh3.googleusercontent.com/a/vatar', $user->avatar);
        self::assertSame('bruce@iron.com', $user->email); // Email should not be updated
        self::assertSame('Google', $user->sso_provider);
    }

    #[Test]
    public function updateUserFromSsoEmail(): void
    {
        $user = create_user([
            'email' => 'bruce@iron.com',
            'name' => 'Bruce Dickinson',
        ]);

        $socialiteUser = Mockery::mock(SocialiteUser::class, [
            'getId' => '123',
            'getEmail' => 'bruce@iron.com',
            'getName' => 'Steve Harris',
            'getAvatar' => 'https://lh3.googleusercontent.com/a/vatar',
        ]);

        $this->service->createOrUpdateUserFromSso(SsoUser::fromSocialite($socialiteUser, 'Google'));
        $user->refresh();

        self::assertSame('Bruce Dickinson', $user->name); // Name should not be updated
        self::assertSame('https://lh3.googleusercontent.com/a/vatar', $user->avatar);
        self::assertSame('Google', $user->sso_provider);
    }

    #[Test]
    public function updateSsoUserCannotChangeProfileDetails(): void
    {
        $user = create_user([
            'email' => 'bruce@iron.com',
            'name' => 'Bruce Dickinson',
            'sso_provider' => 'Google',
        ]);

        $this->service->updateUser(
            user: $user,
            name: 'Steve Harris',
            email: 'steve@iron.com',
            password: 'TheTrooper',
            isAdmin: true,
        );

        $user->refresh();

        self::assertSame('bruce@iron.com', $user->email);
        self::assertFalse(Hash::check('TheTrooper', $user->password));
        self::assertTrue($user->is_admin);
    }
}
