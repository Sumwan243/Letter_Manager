<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TemplateField extends Model
{
    use HasFactory;

    protected $fillable = ['letter_type_id', 'name', 'type', 'required'];

    public function letterType()
    {
        return $this->belongsTo(LetterType::class);
    }
}
