# Auto-Fill Sender Information Setup

## Overview
Sender information is now automatically filled from the logged-in user's profile. Users cannot manually type their own names - all sender details come from their registered profile.

## Changes Made

### 1. Database Migration
**File:** `backend/database/migrations/2025_09_29_000002_add_office_info_to_users_table.php`

Added fields to users table:
- `position` - Job title/position
- `department` - Department name
- `office` - Office/Company name
- `phone` - Contact phone number

### 2. User Model Updated
**File:** `backend/app/Models/User.php`

Added new fields to `$fillable` array so they can be mass-assigned.

### 3. Auto-Fill Logic
**File:** `frontend/src/components/DynamicForm.jsx`

**Auto-filled fields:**
- `sender_name` → User's name
- `sender_position` / `sender_title` → User's position
- `department_name` → User's department
- `phone` / `contact_information` → User's phone
- `email` / `sender_email` → User's email
- `sender_company` / `company_name` → User's office
- `letter_date` → Today's date

**Features:**
- ✅ Fields are read-only (gray background)
- ✅ "Auto-filled" badge on labels
- ✅ Helper text explaining auto-fill
- ✅ Cannot be manually edited

## Setup Instructions

### Step 1: Run Migration
```bash
cd backend
php artisan migrate
```

### Step 2: Update User Profiles

**Option A: Via Admin Dashboard (Recommended)**
1. Login as admin
2. Go to "Manage Users"
3. Click "Edit" next to a user
4. Fill in:
   - Position (e.g., "Professor", "Dean", "Department Head")
   - Department (e.g., "Computer Science", "Administration")
   - Office (e.g., "Jimma University", "Main Campus")
   - Phone (e.g., "+251-xxx-xxx-xxxx")
5. Save

**Option B: Via Database**
```sql
UPDATE users 
SET position = 'Professor',
    department = 'Computer Science',
    office = 'Jimma University',
    phone = '+251-xxx-xxx-xxxx'
WHERE email = 'user@university.edu';
```

**Option C: Bulk Import with New Fields**
Update your CSV to include new columns:
```csv
name,email,password,role,position,department,office,phone
John Doe,john@university.edu,password123,executive,Dean,Administration,Jimma University,+251-xxx
```

Then import:
```bash
php artisan users:import users_with_profiles.csv
```

### Step 3: Test Auto-Fill
1. Login as a user with profile information
2. Go to "Create Letter"
3. Select a template
4. Notice sender fields are automatically filled and read-only

## User Experience

### Creating a Letter
When users create a letter, they will see:

**Sender Information Section:**
```
┌─────────────────────────────────────┐
│ Sender Name [Auto-filled]           │
│ ┌─────────────────────────────────┐ │
│ │ John Doe                    🔒  │ │
│ └─────────────────────────────────┘ │
│ This information is automatically   │
│ filled from your profile            │
└─────────────────────────────────────┘
```

- Gray background indicates read-only
- Blue "Auto-filled" badge on label
- Lock icon or disabled state
- Helper text below field

### Benefits
1. **Consistency**: All letters have accurate sender information
2. **Security**: Users can't impersonate others
3. **Efficiency**: No need to type same info repeatedly
4. **Accuracy**: Reduces typos and errors
5. **Centralized**: Update profile once, applies to all letters

## Admin Responsibilities

### Setting Up New Users
When adding new users, admins should:

1. **Register User** (via bulk import or manual)
2. **Set Profile Information**:
   - Position/Title
   - Department
   - Office/Organization
   - Phone number
3. **Assign Role** (admin/executive/staff)
4. **Notify User** of their credentials

### Updating User Information
When users change positions or departments:

1. Go to "Manage Users"
2. Find the user
3. Click "Edit"
4. Update their profile
5. Save changes

All future letters will use the updated information.

## API Endpoints

### Update User Profile (Admin)
```
PUT /api/users/{id}/profile
```

**Request Body:**
```json
{
  "position": "Professor",
  "department": "Computer Science",
  "office": "Jimma University",
  "phone": "+251-xxx-xxx-xxxx"
}
```

### Update Own Profile (User)
```
POST /api/profile
```

**Request Body:**
```json
{
  "name": "John Doe",
  "position": "Professor",
  "department": "Computer Science",
  "office": "Jimma University",
  "phone": "+251-xxx-xxx-xxxx"
}
```

## Troubleshooting

### Fields Are Empty
**Problem:** Sender fields show empty in letters

**Solution:**
1. Check user profile has information set
2. Verify migration ran: `php artisan migrate:status`
3. Check user table has new columns: `php artisan tinker` → `User::first()`

### Fields Not Read-Only
**Problem:** Users can edit sender fields

**Solution:**
1. Clear browser cache
2. Hard refresh (Ctrl+F5)
3. Check DynamicForm.jsx has latest changes

### Profile Update Not Working
**Problem:** Admin can't update user profiles

**Solution:**
1. Check API endpoint exists in routes/api.php
2. Verify admin middleware is working
3. Check browser console for errors

## Future Enhancements

### Planned Features
- [ ] User self-service profile editing
- [ ] Profile photo upload
- [ ] Signature upload
- [ ] Multiple office locations
- [ ] Department hierarchy
- [ ] Position templates

### Integration Options
- LDAP/Active Directory sync
- HR system integration
- Automated profile updates
- Bulk profile import
- Profile approval workflow

## Summary

**What Changed:**
- ✅ Added profile fields to users table
- ✅ Auto-fill sender information from profile
- ✅ Made sender fields read-only
- ✅ Added visual indicators (badges, helper text)
- ✅ Admin can edit user profiles

**What Users See:**
- Sender fields automatically filled
- Cannot edit their own name/info
- Clear indication fields are auto-filled
- Consistent information across all letters

**What Admins Do:**
- Register users with complete profiles
- Update profiles when users change positions
- Manage office/department information
- Ensure data accuracy

**Result:**
- Professional, consistent letters
- No impersonation possible
- Reduced data entry
- Centralized profile management
