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
        // Business-Focused Letter Types for Professional Communication

        // 1. Business Letter
        LetterType::create([
            'name' => 'Business Letter',
            'description' => 'Formal communication with clients, partners, or other organizations. Covers proposals, requests, complaints, and official correspondence.',
            'template_fields' => [
                'sender_name' => 'text',
                'sender_position' => 'text',
                'sender_company' => 'text',
                'recipient_name' => 'text',
                'recipient_position' => 'text',
                'recipient_company' => 'text',
                'subject' => 'text',
                'letter_type' => ['type' => 'select', 'options' => ['Proposal', 'Request', 'Complaint', 'Inquiry', 'Follow-up', 'Other']],
                'body' => 'textarea',
                'action_requested' => 'textarea',
                'contact_information' => 'text',
            ],
            'is_active' => true,
        ]);

        // 2. Cover Letter
        LetterType::create([
            'name' => 'Cover Letter',
            'description' => 'Sent alongside a CV/resume when applying for jobs. Explains qualifications and why the applicant is suitable.',
            'template_fields' => [
                'applicant_name' => 'text',
                'applicant_address' => 'textarea',
                'applicant_phone' => 'text',
                'applicant_email' => 'email',
                'application_date' => 'date',
                'hiring_manager_name' => 'text',
                'company_name' => 'text',
                'job_title' => 'text',
                'job_source' => 'text',
                'qualifications_summary' => 'textarea',
                'relevant_experience' => 'textarea',
                'why_interested' => 'textarea',
                'salary_expectations' => 'text',
                'availability_date' => 'date',
            ],
            'is_active' => true,
        ]);

        // 3. Notice/Announcement Letter
        LetterType::create([
            'name' => 'Notice/Announcement Letter',
            'description' => 'For informing staff/customers about changes, meetings, holidays, or policies.',
            'template_fields' => [
                'notice_title' => 'text',
                'notice_number' => 'text',
                'sender_name' => 'text',
                'sender_position' => 'text',
                'sender_department' => 'text',
                'notice_type' => ['type' => 'select', 'options' => ['Policy Change', 'Meeting', 'Holiday', 'Event', 'Update', 'Other']],
                'effective_date' => 'date',
                'expiry_date' => 'date',
                'target_audience' => 'text',
                'notice_content' => 'textarea',
                'impact_description' => 'textarea',
                'contact_person' => 'text',
                'contact_details' => 'text',
            ],
            'is_active' => true,
        ]);

        // 4. Acknowledgement/Receipt Letter
        LetterType::create([
            'name' => 'Acknowledgement/Receipt Letter',
            'description' => 'Confirms that goods, payments, or documents have been received.',
            'template_fields' => [
                'sender_name' => 'text',
                'sender_company' => 'text',
                'recipient_name' => 'text',
                'recipient_company' => 'text',
                'receipt_date' => 'date',
                'receipt_number' => 'text',
                'item_type' => ['type' => 'select', 'options' => ['Goods', 'Payment', 'Documents', 'Application', 'Other']],
                'item_description' => 'textarea',
                'quantity_amount' => 'text',
                'payment_amount' => 'text',
                'received_date' => 'date',
                'condition_status' => ['type' => 'select', 'options' => ['Good', 'Damaged', 'Incomplete', 'Satisfactory', 'Other']],
                'additional_notes' => 'textarea',
                'next_steps' => 'textarea',
            ],
            'is_active' => true,
        ]);

        // 5. Private Letter
        LetterType::create([
            'name' => 'Private Letter',
            'description' => 'Personal correspondence for private matters, family communication, or informal business relations.',
            'template_fields' => [
                'sender_name' => 'text',
                'sender_address' => 'textarea',
                'recipient_name' => 'text',
                'recipient_address' => 'textarea',
                'letter_date' => 'date',
                'salutation' => 'text',
                'letter_purpose' => 'text',
                'letter_content' => 'textarea',
                'personal_message' => 'textarea',
                'closing' => 'text',
                'contact_information' => 'text',
            ],
            'is_active' => true,
        ]);
    }
}
