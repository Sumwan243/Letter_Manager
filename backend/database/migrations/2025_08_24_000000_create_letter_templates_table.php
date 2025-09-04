<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('letter_templates', function (Blueprint $table) {
            $table->id();
            $table->string('company_name');
            $table->string('address_line1');
            $table->string('address_line2')->nullable();
            $table->date('date');
            $table->string('recipient_name');
            $table->string('recipient_title')->nullable();
            $table->string('recipient_company')->nullable();
            $table->string('recipient_address1');
            $table->string('recipient_address2')->nullable();
            $table->string('salutation');
            $table->text('paragraph1');
            $table->text('paragraph2')->nullable();
            $table->text('paragraph3')->nullable();
            $table->string('closing');
            $table->string('sender_name');
            $table->string('sender_title')->nullable();
            $table->string('sender_contact')->nullable();
            $table->string('sender_email')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('letter_templates');
    }
};


