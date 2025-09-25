<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    use HasFactory;

    protected $table = 'staff';

    protected $fillable = [
        'department_id',
        'name',
        'position',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }
}


