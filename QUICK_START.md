# Quick Start - Fix Login Issue

## The Problem
The demo users don't exist yet because the database hasn't been set up.

## Solution - Run These Commands

### Option 1: Automated Setup (Windows)
```bash
cd backend
setup.bat
```

### Option 2: Manual Setup (Step by Step)

**1. Open terminal in backend folder:**
```bash
cd c:\xampp\htdocs\dashboard\Letter_Manager\backend
```

**2. Run migrations:**
```bash
php artisan migrate
```

**3. Seed letter types:**
```bash
php artisan db:seed --class=LetterTypeSeeder
```

**4. Import demo users:**
```bash
php artisan users:import storage/users_sample.csv
```

**Expected Output:**
```
✓ Imported (new)     │ 20
↻ Updated (existing) │ 0
✗ Errors             │ 0
```

## Test Login

After running the setup, you can login with:

### Admin Account
- **Email:** `admin@university.edu`
- **Password:** `password123`
- **Access:** All features, all letter types

### Executive Account
- **Email:** `john.smith@university.edu`
- **Password:** `password123`
- **Access:** Executive + Staff letters

### Staff Account
- **Email:** `jane.anderson@university.edu`
- **Password:** `password123`
- **Access:** Staff + Informal letters only

## Start the Servers

### Backend:
```bash
cd backend
php artisan serve
```
Runs at: `http://localhost:8000`

### Frontend:
```bash
cd frontend
npm run dev
```
Runs at: `http://localhost:5173`

## Troubleshooting

### "Command not found: php artisan users:import"
The command exists in `app/Console/Commands/ImportUsers.php`. If it's not recognized:
1. Clear cache: `php artisan cache:clear`
2. List commands: `php artisan list` (should see `users:import`)

### "File not found: storage/users_sample.csv"
The file should be at `backend/storage/users_sample.csv`. If missing, create it with:
```csv
name,email,password,role
Admin User,admin@university.edu,password123,admin
John Smith,john.smith@university.edu,password123,executive
Jane Anderson,jane.anderson@university.edu,password123,staff
```

### "SQLSTATE[42S02]: Base table or view not found"
Run migrations first:
```bash
php artisan migrate
```

### "Class 'LetterTypeSeeder' not found"
Make sure the file exists at:
`backend/database/seeders/LetterTypeSeeder.php`

### Still Can't Login?
1. Check database connection in `.env`
2. Verify users table exists: `php artisan tinker` → `User::count()`
3. Check if user exists: `User::where('email', 'admin@university.edu')->first()`
4. Reset password manually if needed

## Database Configuration

Make sure your `.env` file has correct database settings:

### For SQLite (Default):
```env
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite
```

### For MySQL (XAMPP):
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=letter_manager
DB_USERNAME=root
DB_PASSWORD=
```

## Summary

**Quick Fix:**
1. `cd backend`
2. `php artisan migrate`
3. `php artisan db:seed --class=LetterTypeSeeder`
4. `php artisan users:import storage/users_sample.csv`
5. Login with `admin@university.edu` / `password123`

That's it! 🎉
