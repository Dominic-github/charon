<?php

namespace App\Http\Integrations\Lastfm;

use App\Http\Integrations\Lastfm\Auth\LastfmAuthenticator;
use Saloon\Http\Connector;
use Saloon\Traits\Plugins\AcceptsJson;

class LastfmConnector extends Connector
{
    use AcceptsJson;

    public function resolveBaseUrl(): string
    {
        return config('charon.lastfm.endpoint');
    }

    protected function defaultAuth(): LastfmAuthenticator
    {
        return new LastfmAuthenticator(config('charon.lastfm.key'), config('charon.lastfm.secret'));
    }
}
