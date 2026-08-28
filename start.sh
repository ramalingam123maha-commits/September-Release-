#!/bin/bash

# Login Website - Quick Start Script
# This script helps you set up and run the login website

echo "🔐 Login Website - Setup & Launch Script"
echo "========================================"
echo ""

# Check Node.js
echo "✓ Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "✗ Node.js not found. Please install Node.js v14+"
    exit 1
fi
echo "  Node.js version: $(node --version)"

# Check npm
echo "✓ Checking npm..."
if ! command -v npm &> /dev/null; then
    echo "✗ npm not found"
    exit 1
fi
echo "  npm version: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check .env file
echo ""
echo "⚙️  Checking configuration..."
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "  Please configure .env with your database credentials"
    echo "  Database details needed:"
    echo "    - DB_USER: PostgreSQL username (default: postgres)"
    echo "    - DB_PASSWORD: PostgreSQL password"
    echo "    - DB_NAME: Database name (default: login_website)"
fi

# Check PostgreSQL
echo ""
echo "🗄️  PostgreSQL Setup Required!"
echo "==============================="
echo ""
echo "Make sure PostgreSQL is running and execute:"
echo ""
echo "  createdb login_website"
echo ""
echo "Or using pgAdmin:"
echo "  1. Open pgAdmin"
echo "  2. Create a new database named 'login_website'"
echo "  3. Update .env with your credentials"
echo ""
read -p "Press Enter once PostgreSQL is ready and .env is configured..."

# Start server
echo ""
echo "🚀 Starting Login Website Server..."
echo "========================================"
echo ""
echo "Server will run at: http://localhost:5000"
echo "Features:"
echo "  ✓ User Registration"
echo "  ✓ Secure Login"
echo "  ✓ JWT Authentication"
echo "  ✓ Rate Limiting"
echo "  ✓ Password Hashing (bcrypt)"
echo ""
echo "Stopping server: Press Ctrl+C"
echo ""

npm run dev
