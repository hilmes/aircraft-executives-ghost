// SQL Query Logger
class SQLLogger {
  constructor(logger) {
    this.logger = logger;
  }

  // For PostgreSQL (pg module)
  wrapPgClient(client) {
    const originalQuery = client.query.bind(client);
    
    client.query = async (...args) => {
      const startTime = Date.now();
      let query, values;
      
      if (typeof args[0] === 'string') {
        query = args[0];
        values = args[1];
      } else if (args[0] && typeof args[0] === 'object') {
        query = args[0].text || args[0].query;
        values = args[0].values;
      }
      
      try {
        const result = await originalQuery(...args);
        const duration = Date.now() - startTime;
        
        this.logger.log('info', 'sql', query, {
          values,
          duration,
          rowCount: result.rowCount,
          command: result.command
        });
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        this.logger.log('error', 'sql-error', query, {
          values,
          duration,
          error: error.message,
          stack: error.stack
        });
        
        throw error;
      }
    };
    
    return client;
  }

  // For MySQL (mysql2 module)
  wrapMysqlConnection(connection) {
    const originalQuery = connection.query.bind(connection);
    const originalExecute = connection.execute.bind(connection);
    
    const wrapMethod = (method) => {
      return function(...args) {
        const startTime = Date.now();
        const sql = args[0];
        const values = args[1];
        
        const originalCallback = args[args.length - 1];
        const hasCallback = typeof originalCallback === 'function';
        
        const logResult = (error, results) => {
          const duration = Date.now() - startTime;
          
          if (error) {
            this.logger.log('error', 'sql-error', sql, {
              values,
              duration,
              error: error.message,
              stack: error.stack
            });
          } else {
            this.logger.log('info', 'sql', sql, {
              values,
              duration,
              affectedRows: results?.affectedRows,
              insertId: results?.insertId,
              changedRows: results?.changedRows
            });
          }
        };
        
        if (hasCallback) {
          args[args.length - 1] = (error, results, fields) => {
            logResult(error, results);
            originalCallback(error, results, fields);
          };
          return method.apply(this, args);
        } else {
          // Promise-based
          return method.apply(this, args).then(
            (results) => {
              logResult(null, results[0]);
              return results;
            },
            (error) => {
              logResult(error, null);
              throw error;
            }
          );
        }
      };
    };
    
    connection.query = wrapMethod(originalQuery);
    connection.execute = wrapMethod(originalExecute);
    
    return connection;
  }

  // For Sequelize
  wrapSequelize(sequelize) {
    sequelize.options.logging = (sql, timing) => {
      this.logger.log('info', 'sql', sql, {
        duration: timing,
        dialect: sequelize.options.dialect
      });
    };
    
    sequelize.options.benchmark = true;
    return sequelize;
  }

  // For MongoDB
  wrapMongoCollection(collection) {
    const methods = ['find', 'findOne', 'insertOne', 'insertMany', 'updateOne', 'updateMany', 'deleteOne', 'deleteMany', 'aggregate'];
    
    methods.forEach(method => {
      if (collection[method]) {
        const original = collection[method].bind(collection);
        
        collection[method] = function(...args) {
          const startTime = Date.now();
          const operation = {
            collection: collection.collectionName,
            method,
            args: args.map(arg => JSON.stringify(arg))
          };
          
          const result = original(...args);
          
          // Handle cursor methods
          if (result && typeof result.toArray === 'function') {
            const originalToArray = result.toArray.bind(result);
            result.toArray = async function() {
              try {
                const docs = await originalToArray();
                const duration = Date.now() - startTime;
                
                this.logger.log('info', 'mongodb', `${collection.collectionName}.${method}`, {
                  ...operation,
                  duration,
                  count: docs.length
                });
                
                return docs;
              } catch (error) {
                const duration = Date.now() - startTime;
                
                this.logger.log('error', 'mongodb-error', `${collection.collectionName}.${method}`, {
                  ...operation,
                  duration,
                  error: error.message
                });
                
                throw error;
              }
            }.bind(this);
          }
          
          return result;
        }.bind(this);
      }
    });
    
    return collection;
  }
}

module.exports = SQLLogger;