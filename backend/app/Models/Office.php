<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Office extends Model
{
    protected $fillable = [
        'name',
        'code',
        'description',
        'location',
        'phone',
        'email',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get users in this office
     */
    public function users()
    {
        return $this->hasMany(User::class, 'office', 'name');
    }
}
