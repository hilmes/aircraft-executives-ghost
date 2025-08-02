// Aircraft Executives - Enhanced Static Site
// Serves optimized content while Ghost CMS backend is configured

// Serve static Ghost content and admin interface
module.exports = async (req, res) => {
  const { url } = req;
  console.log('Ghost-static handler called for:', url);
  
  // Enable CORS for Ghost admin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }
  
  try {
    // Handle Ghost admin routes
    if (url.startsWith('/ghost/')) {
      res.setHeader('Content-Type', 'text/html');
      res.statusCode = 200;
      return res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Aircraft Executives - Ghost Admin</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; background: #f8f9fa; }
            .container { max-width: 600px; margin: 100px auto; padding: 40px; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
            .logo { width: 200px; margin-bottom: 30px; }
            h1 { color: #2d3748; margin-bottom: 20px; }
            p { color: #718096; line-height: 1.6; margin-bottom: 30px; }
            .btn { background: #3182ce; color: white; padding: 12px 24px; border: none; border-radius: 6px; text-decoration: none; display: inline-block; }
            .status { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="/assets/images/color_logo_transparent.png" alt="Aircraft Executives" class="logo">
            <h1>Ghost Admin Interface</h1>
            <p>The Ghost CMS admin interface is being set up for your Aircraft Executives website.</p>
            <div class="status">
              <strong>Status:</strong> Configuration in progress<br>
              <strong>Theme:</strong> Aircraft Executives Enhanced<br>
              <strong>Features:</strong> SEO Optimized, Mobile Responsive, Trust Indicators
            </div>
            <p>For immediate access to your enhanced website, visit the main site.</p>
            <a href="/" class="btn">View Website</a>
          </div>
        </body>
        </html>
      `);
    }
    
    // Serve the new optimized homepage design
    const fs = require('fs');
    const path = require('path');
    
    try {
      const optimizedHomepage = fs.readFileSync(
        path.join(__dirname, '..', 'elite-aircraft-homepage-with-chat.html'), 
        'utf8'
      );
      res.setHeader('Content-Type', 'text/html');
      res.statusCode = 200;
      return res.end(optimizedHomepage);
    } catch (error) {
      console.error('Error loading optimized homepage:', error);
      // Fallback to basic version
      res.setHeader('Content-Type', 'text/html');
      res.statusCode = 200;
      return res.end(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Elite Aircraft Brokerage - Loading...</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 60px 20px; text-align: center; color: #333; }
            h1 { font-size: 2.5rem; font-weight: 200; margin-bottom: 20px; }
            p { font-size: 1.1rem; color: #666; max-width: 600px; margin: 0 auto 40px; line-height: 1.6; }
            .loading { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #333; border-radius: 50%; animation: spin 2s linear infinite; margin: 40px auto; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <h1>Elite Aircraft Brokerage</h1>
          <p>Loading the enhanced experience designed with Hara-method minimalism, Jobsian storytelling, interactive WebGL features, and Swiss UX precision...</p>
          <div class="loading"></div>
          <p><a href="/inventory">View Aircraft Inventory</a> | <a href="tel:+14044105638">Call (404) 410-5638</a></p>
          <script>
            // Reload every 3 seconds to try loading the optimized version
            setTimeout(() => window.location.reload(), 3000);
          </script>
        </body>
        </html>
      `);
    }
    
  } catch (error) {
    console.error('Ghost serving error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      error: 'Internal Server Error',
      message: 'Ghost CMS initialization in progress',
      status: 'Please try again in a few moments'
    }));
  }
};