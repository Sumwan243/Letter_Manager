<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LetterType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'template_fields',
        'is_active',
    ];

    protected $casts = [
        'template_fields' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the letters for this letter type.
     */
    public function letters()
    {
        return $this->hasMany(Letter::class);
    }

    /**
     * Scope for active letter types
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
