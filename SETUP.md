# Installation & Setup Guide

## Prerequisites

- Node.js (v14+)
- PostgreSQL (v12+)
- npm or yarn

## Step 1: Clone Repository

```bash
cd September-Release-
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Database Setup

### Option A: Local PostgreSQL

1. Start PostgreSQL service:
```bash
# On macOS with Homebrew
brew services start postgresql

# On Linux
sudo systemctl start postgresql

# On Windows
# Start PostgreSQL from Services or use installed application
```

2. Create database:
```bash
psql -U postgres
```

3. In PostgreSQL shell:
```sql
CREATE DATABASE login_website;
\q
```

### Option B: Docker

```bash
docker run --name postgres-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=login_website -p 5432:5432 -d postgres:latest
```

## Step 4: Configure Environment

Update `.env` file with your database credentials:

```
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=login_website
JWT_SECRET=your_super_secret_jwt_key_change_in_production_12345
PORT=5000
NODE_ENV=development
```

## Step 5: Run Server

```bash
npm start
```

You should see:
```
✓ Server running on http://localhost:5000
✓ Health check: http://localhost:5000/health
```

## Step 6: Access Application

Open your browser and navigate to:
```
http://localhost:5000
```

## Testing the Application

### Test Registration

1. Click "Sign up here"
2. Fill in the form:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `SecurePass123`
   - Confirm: `SecurePass123`
3. Click "Create Account"
4. You should be logged in and see the dashboard

### Test Login

1. Click "Login here" if on register page
2. Fill in the form:
   - Email: `test@example.com`
   - Password: `SecurePass123`
3. Check "Remember me" to save email
4. Click "Login"
5. Dashboard should display

### Test Logout

1. Click your username in the top-right
2. Click "Logout"
3. You'll be returned to the login page

## API Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "username": "testuser"
  }
}
```

### Verify Token
```bash
curl -X GET http://localhost:5000/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Dashboard (Protected)
```bash
curl -X GET http://localhost:5000/api/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env to a different value, e.g., 5001
# Or kill the process using port 5000:
lsof -i :5000
kill -9 <PID>
```

### Database Connection Error
```bash
# Check PostgreSQL is running:
pg_isready -h localhost -p 5432

# Check .env credentials
# Ensure DATABASE_URL is correct
```

### Rate Limiting
- Login endpoint: 5 attempts per 15 minutes
- Registration: 3 attempts per 1 hour

## Production Deployment

### Security Checklist

- ✅ Change `JWT_SECRET` to a strong random value
- ✅ Set `NODE_ENV=production`
- ✅ Use HTTPS/TLS
- ✅ Set secure database credentials
- ✅ Configure CORS for trusted domains
- ✅ Enable HSTS headers
- ✅ Use environment variables for all secrets
- ✅ Enable database backups
- ✅ Set up monitoring and logging
- ✅ Use a reverse proxy (nginx, Apache)

### Environment Variables for Production

```
NODE_ENV=production
PORT=443
DB_HOST=your_prod_database_host
DB_USER=prod_user
DB_PASSWORD=strong_random_password
JWT_SECRET=strong_random_secret_key
CORS_ORIGIN=https://yourdomain.com
```

### Deploy to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

## Support

For issues or questions:
1. Check logs: `npm start`
2. Verify database connection
3. Check environment variables
4. Review browser console for frontend errors
