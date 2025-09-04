<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LetterTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_name',
        'address_line1',
        'address_line2',
        'date',
        'recipient_name',
        'recipient_title',
        'recipient_company',
        'recipient_address1',
        'recipient_address2',
        'salutation',
        'paragraph1',
        'paragraph2',
        'paragraph3',
        'closing',
        'sender_name',
        'sender_title',
        'sender_contact',
        'sender_email',
    ];
}


