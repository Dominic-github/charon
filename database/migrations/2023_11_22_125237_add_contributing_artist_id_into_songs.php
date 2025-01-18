<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddContributingArtistIdIntoSongs extends Migration
{
    /**
     * Run the migrations.
     *
     */
    public function up(): void
    {
        Schema::table('songs', static function (Blueprint $table): void {
            $table->integer('contributing_artist_id')->unsigned()->nullable()->after('album_id');
            $table->foreign('contributing_artist_id')->references('id')->on('artists')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     */
    public function down(): void
    {
        Schema::table('songs', static function (Blueprint $table): void {
            rescue_if(Schema::hasColumn('songs', 'contributing_artist_id'), static function () use ($table): void {
                Schema::disableForeignKeyConstraints();

                if (DB::getDriverName() !== 'sqlite') { // @phpstan-ignore-line
                    $table->dropForeign('songs_contributing_artist_id_foreign');
                }

                $table->dropColumn('contributing_artist_id');
                Schema::enableForeignKeyConstraints();
            });
        });
        
    }
}
