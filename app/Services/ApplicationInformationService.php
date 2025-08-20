<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Cache;

class ApplicationInformationService
{
    public function __construct(private readonly Client $client) {}

    /**
     * Get the latest version number of Charon from GitHub.
     */
    public function getLatestVersionNumber(): string
    {
        return rescue(function () {
            return Cache::remember(cache_key('latest version number'), now()->addDay(), function (): string {
                return json_decode($this->client->get('https://api.github.com/repos/dominic-github/charon/tagss')->getBody())[0]
                    ->name;
            });
        }) ?? charon_version();
    }
}
