<?php

namespace Tests;

use DMS\PHPUnitExtensions\ArraySubset\ArraySubsetAsserts;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\File;
use Tests\Traits\CreatesApplication;
use Tests\Traits\MakesHttpRequests;

abstract class TestCase extends BaseTestCase
{
    use ArraySubsetAsserts;
    use CreatesApplication;
    use DatabaseTransactions;
    use MakesHttpRequests;

    public function setUp(): void
    {
        parent::setUp();

        self::createSandbox();
    }

    protected function tearDown(): void
    {
        self::destroySandbox();

        parent::tearDown();
    }

    private static function createSandbox(): void
    {
        config([
            'charon.album_cover_dir' => 'sandbox/img/covers/',
            'charon.artist_image_dir' => 'sandbox/img/artists/',
            'charon.playlist_cover_dir' => 'sandbox/img/playlists/',
            'charon.user_avatar_dir' => 'sandbox/img/avatars/',
        ]);

        File::ensureDirectoryExists(public_path(config('charon.album_cover_dir')));
        File::ensureDirectoryExists(public_path(config('charon.artist_image_dir')));
        File::ensureDirectoryExists(public_path(config('charon.playlist_cover_dir')));
        File::ensureDirectoryExists(public_path(config('charon.user_avatar_dir')));
        File::ensureDirectoryExists(public_path('sandbox/media/'));
    }

    private static function destroySandbox(): void
    {
        File::deleteDirectory(public_path('sandbox'));
    }
}
