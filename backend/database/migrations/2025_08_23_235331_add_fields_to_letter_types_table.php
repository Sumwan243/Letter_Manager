<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('letter_types', function (Blueprint $table) {
            $table->text('description')->nullable()->after('name');
            $table->json('template_fields')->nullable()->after('description');
            $table->boolean('is_active')->default(true)->after('template_fields');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('letter_types', function (Blueprint $table) {
            $table->dropColumn(['description', 'template_fields', 'is_active']);
        });
    }
};
