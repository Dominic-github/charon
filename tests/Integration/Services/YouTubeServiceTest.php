<?php

namespace Tests\Integration\Services;

use App\Http\Integrations\YouTube\Requests\SearchVideosRequest;
use App\Models\Artist;
use App\Models\Song;
use App\Services\YouTubeService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use PHPUnit\Framework\Attributes\Test;
use Saloon\Http\Faking\MockResponse;
use Saloon\Laravel\Saloon;
use Tests\TestCase;

use function Tests\test_path;

class YouTubeServiceTest extends TestCase
{
    private YouTubeService $service;

    public function setUp(): void
    {
        parent::setUp();

        $this->service = app(YouTubeService::class);
    }

    #[Test]
    public function searchVideosRelatedToSong(): void
    {
        /** @var Song $song */
        $song = Song::factory()->for(Artist::factory()->create(['name' => 'Slipknot']))->create(['title' => 'Snuff']);

        Saloon::fake([
            SearchVideosRequest::class => MockResponse::make(
                body: File::get(test_path('fixtures/youtube/search.json')),
            ),
        ]);

        $response = $this->service->searchVideosRelatedToSong($song, 'my-token');

        self::assertSame('Slipknot - Snuff [OFFICIAL VIDEO]', $response->items[0]->snippet->title);
    }
}
