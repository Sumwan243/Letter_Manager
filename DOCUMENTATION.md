# Letter Manager - Complete Documentation

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/Sumwan243/Letter_Manager?utm_source=oss&utm_medium=github&utm_campaign=Sumwan243%2FLetter_Manager&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Installation & Setup](#installation--setup)
5. [Database Schema](#database-schema)
6. [API Documentation](#api-documentation)
7. [Frontend Structure](#frontend-structure)
8. [Authentication & Authorization](#authentication--authorization)
9. [Features](#features)
10. [Development Workflow](#development-workflow)
11. [Deployment](#deployment)
12. [Troubleshooting](#troubleshooting)

---

## Project Overview

**Letter Manager** is a full-stack web application designed to streamline the creation, management, and tracking of official letters within an organization. The system supports multiple user roles (Admin, Staff, Executive) with role-based access control, letter templates, and automated field population.

### Key Capabilities

- **Multi-role System**: Admin, Staff, and Executive roles with different permissions
- **Letter Templates**: Create reusable templates with dynamic fields
- **Department & Staff Management**: Organize recipients by departments
- **Office Management**: Manage multiple offices and their staff
- **User Management**: Bulk import users, manage profiles, and assign roles
- **Letter Tracking**: Track letter status (draft, pending, approved, rejected)
- **Auto-fill Fields**: Automatically populate letter fields based on user profile

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  React 18 + Vite 7 + React Router + Tailwind CSS           │
│  (Port: 5173)                                               │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST API
                       │ Bearer Token Auth
┌──────────────────────▼──────────────────────────────────────┐
│                         Backend                              │
│  Laravel 12 + Sanctum + SQLite/MySQL                        │
│  (Port: 8000)                                               │
└─────────────────────────────────────────────────────────────┘
```

### Project Structure

```
Letter_Manager/
├── backend/                    # Laravel backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── API/       # API Controllers
│   │   │   │   ├── Auth/      # Authentication Controllers
│   │   │   │   └── Settings/  # Settings Controllers
│   │   │   ├── Middleware/    # Custom Middleware
│   │   │   └── Requests/      # Form Requests
│   │   ├── Models/            # Eloquent Models
│   │   └── Providers/         # Service Providers
│   ├── config/                # Configuration files
│   ├── database/
│   │   ├── migrations/        # Database migrations
│   │   ├── seeders/           # Database seeders
│   │   └── factories/         # Model factories
│   ├── routes/
│   │   ├── api.php           # API routes
│   │   ├── auth.php          # Auth routes
│   │   └── web.php           # Web routes
│   └── storage/              # File storage
│
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── api/              # API client functions
│   │   ├── components/       # Reusable components
│   │   ├── context/          # React Context (Auth)
│   │   ├── layouts/          # Layout components
│   │   ├── pages/            # Page components
│   │   └── utils/            # Utility functions
│   └── public/               # Static assets
│
└── docs/                     # Documentation files
```

---

## Tech Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **PHP** | 8.2+ | Server-side language |
| **Laravel** | 12.x | PHP framework |
| **Laravel Sanctum** | 4.2+ | API authentication |
| **SQLite/MySQL** | - | Database |
| **Composer** | 2.x | Dependency manager |
| **Inertia.js** | 2.0+ | Server-side rendering (optional) |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3+ | UI library |
| **Vite** | 7.x | Build tool |
| **React Router** | 7.8+ | Client-side routing |
| **Axios** | 1.11+ | HTTP client |
| **Tailwind CSS** | 4.1+ | CSS framework |
| **Lucide React** | 0.541+ | Icon library |
| **Radix UI** | Various | Headless UI components |

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking (optional)
- **Pest** - PHP testing framework
- **Laravel Pint** - PHP code style fixer

---

## Installation & Setup

### Prerequisites

- **PHP** >= 8.2
- **Composer** >= 2.0
- **Node.js** >= 18.x
- **npm** or **yarn**
- **MySQL** or **SQLite**
- **XAMPP** (optional, for local development)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install PHP dependencies:**
   ```bash
   composer install
   ```

3. **Create environment file:**
   ```bash
   # Windows
   copy .env.example .env
   
   # Linux/Mac
   cp .env.example .env
   ```

4. **Configure database in `.env`:**

   **For MySQL/MariaDB:**
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=letter_manager
   DB_USERNAME=root
   DB_PASSWORD=
   ```

   **For SQLite:**
   ```env
   DB_CONNECTION=sqlite
   DB_DATABASE=database/database.sqlite
   ```

   If using SQLite, create the database file:
   ```bash
   # Linux/Mac
   touch database/database.sqlite
   
   # Windows: Create an empty file manually
   ```

5. **Generate application key:**
   ```bash
   php artisan key:generate
   ```

6. **Run migrations:**
   ```bash
   php artisan migrate
   ```

7. **Seed database (optional):**
   ```bash
   php artisan db:seed
   ```

8. **Start development server:**
   ```bash
   php artisan serve
   ```
   Backend runs at: `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file (optional):**
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```
   Frontend runs at: `http://localhost:5173`

### Quick Setup Script (Windows)

Run the provided setup script:
```bash
cd backend
setup.bat
```

---

## Database Schema

### Core Tables

#### **users**
Stores user information and authentication data.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| name | varchar | User's full name |
| email | varchar | Unique email address |
| password | varchar | Hashed password |
| role | enum | User role: admin, staff, executive |
| position | varchar | Job position |
| department | varchar | Department name |
| office | varchar | Office location |
| phone | varchar | Contact number |
| avatar | varchar | Avatar image path |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

#### **letters**
Stores letter documents.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| user_id | bigint | Foreign key to users |
| letter_type_id | bigint | Foreign key to letter_types |
| title | varchar | Letter title |
| content | text | Letter content |
| fields | json | Dynamic field values |
| status | enum | draft, pending, approved, rejected |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

#### **letter_types**
Defines letter categories and templates.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| name | varchar | Type name |
| description | text | Type description |
| allowed_roles | json | Roles that can use this type |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

#### **letter_templates**
Stores reusable letter templates.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| name | varchar | Template name |
| content | text | Template content with placeholders |
| fields | json | Template field definitions |
| letter_type_id | bigint | Foreign key to letter_types |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

#### **departments**
Organizational departments.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| name | varchar | Department name |
| description | text | Department description |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

#### **staff**
Department staff members (letter recipients).

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| name | varchar | Staff member name |
| position | varchar | Job position |
| department_id | bigint | Foreign key to departments |
| email | varchar | Email address |
| phone | varchar | Contact number |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

#### **offices**
Office locations.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| name | varchar | Office name |
| address | text | Office address |
| phone | varchar | Office phone |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

#### **template_fields**
Field definitions for templates.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| name | varchar | Field name |
| type | varchar | Field type (text, date, select, etc.) |
| required | boolean | Is field required |
| options | json | Field options (for select fields) |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

### Relationships

```
users (1) ──── (N) letters
letter_types (1) ──── (N) letters
letter_types (1) ──── (N) letter_templates
departments (1) ──── (N) staff
offices (1) ──── (N) users
```

---

## API Documentation

### Base URL
```
http://localhost:8000/api
```

### Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer {token}
```

### Public Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}

Response: 201 Created
{
  "user": { ... },
  "token": "1|abc123..."
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "user": { ... },
  "token": "1|abc123..."
}
```

### Protected Endpoints

#### Get Current User
```http
GET /api/user
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "staff",
  ...
}
```

#### Logout
```http
POST /api/logout
Authorization: Bearer {token}

Response: 200 OK
{
  "message": "Logged out successfully"
}
```

#### List Letters
```http
GET /api/letters?status=draft&page=1
Authorization: Bearer {token}

Response: 200 OK
{
  "data": [
    {
      "id": 1,
      "title": "Request Letter",
      "status": "draft",
      "user": { ... },
      "letter_type": { ... },
      ...
    }
  ],
  "meta": { ... },
  "links": { ... }
}
```

#### Create Letter
```http
POST /api/letters
Authorization: Bearer {token}
Content-Type: application/json

{
  "letter_type_id": 1,
  "title": "Request Letter",
  "content": "Letter content...",
  "fields": {
    "subject": "Request for approval",
    "recipient": "Manager"
  }
}

Response: 201 Created
{
  "id": 1,
  "title": "Request Letter",
  ...
}
```

#### Update Letter
```http
PUT /api/letters/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content...",
  "fields": { ... }
}

Response: 200 OK
```

#### Change Letter Status
```http
PATCH /api/letters/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "approved"
}

Response: 200 OK
```

#### Delete Letter (Admin only)
```http
DELETE /api/letters/{id}
Authorization: Bearer {token}

Response: 204 No Content
```

#### List Letter Types
```http
GET /api/letter-types
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": 1,
    "name": "Request Letter",
    "description": "...",
    "allowed_roles": ["admin", "staff"]
  }
]
```

#### List Departments
```http
GET /api/departments
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": 1,
    "name": "Human Resources",
    "description": "..."
  }
]
```

#### List Staff
```http
GET /api/staff?department_id=1
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": 1,
    "name": "Jane Smith",
    "position": "HR Manager",
    "department": { ... }
  }
]
```

#### Update Profile
```http
POST /api/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Doe",
  "position": "Senior Developer",
  "department": "IT",
  "phone": "123-456-7890"
}

Response: 200 OK
```

#### Change Password
```http
PUT /api/password
Authorization: Bearer {token}
Content-Type: application/json

{
  "current_password": "old_password",
  "password": "new_password",
  "password_confirmation": "new_password"
}

Response: 200 OK
```

### Admin-Only Endpoints

#### List Users
```http
GET /api/users
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "staff",
    ...
  }
]
```

#### Update User Role
```http
PUT /api/users/{id}/role
Authorization: Bearer {token}
Content-Type: application/json

{
  "role": "admin"
}

Response: 200 OK
```

#### Bulk Import Users
```http
POST /api/users/bulk-import
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: users.csv

Response: 200 OK
{
  "message": "Users imported successfully",
  "imported": 10,
  "failed": 0
}
```

#### Download User Template
```http
GET /api/users/download-template
Authorization: Bearer {token}

Response: 200 OK (CSV file)
```

#### Manage Offices
```http
GET /api/offices
POST /api/offices
PUT /api/offices/{id}
DELETE /api/offices/{id}
Authorization: Bearer {token}
```

#### Manage Letter Templates
```http
GET /api/letter-templates
POST /api/letter-templates
PUT /api/letter-templates/{id}
DELETE /api/letter-templates/{id}
Authorization: Bearer {token}
```

---

## Frontend Structure

### Component Hierarchy

```
App
├── AuthProvider (Context)
├── BrowserRouter
│   └── Routes
│       ├── Home (Public)
│       ├── Login (Public)
│       ├── Register (Public)
│       ├── Dashboard (Public)
│       ├── AdminDashboard (Admin only)
│       │   └── AdminLayout
│       ├── StaffDashboard (Staff only)
│       │   └── StaffLayout
│       ├── Letters (Admin/Staff)
│       │   └── LetterList
│       ├── CreateLetter (Admin/Staff)
│       │   └── LetterForm
│       ├── Settings (Admin/Staff)
│       │   └── SettingsForm
│       ├── AdminRecipients (Admin only)
│       ├── AdminUsers (Admin only)
│       └── AdminOffices (Admin only)
```

### Key Components

#### **AuthContext**
Manages authentication state and user information.

```javascript
// Usage
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();
  // ...
}
```

#### **PrivateRoute**
Protects routes based on user roles.

```javascript
<PrivateRoute roles={['admin', 'staff']}>
  <Letters />
</PrivateRoute>
```

#### **ErrorBoundary**
Catches and displays React errors gracefully.

```javascript
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

### Pages

| Page | Path | Roles | Description |
|------|------|-------|-------------|
| Home | `/` | Public | Landing page |
| Login | `/login` | Public | User login |
| Register | `/register` | Public | User registration |
| Dashboard | `/dashboard` | Public | General dashboard |
| AdminDashboard | `/admin` | Admin | Admin control panel |
| StaffDashboard | `/staff` | Staff | Staff workspace |
| Letters | `/letters` | Admin, Staff | Letter list |
| CreateLetter | `/letters/new` | Admin, Staff | Create new letter |
| Settings | `/settings` | Admin, Staff | User settings |
| AdminRecipients | `/admin/recipients` | Admin | Manage departments/staff |
| AdminUsers | `/admin/users` | Admin | User management |
| AdminOffices | `/admin/offices` | Admin | Office management |

### API Client

The frontend uses Axios for API calls. All API functions are located in `src/api/`.

```javascript
// Example: src/api/letters.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const getLetters = async (params) => {
  const response = await axios.get(`${API_URL}/api/letters`, { params });
  return response.data;
};

export const createLetter = async (data) => {
  const response = await axios.post(`${API_URL}/api/letters`, data);
  return response.data;
};
```

---

## Authentication & Authorization

### Authentication Flow

1. **User Login:**
   - User submits credentials to `/api/auth/login`
   - Backend validates credentials
   - Backend generates Sanctum personal access token
   - Token returned to frontend

2. **Token Storage:**
   - Frontend stores token in `localStorage`
   - Token included in all subsequent API requests

3. **Token Usage:**
   ```javascript
   axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
   ```

4. **Logout:**
   - Frontend calls `/api/logout`
   - Backend revokes token
   - Frontend clears localStorage

### Authorization (Role-Based Access Control)

#### User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, user management, all letter types |
| **Staff** | Create/edit own letters, view assigned letters |
| **Executive** | View and approve letters, limited editing |

#### Middleware

**Backend (Laravel):**
```php
// routes/api.php
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::delete('/letters/{letter}', [LetterController::class, 'destroy']);
});
```

**Frontend (React):**
```javascript
// components/PrivateRoute.jsx
<PrivateRoute roles={['admin']}>
  <AdminDashboard />
</PrivateRoute>
```

#### Checking Permissions

**Backend:**
```php
// In controller
if (!$user->isAdmin()) {
    return response()->json(['error' => 'Unauthorized'], 403);
}

// In model
public function canAccessLetterType($allowedRoles) {
    return in_array($this->role, $allowedRoles);
}
```

**Frontend:**
```javascript
// In component
const { user } = useAuth();
if (user.role === 'admin') {
    // Show admin features
}
```

---

## Features

### 1. Letter Management

- **Create Letters**: Use templates or create from scratch
- **Edit Letters**: Update content and fields
- **Delete Letters**: Admin can delete any letter
- **Status Tracking**: Draft → Pending → Approved/Rejected
- **Search & Filter**: Filter by status, type, date

### 2. Template System

- **Dynamic Fields**: Define custom fields for each template
- **Auto-fill**: Automatically populate fields from user profile
- **Field Types**: Text, textarea, date, select, checkbox
- **Reusable**: Use templates across multiple letters

### 3. User Management (Admin)

- **Bulk Import**: Import users from CSV
- **Role Assignment**: Assign admin/staff/executive roles
- **Profile Management**: Update user information
- **User Deletion**: Remove users from system

### 4. Department & Staff Management

- **Departments**: Create and manage organizational departments
- **Staff Members**: Add staff to departments
- **Letter Recipients**: Select staff as letter recipients

### 5. Office Management

- **Multiple Offices**: Support for multiple office locations
- **Office Staff**: Assign staff to offices
- **Office Information**: Store address, phone, etc.

### 6. Settings & Profile

- **Profile Update**: Change name, position, department
- **Password Change**: Update password securely
- **Avatar Upload**: Upload profile picture

---

## Development Workflow

### Running Development Servers

**Backend:**
```bash
cd backend
php artisan serve
```

**Frontend:**
```bash
cd frontend
npm run dev
```

**Both (Concurrent):**
```bash
cd backend
composer dev
```

### Code Style & Linting

**Backend (PHP):**
```bash
# Format code
./vendor/bin/pint

# Check code style
./vendor/bin/pint --test
```

**Frontend (JavaScript):**
```bash
# Lint code
npm run lint

# Format code
npm run format

# Check formatting
npm run format:check
```

### Testing

**Backend (Pest):**
```bash
php artisan test

# Run specific test
php artisan test --filter=UserTest
```

**Frontend:**
```bash
npm run test
```

### Database Management

**Create Migration:**
```bash
php artisan make:migration create_table_name
```

**Run Migrations:**
```bash
php artisan migrate
```

**Rollback Migrations:**
```bash
php artisan migrate:rollback
```

**Seed Database:**
```bash
php artisan db:seed
```

**Fresh Migration (Reset):**
```bash
php artisan migrate:fresh --seed
```

### Creating New Features

**Backend Controller:**
```bash
php artisan make:controller API/MyController
```

**Backend Model:**
```bash
php artisan make:model MyModel -m  # with migration
```

**Frontend Component:**
```bash
# Create file manually in src/components/
touch src/components/MyComponent.jsx
```

---

## Deployment

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
```
Output: `dist/` folder

**Backend:**
```bash
cd backend
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Environment Configuration

**Backend `.env`:**
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=your-db-host
DB_DATABASE=your-db-name
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password

SANCTUM_STATEFUL_DOMAINS=yourdomain.com
SESSION_DOMAIN=.yourdomain.com
```

**Frontend `.env`:**
```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

### Server Requirements

- **PHP** >= 8.2
- **Composer** >= 2.0
- **MySQL** >= 8.0 or **PostgreSQL** >= 13
- **Node.js** >= 18.x (for building frontend)
- **Web Server**: Apache or Nginx

### Apache Configuration

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    DocumentRoot /path/to/backend/public

    <Directory /path/to/backend/public>
        AllowOverride All
        Require all granted
    </Directory>

    # Frontend (if serving from same domain)
    Alias /app /path/to/frontend/dist
    <Directory /path/to/frontend/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/backend/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

### CORS Configuration

**Backend (`config/cors.php`):**
```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173')],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

---

## Troubleshooting

### Common Issues

#### 1. CORS Errors

**Problem:** Frontend cannot connect to backend API.

**Solution:**
- Check `config/cors.php` in backend
- Ensure frontend URL is in `allowed_origins`
- Verify `SANCTUM_STATEFUL_DOMAINS` in `.env`

#### 2. Authentication Not Working

**Problem:** Token not being sent with requests.

**Solution:**
```javascript
// Ensure token is set in axios defaults
const token = localStorage.getItem('token');
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

#### 3. Database Connection Failed

**Problem:** Cannot connect to database.

**Solution:**
- Verify database credentials in `.env`
- Ensure database server is running
- Check database name exists
- For SQLite, ensure file exists and has write permissions

#### 4. 404 on API Routes

**Problem:** API routes return 404.

**Solution:**
```bash
# Clear route cache
php artisan route:clear
php artisan route:cache

# Check routes
php artisan route:list
```

#### 5. Vite Build Errors

**Problem:** Frontend build fails.

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
```

#### 6. Permission Denied Errors

**Problem:** Laravel cannot write to storage.

**Solution:**
```bash
# Linux/Mac
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# Windows: Ensure IIS/Apache user has write access
```

#### 7. Token Mismatch

**Problem:** CSRF token mismatch errors.

**Solution:**
- This shouldn't happen with Bearer tokens
- Ensure using `auth:sanctum` middleware, not `web` middleware
- Check that frontend is sending `Authorization` header, not cookies

### Debug Mode

**Enable Laravel Debug:**
```env
APP_DEBUG=true
LOG_LEVEL=debug
```

**Check Laravel Logs:**
```bash
tail -f storage/logs/laravel.log
```

**Frontend Console:**
```javascript
// Add logging to API calls
axios.interceptors.request.use(request => {
  console.log('Request:', request);
  return request;
});

axios.interceptors.response.use(response => {
  console.log('Response:', response);
  return response;
});
```

### Performance Optimization

**Backend:**
```bash
# Cache configuration
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Optimize autoloader
composer dump-autoload --optimize
```

**Frontend:**
```bash
# Build with production optimizations
npm run build

# Analyze bundle size
npm run build -- --mode=analyze
```

---

## Additional Resources

### Related Documentation

- [Quick Start Guide](QUICK_START.md)
- [Setup and Test Guide](SETUP_AND_TEST.md)
- [Auto-fill Setup](AUTO_FILL_SETUP.md)
- [Bulk Import Guide](BULK_IMPORT_GUIDE.md)
- [Web Import Guide](WEB_IMPORT_GUIDE.md)
- [Template Updates](TEMPLATE_UPDATES.md)
- [Fix Roles Guide](FIX_ROLES.md)

### External Links

- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://react.dev)
- [Laravel Sanctum](https://laravel.com/docs/sanctum)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

## Contributing

### Code Style

- Follow PSR-12 for PHP code
- Use ESLint/Prettier for JavaScript code
- Write descriptive commit messages
- Add comments for complex logic

### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit pull request with description

### Reporting Issues

When reporting issues, include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, PHP version, etc.)
- Error messages and logs

---

## License

This project is licensed under the MIT License.

---

## Support

For questions or issues:
- Create an issue on GitHub
- Contact the development team
- Check existing documentation

---

**Last Updated:** September 30, 2025
**Version:** 1.0.0
