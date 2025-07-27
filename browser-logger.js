// Browser Console Patcher
(function() {
  const API_ENDPOINT = '/api/logs';
  const LOG_BUFFER = [];
  const BUFFER_SIZE = 50;
  const FLUSH_INTERVAL = 2000; // 2 seconds

  // Store original console methods
  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug
  };

  // Patch console methods
  ['log', 'info', 'warn', 'error', 'debug'].forEach(method => {
    console[method] = function(...args) {
      // Call original method
      originalConsole[method].apply(console, args);
      
      // Capture and send to server
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: method,
        source: 'browser',
        message: args.map(arg => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg);
            } catch (e) {
              return String(arg);
            }
          }
          return String(arg);
        }).join(' '),
        metadata: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          referrer: document.referrer
        }
      };
      
      LOG_BUFFER.push(logEntry);
      
      if (LOG_BUFFER.length >= BUFFER_SIZE) {
        flushLogs();
      }
    };
  });

  // Capture window errors
  window.addEventListener('error', (event) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      source: 'browser-error',
      message: event.message,
      metadata: {
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack,
        url: window.location.href
      }
    };
    LOG_BUFFER.push(logEntry);
  });

  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      source: 'browser-promise',
      message: event.reason?.toString() || 'Unhandled promise rejection',
      metadata: {
        reason: event.reason,
        promise: String(event.promise),
        url: window.location.href
      }
    };
    LOG_BUFFER.push(logEntry);
  });

  // Flush logs to server
  async function flushLogs() {
    if (LOG_BUFFER.length === 0) return;
    
    const logsToSend = LOG_BUFFER.splice(0, LOG_BUFFER.length);
    
    try {
      await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ logs: logsToSend })
      });
    } catch (error) {
      // If sending fails, put logs back in buffer
      LOG_BUFFER.unshift(...logsToSend);
      originalConsole.error('Failed to send logs to server:', error);
    }
  }

  // Periodic flush
  setInterval(flushLogs, FLUSH_INTERVAL);

  // Flush on page unload
  window.addEventListener('beforeunload', () => {
    // Use sendBeacon for reliability on page unload
    if (navigator.sendBeacon && LOG_BUFFER.length > 0) {
      const blob = new Blob([JSON.stringify({ logs: LOG_BUFFER })], { type: 'application/json' });
      navigator.sendBeacon(API_ENDPOINT, blob);
    }
  });

  // Expose flush method globally
  window.__flushLogs = flushLogs;
})();