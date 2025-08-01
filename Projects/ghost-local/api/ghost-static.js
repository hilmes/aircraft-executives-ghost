// Alternative: Static Ghost content serving
const { readFileSync, existsSync } = require('fs');
const { join } = require('path');

// Serve static Ghost content and admin interface
module.exports = async (req, res) => {
  const { url } = req;
  
  // Enable CORS for Ghost admin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Handle Ghost admin routes
    if (url.startsWith('/ghost/')) {
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(`
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
    
    // Serve main website with enhanced theme preview
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Aircraft Executives - Elite Aviation Brokerage</title>
        <meta name="description" content="Elite aircraft brokerage specializing in luxury jets and turboprops. IADA accredited with $2.8B+ in transactions.">
        
        <!-- Enhanced SEO -->
        <meta property="og:title" content="Aircraft Executives - Elite Aviation Brokerage">
        <meta property="og:description" content="Elite aircraft brokerage specializing in luxury jets and turboprops. IADA accredited with $2.8B+ in transactions.">
        <meta property="og:type" content="website">
        
        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
        
        <!-- Schema Markup -->
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Aircraft Executives",
          "url": "https://aircraftexecutives.vercel.app",
          "description": "Elite aircraft brokerage specializing in luxury jets and turboprops",
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+1-404-410-5638",
            "contactType": "sales"
          },
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "3595 McCall Place",
            "addressLocality": "Atlanta",
            "addressRegion": "GA",
            "postalCode": "30340",
            "addressCountry": "US"
          }
        }
        </script>
        
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #2d3748; }
          
          /* Trust Banner */
          .trust-banner { background: #f8f9fa; padding: 12px 0; text-align: center; font-size: 14px; border-bottom: 1px solid #e2e8f0; }
          .trust-content { display: flex; justify-content: center; align-items: center; gap: 30px; flex-wrap: wrap; }
          .trust-item { display: flex; align-items: center; gap: 8px; }
          .trust-item img { height: 24px; }
          .metric { font-weight: 600; color: #3182ce; }
          
          /* Header */
          .header { background: rgba(255,255,255,0.95); padding: 16px 0; position: sticky; top: 0; z-index: 100; backdrop-filter: blur(10px); box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .nav { display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto; padding: 0 20px; }
          .logo { font-size: 24px; font-weight: 700; color: #2d3748; text-decoration: none; }
          .nav-links { display: flex; gap: 30px; align-items: center; }
          .nav-links a { text-decoration: none; color: #4a5568; font-weight: 500; transition: color 0.2s; }
          .nav-links a:hover { color: #3182ce; }
          .btn-primary { background: #3182ce; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 500; transition: background 0.2s; }
          .btn-primary:hover { background: #2c5aa0; }
          
          /* Hero */
          .hero { background: linear-gradient(135deg, #1a365d 0%, #2c5aa0 100%); color: white; padding: 100px 0; text-align: center; }
          .hero-content { max-width: 800px; margin: 0 auto; padding: 0 20px; }
          .hero h1 { font-size: 3.5rem; font-weight: 700; margin-bottom: 20px; font-family: 'Playfair Display', serif; }
          .hero p { font-size: 1.25rem; margin-bottom: 40px; opacity: 0.9; }
          .hero-actions { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; }
          .btn-large { padding: 16px 32px; font-size: 18px; }
          .btn-outline { background: transparent; border: 2px solid white; color: white; }
          .btn-outline:hover { background: white; color: #3182ce; }
          
          /* Features */
          .features { padding: 100px 0; background: white; }
          .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
          .section-title { font-size: 2.5rem; text-align: center; margin-bottom: 20px; font-family: 'Playfair Display', serif; }
          .section-subtitle { text-align: center; font-size: 1.2rem; color: #718096; margin-bottom: 60px; }
          .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; }
          .feature-card { text-align: center; padding: 40px 20px; }
          .feature-card h3 { font-size: 1.5rem; margin-bottom: 15px; }
          .feature-card p { color: #718096; }
          
          /* CTA */
          .cta { background: #f8f9fa; padding: 80px 0; text-align: center; }
          .cta h2 { font-size: 2.5rem; margin-bottom: 20px; }
          .cta p { font-size: 1.2rem; color: #718096; margin-bottom: 40px; }
          
          /* Footer */
          .footer { background: #2d3748; color: white; padding: 60px 0 30px; }
          .footer-content { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 40px; margin-bottom: 40px; }
          .footer h4 { margin-bottom: 20px; }
          .footer a { color: #cbd5e0; text-decoration: none; }
          .footer a:hover { color: white; }
          .footer-bottom { text-align: center; padding-top: 30px; border-top: 1px solid #4a5568; color: #a0aec0; }
          
          /* Responsive */
          @media (max-width: 768px) {
            .trust-content { flex-direction: column; gap: 15px; }
            .nav-links { display: none; }
            .hero h1 { font-size: 2.5rem; }
            .hero-actions { flex-direction: column; align-items: center; }
          }
        </style>
      </head>
      <body>
        <!-- Trust Banner -->
        <div class="trust-banner">
          <div class="trust-content">
            <div class="trust-item">
              <span>🏆</span>
              <span>IADA Accredited Dealer</span>
            </div>
            <div class="trust-item">
              <span class="metric">$2.8B+</span>
              <span>in Aircraft Transactions</span>
            </div>
            <div class="trust-item">
              <span class="metric">98%</span>
              <span>Client Satisfaction</span>
            </div>
          </div>
        </div>
        
        <!-- Header -->
        <header class="header">
          <nav class="nav">
            <a href="/" class="logo">Aircraft Executives</a>
            <div class="nav-links">
              <a href="/inventory">Inventory</a>
              <a href="/sell">Sell Aircraft</a>
              <a href="/about">About</a>
              <a href="/contact">Contact</a>
              <a href="tel:+14044105638" class="btn-primary">Call (404) 410-5638</a>
            </div>
          </nav>
        </header>
        
        <!-- Hero -->
        <section class="hero">
          <div class="hero-content">
            <h1>Elite Aircraft Brokerage</h1>
            <p>Exclusive access to off-market opportunities and white-glove transaction management for discerning aircraft owners.</p>
            <div class="hero-actions">
              <a href="/inventory" class="btn-primary btn-large">View Available Aircraft</a>
              <a href="/sell" class="btn-outline btn-large">Sell Your Aircraft</a>
            </div>
          </div>
        </section>
        
        <!-- Features -->
        <section class="features">
          <div class="container">
            <h2 class="section-title">Why Choose Aircraft Executives</h2>
            <p class="section-subtitle">Trusted expertise in luxury aviation transactions</p>
            <div class="features-grid">
              <div class="feature-card">
                <h3>🎯 Expert Acquisition</h3>
                <p>Market analysis to closing, ensuring you find the perfect aircraft at the right price with comprehensive due diligence.</p>
              </div>
              <div class="feature-card">
                <h3>📈 Global Marketing</h3>
                <p>Maximum exposure through our international network with professional marketing and qualified buyer screening.</p>
              </div>
              <div class="feature-card">
                <h3>🔍 Market Intelligence</h3>
                <p>Data-driven valuations and market insights to support informed decision-making and optimal timing.</p>
              </div>
            </div>
          </div>
        </section>
        
        <!-- CTA -->
        <section class="cta">
          <div class="container">
            <h2>Ready to Elevate Your Aircraft Experience?</h2>
            <p>Whether buying or selling, our team ensures a seamless, confidential transaction</p>
            <div class="hero-actions">
              <a href="tel:+14044105638" class="btn-primary btn-large">Call (404) 410-5638</a>
              <a href="mailto:sales@aircraftexecutives.com" class="btn-outline btn-large">Email Us</a>
            </div>
          </div>
        </section>
        
        <!-- Footer -->
        <footer class="footer">
          <div class="container">
            <div class="footer-content">
              <div>
                <h4>Aircraft Executives</h4>
                <p>Elite aviation brokerage specializing in luxury jets and turboprops. IADA accredited with global reach.</p>
              </div>
              <div>
                <h4>Contact</h4>
                <p><a href="tel:+14044105638">(404) 410-5638</a></p>
                <p><a href="mailto:sales@aircraftexecutives.com">sales@aircraftexecutives.com</a></p>
                <p>3595 McCall Place<br>Atlanta, GA 30340</p>
              </div>
              <div>
                <h4>Services</h4>
                <p><a href="/inventory">Aircraft Inventory</a></p>
                <p><a href="/sell">Sell Your Aircraft</a></p>
                <p><a href="/valuation">Aircraft Valuation</a></p>
                <p><a href="/market-analysis">Market Analysis</a></p>
              </div>
            </div>
            <div class="footer-bottom">
              <p>&copy; 2024 Aircraft Executives. All rights reserved. | Enhanced with Claude Code AI</p>
            </div>
          </div>
        </footer>
        
        <!-- Analytics -->
        <script>
          // Track page view
          console.log('Aircraft Executives - Enhanced Ghost Theme Preview Loaded');
          
          // Simple contact form tracking
          document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"]').forEach(link => {
            link.addEventListener('click', () => {
              console.log('Contact initiated:', link.href);
            });
          });
        </script>
      </body>
      </html>
    `);
    
  } catch (error) {
    console.error('Ghost serving error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Ghost CMS initialization in progress',
      status: 'Please try again in a few moments'
    });
  }
};