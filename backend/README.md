# Letter Manager Backend

A Laravel-based backend API for the Letter Manager application, providing authentication, user management, and letter management functionality.

## Features

- **Authentication System**
  - User registration and login
  - Role-based access control (Admin/Staff)
  - Laravel Sanctum token authentication

- **User Management**
  - Admin users with full access
  - Staff users with limited access
  - Role-based permissions

- **Letter Management**
  - Create, read, update, delete letters
  - Letter type templates
  - Status management (draft, pending, approved, rejected)
  - Role-based access to letters

- **API Endpoints**
  - RESTful API design
  - Protected routes with authentication
  - Admin-only routes for sensitive operations

## Requirements

- PHP 8.1+
- Laravel 11+
- MySQL/PostgreSQL
- Composer

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Letter_Manager
   ```

2. **Install dependencies**
   ```bash
   composer install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Database configuration**
   Update your `.env` file with database credentials:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=letter_manager
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

5. **Run migrations**
   ```bash
   php artisan migrate
   ```

6. **Seed the database**
   ```bash
   php artisan db:seed
   ```

7. **Start the server**
   ```bash
   php artisan serve
   ```

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/user` - Get current user info
- `POST /api/logout` - User logout

### Letter Types
- `GET /api/letter-types` - List all letter types
- `GET /api/letter-types/{id}` - Get specific letter type
- `POST /api/letter-types` - Create letter type (Admin only)
- `PUT /api/letter-types/{id}` - Update letter type (Admin only)
- `DELETE /api/letter-types/{id}` - Delete letter type (Admin only)

### Letters
- `GET /api/letters` - List letters (filtered by user role)
- `POST /api/letters` - Create new letter
- `GET /api/letters/{id}` - Get specific letter
- `PUT /api/letters/{id}` - Update letter
- `PATCH /api/letters/{id}/status` - Change letter status (Admin only)
- `DELETE /api/letters/{id}` - Delete letter (Admin only)

## User Roles

### Admin
- Full access to all features
- Can manage letter types
- Can view and manage all letters
- Can change letter statuses
- Can delete letters

### Staff
- Limited access to letters
- Can only view and edit their own letters
- Cannot manage letter types
- Cannot delete letters

## Default Users

After running the seeder, you'll have these default users:

- **Admin**: admin@example.com / password
- **Staff**: staff@example.com / password

## Frontend Integration

The backend is designed to work with a React frontend running on a different port. CORS is configured to allow cross-origin requests from the frontend.

## Testing

Run the test suite:
```bash
php artisan test
```

## Security

- All API endpoints (except login/register) require authentication
- Role-based access control implemented
- Input validation on all endpoints
- SQL injection protection through Eloquent ORM
- XSS protection through Laravel's built-in features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
