![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/Sumwan243/Letter_Manager?utm_source=oss&utm_medium=github&utm_campaign=Sumwan243%2FLetter_Manager&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

# Letter Manager

A full-stack letter management system built with Laravel (backend) and React (frontend).

## Tech Stack

**Backend:**
- Laravel 12
- Laravel Sanctum (Bearer token authentication)
- SQLite/MySQL database support
- PHP 8.2+

**Frontend:**
- React 18
- Vite 7
- Axios for API calls
- React Router for navigation
- Tailwind CSS for styling

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install PHP dependencies:
   ```bash
   composer install
   ```

3. Create your `.env` file:
   ```bash
   copy .env.example .env  # Windows
   # or
   cp .env.example .env    # Linux/Mac
   ```

4. **Configure your database** in `.env`:
   
   **For MySQL/MariaDB (recommended for XAMPP):**
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=letter_manager
   DB_USERNAME=root
   DB_PASSWORD=
   ```
   
   **For SQLite (default):**
   ```env
   DB_CONNECTION=sqlite
   DB_DATABASE=database/database.sqlite
   ```
   
   If using SQLite, create the database file:
   ```bash
   touch database/database.sqlite  # Linux/Mac
   # or manually create an empty file on Windows
   ```

5. Generate application key:
   ```bash
   php artisan key:generate
   ```

6. Run migrations:
   ```bash
   php artisan migrate
   ```

7. (Optional) Seed the database:
   ```bash
   php artisan db:seed
   ```

8. Start the Laravel development server:
   ```bash
   php artisan serve
   ```
   Backend will run at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. (Optional) Create a `.env` file for production API URL:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```
   In development, the Vite proxy handles API requests automatically.

4. Start the development server:
   ```bash
   npm run dev
   ```
   Frontend will run at `http://localhost:5173`

## Authentication

This application uses **Laravel Sanctum with Bearer tokens**:
- Login/register returns a personal access token
- Frontend stores the token in `localStorage`
- All API requests include `Authorization: Bearer <token>` header
- No session cookies or CSRF tokens required

## API Endpoints

All API routes are prefixed with `/api`:

**Public:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

**Protected (requires Bearer token):**
- `GET /api/user` - Get current user
- `POST /api/logout` - Logout user
- `POST /api/profile` - Update user profile
- `PUT /api/password` - Change password
- `GET /api/letters` - List letters
- `POST /api/letters` - Create letter
- `GET /api/departments` - List departments
- `GET /api/staff` - List staff members

**Admin only:**
- `POST /api/letter-types` - Create letter type
- `DELETE /api/letters/{id}` - Delete letter

## Development Notes

- **CORS:** Backend is configured to accept requests from `http://localhost:5173` (Vite dev server)
- **Proxy:** Frontend Vite config proxies `/api` and `/sanctum` to `http://localhost:8000`
- **Logging:** API request/response logging is enabled in development only
- **Database:** Default is SQLite for quick setup; switch to MySQL for production-like environment

## Production Deployment

1. Set `VITE_API_BASE_URL` in frontend `.env` to your production API URL
2. Build frontend: `npm run build`
3. Configure Laravel `.env` for production database
4. Set `APP_ENV=production` and `APP_DEBUG=false`
5. Run `php artisan config:cache` and `php artisan route:cache`
6. Serve frontend `dist/` folder with a web server
7. Configure CORS in `backend/config/cors.php` to allow your production domain
