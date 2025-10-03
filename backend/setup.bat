@echo off
echo ========================================
echo Letter Manager - Quick Setup
echo ========================================
echo.

echo Step 1: Running migrations...
php artisan migrate --force
echo.

echo Step 2: Seeding letter types...
php artisan db:seed --class=LetterTypeSeeder --force
echo.

echo Step 3: Importing demo users...
php artisan users:import storage/users_sample.csv
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Demo Login Credentials:
echo.
echo Admin:
echo   Email: admin@university.edu
echo   Password: password123
echo.
echo Executive:
echo   Email: john.smith@university.edu
echo   Password: password123
echo.
echo Staff:
echo   Email: jane.anderson@university.edu
echo   Password: password123
echo.
echo ========================================
echo Next: Start the servers
echo   Backend: php artisan serve
echo   Frontend: cd ../frontend ^&^& npm run dev
echo ========================================
pause
