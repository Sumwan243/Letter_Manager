<?php

namespace Database\Seeders;

use App\Models\LetterType;
use Illuminate\Database\Seeder;

class LetterTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Minimal set: Formal – Executive, Formal – Staff, Informal

        // 1) Formal – Executive
        LetterType::updateOrCreate(
            ['name' => 'Formal – Executive'],
            [
            'description' => 'Formal client letters from executives; logo optional, full company header, date on right.',
            'template_fields' => [
                // Header
                'company_logo' => 'file',
                'company_name' => 'text',
                'address_line1' => 'text',
                'address_line2' => 'text',
                'city' => 'text',
                'state' => 'text',
                'zip_code' => 'text',
                // Sender
                'sender_name' => 'text',
                'sender_title' => 'text',
                'sender_department' => 'text',
                // Recipient
                'recipient_name' => 'text',
                'recipient_title' => 'text',
                'recipient_company' => 'text',
                'recipient_address' => 'textarea',
                // Meta
                'letter_date' => 'date',
                'salutation' => 'text',
                'subject' => 'text',
                // Body
                'body' => 'textarea',
                'action_requested' => 'textarea',
                'contact_information' => 'text',
            ],
            'is_active' => true,
        ]);

        // 2) Formal – Staff
        LetterType::updateOrCreate(
            ['name' => 'Formal – Staff'],
            [
            'description' => 'Formal client letters from staff; lean header without logo, department emphasis.',
            'template_fields' => [
                // Header
                'company_logo' => 'file',
                'department_name' => 'text',
                // Parties
                'sender_name' => 'text', // FROM
                'recipient_name' => 'text', // TO
                // Meta
                'ref_no' => 'text',
                'letter_date' => 'date',
                'subject' => 'text',
                // Body
                'body' => 'textarea',
                // Footer
                'phone' => 'text',
                'signature_image' => 'file',
            ],
            'is_active' => true,
        ]);

        // 3) Informal
        LetterType::updateOrCreate(
            ['name' => 'Informal'],
            [
            'description' => 'Personal or casual internal letters with a simple personal layout.',
            'template_fields' => [
                'sender_name' => 'text',
                'sender_address' => 'textarea',
                'recipient_name' => 'text',
                'recipient_address' => 'textarea',
                'letter_date' => 'date',
                'salutation' => 'text',
                'personal_message' => 'textarea',
                'closing' => 'text',
            ],
            'is_active' => true,
        ]);
    }
}
