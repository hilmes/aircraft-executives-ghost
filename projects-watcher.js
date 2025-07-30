#!/usr/bin/env node

// Projects Directory Watcher
// Automatically adds unified logging to new Node.js projects

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PROJECTS_DIR = '/Users/hilmes/Projects';
const LOGGING_MODULE_DIR = '/Users/hilmes/unified-logging-module';
const DASHBOARD_SERVER_PATH = '/Users/hilmes/Projects/dashboard-server.js';
const WATCH_INTERVAL = 5000; // Check every 5 seconds
const STATE_FILE = path.join(process.env.HOME, '.projects-watcher-state.json');

// Load previous state
let knownProjects = new Set();
try {
  const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  knownProjects = new Set(state.projects || []);
} catch (e) {
  // First run, no state file yet
}

// Save current state
function saveState() {
  fs.writeFileSync(STATE_FILE, JSON.stringify({
    projects: Array.from(knownProjects),
    lastCheck: new Date().toISOString()
  }, null, 2));
}

// Add unified logging to a project
function addUnifiedLogging(projectPath) {
  const projectName = path.basename(projectPath);
  console.log(`[${new Date().toISOString()}] New project detected: ${projectName}`);
  
  // Check if it's a Node.js project
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log(`  → Not a Node.js project (no package.json), skipping`);
    return;
  }
  
  // Check if logging already exists
  const loggingInitPath = path.join(projectPath, 'unified-logging-init.js');
  if (fs.existsSync(loggingInitPath)) {
    console.log(`  → Unified logging already configured`);
    return;
  }
  
  console.log(`  → Adding unified logging to ${projectName}...`);
  
  // Create symlink to unified logging module
  const nodeModulesPath = path.join(projectPath, 'node_modules');
  const hilmesPath = path.join(nodeModulesPath, '@hilmes');
  const loggingLinkPath = path.join(hilmesPath, 'unified-logging');
  
  try {
    // Create directories if needed
    if (!fs.existsSync(nodeModulesPath)) {
      fs.mkdirSync(nodeModulesPath, { recursive: true });
    }
    if (!fs.existsSync(hilmesPath)) {
      fs.mkdirSync(hilmesPath, { recursive: true });
    }
    
    // Create symlink if it doesn't exist
    if (!fs.existsSync(loggingLinkPath)) {
      fs.symlinkSync(LOGGING_MODULE_DIR, loggingLinkPath);
      console.log(`  → Created symlink to unified logging module`);
    }
    
    // Create initialization file with startup tracking
    const initContent = `// Unified Logging and Startup Tracking
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
`;
    
    fs.writeFileSync(loggingInitPath, initContent);
    console.log(`  → Created unified-logging-init.js`);
    
    // Update .gitignore if it exists
    const gitignorePath = path.join(projectPath, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignore = fs.readFileSync(gitignorePath, 'utf8');
      if (!gitignore.includes('unified-logging-init.js')) {
        fs.appendFileSync(gitignorePath, '\n# Unified logging\nunified-logging-init.js\n');
        console.log(`  → Updated .gitignore`);
      }
    }
    
    console.log(`  ✓ Successfully added unified logging to ${projectName}`);
    
    // Send notification
    exec(`osascript -e 'display notification "Unified logging added to ${projectName}" with title "Projects Watcher"'`);
    
  } catch (error) {
    console.error(`  ✗ Error adding unified logging: ${error.message}`);
  }
}

// Start dashboard server
function startDashboardServer() {
  // Check if dashboard server is already running
  exec('pgrep -f "dashboard-server.js"', (error, stdout) => {
    if (stdout.trim()) {
      console.log(`[${new Date().toISOString()}] Dashboard server already running (PID: ${stdout.trim()})`);
      return;
    }
    
    // Start the dashboard server
    console.log(`[${new Date().toISOString()}] Starting dashboard server...`);
    const child = exec(`node "${DASHBOARD_SERVER_PATH}"`, {
      cwd: path.dirname(DASHBOARD_SERVER_PATH),
      detached: true,
      stdio: 'ignore'
    });
    
    child.unref();
    console.log(`[${new Date().toISOString()}] Dashboard server started (PID: ${child.pid})`);
    
    // Send notification
    exec(`osascript -e 'display notification "Dashboard server started on port 2600" with title "Projects Watcher"'`);
  });
}

// Check for new projects
function checkForNewProjects() {
  try {
    const entries = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const projectPath = path.join(PROJECTS_DIR, entry.name);
        
        // Is this a new project?
        if (!knownProjects.has(entry.name)) {
          knownProjects.add(entry.name);
          addUnifiedLogging(projectPath);
        }
      }
    }
    
    // Save updated state
    saveState();
    
  } catch (error) {
    console.error(`Error checking projects: ${error.message}`);
  }
}

// Initial scan
console.log(`[${new Date().toISOString()}] Projects Watcher started`);
console.log(`Monitoring: ${PROJECTS_DIR}`);
console.log(`Check interval: ${WATCH_INTERVAL / 1000} seconds`);
console.log('---');

// Do initial check
checkForNewProjects();

// Start dashboard server
startDashboardServer();

// Set up periodic checking
setInterval(checkForNewProjects, WATCH_INTERVAL);

// Check dashboard server every 30 seconds
setInterval(() => {
  exec('pgrep -f "dashboard-server.js"', (error, stdout) => {
    if (!stdout.trim()) {
      console.log(`[${new Date().toISOString()}] Dashboard server not running, restarting...`);
      startDashboardServer();
    }
  });
}, 30000);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[${new Date().toISOString()}] Projects Watcher stopped');
  saveState();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[${new Date().toISOString()}] Projects Watcher stopped');
  saveState();
  process.exit(0);
});