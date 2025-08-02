const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  if (req.url === '/') {
    try {
      const homepage = fs.readFileSync(
        path.join(__dirname, 'elite-aircraft-homepage-optimized.html'), 
        'utf8'
      );
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(homepage);
    } catch (error) {
      console.error('Error:', error);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<h1>Error loading homepage</h1><pre>' + error.message + '</pre>');
    }
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

const PORT = 5001;
server.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
});