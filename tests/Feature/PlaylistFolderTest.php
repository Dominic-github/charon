<?php

namespace Tests\Feature;

use App\Http\Resources\PlaylistFolderResource;
use App\Models\Playlist;
use App\Models\PlaylistFolder;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

use function Tests\create_user;

class PlaylistFolderTest extends TestCase
{
    #[Test]
    public function listing(): void
    {
        $user = create_user();
        PlaylistFolder::factory()->for($user)->count(3)->create();

        $this->getAs('api/playlist-folders', $user)
            ->assertJsonStructure(['*' => PlaylistFolderResource::JSON_STRUCTURE])
            ->assertJsonCount(3, '*');
    }

    #[Test]
    public function create(): void
    {
        $user = create_user();

        $this->postAs('api/playlist-folders', ['name' => 'Classical'], $user)
            ->assertJsonStructure(PlaylistFolderResource::JSON_STRUCTURE);

        $this->assertDatabaseHas(PlaylistFolder::class, ['name' => 'Classical', 'user_id' => $user->id]);
    }

    #[Test]
    public function update(): void
    {
        $folder = PlaylistFolder::factory()->create(['name' => 'Metal']);

        $this->patchAs('api/playlist-folders/' . $folder->id, ['name' => 'Classical'], $folder->user)
            ->assertJsonStructure(PlaylistFolderResource::JSON_STRUCTURE);

        self::assertSame('Classical', $folder->fresh()->name);
    }

    #[Test]
    public function unauthorizedUpdate(): void
    {
        $folder = PlaylistFolder::factory()->create(['name' => 'Metal']);

        $this->patchAs('api/playlist-folders/' . $folder->id, ['name' => 'Classical'])
            ->assertForbidden();

        self::assertSame('Metal', $folder->fresh()->name);
    }

    #[Test]
    public function destroy(): void
    {
        $folder = PlaylistFolder::factory()->create();

        $this->deleteAs('api/playlist-folders/' . $folder->id, ['name' => 'Classical'], $folder->user)
            ->assertNoContent();

        self::assertModelMissing($folder);
    }

    #[Test]
    public function nonAuthorizedDelete(): void
    {
        /** @var PlaylistFolder $folder */
        $folder = PlaylistFolder::factory()->create();

        $this->deleteAs('api/playlist-folders/' . $folder->id, ['name' => 'Classical'])
            ->assertForbidden();

        self::assertModelExists($folder);
    }

    #[Test]
    public function movingPlaylistToFolder(): void
    {
        /** @var PlaylistFolder $folder */
        $folder = PlaylistFolder::factory()->create();

        /** @var Playlist $playlist */
        $playlist = Playlist::factory()->for($folder->user)->create();
        self::assertNull($playlist->getFolderId($folder->user));

        $this->postAs("api/playlist-folders/$folder->id/playlists", ['playlists' => [$playlist->id]], $folder->user)
            ->assertSuccessful();

        self::assertTrue($playlist->fresh()->getFolder($folder->user)->is($folder));
    }

    #[Test]
    public function unauthorizedMovingPlaylistToFolderIsNotAllowed(): void
    {
        /** @var PlaylistFolder $folder */
        $folder = PlaylistFolder::factory()->create();

        /** @var Playlist $playlist */
        $playlist = Playlist::factory()->for($folder->user)->create();
        self::assertNull($playlist->getFolderId($folder->user));

        $this->postAs("api/playlist-folders/$folder->id/playlists", ['playlists' => [$playlist->id]])
            ->assertUnprocessable();

        self::assertNull($playlist->fresh()->getFolder($folder->user));
    }

    #[Test]
    public function movingPlaylistToRootLevel(): void
    {
        /** @var PlaylistFolder $folder */
        $folder = PlaylistFolder::factory()->create();

        /** @var Playlist $playlist */
        $playlist = Playlist::factory()->for($folder->user)->create();

        $folder->playlists()->attach($playlist->id);
        self::assertTrue($playlist->refresh()->getFolder($folder->user)->is($folder));

        $this->deleteAs("api/playlist-folders/$folder->id/playlists", ['playlists' => [$playlist->id]], $folder->user)
            ->assertSuccessful();

        self::assertNull($playlist->fresh()->getFolder($folder->user));
    }

    #[Test]
    public function unauthorizedMovingPlaylistToRootLevelIsNotAllowed(): void
    {
        /** @var PlaylistFolder $folder */
        $folder = PlaylistFolder::factory()->create();

        /** @var Playlist $playlist */
        $playlist = Playlist::factory()->for($folder->user)->create();

        $folder->playlists()->attach($playlist->id);
        self::assertTrue($playlist->refresh()->getFolder($folder->user)->is($folder));

        $this->deleteAs("api/playlist-folders/$folder->id/playlists", ['playlists' => [$playlist->id]])
            ->assertUnprocessable();

        self::assertTrue($playlist->refresh()->getFolder($folder->user)->is($folder));
    }

    #[Test]
    public function collaboratorPuttingPlaylistIntoTheirFolder(): void
    {
        $collaborator = create_user();

        /** @var Playlist $playlist */
        $playlist = Playlist::factory()->create();
        $playlist->addCollaborator($collaborator);

        /** @var PlaylistFolder $ownerFolder */
        $ownerFolder = PlaylistFolder::factory()->for($playlist->user)->create();
        $ownerFolder->playlists()->attach($playlist->id);
        self::assertTrue($playlist->refresh()->getFolder($playlist->user)?->is($ownerFolder));

        /** @var PlaylistFolder $collaboratorFolder */
        $collaboratorFolder = PlaylistFolder::factory()->for($collaborator)->create();
        self::assertNull($playlist->getFolder($collaborator));

        $this->postAs(
            "api/playlist-folders/$collaboratorFolder->id/playlists",
            ['playlists' => [$playlist->id]],
            $collaborator
        )
            ->assertSuccessful();

        self::assertTrue($playlist->fresh()->getFolder($collaborator)?->is($collaboratorFolder));

        // Verify the playlist is in the owner's folder too
        self::assertTrue($playlist->fresh()->getFolder($playlist->user)?->is($ownerFolder));
    }

    #[Test]
    public function collaboratorMovingPlaylistToRootLevel(): void
    {
        $collaborator = create_user();

        /** @var Playlist $playlist */
        $playlist = Playlist::factory()->create();
        $playlist->addCollaborator($collaborator);
        self::assertNull($playlist->getFolder($playlist->user));

        /** @var PlaylistFolder $ownerFolder */
        $ownerFolder = PlaylistFolder::factory()->for($playlist->user)->create();
        $ownerFolder->playlists()->attach($playlist->id);
        self::assertTrue($playlist->refresh()->getFolder($playlist->user)?->is($ownerFolder));

        /** @var PlaylistFolder $collaboratorFolder */
        $collaboratorFolder = PlaylistFolder::factory()->for($collaborator)->create();

        $collaboratorFolder->playlists()->attach($playlist->id);
        self::assertTrue($playlist->refresh()->getFolder($collaborator)?->is($collaboratorFolder));

        $this->deleteAs(
            "api/playlist-folders/$collaboratorFolder->id/playlists",
            ['playlists' => [$playlist->id]],
            $collaborator
        )
            ->assertSuccessful();

        self::assertNull($playlist->fresh()->getFolder($collaborator));
        // Verify the playlist is still in the owner's folder
        self::assertTrue($playlist->getFolder($playlist->user)?->is($ownerFolder));
    }
}
