// Example: How to use the new startup tracking in your projects

const express = require('express');
const { 
  logger,
  tracker,
  trackPhase,
  trackPhaseAsync,
  trackExpressApp,
  completeStartup,
  wrapMethod
} = require('./unified-logging-init');

const app = express();

// Example service with methods to track
class UserService {
  async findUser(id) {
    // Simulate database query
    await new Promise(resolve => setTimeout(resolve, 100));
    return { id, name: 'John Doe' };
  }

  async createUser(data) {
    // Simulate database operation
    await new Promise(resolve => setTimeout(resolve, 200));
    return { id: Date.now(), ...data };
  }
}

// Main startup function
async function startApp() {
  // Track configuration loading
  const config = trackPhase('Load Configuration', () => {
    // Your config loading logic
    return {
      port: process.env.PORT || 3000,
      db: process.env.DATABASE_URL || 'postgresql://localhost/myapp'
    };
  });

  // Track database connection
  const db = await trackPhaseAsync('Database Connection', async () => {
    // Your database connection logic
    console.log('Connecting to database...');
    await new Promise(resolve => setTimeout(resolve, 500));
    return { connected: true };
  });

  // Track service initialization
  const userService = trackPhase('Initialize Services', () => {
    const service = new UserService();
    
    // Wrap methods for automatic tracking
    wrapMethod(service, 'findUser', 'UserService');
    wrapMethod(service, 'createUser', 'UserService');
    
    return service;
  });

  // Track Express setup
  trackPhase('Express Middleware', () => {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Enable Express route tracking
    trackExpressApp(app);
  });

  // Define routes
  trackPhase('Define Routes', () => {
    app.get('/', (req, res) => {
      res.json({ message: 'Welcome to the tracked application!' });
    });

    app.get('/user/:id', async (req, res) => {
      try {
        const user = await userService.findUser(req.params.id);
        res.json(user);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.post('/user', async (req, res) => {
      try {
        const user = await userService.createUser(req.body);
        res.status(201).json(user);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.get('/metrics', (req, res) => {
      res.json(tracker.getMetrics());
    });
  });

  // Start server
  await trackPhaseAsync('Start Server', async () => {
    return new Promise((resolve) => {
      app.listen(config.port, () => {
        console.log(`Server running on port ${config.port}`);
        resolve();
      });
    });
  });

  // Complete startup
  const startupReport = completeStartup();
  
  // Start periodic metrics reporting (every 30 seconds for demo)
  tracker.startMetricsReporter(30000);
  
  logger.log('info', 'Application ready', {
    port: config.port,
    startup: startupReport
  });
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  logger.log('error', 'Unhandled Rejection', {
    reason: reason.toString(),
    stack: reason.stack
  });
});

process.on('uncaughtException', (error) => {
  logger.log('error', 'Uncaught Exception', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

// Start the application
startApp().catch(error => {
  logger.log('error', 'Failed to start application', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

/*
This example demonstrates:

1. **Startup Phase Tracking**: Each major initialization step is tracked
2. **Method Wrapping**: Service methods are automatically tracked for performance
3. **Express Integration**: All routes are tracked for response times and status codes
4. **Metrics Endpoint**: Access real-time metrics at /metrics
5. **Error Handling**: Comprehensive error logging

The startup will produce:
- A startup report in .analyzer-cache/startup-report.md
- Method analysis in .analyzer-cache/methods-summary.json
- Real-time metrics in the unified log
- Console output showing startup phases and timing

To view logs:
  make tail-logs      # All logs
  make tail-errors    # Only errors
  make log-stats      # Statistics

To test:
  curl http://localhost:3000/
  curl http://localhost:3000/user/123
  curl -X POST http://localhost:3000/user -H "Content-Type: application/json" -d '{"name":"Test"}'
  curl http://localhost:3000/metrics
*/