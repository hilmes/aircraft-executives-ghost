// Log Aggregation Server
const express = require('express');
const UnifiedLogger = require('./unified-logger');
const SQLLogger = require('./sql-logger');

class LogServer {
  constructor(port = 3001) {
    this.app = express();
    this.port = port;
    this.logger = new UnifiedLogger();
    this.sqlLogger = new SQLLogger(this.logger);
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(express.json({ limit: '10mb' }));
    
    // Log all HTTP requests
    this.app.use((req, res, next) => {
      const startTime = Date.now();
      
      // Capture the original end method
      const originalEnd = res.end;
      
      res.end = function(...args) {
        const duration = Date.now() - startTime;
        
        this.logger.log('info', 'http', `${req.method} ${req.path}`, {
          method: req.method,
          path: req.path,
          query: req.query,
          statusCode: res.statusCode,
          duration,
          userAgent: req.headers['user-agent'],
          ip: req.ip || req.connection.remoteAddress
        });
        
        originalEnd.apply(res, args);
      }.bind(this);
      
      next();
    });
  }

  setupRoutes() {
    // Browser log endpoint
    this.app.post('/api/logs', (req, res) => {
      const { logs } = req.body;
      
      if (Array.isArray(logs)) {
        logs.forEach(log => {
          this.logger.log(log.level, log.source, log.message, log.metadata);
        });
      }
      
      res.status(200).json({ success: true });
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', uptime: process.uptime() });
    });
  }

  // Helper method to integrate with Express apps
  static middleware(logger) {
    return (req, res, next) => {
      // Attach logger to request
      req.logger = logger;
      
      // Override res.json to log responses
      const originalJson = res.json.bind(res);
      res.json = function(data) {
        logger.log('debug', 'response', 'JSON response', {
          path: req.path,
          data: JSON.stringify(data).substring(0, 1000) // Limit size
        });
        return originalJson(data);
      };
      
      next();
    };
  }

  start() {
    this.server = this.app.listen(this.port, () => {
      this.logger.log('info', 'server', `Log server started on port ${this.port}`);
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
      this.logger.close();
    }
  }
}

// Export for use in existing Express apps
module.exports = {
  LogServer,
  UnifiedLogger,
  SQLLogger,
  middleware: LogServer.middleware
};