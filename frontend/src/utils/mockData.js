// Mock data for letter types when backend is not available
// This includes comprehensive letter types and template fields for business and organizational use
//
// Available Letter Types:
// 1. Official Letter - Formal correspondence
// 2. Memo - Internal memorandum
// 3. Notice - Public/internal notices
// 4. Request Letter - Formal requests
// 5. Approval Letter - Approval documents
// 6. Rejection Letter - Rejection/denial documents
// 7. Invitation Letter - Event invitations
// 8. Complaint Letter - Formal complaints
// 9. Recommendation Letter - References/recommendations
// 10. Termination Letter - Employee termination
// 11. Promotion Letter - Employee promotions
// 12. Warning Letter - Disciplinary notices
// 13. Leave Application - Leave requests
// 14. Offer Letter - Job offers
// 15. Contract Agreement - Formal contracts
//
// Each letter type includes template_fields with:
// - name: field identifier
// - type: input type (text, textarea, select, date, time, number, email)
// - required: boolean indicating if field is mandatory
// - options: array of choices for select fields (optional)
// - description: field description (optional)
// - placeholder: custom placeholder text (optional)

// Business-focused letter types for professional communication
export const mockLetterTypes = [
  {
    id: 1,
    name: "Business Letter",
    description: "Formal communication with clients, partners, or other organizations. Covers proposals, requests, complaints, and official correspondence.",
    template_fields: [
      { id: 1, name: "sender_name", type: "text", required: true },
      { id: 2, name: "sender_position", type: "text", required: true },
      { id: 3, name: "sender_company", type: "text", required: true },
      { id: 4, name: "recipient_name", type: "text", required: true },
      { id: 5, name: "recipient_position", type: "text", required: false },
      { id: 6, name: "recipient_company", type: "text", required: true },
      { id: 7, name: "subject", type: "text", required: true },
      { id: 8, name: "letter_type", type: "select", required: true, options: ["Proposal", "Request", "Complaint", "Inquiry", "Follow-up", "Other"] },
      { id: 9, name: "body", type: "textarea", required: true },
      { id: 10, name: "action_requested", type: "textarea", required: false },
      { id: 11, name: "contact_information", type: "text", required: true }
    ]
  },
  {
    id: 2,
    name: "Cover Letter",
    description: "Sent alongside a CV/resume when applying for jobs. Explains qualifications and why the applicant is suitable.",
    template_fields: [
      { id: 12, name: "applicant_name", type: "text", required: true },
      { id: 13, name: "applicant_address", type: "textarea", required: true },
      { id: 14, name: "applicant_phone", type: "text", required: true },
      { id: 15, name: "applicant_email", type: "email", required: true },
      { id: 16, name: "application_date", type: "date", required: true },
      { id: 17, name: "hiring_manager_name", type: "text", required: false },
      { id: 18, name: "company_name", type: "text", required: true },
      { id: 19, name: "job_title", type: "text", required: true },
      { id: 20, name: "job_source", type: "text", required: false },
      { id: 21, name: "qualifications_summary", type: "textarea", required: true },
      { id: 22, name: "relevant_experience", type: "textarea", required: true },
      { id: 23, name: "why_interested", type: "textarea", required: true },
      { id: 24, name: "salary_expectations", type: "text", required: false },
      { id: 25, name: "availability_date", type: "date", required: false }
    ]
  },
  {
    id: 3,
    name: "Notice/Announcement Letter",
    description: "For informing staff/customers about changes, meetings, holidays, or policies.",
    template_fields: [
      { id: 26, name: "notice_title", type: "text", required: true },
      { id: 27, name: "notice_number", type: "text", required: false },
      { id: 28, name: "sender_name", type: "text", required: true },
      { id: 29, name: "sender_position", type: "text", required: true },
      { id: 30, name: "sender_department", type: "text", required: false },
      { id: 31, name: "notice_type", type: "select", required: true, options: ["Policy Change", "Meeting", "Holiday", "Event", "Update", "Other"] },
      { id: 32, name: "effective_date", type: "date", required: true },
      { id: 33, name: "expiry_date", type: "date", required: false },
      { id: 34, name: "target_audience", type: "text", required: true },
      { id: 35, name: "notice_content", type: "textarea", required: true },
      { id: 36, name: "impact_description", type: "textarea", required: false },
      { id: 37, name: "contact_person", type: "text", required: false },
      { id: 38, name: "contact_details", type: "text", required: false }
    ]
  },
  {
    id: 4,
    name: "Acknowledgement/Receipt Letter",
    description: "Confirms that goods, payments, or documents have been received.",
    template_fields: [
      { id: 39, name: "sender_name", type: "text", required: true },
      { id: 40, name: "sender_company", type: "text", required: false },
      { id: 41, name: "recipient_name", type: "text", required: true },
      { id: 42, name: "recipient_company", type: "text", required: false },
      { id: 43, name: "receipt_date", type: "date", required: true },
      { id: 44, name: "receipt_number", type: "text", required: true },
      { id: 45, name: "item_type", type: "select", required: true, options: ["Goods", "Payment", "Documents", "Application", "Other"] },
      { id: 46, name: "item_description", type: "textarea", required: true },
      { id: 47, name: "quantity_amount", type: "text", required: false },
      { id: 48, name: "payment_amount", type: "text", required: false },
      { id: 49, name: "received_date", type: "date", required: true },
      { id: 50, name: "condition_status", type: "select", required: false, options: ["Good", "Damaged", "Incomplete", "Satisfactory", "Other"] },
      { id: 51, name: "additional_notes", type: "textarea", required: false },
      { id: 52, name: "next_steps", type: "textarea", required: false }
    ]
  },
  {
    id: 5,
    name: "Private Letter",
    description: "Personal correspondence for private matters, family communication, or informal business relations.",
    template_fields: [
      { id: 53, name: "sender_name", type: "text", required: true },
      { id: 54, name: "sender_address", type: "textarea", required: false },
      { id: 55, name: "recipient_name", type: "text", required: true },
      { id: 56, name: "recipient_address", type: "textarea", required: false },
      { id: 57, name: "letter_date", type: "date", required: true },
      { id: 58, name: "salutation", type: "text", required: true },
      { id: 59, name: "letter_purpose", type: "text", required: false },
      { id: 60, name: "letter_content", type: "textarea", required: true },
      { id: 61, name: "personal_message", type: "textarea", required: false },
      { id: 62, name: "closing", type: "text", required: true },
      { id: 63, name: "contact_information", type: "text", required: false }
    ]
  }
];
