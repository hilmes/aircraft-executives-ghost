#!/usr/bin/env node

// Aircraft Executives - Unified Development Server
// Integrates Hara-themed Ghost site with Executive Inventory Interface

const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');

// Import our handlers
const siteHandler = require('./api/ghost-static.js');
const inventoryHandler = require('./aircraft-inventory-server.js');

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

// Create unified HTTP server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  console.log(`${new Date().toISOString()} - ${req.method} ${pathname}`);
  
  try {
    // Route inventory interface requests
    if (pathname === '/inventory' || pathname.startsWith('/api/aircraft') || 
        pathname.startsWith('/api/calculate-roi') || pathname.startsWith('/api/market-intelligence') ||
        pathname.startsWith('/api/plan-route') || pathname.startsWith('/api/compare') ||
        pathname.startsWith('/api/realtime') || pathname.startsWith('/api/analytics')) {
      
      // Serve inventory interface HTML for /inventory
      if (pathname === '/inventory') {
        try {
          const inventoryHTML = fs.readFileSync(path.join(__dirname, 'aircraft-inventory-interface.html'), 'utf8');
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html');
          return res.end(inventoryHTML);
        } catch (error) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/html');
          return res.end('<h1>Inventory Interface Not Found</h1><p>The aircraft inventory interface file is missing.</p>');
        }
      }
      
      // Handle API requests through inventory handler
      const inventoryServer = new inventoryHandler();
      return inventoryServer.handleRequest(req, res);
    }
    
    // Serve static assets (CSS, JS, images)
    if (pathname.startsWith('/assets/') || pathname.endsWith('.css') || 
        pathname.endsWith('.js') || pathname.endsWith('.png') || 
        pathname.endsWith('.jpg') || pathname.endsWith('.svg')) {
      const filePath = path.join(__dirname, pathname);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(pathname);
        const contentType = {
          '.css': 'text/css',
          '.js': 'application/javascript',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.svg': 'image/svg+xml'
        }[ext] || 'text/plain';
        
        res.statusCode = 200;
        res.setHeader('Content-Type', contentType);
        return res.end(fs.readFileSync(filePath));
      }
    }
    
    // Default to Hara-themed Ghost site handler
    console.log('Serving homepage via siteHandler');
    await siteHandler(req, res);
    
  } catch (error) {
    console.error('Server error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      error: 'Internal Server Error',
      message: error.message 
    }));
  }
});

// Start unified server
server.listen(PORT, HOST, () => {
  console.log('✈️  Executive Aviation Intelligence Platform');
  console.log('=' .repeat(60));
  console.log(`🚀 Server running at: http://${HOST}:${PORT}`);
  console.log(`🎨 Hara-themed Site: http://${HOST}:${PORT}/`);
  console.log(`📊 Inventory Interface: http://${HOST}:${PORT}/inventory`);
  console.log(`🎯 Ghost Admin: http://${HOST}:${PORT}/ghost/`);
  console.log('=' .repeat(60));
  console.log('');
  console.log('🎨 Hara Design Features:');
  console.log('   • Ma (Emptiness) - Maximized breathing room');
  console.log('   • Material Honesty - Pure color palette');
  console.log('   • Sustainable Typography - Systematic hierarchy');
  console.log('   • Japanese Aesthetic Principles');
  console.log('');
  console.log('📊 Executive Inventory Features:');
  console.log('   • WebGL 3D Aircraft Visualization');
  console.log('   • Real-time Business Intelligence');
  console.log('   • Mission-driven Aircraft Selection');
  console.log('   • Interactive Route Planning');
  console.log('');
  console.log('🌐 API Endpoints:');
  console.log('   • GET  /api/aircraft - List aircraft');
  console.log('   • POST /api/calculate-roi - ROI calculations');
  console.log('   • GET  /api/market-intelligence - Market data');
  console.log('   • POST /api/plan-route - Route planning');
  console.log('');
  console.log('📱 Fully responsive across all devices');
  console.log('🔍 Schema markup and SEO optimized');
  console.log('');
  console.log('Press Ctrl+C to stop the server');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Aircraft Executives local server...');
  server.close(() => {
    console.log('✅ Server stopped gracefully');
    process.exit(0);
  });
});

// Handle errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Try a different port:`);
    console.error(`   PORT=3001 node local-server.js`);
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});