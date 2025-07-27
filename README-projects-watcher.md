# Projects Watcher - Automatic Unified Logging Integration

The Projects Watcher automatically monitors `/Users/hilmes/Projects` and adds unified logging to any new Node.js projects.

## Features

- **Automatic Detection**: Checks for new projects every 5 seconds
- **Smart Integration**: Only adds logging to Node.js projects (with package.json)
- **Non-Intrusive**: Skips projects that already have unified logging
- **Notifications**: macOS notifications when logging is added
- **State Tracking**: Remembers which projects have been processed

## Installation

The watcher is configured as a LaunchAgent and will start automatically on login.

### Start the watcher:
```bash
launchctl load ~/Library/LaunchAgents/com.hilmes.projects-watcher.plist
```

### Stop the watcher:
```bash
launchctl unload ~/Library/LaunchAgents/com.hilmes.projects-watcher.plist
```

### Check status:
```bash
launchctl list | grep projects-watcher
```

### View logs:
```bash
tail -f ~/logs/projects-watcher.log
```

## How It Works

1. **Monitors** `/Users/hilmes/Projects` directory
2. **Detects** new subdirectories
3. **Checks** if it's a Node.js project (has package.json)
4. **Adds** unified logging if not already present:
   - Creates symlink to `@hilmes/unified-logging`
   - Adds `unified-logging-init.js` file
   - Updates `.gitignore`
5. **Notifies** via macOS notification

## Creating New Projects

### Option 1: Use the project template
```bash
~/create-project.sh my-new-project
```

This creates a new project with:
- Express server setup
- Unified logging pre-configured
- Basic file structure
- README with instructions

### Option 2: Create manually
```bash
mkdir ~/Projects/my-project
cd ~/Projects/my-project
npm init -y
# Watcher will automatically add unified logging within 5 seconds
```

## Manual Integration

If you need to manually add unified logging to an existing project:

```bash
# From home directory
make deploy-all

# Or for a specific project
cd ~/Projects/my-project
ln -s ~/unified-logging-module node_modules/@hilmes/unified-logging
```

## Troubleshooting

### Watcher not running
```bash
# Check if it's loaded
launchctl list | grep projects-watcher

# Reload if needed
launchctl unload ~/Library/LaunchAgents/com.hilmes.projects-watcher.plist
launchctl load ~/Library/LaunchAgents/com.hilmes.projects-watcher.plist
```

### Check watcher state
```bash
cat ~/.projects-watcher-state.json
```

### View watcher logs
```bash
tail -f ~/logs/projects-watcher.log
tail -f ~/logs/projects-watcher-error.log
```

## Configuration

The watcher configuration is in:
- Script: `~/projects-watcher.js`
- LaunchAgent: `~/Library/LaunchAgents/com.hilmes.projects-watcher.plist`

To modify check interval or other settings, edit the script and reload the LaunchAgent.