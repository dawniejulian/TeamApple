#!/bin/bash
# scripts/setup.sh
# Setup script untuk inisialisasi project

set -e

echo "==================================="
echo "🚀 Kasirin Setup Script"
echo "==================================="
echo ""

# Check requirements
echo "📋 Checking requirements..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not installed. Please install Node.js v18+"
    exit 1
fi

if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL not installed. Please install PostgreSQL 12+"
    exit 1
fi

echo "✅ Node.js: $(node -v)"
echo "✅ npm: $(npm -v)"
echo ""

# Create .env files
echo "📝 Creating .env files..."
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env"
else
    echo "⏭️  backend/.env already exists"
fi

if [ ! -f "frontend/.env" ]; then
    echo "✅ Frontend using default REACT_APP_API_URL"
fi

echo ""

# Setup backend
echo "📦 Setting up backend..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
    echo "✅ Backend dependencies installed"
else
    echo "⏭️  Backend dependencies already installed"
fi
cd ..

echo ""

# Setup frontend
echo "📦 Setting up frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
    echo "✅ Frontend dependencies installed"
else
    echo "⏭️  Frontend dependencies already installed"
fi
cd ..

echo ""

# Create database
echo "🗄️  Creating database..."
DB_NAME="kasirin_db"
DB_USER="postgres"

if psql -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo "⏭️  Database $DB_NAME already exists"
else
    createdb -U $DB_USER $DB_NAME
    echo "✅ Database $DB_NAME created"
fi

echo ""

# Import schema
echo "📋 Importing database schema..."
psql -U $DB_USER $DB_NAME < database/schema.sql
echo "✅ Database schema imported"

echo ""
echo "==================================="
echo "✅ Setup Complete!"
echo "==================================="
echo ""
echo "🚀 Next steps:"
echo ""
echo "1. Start backend (Terminal 1):"
echo "   cd backend && npm run dev"
echo ""
echo "2. Start frontend (Terminal 2):"
echo "   cd frontend && npm start"
echo ""
echo "3. Open browser:"
echo "   http://localhost:3000"
echo ""
echo "📝 Demo credentials:"
echo "   Username: admin"
echo "   Password: any"
echo ""
