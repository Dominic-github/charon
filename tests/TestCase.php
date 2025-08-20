<?php

namespace Tests;

use App\Helpers\Ulid;
use App\Helpers\Uuid;
use App\Services\MediaBrowser;
use DMS\PHPUnitExtensions\ArraySubset\ArraySubsetAsserts;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\File;
use Tests\Concerns\CreatesApplication;
use Tests\Concerns\MakesHttpRequests;

abstract class TestCase extends BaseTestCase
{
    use ArraySubsetAsserts;
    use CreatesApplication;
    use LazilyRefreshDatabase;
    use MakesHttpRequests;

    /**
     * @var Filesystem The backup of the real filesystem instance, to restore after tests.
     * This is necessary because we might be mocking the File facade in tests, and at the same time
     * we delete test resources during suite's teardown.
     */
    private Filesystem $fileSystem;

    public function setUp(): void
    {
        parent::setUp();

        $this->fileSystem = File::getFacadeRoot();

        self::createSandbox();
    }

    protected function tearDown(): void
    {
        File::swap($this->fileSystem);
        self::destroySandbox();
        MediaBrowser::clearCache();

        Ulid::unfreeze();
        Uuid::unfreeze();

        parent::tearDown();
    }

    private static function createSandbox(): void
    {
        config([
            'charon.album_cover_dir' => 'sandbox/img/covers/',
            'charon.artist_image_dir' => 'sandbox/img/artists/',
            'charon.playlist_cover_dir' => 'sandbox/img/playlists/',
            'charon.user_avatar_dir' => 'sandbox/img/avatars/',
            'charon.artifacts_path' => public_path('sandbox/artifacts/'),
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
