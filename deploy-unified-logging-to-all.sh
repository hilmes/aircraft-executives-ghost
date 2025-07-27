#!/bin/bash

# Deploy Unified Logging to All Projects
# This script adds unified logging to all Node.js projects

PROJECTS_DIR="/Users/hilmes/Projects"
LOGGING_MODULE_DIR="/Users/hilmes/unified-logging-module"
LOGS_DIR="/Users/hilmes/logs"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Unified Logging Deployment Script${NC}"
echo "=================================="

# Create logs directory
if [ ! -d "$LOGS_DIR" ]; then
    echo -e "${YELLOW}Creating logs directory...${NC}"
    mkdir -p "$LOGS_DIR"
fi

# Function to add logging to a project
add_logging_to_project() {
    local project_dir=$1
    local project_name=$(basename "$project_dir")
    
    echo -e "\n${YELLOW}Processing: $project_name${NC}"
    
    # Check if package.json exists
    if [ ! -f "$project_dir/package.json" ]; then
        echo -e "${RED}  ✗ No package.json found, skipping${NC}"
        return
    fi
    
    # Create symlink to unified logging module
    if [ ! -L "$project_dir/node_modules/@hilmes/unified-logging" ]; then
        mkdir -p "$project_dir/node_modules/@hilmes"
        ln -s "$LOGGING_MODULE_DIR" "$project_dir/node_modules/@hilmes/unified-logging"
        echo -e "${GREEN}  ✓ Created symlink to unified logging module${NC}"
    else
        echo "  • Symlink already exists"
    fi
    
    # Add integration helper file
    cat > "$project_dir/unified-logging-init.js" << 'EOF'
// Unified Logging Initialization
// Add this line to your main entry file:
// require('./unified-logging-init');

const { initializeLogger } = require('@hilmes/unified-logging');

// Initialize unified logging
const logger = initializeLogger({
  logFile: process.env.UNIFIED_LOG_FILE || require('path').join(process.env.HOME, 'logs', 'unified.log'),
  captureConsole: true,
  captureProcess: true
});

// Export for use in other modules
module.exports = logger;

// For Express apps, use:
// const { expressMiddleware } = require('@hilmes/unified-logging');
// expressMiddleware(app);
EOF
    echo -e "${GREEN}  ✓ Created unified-logging-init.js${NC}"
    
    # Update .gitignore if it exists
    if [ -f "$project_dir/.gitignore" ]; then
        if ! grep -q "unified-logging-init.js" "$project_dir/.gitignore"; then
            echo -e "\n# Unified logging" >> "$project_dir/.gitignore"
            echo "unified-logging-init.js" >> "$project_dir/.gitignore"
            echo -e "${GREEN}  ✓ Updated .gitignore${NC}"
        fi
    fi
}

# Process all top-level projects with package.json
project_count=0
for project in "$PROJECTS_DIR"/*; do
    if [ -d "$project" ] && [ -f "$project/package.json" ]; then
        add_logging_to_project "$project"
        ((project_count++))
    fi
done

echo -e "\n${GREEN}=================================="
echo -e "Deployment Complete!${NC}"
echo -e "Processed ${GREEN}$project_count${NC} projects"
echo -e "\nTo use unified logging in a project:"
echo -e "1. Add to your main entry file: ${YELLOW}require('./unified-logging-init');${NC}"
echo -e "2. For Express apps: ${YELLOW}const { expressMiddleware } = require('@hilmes/unified-logging');${NC}"
echo -e "3. View logs: ${YELLOW}tail -f ~/logs/unified.log${NC}"
echo -e "\nMakefile commands available:"
echo -e "  ${YELLOW}make tail-logs${NC} - Follow log output"
echo -e "  ${YELLOW}make tail-errors${NC} - Show only errors"
echo -e "  ${YELLOW}make log-stats${NC} - Display statistics"