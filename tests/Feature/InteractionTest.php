<?php

namespace Tests\Feature;

use App\Events\MultipleSongsLiked;
use App\Events\PlaybackStarted;
use App\Events\SongLikeToggled;
use App\Models\Interaction;
use App\Models\Song;
use Illuminate\Support\Facades\Event;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

use function Tests\create_user;

class InteractionTest extends TestCase
{
    #[Test]
    public function increasePlayCount(): void
    {
        Event::fake(PlaybackStarted::class);

        $user = create_user();
        $song = Song::factory()->create();

        $this->postAs('api/interaction/play', ['song' => $song->id], $user);

        self::assertDatabaseHas(Interaction::class, [
            'user_id' => $user->id,
            'song_id' => $song->id,
            'play_count' => 1,
        ]);

        // Try again
        $this->postAs('api/interaction/play', ['song' => $song->id], $user);

        self::assertDatabaseHas(Interaction::class, [
            'user_id' => $user->id,
            'song_id' => $song->id,
            'play_count' => 2,
        ]);
    }

    #[Test]
    public function toggleLike(): void
    {
        Event::fake(SongLikeToggled::class);

        $user = create_user();
        $song = Song::factory()->create();

        $this->postAs('api/interaction/like', ['song' => $song->id], $user);

        self::assertDatabaseHas(Interaction::class, [
            'user_id' => $user->id,
            'song_id' => $song->id,
            'liked' => 1,
        ]);

        // Try again
        $this->postAs('api/interaction/like', ['song' => $song->id], $user);

        self::assertDatabaseHas(Interaction::class, [
            'user_id' => $user->id,
            'song_id' => $song->id,
            'liked' => 0,
        ]);

        Event::assertDispatched(SongLikeToggled::class);
    }

    #[Test]
    public function toggleLikeBatch(): void
    {
        Event::fake(MultipleSongsLiked::class);

        $user = create_user();
        $songs = Song::factory(2)->create();
        $songIds = $songs->pluck('id')->all();

        $this->postAs('api/interaction/batch/like', ['songs' => $songIds], $user);

        foreach ($songs as $song) {
            self::assertDatabaseHas(Interaction::class, [
                'user_id' => $user->id,
                'song_id' => $song->id,
                'liked' => 1,
            ]);
        }

        $this->postAs('api/interaction/batch/unlike', ['songs' => $songIds], $user);

        foreach ($songs as $song) {
            self::assertDatabaseHas(Interaction::class, [
                'user_id' => $user->id,
                'song_id' => $song->id,
                'liked' => 0,
            ]);
        }

        Event::assertDispatched(MultipleSongsLiked::class);
    }

    #[Test]
    public function policyForRegisterPlay(): void
    {
        Event::fake(SongLikeToggled::class);

        $owner = create_user();

        // Can't increase play count of a private song that doesn't belong to the user
        /** @var Song $externalPrivateSong */
        $externalPrivateSong = Song::factory()->private()->create();
        $this->postAs('api/interaction/play', ['song' => $externalPrivateSong->id], $owner)
            ->assertForbidden();

        // Can increase play count of a public song that doesn't belong to the user
        /** @var Song $externalPublicSong */
        $externalPublicSong = Song::factory()->public()->create();
        $this->postAs('api/interaction/play', ['song' => $externalPublicSong->id], $owner)
            ->assertSuccessful();

        // Can increase play count of a private song that belongs to the user
        /** @var Song $ownPrivateSong */
        $ownPrivateSong = Song::factory()->private()->for($owner, 'owner')->create();
        $this->postAs('api/interaction/play', ['song' => $ownPrivateSong->id], $ownPrivateSong->owner)
            ->assertSuccessful();
    }

    #[Test]
    public function policyForToggleLike(): void
    {
        Event::fake(SongLikeToggled::class);

        $owner = create_user();

        // Can't like a private song that doesn't belong to the user
        /** @var Song $externalPrivateSong */
        $externalPrivateSong = Song::factory()->private()->create();
        $this->postAs('api/interaction/like', ['song' => $externalPrivateSong->id], $owner)
            ->assertForbidden();

        // Can like a public song that doesn't belong to the user
        /** @var Song $externalPublicSong */
        $externalPublicSong = Song::factory()->public()->create();
        $this->postAs('api/interaction/like', ['song' => $externalPublicSong->id], $owner)
            ->assertSuccessful();

        // Can like a private song that belongs to the user
        /** @var Song $ownPrivateSong */
        $ownPrivateSong = Song::factory()->private()->for($owner, 'owner')->create();
        $this->postAs('api/interaction/like', ['song' => $ownPrivateSong->id], $owner)
            ->assertSuccessful();
    }

    #[Test]
    public function policyForBatchLike(): void
    {
        Event::fake(MultipleSongsLiked::class);

        $owner = create_user();

        // Can't batch like private songs that don't belong to the user
        /** @var Collection $externalPrivateSongs */
        $externalPrivateSongs = Song::factory()->count(3)->private()->create();
        $this->postAs('api/interaction/batch/like', ['songs' => $externalPrivateSongs->pluck('id')->all()], $owner)
            ->assertForbidden();

        // Can batch like public songs that don't belong to the user
        /** @var Collection $externalPublicSongs */
        $externalPublicSongs = Song::factory()->count(3)->public()->create();
        $this->postAs('api/interaction/batch/like', ['songs' => $externalPublicSongs->pluck('id')->all()], $owner)
            ->assertSuccessful();

        // Can batch like private songs that belong to the user
        /** @var Collection $ownPrivateSongs */
        $ownPrivateSongs = Song::factory()->count(3)->private()->for($owner, 'owner')->create();
        $this->postAs('api/interaction/batch/like', ['songs' => $ownPrivateSongs->pluck('id')->all()], $owner)
            ->assertSuccessful();

        // Can't batch like a mix of inaccessible and accessible songs
        $mixedSongs = $externalPrivateSongs->merge($externalPublicSongs);
        $this->postAs('api/interaction/batch/like', ['songs' => $mixedSongs->pluck('id')->all()], $owner)
            ->assertForbidden();
    }

    #[Test]
    public function policyForBatchUnlike(): void
    {
        Event::fake(MultipleSongsUnliked::class);

        $owner = create_user();

        // Can't batch unlike private songs that don't belong to the user
        /** @var Collection $externalPrivateSongs */
        $externalPrivateSongs = Song::factory()->count(3)->private()->create();
        $this->postAs('api/interaction/batch/unlike', ['songs' => $externalPrivateSongs->pluck('id')->all()], $owner)
            ->assertForbidden();

        // Can batch unlike public songs that don't belong to the user
        /** @var Collection $externalPublicSongs */
        $externalPublicSongs = Song::factory()->count(3)->public()->create();
        $this->postAs('api/interaction/batch/unlike', ['songs' => $externalPublicSongs->pluck('id')->all()], $owner)
            ->assertSuccessful();

        // Can batch unlike private songs that belong to the user
        /** @var Collection $ownPrivateSongs */
        $ownPrivateSongs = Song::factory()->count(3)->private()->for($owner, 'owner')->create();
        $this->postAs('api/interaction/batch/unlike', ['songs' => $ownPrivateSongs->pluck('id')->all()], $owner)
            ->assertSuccessful();

        // Can't batch unlike a mix of inaccessible and accessible songs
        $mixedSongs = $externalPrivateSongs->merge($externalPublicSongs);
        $this->postAs('api/interaction/batch/unlike', ['songs' => $mixedSongs->pluck('id')->all()], $owner)
            ->assertForbidden();
    }
}
