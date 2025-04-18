<?php

namespace App\Console\Commands;

use App\Services\LibraryManager;
use Illuminate\Console\Command;

class PruneLibraryCommand extends Command
{
    protected $signature = 'charon:prune';
    protected $description = 'Remove empty artists and albums';

    public function __construct(private readonly LibraryManager $libraryManager)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->libraryManager->prune();
        $this->info('Empty artists and albums removed.');

        return self::SUCCESS;
    }
}
