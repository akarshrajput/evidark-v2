#!/bin/bash

# EviDark Story Optimization - FirstImage Migration Script
# This script migrates existing stories to use the new firstImage field

set -e  # Exit on any error

echo "🎭 EviDark Story Optimization Migration Script"
echo "============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: This script must be run from the backend directory${NC}"
    echo "Please navigate to the backend directory and run the script again."
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js is not installed or not in PATH${NC}"
    exit 1
fi

# Check if the migration script exists
if [ ! -f "scripts/migrateFirstImages.js" ]; then
    echo -e "${RED}❌ Error: Migration script not found at scripts/migrateFirstImages.js${NC}"
    exit 1
fi

echo -e "${BLUE}🔍 Checking environment...${NC}"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Warning: .env file not found${NC}"
    echo "Please ensure your MongoDB connection string is properly configured."
    read -p "Do you want to continue? (y/N): " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        echo "Migration cancelled."
        exit 0
    fi
fi

# Backup reminder
echo -e "${YELLOW}📋 Important: Backup Reminder${NC}"
echo "It's recommended to backup your database before running this migration."
echo "This script will:"
echo "  1. Find stories without firstImage field"
echo "  2. Extract first image from story content"
echo "  3. Update the firstImage field for optimization"
echo ""

# Confirmation prompt
read -p "Do you want to proceed with the migration? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "Migration cancelled."
    exit 0
fi

echo ""
echo -e "${BLUE}🚀 Starting migration...${NC}"

# Run the migration script
if node scripts/migrateFirstImages.js; then
    echo ""
    echo -e "${GREEN}✅ Migration completed successfully!${NC}"
    echo ""
    echo "📊 Benefits of this optimization:"
    echo "  • Faster story card loading (no content parsing needed)"
    echo "  • Reduced bandwidth usage (content field not sent in lists)"
    echo "  • Better performance for story feeds and search results"
    echo "  • Improved user experience with faster page loads"
    echo ""
    echo -e "${GREEN}🎉 Your EviDark application is now optimized!${NC}"
    
    # Suggest restarting the server
    echo ""
    echo -e "${YELLOW}💡 Suggestion: Restart your server to ensure all changes take effect${NC}"
    echo "   Backend: npm run dev (or your start command)"
    echo "   Frontend: npm run dev (or your start command)"
    
else
    echo ""
    echo -e "${RED}❌ Migration failed!${NC}"
    echo "Please check the error messages above and:"
    echo "  1. Ensure your database connection is working"
    echo "  2. Check your .env file configuration"
    echo "  3. Verify the Story model exists"
    echo "  4. Try running the migration script manually:"
    echo "     node scripts/migrateFirstImages.js"
    exit 1
fi

echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "  1. Test story card loading in your frontend"
echo "  2. Verify images are displaying correctly"
echo "  3. Check the console logs for 'isOptimized: true' in story cards"
echo "  4. Monitor performance improvements"
echo ""
echo "🎭 Happy storytelling with EviDark!"