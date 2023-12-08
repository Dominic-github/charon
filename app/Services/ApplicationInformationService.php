<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Contracts\Cache\Repository as Cache;

class ApplicationInformationService
{
    public function __construct(private Client $client, private Cache $cache)
    {
    }

    /**
     * Get the latest version number of Charon from GitHub.
     */
    public function getLatestVersionNumber(): string
    {
        return attempt(function () {
            return $this->cache->remember('latestCharonVersion', now()->addDay(), function (): string {
                return json_decode($this->client->get('https://api.github.com/repos/night12-00/charon/tags')->getBody())[0]
                    ->name;
            });
        }) ?? charon_version();
    }
}
