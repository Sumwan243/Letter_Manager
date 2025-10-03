# Setup and Testing Guide

## Quick Setup (5 minutes)

### Step 1: Run Database Migrations
```bash
cd backend
php artisan migrate
php artisan db:seed --class=LetterTypeSeeder
```

### Step 2: Import Demo Users
```bash
php artisan users:import storage/users_sample.csv
```

**Expected Output:**
```
✓ Imported (new)     │ 20
↻ Updated (existing) │ 0
✗ Errors             │ 0
```

### Step 3: Start Backend Server
```bash
php artisan serve
```
Backend runs at: `http://localhost:8000`

### Step 4: Start Frontend Server
```bash
cd ../frontend
npm run dev
```
Frontend runs at: `http://localhost:5173`

## Testing the Role-Based System

### Test 1: Staff User (Limited Access)
1. Login with:
   - Email: `jane.anderson@university.edu`
   - Password: `password123`

2. Go to "Create Letter"

3. **Expected Result:**
   - ✓ Can see "Formal – Staff" template
   - ✓ Can see "Informal" template
   - ✗ CANNOT see "Formal – Executive" template

### Test 2: Executive User (Extended Access)
1. Logout and login with:
   - Email: `john.smith@university.edu`
   - Password: `password123`

2. Go to "Create Letter"

3. **Expected Result:**
   - ✓ Can see "Formal – Executive" template
   - ✓ Can see "Formal – Staff" template
   - ✓ Can see "Informal" template

### Test 3: Admin User (Full Access)
1. Logout and login with:
   - Email: `admin@university.edu`
   - Password: `password123`

2. Go to "Create Letter"

3. **Expected Result:**
   - ✓ Can see ALL templates
   - ✓ Can see all users' letters (not just own)

## Testing Letter Creation

### Create Executive Letter (as Executive)
1. Login as `john.smith@university.edu`
2. Select "Formal – Executive"
3. Fill in the grouped form sections:
   - **Organization**: Company name, logo, address
   - **Sender**: Your name, position
   - **Recipient**: Recipient details
   - **Content**: Subject and body
   - **Contact**: Phone, email

4. Click "Create Letter"
5. View the letter - should see professional executive layout

### Create Staff Letter (as Staff)
1. Login as `jane.anderson@university.edu`
2. Select "Formal – Staff"
3. Fill in the form:
   - **Organization**: Logo, organization name, department
   - **Reference**: Ref number (auto-filled date)
   - **Sender**: Your name, position
   - **Recipient**: Recipient name, title
   - **Content**: Subject and body
   - **Signature & Contact**: Signature, phone, email

4. Click "Create Letter"
5. View the letter - should see executive official layout with ref numbers

## Verify Security

### Test Unauthorized Access
1. Login as staff user (`jane.anderson@university.edu`)
2. Try to create "Formal – Executive" letter
3. **Expected Result:**
   - Template should NOT appear in dropdown
   - If somehow attempted via API, should get 403 error

## What You Should See

### Staff User Dashboard
```
Letter Types Available:
├── Formal – Staff ✓
└── Informal ✓
```

### Executive User Dashboard
```
Letter Types Available:
├── Formal – Executive ✓
├── Formal – Staff ✓
└── Informal ✓
```

### Admin User Dashboard
```
Letter Types Available:
├── Formal – Executive ✓
├── Formal – Staff ✓
└── Informal ✓

Additional Features:
└── Can view all users' letters
```

## Bulk Import Testing

### Test with Custom CSV
1. Create a file `test_users.csv`:
```csv
name,email,password,role
Test Executive,test.exec@university.edu,password123,executive
Test Staff,test.staff@university.edu,password123,staff
```

2. Import:
```bash
php artisan users:import test_users.csv
```

3. Login with new accounts and verify access

### Test Update Existing Users
1. Modify `test_users.csv` - change Test Staff role to `executive`
2. Re-run import:
```bash
php artisan users:import test_users.csv
```

3. Login as `test.staff@university.edu`
4. **Expected Result:** Now has executive access

## Features Demonstrated

### ✅ Role-Based Access Control
- Different users see different templates
- Backend validates permissions
- Frontend filters based on role

### ✅ Bulk User Management
- Import 20 users in seconds
- Can scale to 7000+ users
- Update existing users safely

### ✅ Modern Form Design
- Fields grouped by category
- Gradient backgrounds
- Clear visual hierarchy
- Auto-filled date

### ✅ Professional Letter Layouts
- Executive: Business letter format
- Staff: Official correspondence with ref numbers
- Proper spacing and typography

### ✅ Security
- Frontend filtering
- Backend validation
- Role-based permissions
- Secure password hashing

## Troubleshooting

### "Letter types not showing"
- Check browser console for errors
- Verify user has a role assigned
- Check `allowed_roles` in database

### "Import command not found"
- Make sure you're in `backend` directory
- Run `php artisan list` to see available commands
- Check `app/Console/Commands/ImportUsers.php` exists

### "Can't login with demo users"
- Verify import completed successfully
- Check database: `php artisan tinker` → `User::count()`
- Reset password if needed

### "All templates showing for staff"
- Clear browser cache
- Check letter_types table has `allowed_roles` column
- Re-run seeder: `php artisan db:seed --class=LetterTypeSeeder`

## Next Steps

### For Production Deployment

1. **Change Default Passwords**
   - Force password change on first login
   - Use strong password policy

2. **Prepare Real User Data**
   - Export from HR system
   - Map positions to roles
   - Create CSV file

3. **Import Real Users**
   ```bash
   php artisan users:import path/to/university_users.csv
   ```

4. **Configure Environment**
   - Set production database
   - Configure email service
   - Set up SSL/HTTPS

5. **Deploy**
   - Build frontend: `npm run build`
   - Configure web server
   - Set up backups

## Summary

You now have a complete role-based letter management system that:
- ✅ Supports 3 user roles (admin, executive, staff)
- ✅ Filters templates based on user permissions
- ✅ Validates access on both frontend and backend
- ✅ Imports users in bulk from CSV
- ✅ Scales to 7000+ users
- ✅ Ready for university deployment

**Total Setup Time:** ~5 minutes
**Users Imported:** 20 demo users
**Letter Templates:** 3 (with role restrictions)
**Security:** Frontend + Backend validation
