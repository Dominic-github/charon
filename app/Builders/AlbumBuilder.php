<?php

namespace App\Builders;

use App\Models\Album;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Query\JoinClause;

class AlbumBuilder extends Builder
{
    public function isStandard(): self
    {
        return $this->whereNot('albums.id', Album::UNKNOWN_ID);
    }

    public function accessibleBy(User $user): self
    {

        return $this->join('songs', static function (JoinClause $join) use ($user): void {
            $join->on('albums.id', 'songs.album_id')
                ->where(static function (JoinClause $query) use ($user): void {
                    $query->where('songs.owner_id', $user->id)
                        ->orWhere('songs.is_public', true);
                });
        });
    }
}
