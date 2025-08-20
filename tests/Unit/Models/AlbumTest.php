<?php

namespace Tests\Unit\Models;

use App\Models\Album;
use App\Models\Artist;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AlbumTest extends TestCase
{
    #[Test]
    public function existingAlbumCanBeRetrievedUsingArtistAndName(): void
    {
        /** @var Artist $artist */
        $artist = Artist::factory()->create();

        /** @var Album $album */
        $album = Album::factory()->for($artist)->for($artist->user)->create();

        self::assertTrue(Album::getOrCreate($artist, $album->name)->is($album));
    }

    #[Test]
    public function getOrCreate(): void
    {
        /** @var Artist $artist */
        $artist = Artist::factory()->create();

        /** @var Album $album */
        $album = Album::factory()->for($artist)->for($artist->user)->create(['name' => 'Foo']);

        // The album can be retrieved by its artist and user
        self::assertTrue(Album::getOrCreate($album->artist, 'Foo')->is($album));

        // Calling getOrCreate with a different artist should return another album
        self::assertFalse(Album::getOrCreate(Artist::factory()->create(), 'Foo')->is($album));
    }

    #[Test]
    public function newAlbumIsAutomaticallyCreatedWithUserAndArtistAndName(): void
    {
        /** @var Artist $artist */
        $artist = Artist::factory()->create();
        $name = 'Foo';

        self::assertNull(Album::query()->whereBelongsTo($artist)->where('name', $name)->first());

        $album = Album::getOrCreate($artist, $name);
        self::assertSame('Foo', $album->name);
        self::assertTrue($album->artist->is($artist));
    }

    /** @return array<mixed> */
    public static function provideEmptyAlbumNames(): array
    {
        return [
            [''],
            ['  '],
            [null],
            [false],
        ];
    }

    #[DataProvider('provideEmptyAlbumNames')]
    #[Test]
    public function newAlbumWithoutNameIsCreatedAsUnknownAlbum($name): void
    {
        /** @var Artist $artist */
        $artist = Artist::factory()->create();

        $album = Album::getOrCreate($artist, $name);

        self::assertSame('Unknown Album', $album->name);
    }
}
