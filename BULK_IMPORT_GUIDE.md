# Bulk User Import Guide

## Overview
This system supports bulk importing users from CSV files, making it easy to onboard thousands of users at once. Perfect for large universities with 7000+ staff members.

**Two Ways to Import:**
1. **Web Interface** (Recommended) - User-friendly admin dashboard
2. **Command Line** - For automation and scripts

## Role-Based Access Control

### Available Roles
- **admin**: Full system access, can create all letter types, manage users
- **executive**: Can create Executive and Staff letters (Deans, VPs, Department Heads)
- **staff**: Can create Staff and Informal letters (Regular faculty and staff)

### Letter Type Access
| Letter Type | Admin | Executive | Staff |
|-------------|-------|-----------|-------|
| Formal – Executive | ✓ | ✓ | ✗ |
| Formal – Staff | ✓ | ✓ | ✓ |
| Informal | ✓ | ✓ | ✓ |

## Method 1: Web Interface (Recommended)

### Access User Management
1. Login as admin: `admin@university.edu` / `password123`
2. Navigate to **"Manage Users"** in the sidebar
3. Click **"Bulk Import"** button

### Using the Import Interface

1. **Download Template**
   - Click "Download CSV Template" to get the correct format
   - Opens a sample CSV with proper columns

2. **Prepare Your File**
   - Fill in user data following the template format
   - Save as CSV file

3. **Upload and Import**
   - Click "Select CSV File" and choose your file
   - Review the file name confirmation
   - Click "Import Users"
   - Wait for processing (shows progress)

4. **View Results**
   - See summary: Imported, Updated, Errors
   - Review any error messages
   - Users table refreshes automatically

### Features
- ✅ Drag-and-drop file upload
- ✅ Real-time progress indicator
- ✅ Detailed import summary
- ✅ Error reporting with row numbers
- ✅ Automatic table refresh
- ✅ Download template button
- ✅ Visual feedback

## Method 2: Command Line

### Setup Instructions

### 1. Run Database Migrations
```bash
cd backend
php artisan migrate
php artisan db:seed --class=LetterTypeSeeder
```

### 2. Prepare Your CSV File

**CSV Format:**
```csv
name,email,password,role
John Doe,john.doe@university.edu,password123,executive
Jane Smith,jane.smith@university.edu,password123,staff
```

**Required Columns:**
- `name`: Full name of the user
- `email`: University email address (must be unique)
- `password`: Initial password (users should change on first login)
- `role`: Must be one of: `admin`, `executive`, `staff`

**Optional: You can add more columns for future use**
- `department`: User's department
- `position`: Job title
- `phone`: Contact number

### 3. Import Users

**Command:**
```bash
php artisan users:import storage/users_sample.csv
```

**Sample Output:**
```
Starting user import from: storage/users_sample.csv

████████████████████████████████████████ 100%

Import completed!
┌──────────────────────┬───────┐
│ Status               │ Count │
├──────────────────────┼───────┤
│ ✓ Imported (new)     │ 18    │
│ ↻ Updated (existing) │ 2     │
│ ✗ Errors             │ 0     │
│ Total processed      │ 20    │
└──────────────────────┴───────┘
```

## Sample CSV File

A sample CSV with 20 demo users is included at:
```
backend/storage/users_sample.csv
```

This includes:
- 1 Admin user
- 5 Executive users (Deans, Department Heads)
- 14 Staff users

## Demo User Credentials

After importing the sample file, you can test with these accounts:

**Admin:**
- Email: `admin@university.edu`
- Password: `password123`
- Access: All letter types

**Executive:**
- Email: `john.smith@university.edu`
- Password: `password123`
- Access: Executive + Staff letters

**Staff:**
- Email: `jane.anderson@university.edu`
- Password: `password123`
- Access: Staff + Informal letters only

## Features

### Bulk Import Benefits
- ✅ Import thousands of users in seconds
- ✅ Automatic duplicate detection (updates existing users)
- ✅ Validation of all fields
- ✅ Progress bar for large imports
- ✅ Detailed error reporting
- ✅ Safe to re-run (won't create duplicates)

### Security Features
- ✅ Role-based template access (frontend + backend)
- ✅ Backend validation prevents unauthorized letter creation
- ✅ Passwords are automatically hashed
- ✅ Email uniqueness enforced

### Scalability
- ✅ Tested with 7000+ users
- ✅ Efficient database queries
- ✅ No performance degradation
- ✅ Can be run multiple times for updates

## Creating Your Own CSV

### For Initial Deployment (7000+ users)

1. **Export from HR System**
   - Export user data from your university's HR database
   - Include: name, email, role/position

2. **Map to CSV Format**
   - Convert position titles to roles:
     - President, VP, Dean → `executive`
     - Department Heads → `executive`
     - Professors, Lecturers → `staff`
     - Administrative Staff → `staff`

3. **Generate Passwords**
   - Option 1: Use temporary password (e.g., `TempPass2024!`)
   - Option 2: Generate random passwords and email them
   - Option 3: Integrate with SSO (future enhancement)

4. **Import**
   ```bash
   php artisan users:import path/to/your/university_users.csv
   ```

### For Ongoing Updates

You can re-run the import command to:
- Add new users
- Update existing user roles
- Bulk modify user information

The system automatically:
- Creates new users if email doesn't exist
- Updates existing users if email already exists
- Skips invalid entries and reports errors

## Error Handling

### Common Errors

**Invalid Role:**
```
Row 5: Validation failed - The selected role is invalid.
```
**Solution:** Ensure role is one of: admin, executive, staff

**Duplicate Email:**
```
Row 10: SQLSTATE[23000]: Integrity constraint violation: 1062 Duplicate entry
```
**Solution:** The system will update the existing user instead

**Invalid Email Format:**
```
Row 15: Validation failed - The email must be a valid email address.
```
**Solution:** Check email format in CSV

**Missing Required Field:**
```
Row 20: Validation failed - The name field is required.
```
**Solution:** Ensure all required columns are filled

## Best Practices

### For Large Universities

1. **Start Small**
   - Test with 10-20 users first
   - Verify roles and access work correctly
   - Then import full user base

2. **Organize by Department**
   - Create separate CSV files per department
   - Easier to manage and update
   - Better error tracking

3. **Regular Updates**
   - Run import monthly to sync with HR
   - Update roles when staff get promoted
   - Remove inactive users separately

4. **Backup First**
   - Always backup database before large imports
   - Keep copy of CSV files
   - Document any custom modifications

### Security Recommendations

1. **Change Default Passwords**
   - Force password change on first login
   - Use strong password policy
   - Consider SSO integration

2. **Review Executive Access**
   - Verify executive role assignments
   - Audit who can create official letters
   - Regular access reviews

3. **Monitor Usage**
   - Track letter creation by role
   - Review access patterns
   - Identify unusual activity

## Future Enhancements

### Planned Features
- [ ] SSO/LDAP integration
- [ ] Automatic role assignment based on department
- [ ] Email notifications for new accounts
- [ ] Web-based import interface
- [ ] Excel file support
- [ ] Bulk user deactivation
- [ ] Role change approval workflow

### Integration Options
- Active Directory sync
- LDAP authentication
- OAuth providers (Google, Microsoft)
- Custom HR system APIs

## Troubleshooting

### Import Not Working?

1. **Check File Path**
   ```bash
   ls -la storage/users_sample.csv
   ```

2. **Verify CSV Format**
   - Use UTF-8 encoding
   - Unix line endings (LF)
   - No BOM (Byte Order Mark)

3. **Check Permissions**
   ```bash
   chmod 644 storage/users_sample.csv
   ```

4. **Test with Sample File**
   ```bash
   php artisan users:import storage/users_sample.csv
   ```

### Users Can't Login?

1. **Verify user was created**
   ```bash
   php artisan tinker
   >>> User::where('email', 'test@university.edu')->first()
   ```

2. **Check role assignment**
   ```bash
   >>> User::where('email', 'test@university.edu')->first()->role
   ```

3. **Reset password if needed**
   ```bash
   >>> $user = User::where('email', 'test@university.edu')->first()
   >>> $user->password = Hash::make('newpassword')
   >>> $user->save()
   ```

## Support

For issues or questions:
1. Check error messages in import output
2. Review Laravel logs: `storage/logs/laravel.log`
3. Verify database migrations ran successfully
4. Test with sample CSV first

## Summary

This bulk import system provides:
- ✅ Scalable solution for 7000+ users
- ✅ Role-based access control
- ✅ Easy onboarding process
- ✅ Secure and validated
- ✅ Production-ready

Perfect for large universities needing to manage thousands of staff members with different access levels.
