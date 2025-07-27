// Example integration with existing Express app
const express = require('express');
const { UnifiedLogger, SQLLogger, middleware } = require('./log-server');
const pg = require('pg');
const mysql = require('mysql2');

// Initialize logger
const logger = new UnifiedLogger();
const sqlLogger = new SQLLogger(logger);

// Example Express app
const app = express();

// Add logging middleware
app.use(middleware(logger));

// Example PostgreSQL integration
async function setupPostgres() {
  const client = new pg.Client({
    host: 'localhost',
    database: 'mydb',
    user: 'myuser',
    password: 'mypass'
  });
  
  // Wrap client with SQL logging
  sqlLogger.wrapPgClient(client);
  
  await client.connect();
  return client;
}

// Example MySQL integration
function setupMySQL() {
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'mydb'
  });
  
  // Wrap connection with SQL logging
  sqlLogger.wrapMysqlConnection(connection);
  
  return connection;
}

// Example route with logging
app.get('/api/users', async (req, res) => {
  // This will be automatically logged
  console.log('Fetching users');
  
  try {
    // SQL queries will be automatically logged
    const pgClient = await setupPostgres();
    const result = await pgClient.query('SELECT * FROM users');
    
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.log('info', 'server', `Application started on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.log('info', 'server', 'Received SIGTERM, shutting down gracefully');
  logger.close();
  process.exit(0);
});