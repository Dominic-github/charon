<?php

namespace App\Services\SongStorages;

use App\Enums\SongStorageType;
use App\Models\Song;
use App\Models\User;
use Illuminate\Http\UploadedFile;

abstract class SongStorage
{
    abstract public function getStorageType(): SongStorageType;

    abstract public function storeUploadedFile(UploadedFile $file, User $uploader): Song;

    abstract public function delete(Song $song, bool $backup = false): void;

    abstract public function testSetup(): void;

}
