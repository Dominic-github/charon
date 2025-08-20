<?php

namespace App\Enums;

enum SongStorageType: string
{
    case S3 = 's3';
    case S3_LAMBDA = 's3-lambda';
    case DROPBOX = 'dropbox';
    case SFTP = 'sftp';
    case LOCAL = '';

    public function supported(): bool
    {
        return ($this === self::LOCAL || $this === self::S3_LAMBDA);
    }

    public function supportsFolderStructureExtraction(): bool
    {
        return $this === self::LOCAL;
    }
}
