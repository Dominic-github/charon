<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePlaylistsTable extends Migration
{
    public function up(): void
    {
        Schema::create('playlists', static function (Blueprint $table): void {
            $table->increments('id');
            $table->integer('user_id')->unsigned();
            $table->string('name');
            $table->timestamps();
        });

        Schema::table('playlists', static function (Blueprint $table): void {
            $table->foreign('user_id')->references('id')->on('users');
        });
    }

    public function down(): void
    {
         if (Schema::hasTable('playlist_collaborators')) {
            Schema::table('playlist_collaborators', function (Blueprint $table) {
                $table->dropForeign(['playlist_id']);
            });
        }
        Schema::dropIfExists('playlists');
    }
}
