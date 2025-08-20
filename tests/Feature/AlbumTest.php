<?php

namespace Tests\Feature;

use App\Http\Resources\AlbumResource;
use App\Models\Album;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

use function Tests\create_admin;
use function Tests\create_user;

class AlbumTest extends TestCase
{
    #[Test]
    public function index(): void
    {
        Album::factory(10)->create();

        $this->getAs('api/albums')
            ->assertJsonStructure(AlbumResource::PAGINATION_JSON_STRUCTURE);

        $this->getAs('api/albums?sort=artist_name&order=asc')
            ->assertJsonStructure(AlbumResource::PAGINATION_JSON_STRUCTURE);

        $this->getAs('api/albums?sort=year&order=desc&page=2')
            ->assertJsonStructure(AlbumResource::PAGINATION_JSON_STRUCTURE);

        $this->getAs('api/albums?sort=created_at&order=desc&page=1')
            ->assertJsonStructure(AlbumResource::PAGINATION_JSON_STRUCTURE);
    }

    #[Test]
    public function show(): void
    {
        $this->getAs('api/albums/' . Album::factory()->create()->public_id)
            ->assertJsonStructure(AlbumResource::JSON_STRUCTURE);
    }

    #[Test]
    public function update(): void
    {
        $user = create_admin();
        $album = Album::factory()->for($user)->create();

        $this->putAs(
            "api/albums/{$album->public_id}",
            [
                'name' => 'Updated Album Name',
                'year' => 2023,
            ],
            $user
        )->assertJsonStructure(AlbumResource::JSON_STRUCTURE);

        $album->refresh();

        $this->assertEquals('Updated Album Name', $album->name);
        $this->assertEquals(2023, $album->year);
    }

    #[Test]
    public function nonAdminCannotUpdateAlbumInCommunityEdition(): void
    {
        $album = Album::factory()->create();

        $this->putAs(
            "api/albums/{$album->public_id}",
            [
                'name' => 'Updated Album Name',
                'year' => 2023,
            ],
            create_user()
        )->assertForbidden();
    }

    #[Test]
    public function updateAsOwner(): void
    {
        /** @var Album $album */
        $album = Album::factory()->create();

        $this->putAs(
            "api/albums/{$album->public_id}",
            [
                'name' => 'Updated Album Name',
                'year' => 2023,
            ],
            $album->user
        )->assertJsonStructure(AlbumResource::JSON_STRUCTURE);

        $album->refresh();

        $this->assertEquals('Updated Album Name', $album->name);
        $this->assertEquals(2023, $album->year);
    }

    #[Test]
    public function adminCannotUpdateIfNonOwner(): void
    {
        /** @var Album $album */
        $album = Album::factory()->create();
        $scaryBossMan = create_admin();

        self::assertFalse($album->belongsToUser($scaryBossMan));

        $this->putAs(
            "api/albums/{$album->public_id}",
            [
                'name' => 'Updated Album Name',
                'year' => 2023,
            ],
            $scaryBossMan
        )->assertForbidden();
    }

    #[Test]
    public function updateForbiddenForNonOwners(): void
    {
        /** @var Album $album */
        $album = Album::factory()->create();
        $randomDude = create_user();

        self::assertFalse($album->belongsToUser($randomDude));

        $this->putAs(
            "api/albums/{$album->public_id}",
            [
                'name' => 'Updated Album Name',
                'year' => 2023,
            ],
            $randomDude
        )->assertForbidden();
    }
}
