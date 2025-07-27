# Unified Logging System

A comprehensive logging solution that captures all output streams from browser, server, SQL queries, and system processes into a single tailable log file.

## Features

- **Browser Console Patching**: Intercepts all console.log calls and forwards them to server
- **Server Log Aggregation**: Captures stdout, stderr, and all console methods
- **SQL Query Logging**: Logs all database queries with execution time
- **HTTP Request Logging**: Automatic logging of all HTTP requests/responses
- **Unified Log File**: All logs flow to a single JSON-formatted file
- **Real-time Tailing**: Easy-to-use Makefile commands for monitoring

## Quick Start

1. **Install dependencies**:
   ```bash
   make install
   ```

2. **Include browser logger in your HTML**:
   ```html
   <script src="/browser-logger.js"></script>
   ```

3. **Integrate with your Express app**:
   ```javascript
   const { UnifiedLogger, SQLLogger, middleware } = require('./log-server');
   const logger = new UnifiedLogger();
   app.use(middleware(logger));
   ```

4. **Tail logs**:
   ```bash
   make tail-logs
   ```

## Makefile Commands

- `make tail-logs` - Show last 50 lines and follow new output
- `make tail-logs-pretty` - Pretty-print JSON logs
- `make tail-errors` - Show only errors
- `make tail-sql` - Show only SQL queries
- `make tail-http` - Show only HTTP requests
- `make tail-browser` - Show only browser logs
- `make log-stats` - Display log statistics
- `make search-logs SEARCH="keyword"` - Search logs
- `make clear-logs` - Clear log file

## Components

### UnifiedLogger (unified-logger.js)
- Captures all Node.js output streams
- Writes to unified JSON log file
- Handles process errors and exceptions

### Browser Logger (browser-logger.js)
- Patches console methods in browser
- Batches and sends logs to server
- Captures window errors and unhandled promises

### SQL Logger (sql-logger.js)
- Wraps database clients (PostgreSQL, MySQL, MongoDB)
- Logs queries with execution time
- Captures query errors

### Log Server (log-server.js)
- Express middleware for log aggregation
- REST endpoint for browser logs
- HTTP request/response logging

## Log Format

Each log entry is a JSON object:
```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "level": "info",
  "source": "console",
  "message": "User logged in",
  "metadata": {
    "userId": 123,
    "duration": 45
  },
  "pid": 12345
}
```

## Integration Examples

See `example-integration.js` for complete examples of:
- Express app integration
- PostgreSQL logging
- MySQL logging
- Error handling

## Production Tips

1. **Log Rotation**: Use logrotate for production:
   ```
   /path/to/logs/unified.log {
     daily
     rotate 7
     compress
     delaycompress
     notifempty
   }
   ```

2. **Performance**: Browser logger batches requests to minimize overhead

3. **Security**: Sanitize sensitive data before logging

4. **Monitoring**: Set up alerts for error patterns in logs