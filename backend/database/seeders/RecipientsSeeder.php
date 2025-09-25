<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;
use App\Models\Staff;

class RecipientsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $ict = Department::firstOrCreate(['name' => 'ICT']);
        $software = Department::firstOrCreate(['name' => 'Software Department']);

        Staff::firstOrCreate(
            ['name' => 'Surafel Abebaw'],
            ['position' => 'IT Staff', 'department_id' => $ict->id]
        );

        Staff::firstOrCreate(
            ['name' => 'Natnael Solomon'],
            ['position' => 'Software Engineer', 'department_id' => $software->id]
        );
    }
}


