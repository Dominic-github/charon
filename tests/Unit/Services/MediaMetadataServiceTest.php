<?php

namespace Tests\Unit\Services;

use App\Models\Album;
use App\Models\Artist;
use App\Services\ImageWriter;
use App\Services\MediaMetadataService;
use App\Services\SpotifyService;
use Mockery;
use Mockery\LegacyMockInterface;
use Mockery\MockInterface;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class MediaMetadataServiceTest extends TestCase
{
    private LegacyMockInterface|SpotifyService|MockInterface $spotifyService;
    private LegacyMockInterface|ImageWriter|MockInterface $imageWriter;
    private MediaMetadataService $mediaMetadataService;

    public function setUp(): void
    {
        parent::setUp();

        $this->spotifyService = Mockery::mock(SpotifyService::class);
        $this->imageWriter = Mockery::mock(ImageWriter::class);

        $this->mediaMetadataService = new MediaMetadataService($this->spotifyService, $this->imageWriter);
    }

    #[Test]
    public function tryDownloadAlbumCover(): void
    {
        /** @var Album $album */
        $album = Album::factory()->create(['cover' => '']);

        $this->spotifyService
            ->shouldReceive('tryGetAlbumCover')
            ->with($album)
            ->andReturn('/dev/null/cover.jpg');

        $this->imageWriter->shouldReceive('write')->once();

        $this->mediaMetadataService->tryDownloadAlbumCover($album);
    }

    #[Test]
    public function writeAlbumCover(): void
    {
        /** @var Album $album */
        $album = Album::factory()->create();
        $coverPath = '/charon/public/img/album/foo.jpg';

        $this->imageWriter
            ->shouldReceive('write')
            ->once()
            ->with('/charon/public/img/album/foo.jpg', 'dummy-src');

        $this->imageWriter->shouldReceive('write')->once();

        $this->mediaMetadataService->writeAlbumCover($album, 'dummy-src', $coverPath);
        self::assertSame(album_cover_url('foo.jpg'), $album->refresh()->cover);
    }

    #[Test]
    public function tryDownloadArtistImage(): void
    {
        /** @var Artist $artist */
        $artist = Artist::factory()->create(['image' => '']);

        $this->spotifyService
            ->shouldReceive('tryGetArtistImage')
            ->with($artist)
            ->andReturn('/dev/null/img.jpg');

        $this->imageWriter->shouldReceive('write')->once();

        $this->mediaMetadataService->tryDownloadArtistImage($artist);
    }

    #[Test]
    public function writeArtistImage(): void
    {
        /** @var Artist $artist */
        $artist = Artist::factory()->create();
        $imagePath = '/charon/public/img/artist/foo.jpg';

        $this->imageWriter
            ->shouldReceive('write')
            ->once()
            ->with('/charon/public/img/artist/foo.jpg', 'dummy-src');

        $this->mediaMetadataService->writeArtistImage($artist, 'dummy-src', $imagePath);

        self::assertSame(artist_image_url('foo.jpg'), $artist->refresh()->image);
    }
}
