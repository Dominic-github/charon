<?php

namespace Tests\Feature;

use App\Models\Artist;
use App\Services\EncyclopediaService;
use App\Values\ArtistInformation;
use Mockery;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ArtistInformationTest extends TestCase
{
    #[Test]
    public function getInformation(): void
    {
        config(['charon.services.lastfm.key' => 'foo']);
        config(['charon.services.lastfm.secret' => 'geheim']);

        $artist = Artist::factory()->create();

        $lastfm = $this->mock(EncyclopediaService::class);
        $lastfm->expects('getArtistInformation')
            ->with(Mockery::on(static fn (Artist $a) => $a->is($artist)))
            ->andReturn(ArtistInformation::make(
                url: 'https://lastfm.com/artist/foo',
                image: 'https://lastfm.com/image/foo',
                bio: [
                    'summary' => 'foo',
                    'full' => 'bar',
                ],
            ));

        $this->getAs("api/artists/{$artist->public_id}/information")
            ->assertJsonStructure(ArtistInformation::JSON_STRUCTURE);
    }

    #[Test]
    public function getWithoutLastfmStillReturnsValidStructure(): void
    {
        config(['charon.services.lastfm.key' => null]);
        config(['charon.services.lastfm.secret' => null]);

        $this->getAs('api/artists/' . Artist::factory()->create()->public_id . '/information')
            ->assertJsonStructure(ArtistInformation::JSON_STRUCTURE);
    }
}
