<?php

namespace Tests\Feature;

use App\Models\Artist;
use App\Services\MediaMetadataService;
use Mockery;
use App\Models\Song;
use Mockery\MockInterface;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
use function Tests\create_admin;
use function Tests\create_user;

class ArtistImageTest extends TestCase
{
    private MediaMetadataService|MockInterface $mediaMetadataService;

    public function setUp(): void
    {
        parent::setUp();

        $this->mediaMetadataService = self::mock(MediaMetadataService::class);
    }

    #[Test]
    public function update(): void
    {
        $artist = Artist::factory()->create();

        $this->mediaMetadataService
            ->shouldReceive('writeArtistImage')
            ->once()
            ->with(Mockery::on(static fn (Artist $target) => $target->is($artist)), 'data:image/jpeg;base64,Rm9v');

        $this->putAs("api/artist/$artist->id/image", ['image' => 'data:image/jpeg;base64,Rm9v'], create_admin())
            ->assertOk();
    }

    // #[Test]
    // public function updateNotAllowedForNormalUsers(): void
    // {
    //     Artist::factory()->create(['id' => 9999]);

    //     $this->mediaMetadataService->shouldNotReceive('writeArtistImage');

    //     $this->putAs('api/artist/9999/image', ['image' => 'data:image/jpeg;base64,Rm9v'])
    //         ->assertForbidden();
    // }
    
    #[Test]
    public function normalUserCanUploadImageIfOwningAllSongsInArtist(): void
    {
        $user = create_user();

        /** @var Artist $artist */
        $artist = Artist::factory()->create();
        $artist->songs()->saveMany(Song::factory()->for($user, 'owner')->count(3)->create());

        $this->mediaMetadataService
            ->shouldReceive('writeArtistImage')
            ->once()
            ->with(Mockery::on(static fn (Artist $target) => $target->is($artist)), 'data:image/jpeg;base64,Rm9v');

        $this->putAs("api/artists/$artist->id/image", ['image' => 'data:image/jpeg;base64,Rm9v'], $user)
            ->assertOk();
    }

    #[Test]
    public function normalUserCannotUploadImageIfNotOwningAllSongsInArtist(): void
    {
        $user = create_user();

        /** @var Artist $artist */
        $artist = Artist::factory()->create();
        $artist->songs()->saveMany(Song::factory()->for($user, 'owner')->count(3)->create());
        $artist->songs()->save(Song::factory()->create());

        $this->mediaMetadataService
            ->shouldReceive('writeArtistImage')
            ->never();

        $this->putAs("api/artists/$artist->id/image", ['image' => 'data:image/jpeg;base64,Rm9v'], $user)
            ->assertForbidden();
    }

    #[Test]
    public function adminCanUploadImageEvenIfNotOwningAllSongsInArtist(): void
    {
        $user = create_user();

        /** @var Artist $artist */
        $artist = Artist::factory()->create();
        $artist->songs()->saveMany(Song::factory()->for($user, 'owner')->count(3)->create());

        $this->mediaMetadataService
            ->shouldReceive('writeArtistImage')
            ->once()
            ->with(Mockery::on(static fn (Artist $target) => $target->is($artist)), 'data:image/jpeg;base64,Rm9v');

        $this->putAs("api/artists/$artist->id/image", ['image' => 'data:image/jpeg;base64,Rm9v'], create_admin())
            ->assertOk();
    }
}
