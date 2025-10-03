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

        // 1) Formal – Executive (Business Letter)
        LetterType::updateOrCreate(
            ['name' => 'Formal – Executive'],
            [
            'description' => 'Professional business letters from executives with full company branding.',
            'allowed_roles' => ['admin', 'executive'],
            'template_fields' => [
                // Company Header
                'company_logo' => 'file',
                'company_name' => 'text',
                'address_line1' => 'text',
                'address_line2' => 'text',
                'city' => 'text',
                'state' => 'text',
                'zip_code' => 'text',
                // Sender Information
                'sender_name' => 'text',
                'sender_position' => 'text',
                'sender_company' => 'text',
                // Recipient Information
                'recipient_name' => 'text',
                'recipient_title' => 'text',
                'recipient_company' => 'text',
                'recipient_address' => 'textarea',
                // Letter Details
                'letter_date' => 'date',
                'subject' => 'text',
                // Content
                'body' => 'textarea',
                // Closing
                'closing_salutation' => 'text',
                // Contact
                'contact_information' => 'text',
            ],
            'is_active' => true,
        ]);

        // 2) Formal – Staff (Executive Official Letter)
        LetterType::updateOrCreate(
            ['name' => 'Formal – Staff'],
            [
            'description' => 'High-level executive/official correspondence with reference numbers and formal structure.',
            'allowed_roles' => ['admin', 'executive', 'staff'],
            'template_fields' => [
                // Organization Header
                'company_logo' => 'file',
                'organization_name' => 'text',
                'organization_name_local' => 'text',
                'department_name' => 'text',
                // Reference Information
                'ref_no' => 'text',
                'letter_date' => 'date',
                // Sender Information
                'sender_name' => 'text',
                'sender_position' => 'text',
                // Recipient Information
                'recipient_name' => 'text',
                'recipient_title' => 'text',
                // Letter Content
                'subject' => 'text',
                'body' => 'textarea',
                // Closing
                'closing_salutation' => 'text',
                // Signature & Contact
                'signature_image' => 'file',
                'phone' => 'text',
                'email' => 'email',
            ],
            'is_active' => true,
        ]);

        // 3) Informal
        LetterType::updateOrCreate(
            ['name' => 'Informal'],
            [
            'description' => 'Personal or casual internal letters with a simple personal layout.',
            'allowed_roles' => ['admin', 'executive', 'staff'],
            'template_fields' => [
                'sender_name' => 'text',
                'sender_address' => 'textarea',
                'recipient_name' => 'text',
                'recipient_address' => 'textarea',
                'letter_date' => 'date',
                'salutation' => 'text',
                'personal_message' => 'textarea',
                'closing_salutation' => 'text',
            ],
            'is_active' => true,
        ]);
    }
}
