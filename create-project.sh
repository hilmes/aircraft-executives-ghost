#!/bin/bash

# Create New Project with Unified Logging
# Usage: ./create-project.sh project-name

PROJECT_NAME=$1
PROJECTS_DIR="/Users/hilmes/Projects"

if [ -z "$PROJECT_NAME" ]; then
    echo "Usage: $0 project-name"
    exit 1
fi

PROJECT_PATH="$PROJECTS_DIR/$PROJECT_NAME"

if [ -d "$PROJECT_PATH" ]; then
    echo "Error: Project '$PROJECT_NAME' already exists"
    exit 1
fi

echo "Creating new project: $PROJECT_NAME"

# Create project directory
mkdir -p "$PROJECT_PATH"
cd "$PROJECT_PATH"

# Initialize npm project
npm init -y > /dev/null 2>&1

# Create basic structure
mkdir -p src public logs

# Create main entry file with unified logging
cat > src/index.js << 'EOF'
// Initialize unified logging
require('../unified-logging-init');

const express = require('express');
const { expressMiddleware } = require('@hilmes/unified-logging');

const app = express();
const PORT = process.env.PORT || 3000;

// Add unified logging middleware
expressMiddleware(app);

// Serve static files
app.use(express.static('public'));

// Basic route
app.get('/', (req, res) => {
  console.log('Home page accessed');
  res.send('Hello from ' + require('../package.json').name);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
EOF

# Create basic HTML file
cat > public/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>New Project</title>
    <script src="/api/browser-logger"></script>
</head>
<body>
    <h1>Welcome to your new project!</h1>
    <p>Unified logging is already configured.</p>
    <script>
        console.log('Page loaded - this will be logged to unified log');
    </script>
</body>
</html>
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
.env
logs/
*.log
.DS_Store

# Unified logging
unified-logging-init.js
EOF

# Create README
cat > README.md << EOF
# $PROJECT_NAME

A new project with unified logging pre-configured.

## Getting Started

\`\`\`bash
npm install
npm start
\`\`\`

## Unified Logging

This project comes with unified logging enabled. All console output, HTTP requests, and browser logs are captured to \`~/logs/unified.log\`.

View logs:
\`\`\`bash
make tail-logs      # From home directory
\`\`\`

## Structure

- \`src/\` - Source code
- \`public/\` - Static files
- \`logs/\` - Local log files (gitignored)
EOF

# Install basic dependencies
npm install express --save > /dev/null 2>&1

echo "✓ Project created at: $PROJECT_PATH"
echo "✓ Unified logging will be automatically added by the watcher"
echo ""
echo "Next steps:"
echo "  cd $PROJECT_PATH"
echo "  npm start"
echo ""
echo "View logs with: make tail-logs (from home directory)"