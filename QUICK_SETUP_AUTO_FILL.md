# Quick Setup - Auto-Fill Sender Information

## What Changed
✅ Sender information is now automatically filled from user profiles
✅ Users cannot manually type their own names
✅ Admins register office/department info for each user

## Setup (2 Steps)

### Step 1: Run Migration
```bash
cd backend
php artisan migrate
```

This adds 4 new fields to users table:
- `position` - Job title
- `department` - Department name  
- `office` - Organization/Office name
- `phone` - Contact number

### Step 2: Update User Profiles

**For existing users, you need to add their profile information.**

**Option A: Update via database (Quick)**
```bash
php artisan tinker
```

```php
$user = App\Models\User::where('email', 'admin@university.edu')->first();
$user->position = 'Administrator';
$user->department = 'Administration';
$user->office = 'Jimma University';
$user->phone = '+251-xxx-xxx-xxxx';
$user->save();
```

**Option B: Bulk update all users**
```php
// Update all staff
App\Models\User::where('role', 'staff')->update([
    'office' => 'Jimma University',
    'department' => 'General Staff'
]);

// Update executives
App\Models\User::where('role', 'executive')->update([
    'office' => 'Jimma University',
    'department' => 'Administration'
]);
```

## How It Works

### When Creating a Letter
1. User selects a template
2. Sender fields are automatically filled:
   - **Sender Name** → User's name
   - **Position** → User's position
   - **Department** → User's department
   - **Office** → User's office
   - **Phone** → User's phone
   - **Email** → User's email
3. Fields are **read-only** (gray background)
4. Shows "Auto-filled" badge
5. User fills in recipient and content only

### Visual Indicators
- 🔒 Gray background = Read-only
- 🏷️ Blue "Auto-filled" badge on label
- ℹ️ Helper text: "This information is automatically filled from your profile"

## Testing

### Test Auto-Fill
1. Make sure migration ran
2. Update a user's profile (see Step 2 above)
3. Login as that user
4. Go to "Create Letter"
5. Select any template
6. Check sender fields are filled and read-only

### Example Test
```bash
# Update test user
php artisan tinker
>>> $user = App\Models\User::where('email', 'staff@example.com')->first();
>>> $user->position = 'Professor';
>>> $user->department = 'Computer Science';
>>> $user->office = 'Jimma University';
>>> $user->phone = '+251-123-456-789';
>>> $user->save();
>>> exit
```

Then login as `staff@example.com` and create a letter.

## Admin Features (Coming Soon)

The admin dashboard will have an "Edit" button to update user profiles through the UI. For now, use the database method above.

## Benefits

✅ **Security**: Users can't impersonate others
✅ **Consistency**: All letters have accurate sender info
✅ **Efficiency**: No repetitive typing
✅ **Accuracy**: No typos in sender details
✅ **Centralized**: Update once, applies everywhere

## Troubleshooting

### Sender fields are empty
Run migration and update user profiles (see Step 1 & 2)

### Fields are not read-only
Clear browser cache and hard refresh (Ctrl+F5)

### Can't update profiles
Use tinker method above or wait for admin UI update

## Summary

**Before:**
- Users typed their own names
- Risk of typos and inconsistency
- Could impersonate others

**After:**
- Names auto-filled from profile
- Read-only, can't be changed
- Consistent across all letters
- Admin controls profile data

**Next:** Admins will be able to edit user profiles through the web interface.
