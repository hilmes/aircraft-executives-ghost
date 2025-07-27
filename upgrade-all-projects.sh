#!/bin/bash

# Upgrade All Projects with Enhanced Startup Tracking
# This script updates all existing projects with the new analyzer/tracker features

PROJECTS_DIR="/Users/hilmes/Projects"
LOGGING_MODULE_DIR="/Users/hilmes/unified-logging-module"
UPGRADED_COUNT=0
SKIPPED_COUNT=0

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Upgrading All Projects with Startup Tracking     ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════${NC}\n"

# Function to upgrade a project
upgrade_project() {
    local project_dir=$1
    local project_name=$(basename "$project_dir")
    
    echo -e "\n${YELLOW}Processing: $project_name${NC}"
    
    # Check if it's a Node.js project
    if [ ! -f "$project_dir/package.json" ]; then
        echo -e "${RED}  ✗ Not a Node.js project, skipping${NC}"
        ((SKIPPED_COUNT++))
        return
    fi
    
    # Check if unified logging exists
    local init_file="$project_dir/unified-logging-init.js"
    local needs_upgrade=false
    
    if [ ! -f "$init_file" ]; then
        echo -e "${RED}  ✗ No unified logging found, skipping${NC}"
        echo -e "    Run 'make deploy-all' first to add basic logging"
        ((SKIPPED_COUNT++))
        return
    fi
    
    # Check if it has the old version (without analyzer)
    if ! grep -q "ProjectAnalyzer" "$init_file" 2>/dev/null; then
        needs_upgrade=true
        echo -e "${YELLOW}  → Upgrading from basic logging to enhanced tracking${NC}"
    else
        echo -e "${GREEN}  ✓ Already has enhanced tracking${NC}"
        ((SKIPPED_COUNT++))
        return
    fi
    
    # Backup old init file
    cp "$init_file" "$init_file.backup"
    echo -e "${GREEN}  ✓ Created backup: unified-logging-init.js.backup${NC}"
    
    # Create new enhanced init file
    cat > "$init_file" << 'EOF'
// Unified Logging and Startup Tracking
// Add this line to your main entry file:
// require('./unified-logging-init');

const { initializeLogger, ProjectAnalyzer, StartupTracker } = require('@hilmes/unified-logging');

// Initialize unified logging
const logger = initializeLogger({
  logFile: process.env.UNIFIED_LOG_FILE || require('path').join(process.env.HOME, 'logs', 'unified.log'),
  captureConsole: true,
  captureProcess: true
});

// Get project name
const projectName = (() => {
  try {
    return require('./package.json').name;
  } catch (e) {
    return require('path').basename(process.cwd());
  }
})();

// Create startup tracker
const tracker = new StartupTracker(projectName);

// Run project analysis on startup
(async () => {
  try {
    const analyzer = new ProjectAnalyzer();
    await analyzer.run();
  } catch (error) {
    logger.log('error', 'Project analysis failed', { error: error.message });
  }
})();

// Export for use in application
module.exports = {
  logger,
  tracker,
  
  // Convenience methods
  trackPhase: (name, fn) => tracker.trackPhase(name, fn),
  trackPhaseAsync: (name, fn) => tracker.trackPhaseAsync(name, fn),
  wrapMethod: (obj, method, context) => tracker.wrapMethod(obj, method, context),
  trackExpressApp: (app) => tracker.trackExpressApp(app),
  completeStartup: () => tracker.completeStartup(),
  getMetrics: () => tracker.getMetrics()
};

// For Express apps:
// const { tracker, trackExpressApp } = require('./unified-logging-init');
// trackExpressApp(app);
EOF
    
    echo -e "${GREEN}  ✓ Upgraded to enhanced tracking${NC}"
    
    # Create analyzer cache directory
    mkdir -p "$project_dir/.analyzer-cache"
    echo -e "${GREEN}  ✓ Created .analyzer-cache directory${NC}"
    
    # Update .gitignore if needed
    if [ -f "$project_dir/.gitignore" ]; then
        if ! grep -q ".analyzer-cache" "$project_dir/.gitignore"; then
            echo -e "\n# Project analyzer cache" >> "$project_dir/.gitignore"
            echo ".analyzer-cache/" >> "$project_dir/.gitignore"
            echo -e "${GREEN}  ✓ Updated .gitignore${NC}"
        fi
    fi
    
    # Run initial analysis
    echo -e "${BLUE}  → Running initial analysis...${NC}"
    cd "$project_dir"
    node -e "const { ProjectAnalyzer } = require('@hilmes/unified-logging'); new ProjectAnalyzer().run().catch(e => console.error('Analysis failed:', e.message));" 2>/dev/null || echo -e "${YELLOW}    Initial analysis will run on next startup${NC}"
    
    ((UPGRADED_COUNT++))
    echo -e "${GREEN}  ✓ Successfully upgraded $project_name${NC}"
}

# Check if unified logging module has the new features
if [ ! -f "$LOGGING_MODULE_DIR/project-analyzer.js" ]; then
    echo -e "${RED}Error: Unified logging module doesn't have the new analyzer features${NC}"
    echo -e "Please ensure the module is up to date"
    exit 1
fi

# Process all projects
echo -e "${BLUE}Scanning projects directory...${NC}"
project_total=0

for project in "$PROJECTS_DIR"/*; do
    if [ -d "$project" ]; then
        ((project_total++))
    fi
done

echo -e "Found ${GREEN}$project_total${NC} directories to check\n"

# Upgrade each project
for project in "$PROJECTS_DIR"/*; do
    if [ -d "$project" ]; then
        upgrade_project "$project"
    fi
done

# Summary
echo -e "\n${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}                    Summary                         ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "Total projects checked: ${GREEN}$project_total${NC}"
echo -e "Projects upgraded: ${GREEN}$UPGRADED_COUNT${NC}"
echo -e "Projects skipped: ${YELLOW}$SKIPPED_COUNT${NC}"

if [ $UPGRADED_COUNT -gt 0 ]; then
    echo -e "\n${GREEN}✅ Upgrade complete!${NC}"
    echo -e "\nUpgraded projects now have:"
    echo -e "  • Static method analysis on startup"
    echo -e "  • Runtime performance tracking"
    echo -e "  • Change detection between runs"
    echo -e "  • Enhanced metrics reporting"
    echo -e "\nView unified logs with: ${YELLOW}make tail-logs${NC}"
else
    echo -e "\n${YELLOW}No projects needed upgrading${NC}"
fi

# Restart watcher if running
if launchctl list | grep -q "com.hilmes.projects-watcher"; then
    echo -e "\n${BLUE}Restarting projects watcher...${NC}"
    launchctl unload ~/Library/LaunchAgents/com.hilmes.projects-watcher.plist 2>/dev/null
    launchctl load ~/Library/LaunchAgents/com.hilmes.projects-watcher.plist
    echo -e "${GREEN}✓ Projects watcher restarted${NC}"
fi