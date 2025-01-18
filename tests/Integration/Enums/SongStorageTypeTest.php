<?php

namespace Tests\Integration\Enums;

use App\Enums\SongStorageType;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class SongStorageTypeTest extends TestCase
{
    #[Test]
    public function supported(): void
    {
        self::assertTrue(SongStorageType::LOCAL->supported());
        self::assertTrue(SongStorageType::S3_LAMBDA->supported());
        self::assertTrue(SongStorageType::SFTP->supported());
        self::assertTrue(SongStorageType::DROPBOX->supported());
        self::assertTrue(SongStorageType::S3->supported());
    }
}
