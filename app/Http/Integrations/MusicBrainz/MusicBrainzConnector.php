<?php

namespace App\Http\Integrations\MusicBrainz;

use Saloon\Http\Connector;
use Saloon\Traits\Plugins\AcceptsJson;

class MusicBrainzConnector extends Connector
{
    use AcceptsJson;

    public function resolveBaseUrl(): string
    {
        return config('charon.services.musicbrainz.endpoint');
    }

    /** @inheritdoc */
    public function defaultHeaders(): array
    {
        return [
            'Accept' => 'application/json',
            'User-Agent' => config('charon.services.musicbrainz.user_agent')
                ?: config('app.name') . '/' . charon_version() . ' ( ' . config('app.url') . ' )',
        ];
    }
}
