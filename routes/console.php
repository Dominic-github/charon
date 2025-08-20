<?php

use App\Jobs\RunCommandJob;
use Illuminate\Support\Facades\Schedule;

Schedule::job(new RunCommandJob('charon:scan'))->daily();
Schedule::job(new RunCommandJob('charon:prune'))->daily();
Schedule::job(new RunCommandJob('charon:podcasts:sync'))->daily();
Schedule::job(new RunCommandJob('charon:clean-up-temp-files'))->daily();
