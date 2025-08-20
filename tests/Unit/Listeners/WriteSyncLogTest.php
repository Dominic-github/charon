<?php

namespace Tests\Unit\Listeners;

use App\Events\MediaScanCompleted;
use App\Listeners\WriteScanLog;
use App\Values\Scanning\ScanResult;
use App\Values\Scanning\ScanResultCollection;
use Carbon\Carbon;
use Illuminate\Support\Facades\File;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

use function Tests\test_path;

class WriteSyncLogTest extends TestCase
{
    private WriteScanLog $listener;
    private string $originalLogLevel;

    public function setUp(): void
    {
        parent::setUp();

        $this->listener = new WriteScanLog();
        $this->originalLogLevel = config('charon.sync_log_level');
        Carbon::setTestNow(Carbon::create(2021, 1, 2, 12, 34, 56));
    }

    protected function tearDown(): void
    {
        File::delete(storage_path('logs/sync-20210102-123456.log'));
        config(['charon.sync_log_level' => $this->originalLogLevel]);

        parent::tearDown();
    }

    #[Test]
    public function handleWithLogLevelAll(): void
    {
        config(['charon.sync_log_level' => 'all']);

        $this->listener->handle(self::createSyncCompleteEvent());

        $actual = File::get(storage_path('logs/sync-20210102-123456.log'));
        $expected = File::get(test_path('fixtures/sync-log-all.log'));

        // Normalize line endings
        $actual = str_replace("\r\n", "\n", $actual);
        $expected = str_replace("\r\n", "\n", $expected);

        self::assertEquals($expected, $actual);
    }

    #[Test]
    public function handleWithLogLevelError(): void
    {
        config(['charon.sync_log_level' => 'error']);

        $this->listener->handle(self::createSyncCompleteEvent());

        $actual = File::get(storage_path('logs/sync-20210102-123456.log'));
        $expected = File::get(test_path('fixtures/sync-log-error.log'));

        $actual = str_replace("\r\n", "\n", $actual);
        $expected = str_replace("\r\n", "\n", $expected);

        self::assertEquals($expected, $actual);
    }

    private static function createSyncCompleteEvent(): MediaScanCompleted
    {
        $resultCollection = ScanResultCollection::create()
            ->add(ScanResult::success('/media/foo.mp3'))
            ->add(ScanResult::error('/media/baz.mp3', 'Something went wrong'))
            ->add(ScanResult::error('/media/qux.mp3', 'Something went horribly wrong'))
            ->add(ScanResult::skipped('/media/bar.mp3'));

        return new MediaScanCompleted($resultCollection);
    }
}
