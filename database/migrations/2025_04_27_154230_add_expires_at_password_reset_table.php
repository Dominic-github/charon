<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
 
    public function up(): void
    {
        Schema::table('password_resets', static function (Blueprint $table): void {
            $table->timestamp('expires_at');
        });
        DB::unprepared('
            CREATE TRIGGER set_password_reset_expires_at
            BEFORE INSERT ON password_resets
            FOR EACH ROW
            SET NEW.expires_at = TIMESTAMPADD(MINUTE, 60, NEW.created_at);
        ');
    }

};
