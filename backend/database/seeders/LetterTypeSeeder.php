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

        // 1. Professional Correspondence
        LetterType::create([
            'name' => 'Professional Correspondence',
            'description' => 'Formal business communication with clients, partners, or organizations. Covers proposals, requests, complaints, and official correspondence.',
            'template_fields' => [
                'company_logo' => 'file',
                'company_name' => 'text',
                'address_line1' => 'text',
                'address_line2' => 'text',
                'city' => 'text',
                'state' => 'text',
                'zip_code' => 'text',
                'sender_name' => 'text',
                'sender_position' => 'text',
                'sender_company' => 'text',
                'recipient_name' => 'text',
                'recipient_position' => 'text',
                'recipient_company' => 'text',
                'recipient_address' => 'textarea',
                'subject' => 'text',
                'letter_type' => ['type' => 'select', 'options' => ['Proposal', 'Request', 'Complaint', 'Inquiry', 'Follow-up', 'Other']],
                'body' => 'textarea',
                'action_requested' => 'textarea',
                'contact_information' => 'text',
            ],
            'is_active' => true,
        ]);

        // 2. Job Application Intro
        LetterType::create([
            'name' => 'Job Application Intro',
            'description' => 'Career-focused introduction sent with CV/resume. Highlights qualifications and demonstrates suitability for specific positions.',
            'template_fields' => [
                'applicant_name' => 'text',
                'applicant_address' => 'textarea',
                'applicant_phone' => 'text',
                'applicant_email' => 'email',
                'application_date' => 'date',
                'hiring_manager_name' => 'text',
                'hiring_manager_title' => 'text',
                'company_name' => 'text',
                'company_address' => 'textarea',
                'job_title' => 'text',
                'job_source' => 'text',
                'qualifications_summary' => 'textarea',
                'relevant_experience' => 'textarea',
                'why_interested' => 'textarea',
                'salary_expectations' => 'text',
                'availability_date' => 'date',
                'closing_statement' => 'textarea',
            ],
            'is_active' => true,
        ]);

        // 3. Formal Announcement
        LetterType::create([
            'name' => 'Formal Announcement',
            'description' => 'Official and broad notifications for organizational changes, policy updates, or significant announcements.',
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

        // 4. Confirmation Note
        LetterType::create([
            'name' => 'Confirmation Note',
            'description' => 'Receipt and acknowledgment focus for confirming goods, payments, or documents have been received.',
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

        // 5. Confidential Message
        LetterType::create([
            'name' => 'Confidential Message',
            'description' => 'Private and personal correspondence emphasizing privacy for confidential matters, family communication, or sensitive business relations.',
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

        // 6. Team Meeting Brief
        LetterType::create([
            'name' => 'Team Meeting Brief',
            'description' => 'Concise team-related communication for internal meetings, briefings, and team updates.',
            'template_fields' => [
                'meeting_title' => 'text',
                'meeting_date' => 'date',
                'meeting_time' => 'text',
                'meeting_location' => 'text',
                'organizer_name' => 'text',
                'organizer_position' => 'text',
                'attendees' => 'textarea',
                'agenda_items' => 'textarea',
                'meeting_objectives' => 'textarea',
                'preparation_required' => 'textarea',
                'follow_up_actions' => 'textarea',
                'contact_person' => 'text',
            ],
            'is_active' => true,
        ]);

        // 7. Public Notice Update
        LetterType::create([
            'name' => 'Public Notice Update',
            'description' => 'Public-facing announcements for community updates, public information, or general notifications.',
            'template_fields' => [
                'notice_title' => 'text',
                'publication_date' => 'date',
                'effective_date' => 'date',
                'issuing_authority' => 'text',
                'target_audience' => 'text',
                'notice_category' => ['type' => 'select', 'options' => ['Public Safety', 'Service Update', 'Policy Change', 'Event Notice', 'General Information']],
                'notice_content' => 'textarea',
                'impact_description' => 'textarea',
                'contact_information' => 'text',
                'additional_resources' => 'textarea',
                'compliance_requirements' => 'textarea',
            ],
            'is_active' => true,
        ]);
    }
}
