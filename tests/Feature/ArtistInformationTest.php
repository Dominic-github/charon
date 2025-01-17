<?php

namespace Tests\Feature;

use App\Models\Artist;
use App\Services\MediaInformationService;
use App\Values\ArtistInformation;
use Mockery;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ArtistInformationTest extends TestCase
{
    #[Test]
    public function getInformation(): void
    {
        config(['charon.lastfm.key' => 'foo']);
        config(['charon.lastfm.secret' => 'geheim']);

        $artist = Artist::factory()->create();

        $lastfm = self::mock(MediaInformationService::class);
        $lastfm->shouldReceive('getArtistInformation')
            ->with(Mockery::on(static fn (Artist $a) => $a->is($artist)))
            ->andReturn(ArtistInformation::make(
                url: 'https://lastfm.com/artist/foo',
                image: 'https://lastfm.com/image/foo',
                bio: [
                    'summary' => 'foo',
                    'full' => 'bar',
                ],
            ));

        $this->getAs('api/artists/' . $artist->id . '/information')
            ->assertJsonStructure(ArtistInformation::JSON_STRUCTURE);
    }

    #[Test]
    public function getWithoutLastfmStillReturnsValidStructure(): void
    {
        config(['charon.lastfm.key' => null]);
        config(['charon.lastfm.secret' => null]);

        $this->getAs('api/artists/' . Artist::factory()->create()->id . '/information')
            ->assertJsonStructure(ArtistInformation::JSON_STRUCTURE);
    }
}
