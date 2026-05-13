<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {

        // add Area, Owner, Contact info, Price per Year columns. 

        // Areas should include municipalities in abuja: 
        // Asokoro, Maitama, Wuse, Garki, Jabi, Utako, Central Business District (CBD), Lugbe, Kado, Durumi, Apo, Kubwa, Karmo, Karu, Bwari, Kwali.
        Schema::create('spaces', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type');
            $table->text('description');
            $table->integer('capacity')->nullable();
            $table->decimal('price_per_hour', 8, 2)->nullable();
            $table->decimal('price_per_night', 8, 2)->nullable();
            $table->decimal('price_per_year', 8, 2)->nullable();
            $table->string('area');
            $table->string('owner');
            $table->string('contact_info');
            $table->decimal('rating', 2, 1)->default(0);
            $table->integer('review_count')->default(0);
            $table->json('reviews')->nullable();
            $table->json('amenities')->nullable();
            $table->json('images')->nullable();
            $table->integer('beds')->default(1);
            $table->integer('bathrooms')->default(1);
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('address');
            $table->boolean('available')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spaces');
    }
};
