#!/bin/bash
set -e

echo "🔄 Setting up PostgreSQL Database..."

# Drop existing database if exists
psql -h localhost -U postgres -d postgres -c "DROP DATABASE IF EXISTS kasirin_db;" 2>/dev/null || true

# Create database
psql -h localhost -U postgres -d postgres -c "CREATE DATABASE kasirin_db;"
echo "✅ Database created"

# Create tables and load schema
psql -h localhost -U postgres -d kasirin_db -f /Users/mac/Document/kasirin/database/schema.sql

echo "✅ Database setup completed!"
