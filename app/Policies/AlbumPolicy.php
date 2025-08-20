<?php

namespace App\Policies;

use App\Models\Album;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class AlbumPolicy
{
    /**
     * If the user can update the album (e.g., edit name, year, or upload the cover image).
     */
    public function update(User $user, Album $album): Response
    {
        // Unknown albums are not editable.
        if ($album->is_unknown) {
            return Response::deny();
        }

        if ($album->belongsToUser($user)) {
            return Response::allow();
        }

        // // For CE, if the user is an admin, they can update any album owned by them.
        // if ($user->is_admin) {
        //     return Response::allow();
        // }

        return Response::deny();
    }

    public function edit(User $user, Album $album): Response
    {
        return $this->update($user, $album);
    }
}
