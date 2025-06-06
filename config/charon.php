<?php

return [
    'storage_driver' => env('STORAGE_DRIVER', 'local') ?: 'local',

    'media_path' => env('MEDIA_PATH'),

    // The *relative* path to the directory to store album covers and thumbnails, *with* a trailing slash.
    'album_cover_dir' => 'img/covers/',

    // The *relative* path to the directory to store artist images, *with* a trailing slash.
    'artist_image_dir' => 'img/artists/',

    // The *relative* path to the directory to store playlist covers, *with* a trailing slash.
    'playlist_cover_dir' => 'img/playlists/',

    // The *relative* path to the directory to store user avatars, *with* a trailing slash.
    'user_avatar_dir' => 'img/avatars/',

    /*
    |--------------------------------------------------------------------------
    | Sync Options
    |--------------------------------------------------------------------------
    |
    | A timeout is set when using the browser to scan the folder path
    |
    */

    'sync' => [
        'timeout' => env('APP_MAX_SCAN_TIME', 600),
    ],

    /*
    |--------------------------------------------------------------------------
    | Streaming Configurations
    |--------------------------------------------------------------------------
    |
    | Many streaming options can be set, including, 'bitrate' with 128 set
    | as the default, 'method' with php as the default and 'transcoding'
    | to configure the path for FFMPEG to transcode FLAC audio files
    |
    */

    'streaming' => [
        'bitrate' => env('OUTPUT_BIT_RATE', 128),
        'method' => env('STREAMING_METHOD'),
        'ffmpeg_path' => env('FFMPEG_PATH'),
        'transcode_flac' => env('TRANSCODE_FLAC', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Youtube Integration
    |--------------------------------------------------------------------------
    |
    | Youtube integration requires an youtube API key, see wiki for more
    |
    */

    'youtube' => [
        'key' => env('YOUTUBE_API_KEY'),
        'endpoint' => 'https://www.googleapis.com/youtube/v3',
    ],

    /*
    |--------------------------------------------------------------------------
    | Last.FM Integration
    |--------------------------------------------------------------------------
    |
    | See wiki on how to integrate with Last.FM
    |
    */

    'lastfm' => [
        'key' => env('LASTFM_API_KEY'),
        'secret' => env('LASTFM_API_SECRET'),
        'endpoint' => 'https://ws.audioscrobbler.com/2.0',
    ],

    /*
    |--------------------------------------------------------------------------
    | Last.FM Integration
    |--------------------------------------------------------------------------
    |
    | See wiki on how to integrate with Last.FM
    |
    */

    'spotify' => [
        'client_id' => env('SPOTIFY_CLIENT_ID'),
        'client_secret' => env('SPOTIFY_CLIENT_SECRET'),
    ],


    /*
    |--------------------------------------------------------------------------
    | CDN
    |--------------------------------------------------------------------------
    |
    |
    |
    */

    'cdn' => [
        'url' => env('CDN_URL'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Downloading Music
    |--------------------------------------------------------------------------
    |
    | Charon provides the ability to prohibit or allow [default] downloading music
    |
    */

    'download' => [
        'allow' => env('allows_download', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Ignore Dot Files
    |--------------------------------------------------------------------------
    |
    | Ignore dot files and folders when scanning for media files.
    |
    */
    'ignore_dot_files' => env('IGNORE_DOT_FILES', true),

    'itunes' => [
        'enabled' => env('USE_ITUNES', true),
        'affiliate_id' => '1000lsGu',
        'endpoint' => 'https://itunes.apple.com/search',
    ],

    'cache_media' => env('CACHE_MEDIA', true),
    'memory_limit' => env('MEMORY_LIMIT'),
    'force_https' => env('FORCE_HTTPS', false),
    'backup_on_delete' => env('BACKUP_ON_DELETE', true),

    'sync_log_level' => env('SYNC_LOG_LEVEL', 'error'),

    'proxy_auth' => [
        'enabled' => env('PROXY_AUTH_ENABLED', false),
        'user_header' => env('PROXY_AUTH_USER_HEADER', 'remote-user'),
        'preferred_name_header' => env('PROXY_AUTH_PREFERRED_NAME_HEADER', 'remote-preferred-name'),
        'allow_list' => array_map(static fn ($entry) => trim($entry), explode(',', env('PROXY_AUTH_ALLOW_LIST', ''))),
    ],

    'misc' => [
        'home_url' => 'https://charon.dev',
        'docs_url' => 'https://docs.charon.dev',
        'sponsor_github_url' => 'https://github.com/users/dominic-gtihub/sponsorship',
        'sponsor_open_collective_url' => 'https://opencollective.com/dominic-github',
        'demo' => env('CHARON_DEMO', false),
    ],
];
