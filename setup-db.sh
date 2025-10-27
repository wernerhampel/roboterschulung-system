#!/bin/bash

# ROBTEC Training System - Database Setup Script
# This script initializes the PostgreSQL database with the required schema

echo "🗄️  ROBTEC Training System - Database Setup"
echo "==========================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set DATABASE_URL first:"
    echo "export DATABASE_URL='postgresql://user:password@host:port/database'"
    echo ""
    exit 1
fi

echo "✅ DATABASE_URL is set"
echo ""

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo "❌ Error: psql is not installed"
    echo ""
    echo "Please install PostgreSQL client:"
    echo "  Ubuntu/Debian: sudo apt-get install postgresql-client"
    echo "  macOS: brew install postgresql"
    echo ""
    exit 1
fi

echo "✅ psql is installed"
echo ""

# Import schema
echo "📥 Importing database schema..."
echo ""

if psql "$DATABASE_URL" < sql/schema.sql; then
    echo ""
    echo "✅ Database schema imported successfully!"
    echo ""
    echo "🎉 Setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Start the admin app: npm run dev:admin"
    echo "2. Start the verify app: npm run dev:verify"
    echo "3. Open http://localhost:3000 in your browser"
    echo ""
else
    echo ""
    echo "❌ Error: Failed to import schema"
    echo ""
    echo "Please check:"
    echo "1. DATABASE_URL is correct"
    echo "2. Database server is running"
    echo "3. You have permission to create tables"
    echo ""
    exit 1
fi
