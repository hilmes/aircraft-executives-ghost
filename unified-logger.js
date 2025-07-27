// Unified Logger - Server Side
const fs = require('fs');
const path = require('path');
const { createWriteStream } = require('fs');
const { format } = require('util');

class UnifiedLogger {
  constructor(logFile = 'logs/unified.log') {
    this.logFile = path.resolve(logFile);
    this.ensureLogDirectory();
    this.stream = createWriteStream(this.logFile, { flags: 'a' });
    this.setupProcessCapture();
  }

  ensureLogDirectory() {
    const dir = path.dirname(this.logFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  log(level, source, message, metadata = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      source,
      message,
      metadata,
      pid: process.pid
    };
    
    this.stream.write(JSON.stringify(logEntry) + '\n');
  }

  setupProcessCapture() {
    // Capture stdout
    const originalStdoutWrite = process.stdout.write;
    process.stdout.write = (chunk, encoding, callback) => {
      this.log('info', 'stdout', chunk.toString().trim());
      return originalStdoutWrite.call(process.stdout, chunk, encoding, callback);
    };

    // Capture stderr
    const originalStderrWrite = process.stderr.write;
    process.stderr.write = (chunk, encoding, callback) => {
      this.log('error', 'stderr', chunk.toString().trim());
      return originalStderrWrite.call(process.stderr, chunk, encoding, callback);
    };

    // Capture console methods
    const consoleMethods = ['log', 'info', 'warn', 'error', 'debug'];
    consoleMethods.forEach(method => {
      const original = console[method];
      console[method] = (...args) => {
        this.log(method, 'console', format(...args));
        original.apply(console, args);
      };
    });

    // Capture uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.log('error', 'uncaughtException', error.message, { stack: error.stack });
    });

    // Capture unhandled rejections
    process.on('unhandledRejection', (reason, promise) => {
      this.log('error', 'unhandledRejection', reason?.toString() || 'Unknown reason', { promise });
    });
  }

  close() {
    this.stream.end();
  }
}

module.exports = UnifiedLogger;