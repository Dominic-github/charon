<?php

namespace Tests\Feature;

use App\Models\Song;
use App\Services\Streamer\Adapters\LocalStreamerAdapter;
use App\Services\Streamer\Adapters\TranscodingStreamerAdapter;
use App\Services\TokenManager;
use App\Values\CompositeToken;
use Illuminate\Support\Facades\File;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

use function Tests\create_user;
use function Tests\test_path;

class SongPlayTest extends TestCase
{
    #[Test]
    public function play(): void
    {
        $user = create_user();

        /** @var CompositeToken $token */
        $token = app(TokenManager::class)->createCompositeToken($user);

        /** @var Song $song */
        $song = Song::factory()->create([
            'path' => test_path('songs/blank.mp3'),
        ]);

        $this->mock(LocalStreamerAdapter::class)
            ->shouldReceive('stream')
            ->once();

        $this->get("play/$song->id?t=$token->audioToken")
            ->assertOk();
    }

    #[Test]
    public function transcoding(): void
    {
        config(['charon.streaming.transcode_flac' => true]);
        $user = create_user();

        /** @var CompositeToken $token */
        $token = app(TokenManager::class)->createCompositeToken($user);

        /** @var Song $song */
        $song = Song::factory()->create(['path' => test_path('songs/blank.mp3')]);

        File::partialMock()
            ->shouldReceive('mimeType')
            ->with($song->path)
            ->andReturn('audio/flac');

        $this->mock(TranscodingStreamerAdapter::class)
            ->shouldReceive('stream')
            ->once();

        $this->get("play/$song->id?t=$token->audioToken")
            ->assertOk();

        config(['charon.streaming.transcode_flac' => false]);
    }

    #[Test]
    public function forceTranscoding(): void
    {
        $user = create_user();

        /** @var CompositeToken $token */
        $token = app(TokenManager::class)->createCompositeToken($user);

        /** @var Song $song */
        $song = Song::factory()->create(['path' => test_path('songs/blank.mp3')]);

        $this->mock(TranscodingStreamerAdapter::class)
            ->shouldReceive('stream')
            ->once();

        $this->get("play/$song->id/1?t=$token->audioToken")
            ->assertOk();
    }

    #[Test]
    public function playPublicUnownedSong(): void
    {
        /** @var CompositeToken $token */
        $token = app(TokenManager::class)->createCompositeToken(create_user());

        /** @var Song $song */
        $song = Song::factory()->public()->create([
            'path' => test_path('songs/blank.mp3'),
        ]);

        $this->mock(LocalStreamerAdapter::class)
            ->shouldReceive('stream')
            ->once();

        $this->get("play/$song->id?t=$token->audioToken")
            ->assertOk();
    }

    #[Test]
    public function playPrivateOwnedSong(): void
    {
        /** @var Song $song */
        $song = Song::factory()->private()->create([
            'path' => test_path('songs/blank.mp3'),
        ]);

        /** @var CompositeToken $token */
        $token = app(TokenManager::class)->createCompositeToken($song->owner);

        $this->mock(LocalStreamerAdapter::class)
            ->shouldReceive('stream')
            ->once();

        $this->get("play/$song->id?t=$token->audioToken")
            ->assertOk();
    }

    #[Test]
    public function cannotPlayPrivateUnownedSong(): void
    {
        /** @var Song $song */
        $song = Song::factory()->private()->create([
            'path' => test_path('songs/blank.mp3'),
        ]);

        /** @var CompositeToken $token */
        $token = app(TokenManager::class)->createCompositeToken(create_user());

        $this->get("play/$song->id?t=$token->audioToken")
            ->assertForbidden();
    }
}
