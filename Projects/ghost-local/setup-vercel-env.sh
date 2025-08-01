#!/bin/bash

# Aircraft Executives Ghost - Vercel Environment Setup Script
echo "Setting up Vercel environment variables for Ghost CMS..."

# You'll need to replace these with your actual database credentials
echo "Please provide your database credentials:"

read -p "Database Host: " DB_HOST
read -p "Database User: " DB_USER
read -s -p "Database Password: " DB_PASSWORD
echo
read -p "Database Name: " DB_NAME

# Set Vercel environment variables
echo "Setting Vercel environment variables..."

vercel env add ghost_db_host production <<< "$DB_HOST"
vercel env add ghost_db_user production <<< "$DB_USER"  
vercel env add ghost_db_password production <<< "$DB_PASSWORD"
vercel env add ghost_db_name production <<< "$DB_NAME"

echo "Environment variables set successfully!"
echo "Now you can deploy with: vercel --prod --yes"

# Alternative: Use SQLite for simple deployment
echo ""
echo "Alternative: For a simple deployment, you can use SQLite instead."
echo "Run: vercel env add USE_SQLITE production <<< 'true'"