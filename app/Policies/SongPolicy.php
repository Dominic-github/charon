<?php

namespace App\Policies;

use App\Models\Song;
use App\Models\User;

class SongPolicy
{
    public function own(User $user, Song $song): bool
    {
        return $song->owner_id === $user->id;
    }

    public function access(User $user, Song $song): bool
    {
        return   $song->accessibleBy($user);
    }

    public function delete(User $user, Song $song): bool
    {
        return ( $song->ownedBy($user)) || $user->is_admin;
    }

    public function edit(User $user, Song $song): bool
    {
        return ( $song->accessibleBy($user)) || $user->is_admin;
    }

    public function download(User $user, Song $song): bool
    {
        return config('charon.download.allow') && $this->access($user, $song);
    }
}
