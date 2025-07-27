#!/bin/bash

# Deploy Unified Logging to Projects
# This script copies the unified logging prompt to all project directories

PROJECTS_DIR="/Users/hilmes/Projects"
PROMPT_FILE="/Users/hilmes/UNIFIED-LOGGING-PROMPT.md"
CLAUDE_FILE="/Users/hilmes/Projects/CLAUDE.md"

# Check if prompt file exists
if [ ! -f "$PROMPT_FILE" ]; then
    echo "Error: UNIFIED-LOGGING-PROMPT.md not found at $PROMPT_FILE"
    exit 1
fi

# Create Projects directory if it doesn't exist
if [ ! -d "$PROJECTS_DIR" ]; then
    echo "Creating Projects directory..."
    mkdir -p "$PROJECTS_DIR"
fi

# Copy CLAUDE.md to Projects root if not present
if [ ! -f "$CLAUDE_FILE" ]; then
    echo "Creating CLAUDE.md in Projects directory..."
    cat > "$CLAUDE_FILE" << 'EOF'
# Claude Code Project Standards

## Unified Logging System

All projects in this directory should implement a unified logging system. When working in any project folder, Claude Code will automatically set up comprehensive logging that captures:

- Browser console.log calls (forwarded to server)
- Server stdout/stderr streams
- SQL queries with execution times
- HTTP requests and responses
- All output to a single tailable log file

### Quick Setup

When starting work in a project, run:
```bash
# Check if unified logging exists
ls unified-logger.js browser-logger.js sql-logger.js log-server.js Makefile

# If not present, implement using the prompt in UNIFIED-LOGGING-PROMPT.md
```

### Available Commands

Once implemented, use these commands:
```bash
make tail-logs       # Monitor all logs (last 50 lines, follow)
make tail-errors     # Only error logs
make tail-sql        # Only SQL queries
make tail-http       # Only HTTP requests
make tail-browser    # Only browser logs
make log-stats       # Show log statistics
```

### Implementation Details

See `UNIFIED-LOGGING-PROMPT.md` in each project directory for the full implementation prompt.

## Project Conventions

1. **Logging First**: Always implement unified logging when starting work
2. **Single Log File**: All logs flow to `logs/unified.log` as JSON
3. **Browser Integration**: Include browser-logger.js in all web projects
4. **SQL Tracking**: Wrap all database clients with sql-logger.js
5. **Express Apps**: Use the logging middleware for automatic HTTP logging

## Automatic Implementation

Claude Code will automatically check for and implement unified logging when:
- Starting work in a new project
- Debugging issues
- Setting up monitoring
- Working with databases or APIs

This ensures consistent logging across all projects for easier debugging and monitoring.
EOF
fi

# Counter for tracking deployments
deployed=0
skipped=0

# Deploy to all project directories
echo "Deploying unified logging prompt to all projects..."
for dir in "$PROJECTS_DIR"/*/; do
    if [ -d "$dir" ]; then
        project_name=$(basename "$dir")
        
        # Skip node_modules and other non-project directories
        if [[ "$project_name" == "node_modules" ]] || [[ "$project_name" == ".git" ]]; then
            continue
        fi
        
        # Check if prompt already exists
        if [ -f "$dir/UNIFIED-LOGGING-PROMPT.md" ]; then
            echo "✓ Already exists: $project_name"
            ((skipped++))
        else
            cp "$PROMPT_FILE" "$dir/"
            echo "✓ Deployed to: $project_name"
            ((deployed++))
        fi
    fi
done

echo ""
echo "Deployment complete!"
echo "- Deployed to $deployed new projects"
echo "- Skipped $skipped existing projects"
echo ""
echo "To implement unified logging in a project, use the prompt in UNIFIED-LOGGING-PROMPT.md"
echo "To monitor logs after implementation: make tail-logs"

# Make script executable
chmod +x "$0"