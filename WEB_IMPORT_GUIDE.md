# Web-Based Bulk Import Guide

## Quick Start

### Step 1: Access Admin Dashboard
1. Login as admin
2. Click **"Manage Users"** in the sidebar
3. You'll see the User Management page

## User Management Page Features

### Main Dashboard
- **User Table**: View all users with their roles
- **Role Management**: Change user roles with dropdown
- **Bulk Import Button**: Opens import modal
- **Refresh Button**: Reload user list

### User Table Columns
- **Name**: Full name of user
- **Email**: User's email address
- **Role**: Dropdown to change role (admin/executive/staff)
- **Joined**: Account creation date
- **Actions**: Role badge indicator

## Bulk Import Process

### 1. Open Import Modal
Click the **"Bulk Import"** button (top right)

### 2. Download Template (Optional)
- Click **"Download CSV Template"**
- Get a sample CSV with correct format
- Contains example rows

### 3. Prepare Your CSV
**Required Format:**
```csv
name,email,password,role
John Doe,john.doe@university.edu,password123,executive
Jane Smith,jane.smith@university.edu,password123,staff
```

**Requirements:**
- ✅ Header row must be: `name,email,password,role`
- ✅ Role must be: `admin`, `executive`, or `staff`
- ✅ Email must be valid and unique
- ✅ Password minimum 8 characters
- ✅ Maximum file size: 10MB

### 4. Upload File
- Click **"Select CSV File"** or drag file
- See confirmation: "✓ Selected: filename.csv"

### 5. Import
- Click **"Import Users"** button
- See progress: "Importing..."
- Wait for completion

### 6. View Results
**Summary Cards:**
- 🟢 **New Users**: Successfully imported
- 🔵 **Updated**: Existing users updated
- 🔴 **Errors**: Failed rows
- ⚪ **Total Processed**: All rows

**Error Details:**
- Row number
- Email address
- Error message

### 7. Done!
- User table automatically refreshes
- New users appear in the list
- Close modal or import more

## Features

### Smart Updates
- **New users**: Creates account
- **Existing users**: Updates name and role (matched by email)
- **Passwords**: Only set on creation, not updated

### Validation
- Real-time file type checking
- Server-side validation
- Detailed error messages
- Row-by-row processing

### User Experience
- ✅ Modern, clean interface
- ✅ Gradient backgrounds
- ✅ Loading indicators
- ✅ Success/error feedback
- ✅ Responsive design
- ✅ Dark mode support

## Common Workflows

### Onboarding New Staff
1. Export from HR system
2. Format as CSV
3. Upload via web interface
4. Review results
5. Notify users

### Updating Roles
**Option A: Individual**
- Find user in table
- Change role dropdown
- Confirm change

**Option B: Bulk**
- Update CSV with new roles
- Re-import file
- System updates existing users

### Regular Sync
1. Schedule monthly import
2. Export latest HR data
3. Upload via web interface
4. Review changes
5. Archive import file

## Troubleshooting

### "Invalid CSV format"
- Check header row matches exactly
- Ensure no extra columns
- Save as CSV (not Excel)

### "File too large"
- Split into multiple files
- Maximum 10MB per file
- ~50,000 users per file

### "Validation failed"
- Check error details in results
- Fix specific rows
- Re-import corrected file

### Users not appearing
- Check import results for errors
- Verify email format
- Ensure role is valid
- Refresh page

## Tips & Best Practices

### Before Importing
- ✅ Test with small file first (5-10 users)
- ✅ Backup database
- ✅ Verify CSV format
- ✅ Check for duplicate emails

### During Import
- ✅ Don't close browser
- ✅ Wait for completion
- ✅ Note any errors
- ✅ Keep CSV file for reference

### After Import
- ✅ Review import summary
- ✅ Check user table
- ✅ Test login with new accounts
- ✅ Archive import file

## Security

### Access Control
- Only admins can access
- Protected API endpoints
- Role validation on backend

### Password Handling
- Automatically hashed
- Never stored in plain text
- Users should change on first login

### Data Privacy
- CSV files not stored
- Processed in memory
- Secure file upload

## Advantages Over CLI

### Web Interface Benefits
1. **User-Friendly**: No command line knowledge needed
2. **Visual Feedback**: See progress and results
3. **Error Handling**: Clear error messages with row numbers
4. **Accessibility**: Use from any browser
5. **No Server Access**: Don't need SSH/terminal
6. **Immediate Results**: See imported users right away

### When to Use CLI
- Automated scripts
- Scheduled imports
- Integration with other systems
- Very large files (100k+ users)
- Server-side processing

## Summary

The web-based bulk import provides:
- ✅ Easy-to-use interface
- ✅ No technical knowledge required
- ✅ Visual progress and results
- ✅ Error reporting
- ✅ Template download
- ✅ Role management
- ✅ Instant feedback

Perfect for:
- HR administrators
- IT staff without CLI access
- One-time imports
- Regular updates
- Testing and validation

**Access:** Admin Dashboard → Manage Users → Bulk Import
