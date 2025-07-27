# Unified Logging System

# Default log file location
LOG_FILE ?= ~/logs/unified.log

# Create logs directory
logs:
	@mkdir -p logs

# Tail logs with follow - shows last 50 lines and follows new output
tail-logs: logs
	@echo "Tailing unified logs (Ctrl+C to stop)..."
	@tail -n 50 -f $(LOG_FILE)

# Tail logs with JSON pretty printing
tail-logs-pretty: logs
	@echo "Tailing unified logs with JSON formatting (Ctrl+C to stop)..."
	@tail -n 50 -f $(LOG_FILE) | while read line; do echo "$$line" | jq -r '"\(.timestamp) [\(.level)] \(.source): \(.message)"' 2>/dev/null || echo "$$line"; done

# Show only errors
tail-errors: logs
	@echo "Tailing error logs only (Ctrl+C to stop)..."
	@tail -f $(LOG_FILE) | grep -E '"level":"error"' | while read line; do echo "$$line" | jq -r '"\(.timestamp) [\(.level)] \(.source): \(.message)"' 2>/dev/null || echo "$$line"; done

# Show SQL queries only
tail-sql: logs
	@echo "Tailing SQL queries (Ctrl+C to stop)..."
	@tail -f $(LOG_FILE) | grep -E '"source":"sql"' | while read line; do echo "$$line" | jq -r '"\(.timestamp) SQL: \(.message) (duration: \(.metadata.duration)ms)"' 2>/dev/null || echo "$$line"; done

# Show HTTP requests only
tail-http: logs
	@echo "Tailing HTTP requests (Ctrl+C to stop)..."
	@tail -f $(LOG_FILE) | grep -E '"source":"http"' | while read line; do echo "$$line" | jq -r '"\(.timestamp) HTTP: \(.message) (status: \(.metadata.statusCode), duration: \(.metadata.duration)ms)"' 2>/dev/null || echo "$$line"; done

# Show browser logs only
tail-browser: logs
	@echo "Tailing browser logs (Ctrl+C to stop)..."
	@tail -f $(LOG_FILE) | grep -E '"source":"browser"' | while read line; do echo "$$line" | jq -r '"\(.timestamp) BROWSER [\(.level)]: \(.message)"' 2>/dev/null || echo "$$line"; done

# Clear logs
clear-logs:
	@echo "Clearing log file..."
	@> $(LOG_FILE)
	@echo "Logs cleared."

# Show log statistics
log-stats: logs
	@echo "Log Statistics:"
	@echo "Total lines: $$(wc -l < $(LOG_FILE))"
	@echo "Log levels:"
	@cat $(LOG_FILE) | jq -r '.level' 2>/dev/null | sort | uniq -c | sort -nr
	@echo "\nLog sources:"
	@cat $(LOG_FILE) | jq -r '.source' 2>/dev/null | sort | uniq -c | sort -nr

# Search logs (usage: make search-logs SEARCH="keyword")
search-logs: logs
	@if [ -z "$(SEARCH)" ]; then echo "Usage: make search-logs SEARCH=\"keyword\""; exit 1; fi
	@echo "Searching for '$(SEARCH)' in logs..."
	@grep -i "$(SEARCH)" $(LOG_FILE) | tail -n 50 | while read line; do echo "$$line" | jq -r '"\(.timestamp) [\(.level)] \(.source): \(.message)"' 2>/dev/null || echo "$$line"; done

# Follow logs from specific time (usage: make logs-since TIME="2024-01-01T00:00:00")
logs-since: logs
	@if [ -z "$(TIME)" ]; then echo "Usage: make logs-since TIME=\"2024-01-01T00:00:00\""; exit 1; fi
	@echo "Showing logs since $(TIME)..."
	@cat $(LOG_FILE) | while read line; do echo "$$line" | jq -r 'select(.timestamp >= "$(TIME)") | "\(.timestamp) [\(.level)] \(.source): \(.message)"' 2>/dev/null; done

# Install dependencies
install:
	npm install express
	@echo "Dependencies installed. Don't forget to include browser-logger.js in your HTML."

# Start log server
start-log-server:
	@echo "Starting log server on port 3001..."
	@node -e "const { LogServer } = require('./log-server'); const server = new LogServer(); server.start();" 

# Help
help:
	@echo "Unified Logging System Commands:"
	@echo "  make tail-logs       - Tail unified logs (last 50 lines, follows new output)"
	@echo "  make tail-logs-pretty - Tail logs with JSON formatting"
	@echo "  make tail-errors     - Show only error logs"
	@echo "  make tail-sql        - Show only SQL queries"
	@echo "  make tail-http       - Show only HTTP requests"
	@echo "  make tail-browser    - Show only browser logs"
	@echo "  make clear-logs      - Clear log file"
	@echo "  make log-stats       - Show log statistics"
	@echo "  make search-logs SEARCH=\"keyword\" - Search logs"
	@echo "  make logs-since TIME=\"2024-01-01T00:00:00\" - Show logs since time"
	@echo "  make install         - Install dependencies"
	@echo "  make start-log-server - Start standalone log server"
	@echo "  make deploy-all      - Deploy unified logging to all projects"
	@echo "  make start-watcher   - Start projects watcher service"
	@echo "  make stop-watcher    - Stop projects watcher service"
	@echo "  make watcher-status  - Check watcher status"
	@echo "  make create-project NAME=name - Create new project with logging"
	@echo "  make upgrade-all     - Upgrade all projects with enhanced tracking"

# Deploy unified logging to all projects
deploy-all:
	@echo "Deploying unified logging to all projects..."
	@bash ~/deploy-unified-logging-to-all.sh

# Start projects watcher
start-watcher:
	@echo "Starting projects watcher..."
	@launchctl load ~/Library/LaunchAgents/com.hilmes.projects-watcher.plist 2>/dev/null || echo "Watcher already running"
	@echo "Watcher started. Check status with: make watcher-status"

# Stop projects watcher
stop-watcher:
	@echo "Stopping projects watcher..."
	@launchctl unload ~/Library/LaunchAgents/com.hilmes.projects-watcher.plist 2>/dev/null || echo "Watcher not running"

# Check watcher status
watcher-status:
	@echo "Projects Watcher Status:"
	@launchctl list | grep projects-watcher || echo "Watcher not running"
	@echo ""
	@echo "Recent watcher logs:"
	@tail -5 ~/logs/projects-watcher.log 2>/dev/null || echo "No logs found"

# Create new project with unified logging
create-project:
	@if [ -z "$(NAME)" ]; then echo "Usage: make create-project NAME=project-name"; exit 1; fi
	@bash ~/create-project.sh $(NAME)

# Upgrade all projects with enhanced tracking
upgrade-all:
	@echo "Upgrading all projects with enhanced startup tracking..."
	@bash ~/upgrade-all-projects.sh

.PHONY: tail-logs tail-logs-pretty tail-errors tail-sql tail-http tail-browser clear-logs log-stats search-logs logs-since install start-log-server help logs deploy-all start-watcher stop-watcher watcher-status create-project upgrade-all