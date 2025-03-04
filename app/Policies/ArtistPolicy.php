<?php

namespace App\Policies;

use App\Models\Artist;
use App\Models\Song;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ArtistPolicy
{
    public function update(User $user, Artist $artist): Response
    {
        if ($user->is_admin) {
            return Response::allow();
        }

        return $artist->songs->every(static fn (Song $song) => $song->ownedBy($user))
            ? Response::allow()
            : Response::deny('Artist is not owned by the user.');
    }
}
