<?php

namespace Tests\Feature;

use App\Http\Resources\GenreResource;
use App\Http\Resources\SongResource;
use App\Models\Genre;
use App\Models\Song;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class GenreTest extends TestCase
{
    #[Test]
    public function getAllGenres(): void
    {
        /** @var Genre $rock */
        $rock = Genre::factory()->has(Song::factory()->count(2))->create(['name' => 'Rock']);

        /** @var Genre $pop */
        $pop = Genre::factory()->has(Song::factory()->count(1))->create(['name' => 'Pop']);

        Song::factory()->count(2)->create();

        $this->getAs('api/genres')
            ->assertJsonStructure(['*' => GenreResource::JSON_STRUCTURE])
            ->assertJsonFragment(['name' => 'Rock'])
            ->assertJsonFragment(['name' => 'Pop'])
            ->assertJsonFragment(['name' => Genre::NO_GENRE_NAME]);
    }

    #[Test]
    public function getOneGenre(): void
    {
        /** @var Genre $rock */
        $rock = Genre::factory()->has(Song::factory()->count(2))->create(['name' => 'Rock']);

        $this->getAs('api/genres/' . $rock->public_id)
            ->assertJsonStructure(GenreResource::JSON_STRUCTURE)
            ->assertJsonFragment(['name' => 'Rock', 'song_count' => 2]);
    }

    #[Test]
    public function getNonExistingGenreThrowsNotFound(): void
    {
        $this->getAs('api/genres/NonExistingGenre')->assertNotFound();
    }

    #[Test]
    public function paginateSongsInGenre(): void
    {
        /** @var Genre $rock */
        $rock = Genre::factory()->has(Song::factory()->count(2))->create(['name' => 'Rock']);

        $this->getAs("api/genres/$rock->public_id/songs")
            ->assertJsonStructure(SongResource::PAGINATION_JSON_STRUCTURE);
    }

    #[Test]
    public function getRandomSongsInGenre(): void
    {
        /** @var Genre $rock */
        $rock = Genre::factory()->has(Song::factory()->count(2))->create(['name' => 'Rock']);

        $this->getAs("api/genres/$rock->public_id/songs/random?limit=500")
            ->assertJsonCount(2)
            ->assertJsonStructure([0 => SongResource::JSON_STRUCTURE]);
    }
}
