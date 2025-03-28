<?php

namespace Tests\Feature;

use App\Models\Song;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

use function Tests\create_admin;

class SongVisibilityTest extends TestCase
{
    #[Test]
    public function changingVisibilityIsForbiddenInCommunityEdition(): void
    {
        $owner = create_admin();
        Song::factory(3)->create();

        $this->putAs('api/songs/publicize', ['songs' => Song::query()->pluck('id')->all()], $owner)
            ->assertForbidden();

        $this->putAs('api/songs/privatize', ['songs' => Song::query()->pluck('id')->all()], $owner)
            ->assertForbidden();
    }

    #[Test]
    public function makingSongPublic(): void
    {
        $currentUser = create_user();
        $anotherUser = create_user();

        /** @var Collection<Song> $externalSongs */
        $externalSongs = Song::factory(3)->for($anotherUser, 'owner')->private()->create();

        // We can't make public songs that are not ours.
        $this->putAs('api/songs/publicize', ['songs' => $externalSongs->pluck('id')->toArray()], $currentUser)
            ->assertForbidden();

        // But we can our own songs.
        $ownSongs = Song::factory(3)->for($currentUser, 'owner')->create();

        $this->putAs('api/songs/publicize', ['songs' => $ownSongs->pluck('id')->toArray()], $currentUser)
            ->assertSuccessful();

        $ownSongs->each(static fn (Song $song) => self::assertTrue($song->refresh()->is_public));
    }

    #[Test]
    public function makingSongPrivate(): void
    {
        $currentUser = create_user();
        $anotherUser = create_user();

        /** @var Collection<Song> $externalSongs */
        $externalSongs = Song::factory(3)->for($anotherUser, 'owner')->public()->create();

        // We can't Mark as Private songs that are not ours.
        $this->putAs('api/songs/privatize', ['songs' => $externalSongs->pluck('id')->toArray()], $currentUser)
            ->assertForbidden();

        // But we can our own songs.
        $ownSongs = Song::factory(3)->for($currentUser, 'owner')->create();

        $this->putAs('api/songs/privatize', ['songs' => $ownSongs->pluck('id')->toArray()], $currentUser)
            ->assertSuccessful();

        $ownSongs->each(static fn (Song $song) => self::assertFalse($song->refresh()->is_public));
    }
}
