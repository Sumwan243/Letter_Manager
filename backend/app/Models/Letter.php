<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Letter extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'letter_type_id',
        'title',
        'content',
        'fields',
        'status',
    ];

    // Cast fields JSON to array automatically
    protected $casts = [
        'fields' => 'array',
    ];

    /**
     * Accessor: Provide a sensible default title when empty
     */
    public function getTitleAttribute($value)
    {
        if (is_string($value) && $value !== '') {
            return $value;
        }

        $fields = $this->attributes['fields'] ?? null;
        if (is_string($fields)) {
            // When not yet cast
            $decoded = json_decode($fields, true);
            if (json_last_error() === JSON_ERROR_NONE && isset($decoded['subject']) && $decoded['subject'] !== '') {
                return $decoded['subject'];
            }
        } elseif (is_array($this->fields) && isset($this->fields['subject']) && $this->fields['subject'] !== '') {
            return $this->fields['subject'];
        }

        return 'Untitled Letter';
    }

    /**
     * Accessor: Ensure content is a string
     */
    public function getContentAttribute($value)
    {
        return $value ?? '';
    }

    /**
     * Get the user that owns the letter.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the letter type for the letter.
     */
    public function letterType()
    {
        return $this->belongsTo(LetterType::class);
    }

    /**
     * Scope for letters by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for letters by user
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}
