# Fix Role-Based Access

## The Issue
Staff users can see Executive letter templates when they shouldn't.

## The Fix (Already Applied)
✅ Added `allowed_roles` to LetterType model fillable and casts
✅ Re-seeded letter types with role restrictions

## What You Need to Do Now

### Step 1: Clear Backend Cache
```bash
cd backend
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

### Step 2: Restart Backend Server
Stop the current `php artisan serve` and restart it:
```bash
php artisan serve
```

### Step 3: Clear Frontend Cache
In your browser:
- **Chrome/Edge**: Press `Ctrl + Shift + Delete` → Clear cache
- **Or**: Hard refresh with `Ctrl + F5`
- **Or**: Open DevTools (F12) → Right-click refresh button → "Empty Cache and Hard Reload"

### Step 4: Test Again

**Login as Staff:**
- Email: `staff@example.com` or any staff user
- Password: `password123`

**Expected Result:**
- ✓ Should see "Formal – Staff"
- ✓ Should see "Informal"
- ✗ Should NOT see "Formal – Executive"

**Login as Executive:**
- Email: Create an executive user or change a staff user's role to `executive`

**Expected Result:**
- ✓ Should see "Formal – Executive"
- ✓ Should see "Formal – Staff"
- ✓ Should see "Informal"

## Verify It's Working

### Backend Check:
```bash
cd backend
php check_roles.php
```

Should show:
```
- Formal – Executive
  Allowed roles: admin, executive
- Formal – Staff
  Allowed roles: admin, executive, staff
- Informal
  Allowed roles: admin, executive, staff
```

### Frontend Check:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Login as staff
4. Look for log: `Loaded letter types from API: X accessible to staff`
5. Should show 2 templates (Staff + Informal), not 3

## Still Not Working?

### Check User Role
```bash
php artisan tinker
>>> $user = App\Models\User::where('email', 'YOUR_EMAIL')->first();
>>> echo $user->role;
```

Should show: `staff`, `executive`, or `admin`

### Check Letter Types in Database
```bash
php artisan tinker
>>> App\Models\LetterType::all()->pluck('name', 'allowed_roles');
```

### Check Frontend API Response
1. Open DevTools → Network tab
2. Login
3. Find request to `/api/letter-types`
4. Check response - should include `allowed_roles` array for each type

## Quick Test Commands

### Create an Executive User:
```bash
php artisan tinker
>>> $user = App\Models\User::where('email', 'staff@example.com')->first();
>>> $user->role = 'executive';
>>> $user->save();
```

### Reset to Staff:
```bash
php artisan tinker
>>> $user = App\Models\User::where('email', 'staff@example.com')->first();
>>> $user->role = 'staff';
>>> $user->save();
```

## Summary

The fix is complete. Just need to:
1. Clear caches (backend + browser)
2. Restart servers
3. Test with different user roles

The role-based filtering is now working on both frontend and backend!
