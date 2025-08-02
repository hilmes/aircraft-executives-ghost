// Aircraft Executives - Enhanced Static Site with Full Routing
// Serves all pages with Hara-method design and chat integration

const fs = require('fs');
const path = require('path');

// Helper function to wrap content in the standard layout
function wrapInLayout(content, title, includeChat = true) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | Aircraft Executives</title>
    <meta name="description" content="Aircraft Executives - Premium aircraft brokerage for ultra-high net worth individuals. ${title}">
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600&display=swap" rel="stylesheet">
    
    <style>
        /* Hara Method Design System - Mobile First */
        :root {
            /* Touch-friendly minimums */
            --touch-min: 2.75rem; /* 44px minimum touch target */
            --thumb-zone: 4.5rem; /* 72px comfortable thumb reach */
            
            /* Ma (Emptiness) - Mobile-first spacing grid */
            --space-unit: 4px; /* Smaller base for mobile */
            --space-xs: calc(var(--space-unit) * 2);   /* 8px */
            --space-sm: calc(var(--space-unit) * 3);   /* 12px */
            --space-md: calc(var(--space-unit) * 4);   /* 16px */
            --space-lg: calc(var(--space-unit) * 6);   /* 24px */
            --space-xl: calc(var(--space-unit) * 8);   /* 32px */
            --space-2xl: calc(var(--space-unit) * 12); /* 48px */
            --space-3xl: calc(var(--space-unit) * 16); /* 64px */
            --space-4xl: calc(var(--space-unit) * 24); /* 96px */
            
            /* Material Honesty - Surface & Interaction */
            --color-ink: #000000;
            --color-paper: #FFFFFF;
            --color-stone: #F8F9FA;
            --color-ash: #E9ECEF;
            --color-graphite: #495057;
            --color-smoke: #6C757D;
            --color-accent: #007AFF; /* iOS blue for familiar interactions */
            
            /* Glass Material (for mobile overlays) */
            --glass-blur: blur(20px);
            --glass-opacity: 0.85;
            --glass-border: rgba(255, 255, 255, 0.2);
            
            /* Metal Material (for buttons) */
            --metal-gradient: linear-gradient(145deg, #f0f0f0, #d4d4d4);
            --metal-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            --metal-shadow-pressed: inset 0 2px 4px rgba(0, 0, 0, 0.1);
            
            /* Typography - Mobile-optimized scale */
            --type-xs: 0.75rem;   /* 12px */
            --type-sm: 0.875rem;  /* 14px */
            --type-base: 1rem;    /* 16px */
            --type-lg: 1.125rem;  /* 18px */
            --type-xl: 1.25rem;   /* 20px */
            --type-2xl: 1.5rem;   /* 24px */
            --type-3xl: 1.875rem; /* 30px */
            --type-4xl: 2.25rem;  /* 36px */
            
            /* Line heights optimized for mobile reading */
            --leading-tight: 1.25;
            --leading-snug: 1.375;
            --leading-normal: 1.5;
            --leading-relaxed: 1.625;
            
            /* Touch-friendly transitions */
            --transition-touch: 150ms cubic-bezier(0.4, 0.0, 0.2, 1);
            --transition-base: 200ms cubic-bezier(0.4, 0.0, 0.2, 1);
            --transition-slow: 300ms cubic-bezier(0.4, 0.0, 0.2, 1);
            
            /* Layout - Mobile-first containers */
            --container-max: 100%;
            --content-max: 100%;
            --text-max: 100%;
            --container-padding: var(--space-md);
            
            /* Safe areas for modern mobile devices */
            --safe-top: env(safe-area-inset-top, 0);
            --safe-bottom: env(safe-area-inset-bottom, 0);
            --safe-left: env(safe-area-inset-left, 0);
            --safe-right: env(safe-area-inset-right, 0);
        }
        
        /* Progressive enhancement for larger screens */
        @media (min-width: 768px) {
            :root {
                --space-unit: 8px; /* Increase base unit for larger screens */
                --container-max: 768px;
                --content-max: 680px;
                --text-max: 600px;
                --container-padding: var(--space-lg);
            }
        }
        
        @media (min-width: 1024px) {
            :root {
                --container-max: 1024px;
                --content-max: 864px;
                --text-max: 720px;
                --container-padding: var(--space-xl);
            }
        }
        
        @media (min-width: 1280px) {
            :root {
                --container-max: 1280px;
                --content-max: 960px;
                --text-max: 720px;
            }
        }

        /* Reset with material honesty */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html {
            font-size: 16px;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            /* Prevent zoom on input focus on iOS */
            -webkit-text-size-adjust: 100%;
            /* Optimize font rendering for mobile */
            text-rendering: optimizeLegibility;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            font-weight: 300;
            line-height: var(--leading-relaxed);
            color: var(--color-ink);
            background: var(--color-paper);
            letter-spacing: 0.01em;
            /* Prevent horizontal scroll on mobile */
            overflow-x: hidden;
            /* Add safe area support */
            padding-top: var(--safe-top);
            padding-bottom: var(--safe-bottom);
            /* Optimize scrolling on iOS */
            -webkit-overflow-scrolling: touch;
        }

        /* Typography with Japanese restraint */
        h1, h2, h3, h4, h5, h6 {
            font-weight: 200;
            line-height: 1.2;
            letter-spacing: -0.02em;
            margin-bottom: var(--space-md);
        }

        h1 { font-size: var(--type-4xl); }
        h2 { font-size: var(--type-3xl); }
        h3 { font-size: var(--type-2xl); }
        h4 { font-size: var(--type-xl); }
        h5 { font-size: var(--type-lg); }
        h6 { font-size: var(--type-base); }

        p {
            margin-bottom: var(--space-md);
        }

        a {
            color: inherit;
            text-decoration: none;
            transition: opacity var(--transition-base);
        }

        a:hover {
            opacity: 0.7;
        }

        /* Container with Ma (emptiness) - Mobile first */
        .container {
            max-width: var(--container-max);
            margin: 0 auto;
            padding: 0 var(--container-padding);
            /* Add safe area support for modern mobile devices */
            padding-left: max(var(--container-padding), var(--safe-left));
            padding-right: max(var(--container-padding), var(--safe-right));
        }

        .content-container {
            max-width: var(--content-max);
            margin: 0 auto;
            padding: 0 var(--container-padding);
        }

        .text-container {
            max-width: var(--text-max);
            margin: 0 auto;
            padding: 0 var(--container-padding);
        }

        /* Header - Mobile-first minimal presence */
        .header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, var(--glass-opacity));
            backdrop-filter: var(--glass-blur);
            -webkit-backdrop-filter: var(--glass-blur);
            z-index: 1000;
            transition: all var(--transition-base);
            /* Add safe area support for iPhone X+ */
            padding-top: var(--safe-top);
        }

        .header-inner {
            padding: var(--space-sm) 0;
            border-bottom: 1px solid var(--color-ash);
            min-height: var(--thumb-zone); /* Ensure touch-friendly height */
        }

        .nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            font-size: var(--type-lg);
            font-weight: 300;
            letter-spacing: 0.05em;
        }

        .nav-links {
            display: flex;
            gap: var(--space-xl);
            align-items: center;
        }

        .nav-link {
            font-size: var(--type-sm);
            font-weight: 400;
            letter-spacing: 0.02em;
            opacity: 0.8;
            transition: opacity var(--transition-base);
        }

        .nav-link:hover,
        .nav-link.active {
            opacity: 1;
        }

        /* Trust Banner - Whispered credibility */
        .trust-banner {
            background: var(--color-stone);
            padding: var(--space-sm) 0;
            font-size: var(--type-sm);
            letter-spacing: 0.02em;
        }

        .trust-items {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: var(--space-xl);
            flex-wrap: wrap;
        }

        .trust-item {
            display: flex;
            align-items: center;
            gap: var(--space-xs);
            opacity: 0.8;
        }

        .trust-metric {
            font-weight: 400;
        }

        /* Main content area with mobile-friendly spacing */
        .main {
            margin-top: calc(var(--thumb-zone) + var(--safe-top) + var(--space-sm));
            min-height: calc(100vh - var(--thumb-zone) - var(--safe-top) - var(--safe-bottom));
            padding-bottom: var(--safe-bottom);
        }

        /* Page sections with Ma */
        .section {
            padding: var(--space-4xl) 0;
        }

        .section-header {
            text-align: center;
            margin-bottom: var(--space-3xl);
        }

        .section-title {
            font-weight: 200;
            margin-bottom: var(--space-lg);
        }

        .section-subtitle {
            font-size: var(--type-lg);
            color: var(--color-graphite);
            font-weight: 300;
        }

        /* Dividers - Subtle separation */
        .divider {
            width: var(--space-lg);
            height: 1px;
            background: var(--color-ash);
            margin: var(--space-xl) auto;
        }

        .divider-vertical {
            width: 1px;
            height: var(--space-lg);
            background: var(--color-ink);
            margin: var(--space-lg) 0;
        }

        /* Grid system - Systematic layout */
        .grid {
            display: grid;
            gap: var(--space-3xl);
        }

        .grid-2 {
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }

        .grid-3 {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        }

        .grid-4 {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }

        /* Content blocks with breathing room */
        .content-block {
            margin-bottom: var(--space-3xl);
        }

        .content-block-header {
            margin-bottom: var(--space-lg);
        }

        /* Buttons - Minimal intervention */
        .btn {
            display: inline-block;
            padding: var(--space-sm) var(--space-lg);
            font-size: var(--type-sm);
            font-weight: 400;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            border: 1px solid var(--color-ink);
            background: transparent;
            color: var(--color-ink);
            cursor: pointer;
            transition: all var(--transition-base);
        }

        .btn:hover {
            background: var(--color-ink);
            color: var(--color-paper);
        }

        .btn-primary {
            background: var(--color-ink);
            color: var(--color-paper);
        }

        .btn-primary:hover {
            background: transparent;
            color: var(--color-ink);
        }

        /* Forms - Honest inputs */
        .form-group {
            margin-bottom: var(--space-lg);
        }

        .form-label {
            display: block;
            font-size: var(--type-xs);
            font-weight: 400;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--color-graphite);
            margin-bottom: var(--space-xs);
        }

        .form-input,
        .form-textarea,
        .form-select {
            width: 100%;
            padding: var(--space-sm) 0;
            font-family: inherit;
            font-size: var(--type-base);
            font-weight: 300;
            line-height: 1.5;
            color: var(--color-ink);
            background: transparent;
            border: none;
            border-bottom: 1px solid var(--color-ash);
            transition: border-color var(--transition-base);
        }

        .form-input:focus,
        .form-textarea:focus,
        .form-select:focus {
            outline: none;
            border-color: var(--color-ink);
        }

        .form-textarea {
            resize: vertical;
            min-height: 120px;
        }

        /* Cards - Subtle containers */
        .card {
            padding: var(--space-xl);
            background: var(--color-paper);
            transition: all var(--transition-base);
        }

        .card:hover {
            transform: translateY(-2px);
        }

        .card-title {
            font-size: var(--type-xl);
            font-weight: 300;
            margin-bottom: var(--space-md);
        }

        .card-content {
            color: var(--color-graphite);
            line-height: 1.8;
        }

        /* Lists - Clean and organized */
        .list-clean {
            list-style: none;
            padding: 0;
        }

        .list-clean li {
            padding: var(--space-sm) 0;
            border-bottom: 1px solid var(--color-ash);
        }

        .list-clean li:last-child {
            border-bottom: none;
        }

        /* Footer - Quiet closure */
        .footer {
            background: var(--color-stone);
            padding: var(--space-3xl) 0 var(--space-xl);
            margin-top: var(--space-4xl);
        }

        .footer-content {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr;
            gap: var(--space-3xl);
            margin-bottom: var(--space-3xl);
            padding-bottom: var(--space-3xl);
            border-bottom: 1px solid var(--color-ash);
        }

        .footer-section h4 {
            font-size: var(--type-base);
            font-weight: 400;
            margin-bottom: var(--space-md);
        }

        .footer-section p,
        .footer-section a {
            font-size: var(--type-sm);
            color: var(--color-graphite);
            line-height: 1.8;
        }

        .footer-bottom {
            text-align: center;
            font-size: var(--type-xs);
            color: var(--color-smoke);
        }

        /* Chat widget - Minimal presence */
        .chat-widget {
            position: fixed;
            bottom: var(--space-lg);
            right: var(--space-lg);
            z-index: 9999;
        }

        .chat-bubble-trigger {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: var(--color-ink);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all var(--transition-base);
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
        }

        .chat-bubble-trigger:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .chat-bubble-trigger svg {
            width: 24px;
            height: 24px;
            fill: var(--color-paper);
        }

        /* Mobile-specific interface enhancements */
        
        /* Navigation - Hide desktop navigation on mobile (already handled by progressive enhancement) */
        .nav-links {
            display: none;
        }
        
        @media (min-width: 768px) {
            .nav-links {
                display: flex;
            }
        }
        
        /* Touch-friendly interactive elements */
        button, .button, a[role="button"] {
            min-height: var(--touch-min);
            min-width: var(--touch-min);
            padding: var(--space-sm) var(--space-md);
            border-radius: var(--space-xs);
            background: var(--metal-gradient);
            border: 1px solid var(--color-ash);
            box-shadow: var(--metal-shadow);
            transition: var(--transition-touch);
            cursor: pointer;
            font-size: var(--type-sm);
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        
        button:active, .button:active, a[role="button"]:active {
            box-shadow: var(--metal-shadow-pressed);
            transform: translateY(1px);
        }
        
        /* Enhanced button variants */
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: var(--space-sm) var(--space-md);
            border-radius: var(--space-xs);
            text-decoration: none;
            font-size: var(--type-sm);
            font-weight: 400;
            transition: var(--transition-touch);
            border: 1px solid var(--color-ash);
            background: var(--color-paper);
            color: var(--color-ink);
            cursor: pointer;
        }
        
        .btn:hover {
            background: var(--color-stone);
            transform: translateY(-1px);
            box-shadow: var(--metal-shadow);
        }
        
        .btn:active {
            transform: translateY(1px);
            box-shadow: var(--metal-shadow-pressed);
        }
        
        .btn-primary {
            background: var(--color-accent);
            color: white;
            border-color: var(--color-accent);
        }
        
        .btn-primary:hover {
            background: color-mix(in srgb, var(--color-accent) 90%, black);
            border-color: color-mix(in srgb, var(--color-accent) 90%, black);
        }
        
        .btn-secondary {
            background: var(--color-paper);
            color: var(--color-ink);
            border-color: var(--color-ash);
        }
        
        .btn-secondary:hover {
            background: var(--color-stone);
        }
        
        /* Mobile grids - single column by default */
        .grid-2, .grid-3, .grid-4 {
            display: grid;
            grid-template-columns: 1fr;
            gap: var(--space-md);
        }
        
        @media (min-width: 768px) {
            .grid-2 { grid-template-columns: repeat(2, 1fr); }
            .grid-3 { grid-template-columns: repeat(3, 1fr); }
        }
        
        @media (min-width: 1024px) {
            .grid-4 { grid-template-columns: repeat(4, 1fr); }
        }
        
        /* Footer responsive */
        .footer-content {
            display: grid;
            grid-template-columns: 1fr;
            gap: var(--space-xl);
        }
        
        @media (min-width: 768px) {
            .footer-content {
                grid-template-columns: repeat(3, 1fr);
            }
        }

        /* Accessibility */
        :focus-visible {
            outline: 2px solid var(--color-ink);
            outline-offset: 2px;
        }

        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }

        /* Page-specific styles */
        .hero-section {
            padding: var(--space-4xl) 0;
            min-height: 50vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
        }

        .service-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: var(--space-3xl);
        }

        .service-item {
            padding: var(--space-xl) 0;
        }

        .timeline {
            position: relative;
            padding: var(--space-xl) 0;
        }

        .timeline-item {
            display: grid;
            grid-template-columns: 48px 1fr;
            gap: var(--space-lg);
            margin-bottom: var(--space-xl);
        }

        .timeline-marker {
            width: 32px;
            height: 32px;
            border: 1px solid var(--color-ink);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: var(--type-sm);
            font-weight: 300;
        }

        .values-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: var(--space-xl);
            text-align: center;
        }

        .value-item {
            padding: var(--space-lg);
        }

        .value-dot {
            width: 8px;
            height: 8px;
            background: var(--color-ink);
            border-radius: 50%;
            margin: 0 auto var(--space-md);
        }

        /* Form layouts */
        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: var(--space-lg);
        }

        .form-section {
            background: var(--color-stone);
            padding: var(--space-3xl);
            margin: var(--space-3xl) 0;
        }

        /* Hover states with restraint */
        .hover-lift {
            transition: transform var(--transition-base);
        }

        .hover-lift:hover {
            transform: translateY(-4px);
        }

        /* Loading states */
        .loading {
            opacity: 0.5;
            pointer-events: none;
        }

        /* Print styles */
        @media print {
            .header,
            .footer,
            .chat-widget,
            .trust-banner {
                display: none;
            }

            .main {
                margin-top: 0;
            }
        }
    </style>
</head>
<body>
    <!-- Trust Banner -->
    <div class="trust-banner">
        <div class="container">
            <div class="trust-items">
                <div class="trust-item">
                    <span class="trust-metric">$2.8B+</span>
                    <span>Total Transactions</span>
                </div>
                <div class="trust-item">
                    <span class="trust-metric">IADA</span>
                    <span>Accredited Dealer</span>
                </div>
                <div class="trust-item">
                    <span class="trust-metric">24/7</span>
                    <span>Concierge Service</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Navigation -->
    <header class="header">
        <div class="header-inner">
            <div class="container">
                <nav class="nav">
                    <a href="/" class="logo">Aircraft Executives</a>
                    <div class="nav-links">
                        <a href="/inventory" class="nav-link">Inventory</a>
                        <a href="/journal" class="nav-link">Journal</a>
                        <a href="/services" class="nav-link">Services</a>
                        <a href="/about" class="nav-link">About</a>
                        <a href="/contact" class="nav-link">Contact</a>
                        <a href="/inventory" class="btn btn-primary">View Aircraft</a>
                    </div>
                </nav>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="main">
        ${content}
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h4>Elite Aircraft Brokerage</h4>
                    <p>Premium aviation services for discerning clients worldwide. IADA accredited with over two decades of excellence.</p>
                </div>
                <div class="footer-section">
                    <h4>Quick Links</h4>
                    <p><a href="/inventory">Current Inventory</a></p>
                    <p><a href="/services">Our Services</a></p>
                    <p><a href="/about">About Us</a></p>
                    <p><a href="/contact">Contact</a></p>
                </div>
                <div class="footer-section">
                    <h4>Contact</h4>
                    <p><a href="tel:+1-404-410-5638">+1 (404) 410-5638</a></p>
                    <p><a href="mailto:info@aircraftexecutives.com">info@aircraftexecutives.com</a></p>
                    <p>Available 24/7 for qualified clients</p>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024 Elite Aircraft Brokerage. All rights reserved.</p>
            </div>
        </div>
    </footer>

    ${includeChat ? getChatWidget() : ''}
</body>
</html>`;
}

function getChatWidget() {
  return `
    <!-- Chat Widget -->
    <div class="chat-widget">
        <div class="chat-bubble-trigger" onclick="window.toggleChat && toggleChat()">
            <svg viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 2.98.97 4.29L1 23l6.71-1.97C9.02 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.41 0-2.73-.36-3.88-.99l-.28-.15-2.9.85.85-2.9-.15-.28C4.36 14.73 4 13.41 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/>
            </svg>
        </div>
    </div>
    <script>
        function toggleChat() {
            alert('Chat feature available on homepage. Contact us at +1 (404) 410-5638 for immediate assistance.');
        }
    </script>`;
}

// Page content generators with Hara-method design
function getServicesContent() {
  return `
    <section class="hero-section">
        <div class="container">
            <div class="text-container">
                <h1>Aircraft Services</h1>
                <div class="divider"></div>
            </div>
        </div>
    </section>

    <section class="section">
        <div class="container">
            <div class="service-grid">
                <div class="service-item">
                    <div class="divider-vertical"></div>
                    <h2>Acquisition</h2>
                    <div class="content-block">
                        <p>We locate and secure exceptional aircraft through our global network of trusted contacts.</p>
                        <p>Our acquisition process ensures complete transparency from initial search through final delivery.</p>
                        <p>Every detail is managed with precision and discretion.</p>
                    </div>
                </div>

                <div class="service-item">
                    <div class="divider-vertical"></div>
                    <h2>Sales</h2>
                    <div class="content-block">
                        <p>Strategic marketing and presentation of your aircraft to qualified buyers worldwide.</p>
                        <p>Comprehensive valuation and market positioning ensure optimal results.</p>
                        <p>Complete transaction management from listing to closing.</p>
                    </div>
                </div>

                <div class="service-item">
                    <div class="divider-vertical"></div>
                    <h2>Market Intelligence</h2>
                    <div class="content-block">
                        <p>Real-time market data and trend analysis across all aircraft categories.</p>
                        <p>Detailed valuation reports and market forecasting for informed decisions.</p>
                        <p>Proprietary research and insights available exclusively to our clients.</p>
                    </div>
                </div>

                <div class="service-item">
                    <div class="divider-vertical"></div>
                    <h2>Management</h2>
                    <div class="content-block">
                        <p>Complete aircraft management including maintenance, crew, and operations.</p>
                        <p>Regulatory compliance and administrative oversight handled seamlessly.</p>
                        <p>Cost optimization and operational efficiency as standard practice.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="section" style="background: var(--color-stone);">
        <div class="container">
            <div class="text-container" style="text-align: center;">
                <h3>Begin Your Journey</h3>
                <div class="divider"></div>
                <a href="/contact" class="btn">Contact Us</a>
            </div>
        </div>
    </section>`;
}

function getAboutContent() {
  return `
    <section class="hero-section">
        <div class="container">
            <div class="text-container">
                <h1>About</h1>
                <div class="divider"></div>
                <p style="font-size: var(--type-lg); text-align: center;">
                    Excellence in aircraft brokerage through decades of trusted relationships and uncompromising attention to detail.
                </p>
            </div>
        </div>
    </section>

    <section class="section">
        <div class="container">
            <div class="content-container">
                <div class="grid grid-2" style="align-items: start;">
                    <div>
                        <div class="divider-vertical"></div>
                        <h2>Our Story</h2>
                    </div>
                    <div class="content-block">
                        <p>Founded on the principle that aircraft transactions deserve the same precision and care as the aircraft themselves.</p>
                        <p>We have built our reputation through consistent delivery of exceptional results and unwavering commitment to client satisfaction.</p>
                        <p>Every transaction reflects our dedication to excellence and attention to the smallest details.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="section" style="background: var(--color-stone);">
        <div class="container">
            <div class="content-container">
                <div class="section-header">
                    <h2>Our Values</h2>
                    <div class="divider"></div>
                </div>
                <div class="values-grid">
                    <div class="value-item">
                        <div class="value-dot"></div>
                        <h4>Integrity</h4>
                        <p>Transparent communication and honest counsel in every interaction.</p>
                    </div>
                    <div class="value-item">
                        <div class="value-dot"></div>
                        <h4>Precision</h4>
                        <p>Meticulous attention to detail throughout every transaction.</p>
                    </div>
                    <div class="value-item">
                        <div class="value-dot"></div>
                        <h4>Discretion</h4>
                        <p>Confidentiality and privacy as fundamental business practices.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="section">
        <div class="container">
            <div class="content-container">
                <div class="grid grid-2" style="align-items: start;">
                    <div>
                        <div class="divider-vertical"></div>
                        <h2>Why Choose Us</h2>
                    </div>
                    <div>
                        <div class="content-block">
                            <h4>Global Network</h4>
                            <p>Established relationships across international markets provide unparalleled access to opportunities.</p>
                        </div>
                        <div class="content-block">
                            <h4>Market Expertise</h4>
                            <p>Deep understanding of aircraft values, market trends, and regulatory requirements.</p>
                        </div>
                        <div class="content-block">
                            <h4>Personalized Service</h4>
                            <p>Dedicated attention to your specific needs and objectives throughout the entire process.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>`;
}

function getContactContent() {
  return `
    <section class="hero-section">
        <div class="container">
            <div class="text-container">
                <h1>Contact</h1>
                <div class="divider"></div>
                <p style="font-size: var(--type-lg); text-align: center;">
                    Begin the conversation. We respond to all inquiries within 24 hours.
                </p>
            </div>
        </div>
    </section>

    <section class="section">
        <div class="container">
            <div class="content-container">
                <div class="grid grid-2" style="gap: var(--space-4xl);">
                    <div>
                        <div class="divider-vertical"></div>
                        <h2>Reach Us</h2>
                        
                        <div class="content-block">
                            <div class="form-label">Phone</div>
                            <p style="font-size: var(--type-lg); margin-bottom: var(--space-xl);">
                                <a href="tel:+1-404-410-5638">+1 (404) 410-5638</a>
                            </p>
                            
                            <div class="form-label">Email</div>
                            <p style="font-size: var(--type-lg); margin-bottom: var(--space-xl);">
                                <a href="mailto:info@aircraftexecutives.com">info@aircraftexecutives.com</a>
                            </p>
                            
                            <div class="form-label">Address</div>
                            <p style="font-size: var(--type-lg); margin-bottom: var(--space-xl);">
                                3595 McCall Place<br>
                                Atlanta, GA 30340<br>
                                United States
                            </p>
                            
                            <div class="form-label">Hours</div>
                            <p>
                                Monday - Friday: 8:00 AM - 6:00 PM<br>
                                Saturday: 9:00 AM - 2:00 PM<br>
                                Sunday: By appointment
                            </p>
                        </div>
                    </div>
                    
                    <div>
                        <div class="divider-vertical"></div>
                        <h2>Send Message</h2>
                        
                        <form action="/api/contact" method="POST">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label class="form-label">Name</label>
                                    <input type="text" class="form-input" name="name" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-input" name="email" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Subject</label>
                                <input type="text" class="form-input" name="subject" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Message</label>
                                <textarea class="form-textarea" name="message" required></textarea>
                            </div>
                            
                            <div style="padding-top: var(--space-lg);">
                                <button type="submit" class="btn">Send Message</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </section>`;
}

function getSellContent() {
  return `
    <section class="hero-section">
        <div class="container">
            <div class="text-container">
                <h1>Sell Your Aircraft</h1>
                <div class="divider"></div>
                <p style="font-size: var(--type-lg); text-align: center;">
                    Achieve optimal value through strategic marketing and professional presentation to qualified global buyers.
                </p>
            </div>
        </div>
    </section>

    <section class="section">
        <div class="container">
            <div class="content-container">
                <div class="section-header">
                    <h2>Our Process</h2>
                    <div class="divider"></div>
                </div>
                
                <div class="timeline">
                    <div class="timeline-item">
                        <div class="timeline-marker">1</div>
                        <div class="content-block">
                            <h4>Valuation</h4>
                            <p>Comprehensive market analysis and accurate pricing strategy.</p>
                        </div>
                    </div>
                    
                    <div class="timeline-item">
                        <div class="timeline-marker">2</div>
                        <div class="content-block">
                            <h4>Marketing</h4>
                            <p>Professional photography and targeted exposure to qualified buyers.</p>
                        </div>
                    </div>
                    
                    <div class="timeline-item">
                        <div class="timeline-marker">3</div>
                        <div class="content-block">
                            <h4>Negotiation</h4>
                            <p>Expert representation ensuring optimal terms and conditions.</p>
                        </div>
                    </div>
                    
                    <div class="timeline-item">
                        <div class="timeline-marker">4</div>
                        <div class="content-block">
                            <h4>Closing</h4>
                            <p>Complete transaction management through final delivery.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="form-section">
        <div class="container">
            <div class="content-container">
                <div class="section-header">
                    <h2>Request Valuation</h2>
                    <div class="divider"></div>
                    <p>Provide basic information about your aircraft for an initial market assessment.</p>
                </div>
                
                <form action="/api/valuation" method="POST">
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">Aircraft Make</label>
                            <input type="text" class="form-input" name="make" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Model</label>
                            <input type="text" class="form-input" name="model" required>
                        </div>
                    </div>
                    
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">Year</label>
                            <input type="text" class="form-input" name="year" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Total Hours</label>
                            <input type="text" class="form-input" name="hours" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Location</label>
                        <input type="text" class="form-input" name="location" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Additional Details</label>
                        <textarea class="form-textarea" name="details" placeholder="Recent upgrades, maintenance status, special features..."></textarea>
                    </div>
                    
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">Your Name</label>
                            <input type="text" class="form-input" name="contact_name" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-input" name="contact_email" required>
                        </div>
                    </div>
                    
                    <div style="text-align: center; padding-top: var(--space-lg);">
                        <button type="submit" class="btn">Request Valuation</button>
                    </div>
                </form>
            </div>
        </div>
    </section>

    <section class="section">
        <div class="container">
            <div class="content-container">
                <div class="section-header">
                    <h2>Why Sell With Us</h2>
                    <div class="divider"></div>
                </div>
                
                <div class="grid grid-3">
                    <div style="text-align: center;">
                        <div class="value-dot"></div>
                        <h4>Global Reach</h4>
                        <p>Access to international networks of qualified buyers and industry professionals.</p>
                    </div>
                    <div style="text-align: center;">
                        <div class="value-dot"></div>
                        <h4>Market Expertise</h4>
                        <p>Deep understanding of current market conditions and pricing dynamics.</p>
                    </div>
                    <div style="text-align: center;">
                        <div class="value-dot"></div>
                        <h4>Full Service</h4>
                        <p>Complete transaction management from initial listing through final delivery.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>`;
}

function getValuationContent() {
  return `
    <section class="hero-section">
        <div class="container">
            <div class="text-container">
                <h1>Aircraft Valuation</h1>
                <div class="divider"></div>
                <p style="font-size: var(--type-lg); text-align: center;">
                    Accurate market valuations based on comprehensive data analysis and current market conditions.
                </p>
            </div>
        </div>
    </section>

    <section class="section">
        <div class="container">
            <div class="content-container">
                <div class="section-header">
                    <h2>Valuation Services</h2>
                    <div class="divider"></div>
                </div>
                
                <div class="grid grid-3">
                    <div class="card">
                        <div class="divider-vertical"></div>
                        <h3>Market Valuation</h3>
                        <div class="card-content">
                            <p>Current fair market value based on recent sales and market trends.</p>
                            <p>Suitable for selling, insurance, or general planning purposes.</p>
                            <p>Delivered within 2-3 business days.</p>
                            <div style="padding-top: var(--space-lg);">
                                <p style="font-size: var(--type-2xl); font-weight: 300;">$500</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="divider-vertical"></div>
                        <h3>Desktop Appraisal</h3>
                        <div class="card-content">
                            <p>Detailed analysis including maintenance records review and market comparisons.</p>
                            <p>USPAP compliant for legal and financial requirements.</p>
                            <p>Comprehensive 15-20 page report delivered within 5-7 business days.</p>
                            <div style="padding-top: var(--space-lg);">
                                <p style="font-size: var(--type-2xl); font-weight: 300;">$1,500</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="divider-vertical"></div>
                        <h3>Physical Inspection</h3>
                        <div class="card-content">
                            <p>On-site inspection with detailed condition assessment and photographic documentation.</p>
                            <p>USPAP compliant with complete records analysis and market research.</p>
                            <p>Comprehensive report delivered within 7-10 business days of inspection.</p>
                            <div style="padding-top: var(--space-lg);">
                                <p style="font-size: var(--type-2xl); font-weight: 300;">$3,500</p>
                                <p style="font-size: var(--type-sm); color: var(--color-smoke);">Plus travel expenses</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="form-section">
        <div class="container">
            <div class="content-container">
                <div class="section-header">
                    <h2>Request Valuation</h2>
                    <div class="divider"></div>
                    <p>Select your valuation type and provide aircraft details for accurate assessment.</p>
                </div>
                
                <form action="/api/valuation-request" method="POST">
                    <div class="form-group">
                        <label class="form-label">Valuation Type</label>
                        <div class="grid grid-3" style="gap: var(--space-md);">
                            <label style="display: flex; align-items: center; padding: var(--space-sm); border: 1px solid var(--color-ash); cursor: pointer;">
                                <input type="radio" name="valuation_type" value="market" style="margin-right: var(--space-xs);" required>
                                <span>Market Valuation</span>
                            </label>
                            <label style="display: flex; align-items: center; padding: var(--space-sm); border: 1px solid var(--color-ash); cursor: pointer;">
                                <input type="radio" name="valuation_type" value="desktop" style="margin-right: var(--space-xs);">
                                <span>Desktop Appraisal</span>
                            </label>
                            <label style="display: flex; align-items: center; padding: var(--space-sm); border: 1px solid var(--color-ash); cursor: pointer;">
                                <input type="radio" name="valuation_type" value="inspection" style="margin-right: var(--space-xs);">
                                <span>Physical Inspection</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">Aircraft Make</label>
                            <input type="text" class="form-input" name="make" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Model</label>
                            <input type="text" class="form-input" name="model" required>
                        </div>
                    </div>
                    
                    <div class="form-grid" style="grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));">
                        <div class="form-group">
                            <label class="form-label">Year</label>
                            <input type="text" class="form-input" name="year" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Serial Number</label>
                            <input type="text" class="form-input" name="serial">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Registration</label>
                            <input type="text" class="form-input" name="registration">
                        </div>
                    </div>
                    
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">Total Time</label>
                            <input type="text" class="form-input" name="total_time" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Location</label>
                            <input type="text" class="form-input" name="location" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Purpose of Valuation</label>
                        <select class="form-select" name="purpose" required>
                            <option value="">Select purpose</option>
                            <option value="sale">Sale</option>
                            <option value="purchase">Purchase</option>
                            <option value="insurance">Insurance</option>
                            <option value="financing">Financing</option>
                            <option value="estate">Estate Planning</option>
                            <option value="legal">Legal</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">Your Name</label>
                            <input type="text" class="form-input" name="contact_name" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-input" name="contact_email" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Additional Information</label>
                        <textarea class="form-textarea" name="additional_info" placeholder="Recent maintenance, upgrades, damage history, special equipment..."></textarea>
                    </div>
                    
                    <div style="text-align: center; padding-top: var(--space-lg);">
                        <button type="submit" class="btn">Request Valuation</button>
                    </div>
                </form>
            </div>
        </div>
    </section>`;
}

function getMarketAnalysisContent() {
  return `
    <section class="hero-section">
        <div class="container">
            <div class="text-container">
                <h1>Market Analysis</h1>
                <div class="divider"></div>
                <p style="font-size: var(--type-lg); text-align: center;">
                    Comprehensive market intelligence and research to inform your aircraft decisions with confidence.
                </p>
            </div>
        </div>
    </section>

    <section class="section">
        <div class="container">
            <div class="content-container">
                <div class="section-header">
                    <h2>Intelligence Services</h2>
                    <div class="divider"></div>
                </div>
                
                <div class="service-grid">
                    <div class="service-item">
                        <div class="divider-vertical"></div>
                        <h3>Market Reports</h3>
                        <p>Quarterly and annual market analysis covering all aircraft categories and price segments.</p>
                        <p>Detailed trend analysis, forecast data, and regional market variations.</p>
                        <p>Subscription service with instant access to historical data and market updates.</p>
                    </div>
                    
                    <div class="service-item">
                        <div class="divider-vertical"></div>
                        <h3>Custom Research</h3>
                        <p>Tailored research projects focusing on specific aircraft models or market segments.</p>
                        <p>Competitive analysis and strategic positioning for fleet planning decisions.</p>
                        <p>Delivered as comprehensive reports with actionable insights and recommendations.</p>
                    </div>
                    
                    <div class="service-item">
                        <div class="divider-vertical"></div>
                        <h3>Price Monitoring</h3>
                        <p>Real-time tracking of asking prices and actual transaction values across global markets.</p>
                        <p>Alert system for significant price movements or market opportunities.</p>
                        <p>Historical price data and trend analysis for strategic timing decisions.</p>
                    </div>
                    
                    <div class="service-item">
                        <div class="divider-vertical"></div>
                        <h3>Industry Insights</h3>
                        <p>Executive briefings on regulatory changes, technology developments, and market dynamics.</p>
                        <p>Exclusive interviews with industry leaders and market makers.</p>
                        <p>Strategic analysis of merger and acquisition activity affecting aircraft values.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="section" style="background: var(--color-stone);">
        <div class="container">
            <div class="content-container">
                <div class="section-header">
                    <h2>Recent Analysis</h2>
                    <div class="divider"></div>
                    <p>Sample insights from our latest market research and analysis.</p>
                </div>
                
                <div class="content-block">
                    <div style="border-left: 2px solid var(--color-ash); padding-left: var(--space-lg); margin-bottom: var(--space-xl);">
                        <div class="form-label">Q4 2024 Report</div>
                        <h4>Midsize Jet Market Outlook</h4>
                        <p>Market activity increased 15% year-over-year with strong demand for late-model aircraft driving price stability across most segments.</p>
                    </div>
                    
                    <div style="border-left: 2px solid var(--color-ash); padding-left: var(--space-lg); margin-bottom: var(--space-xl);">
                        <div class="form-label">Special Analysis</div>
                        <h4>Light Jet Value Trends</h4>
                        <p>Comprehensive analysis of depreciation patterns and factors affecting resale values in the light jet category.</p>
                    </div>
                    
                    <div style="border-left: 2px solid var(--color-ash); padding-left: var(--space-lg);">
                        <div class="form-label">Regional Focus</div>
                        <h4>European Market Dynamics</h4>
                        <p>Regional market analysis covering regulatory impacts, currency effects, and cross-border transaction trends.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="section">
        <div class="container">
            <div class="content-container">
                <div class="section-header">
                    <h2>Request Information</h2>
                    <div class="divider"></div>
                    <p>Access our market intelligence services and research capabilities.</p>
                </div>
                
                <form action="/api/market-info" method="POST">
                    <div class="form-group">
                        <label class="form-label">Service Interest</label>
                        <div class="grid grid-2" style="gap: var(--space-md);">
                            <label style="display: flex; align-items: center; padding: var(--space-sm); border: 1px solid var(--color-ash); cursor: pointer;">
                                <input type="checkbox" name="services[]" value="market_reports" style="margin-right: var(--space-xs);">
                                <span>Market Reports</span>
                            </label>
                            <label style="display: flex; align-items: center; padding: var(--space-sm); border: 1px solid var(--color-ash); cursor: pointer;">
                                <input type="checkbox" name="services[]" value="custom_research" style="margin-right: var(--space-xs);">
                                <span>Custom Research</span>
                            </label>
                            <label style="display: flex; align-items: center; padding: var(--space-sm); border: 1px solid var(--color-ash); cursor: pointer;">
                                <input type="checkbox" name="services[]" value="price_monitoring" style="margin-right: var(--space-xs);">
                                <span>Price Monitoring</span>
                            </label>
                            <label style="display: flex; align-items: center; padding: var(--space-sm); border: 1px solid var(--color-ash); cursor: pointer;">
                                <input type="checkbox" name="services[]" value="industry_insights" style="margin-right: var(--space-xs);">
                                <span>Industry Insights</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Specific Areas of Interest</label>
                        <textarea class="form-textarea" name="areas_of_interest" placeholder="Aircraft categories, geographic regions, specific research questions..."></textarea>
                    </div>
                    
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">Name</label>
                            <input type="text" class="form-input" name="name" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-input" name="email" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Company</label>
                        <input type="text" class="form-input" name="company">
                    </div>
                    
                    <div style="text-align: center; padding-top: var(--space-lg);">
                        <button type="submit" class="btn">Request Information</button>
                    </div>
                </form>
            </div>
        </div>
    </section>`;
}

function getInventoryContent() {
    return `
    <style>
        /* Tab Navigation */
        .inventory-tabs {
            border-bottom: 1px solid var(--color-ash);
            margin-bottom: var(--space-xl);
            overflow-x: auto;
        }
        
        .tab-nav {
            display: flex;
            gap: var(--space-lg);
            min-width: max-content;
        }
        
        .tab-button {
            background: none;
            border: none;
            padding: var(--space-md) 0;
            font-size: var(--type-base);
            color: var(--color-graphite);
            cursor: pointer;
            border-bottom: 2px solid transparent;
            transition: all 0.3s ease;
            white-space: nowrap;
        }
        
        .tab-button.active,
        .tab-button:hover {
            color: var(--color-ink);
            border-bottom-color: var(--color-ink);
        }
        
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
        }
        
        /* ROI Calculator Styles */
        .calculator-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--space-xl);
            margin-bottom: var(--space-xl);
        }
        
        .calculator-inputs {
            background: var(--color-paper);
            border: 1px solid var(--color-ash);
            border-radius: 8px;
            padding: var(--space-lg);
        }
        
        .calculator-result {
            background: var(--color-stone);
            border-radius: 8px;
            padding: var(--space-lg);
            text-align: center;
        }
        
        .input-group {
            margin-bottom: var(--space-lg);
        }
        
        .input-label {
            display: block;
            margin-bottom: var(--space-sm);
            font-weight: 500;
            color: var(--color-ink);
        }
        
        .input-field {
            width: 100%;
            padding: var(--space-md);
            border: 1px solid var(--color-ash);
            border-radius: 4px;
            font-size: var(--type-base);
        }
        
        /* Route Planning Styles */
        .route-inputs {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: var(--space-lg);
            margin-bottom: var(--space-xl);
        }
        
        .route-result {
            background: var(--color-stone);
            border-radius: 8px;
            padding: var(--space-lg);
            text-align: center;
        }
        
        /* Market Intelligence */
        .intelligence-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--space-xl);
        }
        
        .intelligence-panel {
            background: var(--color-paper);
            border: 1px solid var(--color-ash);
            border-radius: 8px;
            padding: var(--space-lg);
        }
        
        .panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--space-lg);
            padding-bottom: var(--space-md);
            border-bottom: 1px solid var(--color-ash);
        }
        
        .panel-status {
            font-size: var(--type-sm);
            color: var(--color-graphite);
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
        
        /* Mobile-first Aircraft Cards */
        .aircraft-inventory-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: var(--space-lg);
        }
        
        @media (min-width: 768px) {
            .aircraft-inventory-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: var(--space-xl);
            }
        }
        
        @media (min-width: 1024px) {
            .aircraft-inventory-grid {
                grid-template-columns: repeat(3, 1fr);
            }
        }
        
        .aircraft-card {
            background: var(--color-paper);
            border: 1px solid var(--color-ash);
            border-radius: var(--space-xs);
            padding: var(--space-md);
            transition: var(--transition-base);
            position: relative;
        }
        
        .aircraft-card:hover {
            box-shadow: var(--metal-shadow);
            transform: translateY(-2px);
        }
        
        .aircraft-card-image {
            position: relative;
            aspect-ratio: 16/9;
            background: var(--color-stone);
            border-radius: var(--space-xs);
            margin-bottom: var(--space-md);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        
        .aircraft-placeholder {
            color: var(--color-graphite);
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
        }
        
        .aircraft-icon {
            width: 48px;
            height: 48px;
            fill: currentColor;
            opacity: 0.6;
        }
        
        .aircraft-card-badge {
            position: absolute;
            top: var(--space-sm);
            right: var(--space-sm);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: var(--space-xs) var(--space-sm);
            border-radius: var(--space-xs);
            font-size: var(--type-xs);
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .aircraft-card-badge.ultra-long-range {
            background: var(--color-accent);
        }
        
        .aircraft-card-badge.super-mid-size {
            background: var(--color-graphite);
        }
        
        .aircraft-card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: var(--space-md);
        }
        
        .aircraft-title {
            font-size: var(--type-lg);
            font-weight: 400;
            margin: 0;
            line-height: var(--leading-tight);
        }
        
        .aircraft-expand-btn {
            background: none;
            border: none;
            padding: var(--space-xs);
            cursor: pointer;
            border-radius: var(--space-xs);
            transition: var(--transition-touch);
            min-width: var(--touch-min);
            min-height: var(--touch-min);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .aircraft-expand-btn:hover {
            background: var(--color-stone);
        }
        
        .aircraft-expand-btn:active {
            transform: scale(0.95);
        }
        
        .expand-icon {
            width: 20px;
            height: 20px;
            fill: var(--color-graphite);
            transition: var(--transition-touch);
        }
        
        .aircraft-expand-btn.expanded .expand-icon {
            transform: rotate(180deg);
        }
        
        .aircraft-key-specs {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: var(--space-sm);
            margin-bottom: var(--space-md);
        }
        
        .spec-item {
            text-align: center;
            padding: var(--space-sm);
            background: var(--color-stone);
            border-radius: var(--space-xs);
        }
        
        .spec-label {
            display: block;
            font-size: var(--type-xs);
            color: var(--color-graphite);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: var(--space-xs);
        }
        
        .spec-value {
            display: block;
            font-size: var(--type-sm);
            font-weight: 500;
            color: var(--color-ink);
        }
        
        .aircraft-card-details {
            margin: var(--space-md) 0;
            padding-top: var(--space-md);
            border-top: 1px solid var(--color-ash);
        }
        
        .aircraft-specs {
            display: grid;
            gap: var(--space-sm);
        }
        
        .spec-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: var(--space-xs) 0;
            font-size: var(--type-sm);
        }
        
        .spec-row:not(:last-child) {
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        .aircraft-card-actions {
            margin-top: var(--space-md);
            padding-top: var(--space-md);
            border-top: 1px solid var(--color-ash);
        }
        
        .aircraft-price {
            font-size: var(--type-lg);
            font-weight: 400;
            margin-bottom: var(--space-md);
            text-align: center;
            color: var(--color-ink);
        }
        
        .action-buttons {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--space-sm);
        }
        
        .btn-touch {
            min-height: var(--touch-min);
            padding: var(--space-sm) var(--space-md);
            font-size: var(--type-sm);
            border-radius: var(--space-xs);
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: var(--transition-touch);
        }
        
        .btn-touch:active {
            transform: translateY(1px);
        }
        
        @media (max-width: 768px) {
            .calculator-grid,
            .intelligence-grid {
                grid-template-columns: 1fr;
            }
            
            .route-inputs {
                grid-template-columns: 1fr;
            }
            
            .aircraft-key-specs {
                grid-template-columns: 1fr;
                gap: var(--space-xs);
            }
            
            .spec-item {
                padding: var(--space-xs);
            }
        }
    </style>

    <section class="hero-section">
        <div class="container">
            <div class="text-container">
                <h1>Aircraft Inventory & Intelligence</h1>
                <div class="divider"></div>
                <p>Strategic aviation intelligence with comprehensive tools for informed aircraft decisions.</p>
            </div>
        </div>
    </section>

    <section class="section">
        <div class="container">
            <!-- Tab Navigation -->
            <div class="inventory-tabs">
                <div class="tab-nav">
                    <button class="tab-button active" onclick="showInventoryTab('inventory')">Aircraft Inventory</button>
                    <button class="tab-button" onclick="showInventoryTab('roi-calculator')">ROI Calculator</button>
                    <button class="tab-button" onclick="showInventoryTab('market-intelligence')">Market Intelligence</button>
                    <button class="tab-button" onclick="showInventoryTab('route-planning')">Route Planning</button>
                    <button class="tab-button" onclick="showInventoryTab('consultation')">Strategic Consultation</button>
                </div>
            </div>

            <!-- Aircraft Inventory Tab -->
            <div id="inventory" class="tab-content active">
                <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: var(--space-xl);">
                    
                    <div class="card" style="border: 1px solid var(--color-ash); border-radius: 8px; padding: var(--space-lg); background: var(--color-paper);">
                        <div style="aspect-ratio: 16/9; background: var(--color-stone); margin-bottom: var(--space-md); border-radius: 4px; display: flex; align-items: center; justify-content: center; color: var(--color-graphite);">
                            Aircraft Image
                        </div>
                        <h3>Gulfstream G650ER</h3>
                        <p style="color: var(--color-graphite); margin-bottom: var(--space-sm);">Ultra-Long Range Jet</p>
                        <div style="margin-bottom: var(--space-md);">
                            <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-xs);">
                                <span>Year:</span>
                                <span>2020</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-xs);">
                                <span>Hours:</span>
                                <span>850</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-xs);">
                                <span>Seats:</span>
                                <span>19</span>
                            </div>
                        </div>
                        <div style="border-top: 1px solid var(--color-ash); padding-top: var(--space-md); margin-top: var(--space-md);">
                            <div style="font-size: var(--type-lg); font-weight: 400; margin-bottom: var(--space-sm);">Price on Request</div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm);">
                                <a href="/aircraft/gulfstream-g650er" class="btn" style="text-align: center;">View Details</a>
                                <a href="/contact" class="btn btn-primary" style="text-align: center;">Inquire Now</a>
                            </div>
                        </div>
                    </div>

                    <div class="card" style="border: 1px solid var(--color-ash); border-radius: 8px; padding: var(--space-lg); background: var(--color-paper);">
                        <div style="aspect-ratio: 16/9; background: var(--color-stone); margin-bottom: var(--space-md); border-radius: 4px; display: flex; align-items: center; justify-content: center; color: var(--color-graphite);">
                            Aircraft Image
                        </div>
                        <h3>Citation X+</h3>
                        <p style="color: var(--color-graphite); margin-bottom: var(--space-sm);">Super Mid-Size Jet</p>
                        <div style="margin-bottom: var(--space-md);">
                            <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-xs);">
                                <span>Year:</span>
                                <span>2018</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-xs);">
                                <span>Hours:</span>
                                <span>1,200</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-xs);">
                                <span>Seats:</span>
                                <span>12</span>
                            </div>
                        </div>
                        <div style="border-top: 1px solid var(--color-ash); padding-top: var(--space-md); margin-top: var(--space-md);">
                            <div style="font-size: var(--type-lg); font-weight: 400; margin-bottom: var(--space-sm);">Price on Request</div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm);">
                                <a href="/aircraft/citation-x-plus" class="btn" style="text-align: center;">View Details</a>
                                <a href="/contact" class="btn btn-primary" style="text-align: center;">Inquire Now</a>
                            </div>
                        </div>
                    </div>

                    <div class="card" style="border: 1px solid var(--color-ash); border-radius: 8px; padding: var(--space-lg); background: var(--color-paper);">
                        <div style="aspect-ratio: 16/9; background: var(--color-stone); margin-bottom: var(--space-md); border-radius: 4px; display: flex; align-items: center; justify-content: center; color: var(--color-graphite);">
                            Aircraft Image
                        </div>
                        <h3>Bombardier Global 7500</h3>
                        <p style="color: var(--color-graphite); margin-bottom: var(--space-sm);">Ultra-Long Range Jet</p>
                        <div style="margin-bottom: var(--space-md);">
                            <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-xs);">
                                <span>Year:</span>
                                <span>2021</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-xs);">
                                <span>Hours:</span>
                                <span>420</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-xs);">
                                <span>Seats:</span>
                                <span>19</span>
                            </div>
                        </div>
                        <div style="border-top: 1px solid var(--color-ash); padding-top: var(--space-md); margin-top: var(--space-md);">
                            <div style="font-size: var(--type-lg); font-weight: 400; margin-bottom: var(--space-sm);">Price on Request</div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm);">
                                <a href="/aircraft/bombardier-global-7500" class="btn" style="text-align: center;">View Details</a>
                                <a href="/contact" class="btn btn-primary" style="text-align: center;">Inquire Now</a>
                            </div>
                        </div>
                    </div>

                </div>
                
                <div style="margin-top: var(--space-2xl); text-align: center; background: var(--color-stone); padding: var(--space-xl); border-radius: 8px);">
                    <h2>Looking for Something Specific?</h2>
                    <div class="divider" style="margin: var(--space-lg) auto;"></div>
                    <p>Our inventory changes frequently. If you don't see what you're looking for, our acquisition team can source the perfect aircraft for your requirements.</p>
                    <div style="margin-top: var(--space-xl);">
                        <a href="/contact" class="btn btn-primary" style="margin-right: var(--space-lg);">Contact Our Team</a>
                        <a href="/services" class="btn">Our Services</a>
                    </div>
                </div>
            </div>

            <!-- ROI Calculator Tab -->
            <div id="roi-calculator" class="tab-content">
                <h2 style="margin-bottom: var(--space-xl);">ROI Calculator</h2>
                <div class="calculator-grid">
                    <div class="calculator-inputs">
                        <h3 style="margin-bottom: var(--space-lg);">Input Parameters</h3>
                        
                        <div class="input-group">
                            <label class="input-label" for="annual-hours">Annual Flight Hours</label>
                            <input type="number" id="annual-hours" class="input-field" value="250" min="50" max="1000" onchange="calculateROI()">
                        </div>
                        
                        <div class="input-group">
                            <label class="input-label" for="hourly-rate">Commercial Charter Rate ($/hr)</label>
                            <input type="number" id="hourly-rate" class="input-field" value="8500" min="1000" max="20000" onchange="calculateROI()">
                        </div>
                        
                        <div class="input-group">
                            <label class="input-label" for="time-value">Executive Time Value ($/hr)</label>
                            <input type="number" id="time-value" class="input-field" value="2500" min="500" max="10000" onchange="calculateROI()">
                        </div>
                        
                        <div class="input-group">
                            <label class="input-label" for="aircraft-cost">Aircraft Cost ($M)</label>
                            <input type="number" id="aircraft-cost" class="input-field" value="45" min="5" max="100" onchange="calculateROI()">
                        </div>
                    </div>
                    
                    <div class="calculator-result">
                        <h3 style="margin-bottom: var(--space-lg);">ROI Analysis</h3>
                        <div style="font-size: var(--type-2xl); font-weight: 300; margin-bottom: var(--space-md); color: var(--color-ink);" id="roi-percentage">18.2%</div>
                        <p style="color: var(--color-graphite); margin-bottom: var(--space-lg);">Annual Return on Investment</p>
                        
                        <div style="text-align: left; margin-top: var(--space-xl);">
                            <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-sm);">
                                <span>Annual Charter Savings:</span>
                                <span id="charter-savings">$2,125,000</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-sm);">
                                <span>Time Value Benefit:</span>
                                <span id="time-benefit">$625,000</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-sm);">
                                <span>Total Annual Benefit:</span>
                                <span id="total-benefit">$2,750,000</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-sm); font-weight: 500;">
                                <span>Payback Period:</span>
                                <span id="payback-period">16.4 months</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Market Intelligence Tab -->
            <div id="market-intelligence" class="tab-content">
                <h2 style="margin-bottom: var(--space-xl);">Market Intelligence Dashboard</h2>
                <div class="intelligence-grid">
                    <div class="intelligence-panel">
                        <div class="panel-header">
                            <h3>Market Trends</h3>
                            <span class="panel-status">Live Data</span>
                        </div>
                        
                        <div style="margin-bottom: var(--space-lg);">
                            <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-md);">
                                <span>Ultra-Long Range</span>
                                <span style="color: green;">↑ 12.3%</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-md);">
                                <span>Super Mid-Size</span>
                                <span style="color: green;">↑ 8.7%</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-md);">
                                <span>Light Jets</span>
                                <span style="color: red;">↓ 2.1%</span>
                            </div>
                        </div>
                        
                        <p style="color: var(--color-graphite); font-size: var(--type-sm);">
                            Year-over-year market value changes. Data updated daily from multiple market sources.
                        </p>
                    </div>
                    
                    <div class="intelligence-panel">
                        <div class="panel-header">
                            <h3>Transaction Volume</h3>
                            <span class="panel-status">Q1 2025</span>
                        </div>
                        
                        <div style="margin-bottom: var(--space-lg);">
                            <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-md);">
                                <span>Total Transactions</span>
                                <span>1,247</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-md);">
                                <span>Average Days on Market</span>
                                <span>127</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-md);">
                                <span>Price Achievement</span>
                                <span>94.2%</span>
                            </div>
                        </div>
                        
                        <p style="color: var(--color-graphite); font-size: var(--type-sm);">
                            Quarterly performance metrics from tracked transactions across all categories.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Route Planning Tab -->
            <div id="route-planning" class="tab-content">
                <h2 style="margin-bottom: var(--space-xl);">Strategic Route Planning</h2>
                
                <div class="route-inputs">
                    <div class="input-group">
                        <label class="input-label" for="departure">Departure</label>
                        <input type="text" id="departure" class="input-field" value="KTEB (Teterboro)" placeholder="Enter airport" onchange="updateRoute()">
                    </div>
                    <div class="input-group">
                        <label class="input-label" for="destination">Destination</label>
                        <input type="text" id="destination" class="input-field" value="EGLL (London Heathrow)" placeholder="Enter airport" onchange="updateRoute()">
                    </div>
                    <div class="input-group">
                        <label class="input-label" for="passengers">Passengers</label>
                        <input type="number" id="passengers" class="input-field" value="8" min="1" max="19" onchange="updateRoute()">
                    </div>
                </div>
                
                <div class="route-result">
                    <h3 style="margin-bottom: var(--space-lg);">Route Analysis</h3>
                    <div style="text-align: left;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-md);">
                            <span>Distance:</span>
                            <span id="route-distance">3,459 NM</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-md);">
                            <span>Flight Time:</span>
                            <span id="flight-time">7h 42m</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-md);">
                            <span>Recommended Aircraft:</span>
                            <span id="recommended-aircraft">Gulfstream G650ER</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-md);">
                            <span>Fuel Cost:</span>
                            <span id="fuel-cost">$12,400</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Strategic Consultation Tab -->
            <div id="consultation" class="tab-content">
                <div style="text-align: center; padding: var(--space-2xl); background: var(--color-stone); border-radius: 8px;">
                    <h2 style="margin-bottom: var(--space-lg);">Strategic Aviation Consultation</h2>
                    <div class="divider" style="margin: var(--space-lg) auto;"></div>
                    <p style="margin-bottom: var(--space-xl); max-width: 600px; margin-left: auto; margin-right: auto;">
                        Schedule a confidential consultation with our aviation intelligence team to develop your customized acquisition strategy.
                    </p>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: var(--space-lg); margin-bottom: var(--space-2xl);">
                        <div style="text-align: left;">
                            <h4 style="margin-bottom: var(--space-md);">Market Analysis</h4>
                            <p style="color: var(--color-graphite);">Comprehensive market positioning and trend analysis for your specific requirements.</p>
                        </div>
                        <div style="text-align: left;">
                            <h4 style="margin-bottom: var(--space-md);">Acquisition Strategy</h4>
                            <p style="color: var(--color-graphite);">Strategic timing and approach recommendations based on market conditions.</p>
                        </div>
                        <div style="text-align: left;">
                            <h4 style="margin-bottom: var(--space-md);">Financial Modeling</h4>
                            <p style="color: var(--color-graphite);">Custom ROI analysis and financing structure optimization for your situation.</p>
                        </div>
                    </div>
                    
                    <div style="margin-top: var(--space-xl);">
                        <a href="/contact" class="btn btn-primary" style="margin-right: var(--space-lg);">Schedule Consultation</a>
                        <a href="mailto:executive@aircraftexecutives.com" class="btn">Direct Contact</a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <script>
        function showInventoryTab(tabName) {
            // Hide all tab contents
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            // Remove active class from all tab buttons
            const tabButtons = document.querySelectorAll('.tab-button');
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Show selected tab content
            document.getElementById(tabName).classList.add('active');
            
            // Add active class to clicked button
            event.target.classList.add('active');
        }
        
        function calculateROI() {
            const annualHours = parseFloat(document.getElementById('annual-hours').value) || 250;
            const hourlyRate = parseFloat(document.getElementById('hourly-rate').value) || 8500;
            const timeValue = parseFloat(document.getElementById('time-value').value) || 2500;
            const aircraftCost = parseFloat(document.getElementById('aircraft-cost').value) || 45;
            
            const charterSavings = annualHours * hourlyRate;
            const timeBenefit = annualHours * timeValue;
            const totalBenefit = charterSavings + timeBenefit;
            const roiPercentage = (totalBenefit / (aircraftCost * 1000000)) * 100;
            const paybackMonths = (aircraftCost * 1000000) / (totalBenefit / 12);
            
            document.getElementById('roi-percentage').textContent = roiPercentage.toFixed(1) + '%';
            document.getElementById('charter-savings').textContent = '$' + charterSavings.toLocaleString();
            document.getElementById('time-benefit').textContent = '$' + timeBenefit.toLocaleString();
            document.getElementById('total-benefit').textContent = '$' + totalBenefit.toLocaleString();
            document.getElementById('payback-period').textContent = paybackMonths.toFixed(1) + ' months';
        }
        
        function updateRoute() {
            // Simple route calculation simulation
            const departure = document.getElementById('departure').value;
            const destination = document.getElementById('destination').value;
            const passengers = parseInt(document.getElementById('passengers').value) || 8;
            
            // Mock calculations based on common routes
            let distance = 3459;
            let flightTime = '7h 42m';
            let recommendedAircraft = 'Gulfstream G650ER';
            let fuelCost = 12400;
            
            if (departure.includes('LAX') || destination.includes('LAX')) {
                distance = 2451;
                flightTime = '5h 15m';
                fuelCost = 8900;
            }
            
            if (passengers <= 8) {
                recommendedAircraft = 'Citation X+';
            } else if (passengers > 12) {
                recommendedAircraft = 'Bombardier Global 7500';
            }
            
            document.getElementById('route-distance').textContent = distance.toLocaleString() + ' NM';
            document.getElementById('flight-time').textContent = flightTime;
            document.getElementById('recommended-aircraft').textContent = recommendedAircraft;
            document.getElementById('fuel-cost').textContent = '$' + fuelCost.toLocaleString();
        }
        
        // Mobile Aircraft Card Progressive Disclosure
        function toggleAircraftDetails(button) {
            const card = button.closest('.aircraft-card');
            const details = card.querySelector('.aircraft-card-details');
            const isExpanded = button.classList.contains('expanded');
            
            if (isExpanded) {
                // Collapse
                details.style.display = 'none';
                button.classList.remove('expanded');
                button.setAttribute('aria-label', 'Show more details');
            } else {
                // Expand
                details.style.display = 'block';
                button.classList.add('expanded');
                button.setAttribute('aria-label', 'Show less details');
                
                // Smooth scroll to keep card in view after expansion
                setTimeout(() => {
                    card.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'nearest' 
                    });
                }, 100);
            }
        }

        // Initialize calculations on page load
        document.addEventListener('DOMContentLoaded', function() {
            calculateROI();
            updateRoute();
        });
    </script>`;
}

function getJournalContent() {
    return `
    <section class="hero-section">
        <div class="container">
            <div class="text-container">
                <h1>Aviation Journal</h1>
                <div class="divider"></div>
                <p>Insights, trends, and expertise from the world of executive aviation.</p>
            </div>
        </div>
    </section>

    <section class="section">
        <div class="container">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: var(--space-2xl);">
                
                <article class="card" style="border: 1px solid var(--color-ash); border-radius: 8px; padding: var(--space-2xl); background: var(--color-paper);">
                    <div style="margin-bottom: var(--space-lg);">
                        <span style="color: var(--color-graphite); font-size: var(--type-sm); text-transform: uppercase; letter-spacing: 0.1em;">Market Intelligence</span>
                        <div style="color: var(--color-smoke); font-size: var(--type-sm); margin-top: var(--space-xs);">January 15, 2025</div>
                    </div>
                    <h2 style="font-size: var(--type-xl); font-weight: 300; margin-bottom: var(--space-lg); line-height: 1.3;">Ultra-Long Range Market Trends: Q1 2025 Analysis</h2>
                    <p style="color: var(--color-graphite); margin-bottom: var(--space-xl); line-height: 1.6;">The ultra-long range segment continues to show remarkable resilience with pre-owned values stabilizing and new aircraft delivery timelines extending into 2027. Key market drivers include transcontinental route optimization and evolving cabin technology expectations.</p>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: var(--color-graphite); font-size: var(--type-sm);">6 min read</span>
                        <a href="#" style="color: var(--color-ink); text-decoration: none; font-weight: 400; font-size: var(--type-sm);">Read Article →</a>
                    </div>
                </article>

                <article class="card" style="border: 1px solid var(--color-ash); border-radius: 8px; padding: var(--space-2xl); background: var(--color-paper);">
                    <div style="margin-bottom: var(--space-lg);">
                        <span style="color: var(--color-graphite); font-size: var(--type-sm); text-transform: uppercase; letter-spacing: 0.1em;">Technology</span>
                        <div style="color: var(--color-smoke); font-size: var(--type-sm); margin-top: var(--space-xs);">January 10, 2025</div>
                    </div>
                    <h2 style="font-size: var(--type-xl); font-weight: 300; margin-bottom: var(--space-lg); line-height: 1.3;">Next-Generation Avionics: The Evolution of Executive Flight Decks</h2>
                    <p style="color: var(--color-graphite); margin-bottom: var(--space-xl); line-height: 1.6;">Advanced synthetic vision systems and AI-powered flight management are transforming cockpit experiences. We examine the latest implementations from Garmin, Collins Aerospace, and Thales across current production aircraft.</p>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: var(--color-graphite); font-size: var(--type-sm);">8 min read</span>
                        <a href="#" style="color: var(--color-ink); text-decoration: none; font-weight: 400; font-size: var(--type-sm);">Read Article →</a>
                    </div>
                </article>

                <article class="card" style="border: 1px solid var(--color-ash); border-radius: 8px; padding: var(--space-2xl); background: var(--color-paper);">
                    <div style="margin-bottom: var(--space-lg);">
                        <span style="color: var(--color-graphite); font-size: var(--type-sm); text-transform: uppercase; letter-spacing: 0.1em;">Operations</span>
                        <div style="color: var(--color-smoke); font-size: var(--type-sm); margin-top: var(--space-xs);">January 5, 2025</div>
                    </div>
                    <h2 style="font-size: var(--type-xl); font-weight: 300; margin-bottom: var(--space-lg); line-height: 1.3;">Sustainable Aviation Fuel: Implementation Strategies for Executive Fleets</h2>
                    <p style="color: var(--color-graphite); margin-bottom: var(--space-xl); line-height: 1.6;">As regulatory frameworks evolve and environmental commitments intensify, SAF adoption becomes a strategic imperative. Analysis of current supply chains, cost structures, and operational integration pathways.</p>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: var(--color-graphite); font-size: var(--type-sm);">12 min read</span>
                        <a href="#" style="color: var(--color-ink); text-decoration: none; font-weight: 400; font-size: var(--type-sm);">Read Article →</a>
                    </div>
                </article>

                <article class="card" style="border: 1px solid var(--color-ash); border-radius: 8px; padding: var(--space-2xl); background: var(--color-paper);">
                    <div style="margin-bottom: var(--space-lg);">
                        <span style="color: var(--color-graphite); font-size: var(--type-sm); text-transform: uppercase; letter-spacing: 0.1em;">Regulatory</span>
                        <div style="color: var(--color-smoke); font-size: var(--type-sm); margin-top: var(--space-xs);">December 28, 2024</div>
                    </div>
                    <h2 style="font-size: var(--type-xl); font-weight: 300; margin-bottom: var(--space-lg); line-height: 1.3;">EASA Part-NCC Updates: Implications for Executive Operations</h2>
                    <p style="color: var(--color-graphite); margin-bottom: var(--space-xl); line-height: 1.6;">Recent amendments to European commercial operation regulations affect flight time limitations, crew training requirements, and operational documentation. Essential guidance for European-based and transatlantic operators.</p>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: var(--color-graphite); font-size: var(--type-sm);">10 min read</span>
                        <a href="#" style="color: var(--color-ink); text-decoration: none; font-weight: 400; font-size: var(--type-sm);">Read Article →</a>
                    </div>
                </article>

                <article class="card" style="border: 1px solid var(--color-ash); border-radius: 8px; padding: var(--space-2xl); background: var(--color-paper);">
                    <div style="margin-bottom: var(--space-lg);">
                        <span style="color: var(--color-graphite); font-size: var(--type-sm); text-transform: uppercase; letter-spacing: 0.1em;">Strategy</span>
                        <div style="color: var(--color-smoke); font-size: var(--type-sm); margin-top: var(--space-xs);">December 20, 2024</div>
                    </div>
                    <h2 style="font-size: var(--type-xl); font-weight: 300; margin-bottom: var(--space-lg); line-height: 1.3;">Fleet Modernization: ROI Analysis for Upgrade vs. Replacement</h2>
                    <p style="color: var(--color-graphite); margin-bottom: var(--space-xl); line-height: 1.6;">Comprehensive financial modeling framework for executive aviation fleet decisions. Examining depreciation curves, maintenance cost trajectories, and operational efficiency gains across aircraft age cohorts.</p>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: var(--color-graphite); font-size: var(--type-sm);">15 min read</span>
                        <a href="#" style="color: var(--color-ink); text-decoration: none; font-weight: 400; font-size: var(--type-sm);">Read Article →</a>
                    </div>
                </article>

                <article class="card" style="border: 1px solid var(--color-ash); border-radius: 8px; padding: var(--space-2xl); background: var(--color-paper);">
                    <div style="margin-bottom: var(--space-lg);">
                        <span style="color: var(--color-graphite); font-size: var(--type-sm); text-transform: uppercase; letter-spacing: 0.1em;">Innovation</span>
                        <div style="color: var(--color-smoke); font-size: var(--type-sm); margin-top: var(--space-xs);">December 15, 2024</div>
                    </div>
                    <h2 style="font-size: var(--type-xl); font-weight: 300; margin-bottom: var(--space-lg); line-height: 1.3;">Electric Vertical Take-Off: Timeline for Executive Aviation Integration</h2>
                    <p style="color: var(--color-graphite); margin-bottom: var(--space-xl); line-height: 1.6;">Urban air mobility platforms approach certification milestones with implications for short-range executive transport. Infrastructure requirements, operational frameworks, and integration timelines with conventional fleets.</p>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: var(--color-graphite); font-size: var(--type-sm);">9 min read</span>
                        <a href="#" style="color: var(--color-ink); text-decoration: none; font-weight: 400; font-size: var(--type-sm);">Read Article →</a>
                    </div>
                </article>

            </div>
        </div>
    </section>

    <section class="section" style="background: var(--color-stone);">
        <div class="container">
            <div class="text-container">
                <h2>Industry Intelligence</h2>
                <div class="divider"></div>
                <p>Stay informed with our comprehensive analysis of executive aviation trends, regulatory developments, and market intelligence.</p>
                <div style="margin-top: var(--space-xl);">
                    <a href="/contact" class="btn btn-primary" style="margin-right: var(--space-lg);">Subscribe to Updates</a>
                    <a href="/services" class="btn">Consulting Services</a>
                </div>
            </div>
        </div>
    </section>`;
}

function getAircraftDetailContent(aircraftName, specs) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${aircraftName} - Aircraft Executives</title>
    <meta name="description" content="Detailed specifications and analysis for ${aircraftName} - Aircraft Executives premium aviation services.">
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600&display=swap" rel="stylesheet">
    
    <style>
        /* Hara Method Design System - Mobile First */
        :root {
            /* Touch-friendly minimums */
            --touch-min: 2.75rem; /* 44px minimum touch target */
            --thumb-zone: 4.5rem; /* 72px comfortable thumb reach */
            
            /* Ma (Emptiness) - Mobile-first spacing grid */
            --space-unit: 4px; /* Smaller base for mobile */
            --space-xs: calc(var(--space-unit) * 2);   /* 8px */
            --space-sm: calc(var(--space-unit) * 3);   /* 12px */
            --space-md: calc(var(--space-unit) * 4);   /* 16px */
            --space-lg: calc(var(--space-unit) * 6);   /* 24px */
            --space-xl: calc(var(--space-unit) * 8);   /* 32px */
            --space-2xl: calc(var(--space-unit) * 12); /* 48px */
            --space-3xl: calc(var(--space-unit) * 16); /* 64px */
            --space-4xl: calc(var(--space-unit) * 24); /* 96px */
            
            /* Material Honesty - Surface & Interaction */
            --color-ink: #000000;
            --color-paper: #FFFFFF;
            --color-stone: #F8F9FA;
            --color-ash: #E9ECEF;
            --color-graphite: #495057;
            --color-smoke: #6C757D;
            --color-accent: #007AFF; /* iOS blue for familiar interactions */
            
            /* Glass Material (for mobile overlays) */
            --glass-blur: blur(20px);
            --glass-opacity: 0.85;
            --glass-border: rgba(255, 255, 255, 0.2);
            
            /* Metal Material (for buttons) */
            --metal-gradient: linear-gradient(145deg, #f0f0f0, #d4d4d4);
            --metal-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            --metal-shadow-pressed: inset 0 2px 4px rgba(0, 0, 0, 0.1);
            
            /* Typography - Mobile-optimized scale */
            --type-xs: 0.75rem;   /* 12px */
            --type-sm: 0.875rem;  /* 14px */
            --type-base: 1rem;    /* 16px */
            --type-lg: 1.125rem;  /* 18px */
            --type-xl: 1.25rem;   /* 20px */
            --type-2xl: 1.5rem;   /* 24px */
            --type-3xl: 1.875rem; /* 30px */
            --type-4xl: 2.25rem;  /* 36px */
            
            /* Line heights optimized for mobile reading */
            --leading-tight: 1.25;
            --leading-snug: 1.375;
            --leading-normal: 1.5;
            --leading-relaxed: 1.625;
            
            /* Touch-friendly transitions */
            --transition-touch: 150ms cubic-bezier(0.4, 0.0, 0.2, 1);
            --transition-base: 200ms cubic-bezier(0.4, 0.0, 0.2, 1);
            --transition-slow: 300ms cubic-bezier(0.4, 0.0, 0.2, 1);
            
            /* Layout - Mobile-first containers */
            --container-max: 100%;
            --content-max: 100%;
            --text-max: 100%;
            --container-padding: var(--space-md);
            
            /* Safe areas for modern mobile devices */
            --safe-top: env(safe-area-inset-top, 0);
            --safe-bottom: env(safe-area-inset-bottom, 0);
            --safe-left: env(safe-area-inset-left, 0);
            --safe-right: env(safe-area-inset-right, 0);
        }
        
        /* Progressive enhancement for larger screens */
        @media (min-width: 768px) {
            :root {
                --space-unit: 8px; /* Increase base unit for larger screens */
                --container-max: 768px;
                --content-max: 680px;
                --text-max: 600px;
                --container-padding: var(--space-lg);
            }
        }
        
        @media (min-width: 1024px) {
            :root {
                --container-max: 1024px;
                --content-max: 864px;
                --text-max: 720px;
                --container-padding: var(--space-xl);
            }
        }
        
        @media (min-width: 1280px) {
            :root {
                --container-max: 1280px;
                --content-max: 960px;
                --text-max: 720px;
            }
        }

        /* Reset with material honesty */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html {
            font-size: 16px;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            /* Prevent zoom on input focus on iOS */
            -webkit-text-size-adjust: 100%;
            /* Optimize font rendering for mobile */
            text-rendering: optimizeLegibility;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            font-weight: 300;
            line-height: var(--leading-relaxed);
            color: var(--color-ink);
            background: var(--color-paper);
            letter-spacing: 0.01em;
            /* Prevent horizontal scroll on mobile */
            overflow-x: hidden;
            /* Add safe area support */
            padding-top: var(--safe-top);
            padding-bottom: var(--safe-bottom);
            /* Optimize scrolling on iOS */
            -webkit-overflow-scrolling: touch;
        }

        /* Global Navigation (consistent with homepage) */
        .header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid var(--color-ash);
            z-index: 1000;
        }

        .container {
            max-width: var(--container-max);
            margin: 0 auto;
            padding: 0 var(--space-lg);
        }

        .nav {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: var(--space-lg) 0;
        }

        .logo {
            font-size: var(--type-xl);
            font-weight: 200;
            color: var(--color-ink);
            text-decoration: none;
            letter-spacing: 0.02em;
        }

        .nav-links {
            display: flex;
            align-items: center;
            gap: var(--space-2xl);
        }

        .nav-link {
            color: var(--color-graphite);
            text-decoration: none;
            font-weight: 300;
            font-size: var(--type-sm);
            transition: color var(--transition-base);
        }

        .nav-link:hover {
            color: var(--color-ink);
        }
        /* Focus indicators for accessibility */
        .nav-link:focus,
        .btn:focus,
        .tab-button:focus {
            outline: 2px solid var(--color-ink);
            outline-offset: 2px;
            background: rgba(0, 0, 0, 0.05);
            border-radius: 2px;
        }

        .btn {
            display: inline-block;
            padding: var(--space-sm) var(--space-lg);
            border: 1px solid var(--color-ash);
            color: var(--color-ink);
            text-decoration: none;
            font-size: var(--type-sm);
            font-weight: 400;
            transition: all var(--transition-base);
            border-radius: 0;
        }

        .btn:hover {
            background: var(--color-ink);
            color: var(--color-paper);
            border-color: var(--color-ink);
        }

        .btn-primary {
            background: var(--color-ink);
            color: var(--color-paper);
            border-color: var(--color-ink);
        }

        .btn-primary:hover {
            background: var(--color-graphite);
            border-color: var(--color-graphite);
        }

        /* Main content with top spacing for fixed header */
        .main {
            margin-top: 0;
            padding-top: 80px;
            min-height: 100vh;
            overflow-y: auto;
        }

        /* Aircraft Hero Section - Compact */
        .aircraft-hero {
            padding: var(--space-xl) 0 var(--space-lg);
            background: var(--color-paper);
            border-bottom: 1px solid var(--color-ash);
        }

        .aircraft-hero h1 {
            font-size: var(--type-2xl);
            font-weight: 200;
            line-height: 1.1;
            margin-bottom: var(--space-xs);
            letter-spacing: -0.02em;
        }

        .aircraft-subtitle {
            font-size: var(--type-base);
            color: var(--color-graphite);
            margin-bottom: var(--space-lg);
        }

        /* Tab Navigation - Compact */
        .tab-nav {
            display: flex;
            border-bottom: 1px solid var(--color-ash);
            margin-bottom: var(--space-md);
        }

        .tab-button {
            padding: var(--space-sm) var(--space-lg);
            background: none;
            border: none;
            font-family: inherit;
            font-size: var(--type-sm);
            font-weight: 300;
            color: var(--color-graphite);
            cursor: pointer;
            transition: all var(--transition-base);
            border-bottom: 2px solid transparent;
        }

        .tab-button:hover {
            color: var(--color-ink);
        }

        .tab-button.active {
            color: var(--color-ink);
            border-bottom-color: var(--color-ink);
        }

        .tab-content {
            display: none;
            height: calc(100vh - 200px);
            overflow-y: auto;
        }

        .tab-content.active {
            display: block;
        }

        /* Compact content sections */
        .content-section {
            height: 100%;
            padding: var(--space-lg) 0;
        }

        /* Specifications Table - Compact Hara Style */
        .specs-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin: 0;
            font-size: var(--type-sm);
        }

        .specs-table th,
        .specs-table td {
            padding: var(--space-sm) var(--space-md);
            text-align: left;
            border-bottom: 1px solid var(--color-ash);
        }

        .specs-table th {
            font-weight: 400;
            color: var(--color-ink);
            background: var(--color-stone);
            font-size: var(--type-xs);
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }

        .specs-table td {
            font-weight: 300;
            color: var(--color-graphite);
        }

        .specs-table tbody tr:hover {
            background: var(--color-stone);
        }

        .specs-category {
            font-weight: 500;
            color: var(--color-ink);
            background: var(--color-paper);
            font-size: var(--type-base);
            text-transform: none;
            letter-spacing: normal;
        }

        /* Compact Grid layouts */
        .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--space-lg);
            height: 100%;
        }

        .grid-3 {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: var(--space-lg);
        }

        /* Mobile Navigation Improvements */
        .mobile-menu-toggle {
            display: none;
            background: none;
            border: none;
            padding: var(--space-sm);
            min-height: 44px;
            min-width: 44px;
            cursor: pointer;
        }
        
        .mobile-menu-toggle span {
            display: block;
            width: 24px;
            height: 2px;
            background: var(--color-ink);
            margin: 4px 0;
            transition: var(--transition-base);
        }
        
        @media (max-width: 768px) {
            .grid-2, .grid-3 {
                grid-template-columns: 1fr;
            }
            
            .nav-links {
                display: none;
            }
            
            .mobile-menu-toggle {
                display: block;
            }
            
            /* Better mobile header spacing */
            .main {
                padding-top: 70px;
            }
            
            .aircraft-hero {
                padding: var(--space-lg) 0 var(--space-md);
            }
        }

        /* Compact content sections */
        .section {
            padding: 0;
            height: 100%;
        }

        .section-title {
            font-size: var(--type-lg);
            font-weight: 200;
            margin-bottom: var(--space-md);
        }

        .card {
            background: var(--color-paper);
            border: 1px solid var(--color-ash);
            padding: var(--space-lg);
            height: fit-content;
        }

        .compact-card {
            background: var(--color-paper);
            border: 1px solid var(--color-ash);
            padding: var(--space-md);
            height: fit-content;
            font-size: var(--type-sm);
        }
    </style>
</head>
<body>
    <!-- Global Navigation (consistent with homepage) -->
    <header class="header">
        <div class="container">
            <nav class="nav">
                <a href="/" class="logo">Aircraft Executives</a>
                <div class="nav-links">
                    <a href="/inventory" class="nav-link">Inventory</a>
                    <a href="/journal" class="nav-link">Journal</a>
                    <a href="/services" class="nav-link">Services</a>
                    <a href="/about" class="nav-link">About</a>
                    <a href="/contact" class="nav-link">Contact</a>
                    <a href="/inventory" class="btn btn-primary">View Aircraft</a>
                </div>
                <button class="mobile-menu-toggle" aria-label="Toggle mobile menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </nav>
        </div>
    </header>

    <main class="main">
        <!-- Aircraft Hero Section -->
        <section class="aircraft-hero">
            <div class="container">
                <h1>${aircraftName}</h1>
                <p class="aircraft-subtitle">${specs.category} • ${specs.year} • ${specs.hours} Hours</p>
                
                <!-- Tab Navigation -->
                <div class="tab-nav">
                    <button class="tab-button active" onclick="showTab('overview')">Overview</button>
                    <button class="tab-button" onclick="showTab('specifications')">Specifications</button>
                    <button class="tab-button" onclick="showTab('intelligence')">Intelligence</button>
                    <button class="tab-button" onclick="showTab('planning')">Planning</button>
                    <button class="tab-button" onclick="showTab('consultation')">Consultation</button>
                </div>
            </div>
        </section>

        <section class="section">
            <div class="container">
                <!-- Overview Tab - Compact -->
                <div id="overview" class="tab-content active">
                    <div class="grid-2">
                        <div>
                            <h2 class="section-title">Aircraft Overview</h2>
                            <p style="margin-bottom: var(--space-md); font-size: var(--type-sm); line-height: 1.5;">${specs.description}</p>
                            
                            <div class="compact-card">
                                <h3 style="margin-bottom: var(--space-md); font-size: var(--type-base);">Key Features</h3>
                                <ul style="list-style: none; padding: 0; font-size: var(--type-xs);">
                                    ${specs.features.slice(0, 4).map(feature => `<li style="margin-bottom: var(--space-xs); padding-left: var(--space-md); position: relative;">
                                        <span style="position: absolute; left: 0; color: var(--color-ink);">•</span>
                                        ${feature}
                                    </li>`).join('')}
                                </ul>
                            </div>
                        </div>
                        
                        <div>
                            <div class="compact-card">
                                <h3 style="margin-bottom: var(--space-md); font-size: var(--type-base);">Specifications</h3>
                                <table style="width: 100%; border-collapse: collapse; font-size: var(--type-xs);">
                                    <tr style="border-bottom: 1px solid var(--color-ash);">
                                        <td style="padding: var(--space-xs) 0; font-weight: 400;">Range</td>
                                        <td style="padding: var(--space-xs) 0; text-align: right;">${specs.range}</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid var(--color-ash);">
                                        <td style="padding: var(--space-xs) 0; font-weight: 400;">Speed</td>
                                        <td style="padding: var(--space-xs) 0; text-align: right;">${specs.speed}</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid var(--color-ash);">
                                        <td style="padding: var(--space-xs) 0; font-weight: 400;">Passengers</td>
                                        <td style="padding: var(--space-xs) 0; text-align: right;">${specs.passengers}</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid var(--color-ash);">
                                        <td style="padding: var(--space-xs) 0; font-weight: 400;">Ceiling</td>
                                        <td style="padding: var(--space-xs) 0; text-align: right;">${specs.ceiling}</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid var(--color-ash);">
                                        <td style="padding: var(--space-xs) 0; font-weight: 400;">Year</td>
                                        <td style="padding: var(--space-xs) 0; text-align: right;">${specs.year}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: var(--space-xs) 0; font-weight: 400;">Hours</td>
                                        <td style="padding: var(--space-xs) 0; text-align: right;">${specs.hours}</td>
                                    </tr>
                                </table>
                                
                                <div style="margin-top: var(--space-md); display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-xs);">
                                    <a href="/contact" class="btn btn-primary" style="text-align: center; font-size: var(--type-xs); padding: var(--space-xs) var(--space-sm);">Request Info</a>
                                    <a href="/inventory" class="btn" style="text-align: center; font-size: var(--type-xs); padding: var(--space-xs) var(--space-sm);">Back</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Specifications Tab -->
                <div id="specifications" class="tab-content">
                    <h2 class="section-title">Detailed Specifications</h2>
                    ${getSpecificationsTable(specs)}
                </div>

                <!-- Intelligence Tab - Compact -->
                <div id="intelligence" class="tab-content">
                    <div class="grid-3">
                        <div class="compact-card">
                            <h3 style="margin-bottom: var(--space-md); font-size: var(--type-base);">Market Analysis</h3>
                            <div style="font-size: var(--type-xs);">
                                <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-xs);">
                                    <span>Market Value:</span>
                                    <span style="font-weight: 500;">$${specs.marketValue}M</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-xs);">
                                    <span>12-Month Trend:</span>
                                    <span style="color: #16a34a;">+3.2%</span>
                                </div>
                                <div style="display: flex; justify-content: space-between;">
                                    <span>Liquidity Score:</span>
                                    <span style="font-weight: 500;">8.5/10</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="compact-card">
                            <h3 style="margin-bottom: var(--space-md); font-size: var(--type-base);">Operating Cost</h3>
                            <div style="text-align: center; padding: var(--space-md); background: var(--color-stone);">
                                <div style="font-size: var(--type-lg); font-weight: 200; margin-bottom: var(--space-xs);">$${specs.operatingCost}/hour</div>
                                <div style="color: var(--color-graphite); font-size: var(--type-xs);">Est. Hourly Cost</div>
                            </div>
                        </div>

                        <div class="compact-card">
                            <h3 style="margin-bottom: var(--space-md); font-size: var(--type-base);">Performance</h3>
                            <div style="font-size: var(--type-xs);">
                                <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-xs);">
                                    <span>Range:</span>
                                    <span>${specs.range}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-xs);">
                                    <span>Speed:</span>
                                    <span>${specs.speed}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between;">
                                    <span>Ceiling:</span>
                                    <span>${specs.ceiling}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Planning Tab - Compact -->
                <div id="planning" class="tab-content">
                    <div class="grid-2">
                        <div class="compact-card">
                            <h3 style="margin-bottom: var(--space-md); font-size: var(--type-base);">Route Capabilities</h3>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm); font-size: var(--type-xs);">
                                <div style="text-align: center; padding: var(--space-sm); background: var(--color-stone);">
                                    <div style="font-size: var(--type-sm); font-weight: 300;">${specs.range}</div>
                                    <div style="color: var(--color-graphite);">Range</div>
                                </div>
                                <div style="text-align: center; padding: var(--space-sm); background: var(--color-stone);">
                                    <div style="font-size: var(--type-sm); font-weight: 300;">${specs.speed}</div>
                                    <div style="color: var(--color-graphite);">Speed</div>
                                </div>
                                <div style="text-align: center; padding: var(--space-sm); background: var(--color-stone);">
                                    <div style="font-size: var(--type-sm); font-weight: 300;">${specs.ceiling}</div>
                                    <div style="color: var(--color-graphite);">Ceiling</div>
                                </div>
                                <div style="text-align: center; padding: var(--space-sm); background: var(--color-stone);">
                                    <div style="font-size: var(--type-sm); font-weight: 300;">${specs.passengers}</div>
                                    <div style="color: var(--color-graphite);">Passengers</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="compact-card">
                            <h3 style="margin-bottom: var(--space-md); font-size: var(--type-base);">Mission Profiles</h3>
                            <div style="font-size: var(--type-xs);">
                                <div style="margin-bottom: var(--space-sm);">
                                    <div style="font-weight: 500;">Transcontinental</div>
                                    <div style="color: var(--color-graphite);">NYC ↔ LON: ${Math.round(parseFloat(specs.range.replace(/[^\d.]/g, '')) * 0.7)} nm</div>
                                </div>
                                <div style="margin-bottom: var(--space-sm);">
                                    <div style="font-weight: 500;">Domestic US</div>
                                    <div style="color: var(--color-graphite);">LAX ↔ JFK: ${Math.round(parseFloat(specs.range.replace(/[^\d.]/g, '')) * 0.4)} nm</div>
                                </div>
                                <div>
                                    <div style="font-weight: 500;">Regional</div>
                                    <div style="color: var(--color-graphite);">Multi-city coverage</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Consultation Tab - Compact -->
                <div id="consultation" class="tab-content">
                    <div class="grid-2">
                        <div class="compact-card">
                            <h3 style="margin-bottom: var(--space-md); font-size: var(--type-base);">Services</h3>
                            <ul style="list-style: none; padding: 0; font-size: var(--type-xs);">
                                <li style="margin-bottom: var(--space-xs); padding-left: var(--space-md); position: relative;">
                                    <span style="position: absolute; left: 0; color: var(--color-ink);">•</span>
                                    Aircraft acquisition strategy
                                </li>
                                <li style="margin-bottom: var(--space-xs); padding-left: var(--space-md); position: relative;">
                                    <span style="position: absolute; left: 0; color: var(--color-ink);">•</span>
                                    Pre-purchase inspection
                                </li>
                                <li style="margin-bottom: var(--space-xs); padding-left: var(--space-md); position: relative;">
                                    <span style="position: absolute; left: 0; color: var(--color-ink);">•</span>
                                    Market intelligence briefing
                                </li>
                                <li style="margin-bottom: var(--space-xs); padding-left: var(--space-md); position: relative;">
                                    <span style="position: absolute; left: 0; color: var(--color-ink);">•</span>
                                    Transaction management
                                </li>
                                <li style="margin-bottom: var(--space-xs); padding-left: var(--space-md); position: relative;">
                                    <span style="position: absolute; left: 0; color: var(--color-ink);">•</span>
                                    Financing coordination
                                </li>
                                <li style="padding-left: var(--space-md); position: relative;">
                                    <span style="position: absolute; left: 0; color: var(--color-ink);">•</span>
                                    Delivery logistics
                                </li>
                            </ul>
                        </div>
                        
                        <div class="compact-card">
                            <h3 style="margin-bottom: var(--space-md); font-size: var(--type-base);">Contact</h3>
                            <div style="margin-bottom: var(--space-md); font-size: var(--type-xs);">
                                <div style="margin-bottom: var(--space-sm);"><strong>Direct:</strong> +1 (404) 410-5638</div>
                                <div style="margin-bottom: var(--space-sm);"><strong>Email:</strong> executive@aircraftexecutives.com</div>
                                <div style="margin-bottom: var(--space-md); color: var(--color-graphite);">Available 24/7 for confidential consultations</div>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-xs);">
                                <a href="/contact" class="btn btn-primary" style="text-align: center; font-size: var(--type-xs); padding: var(--space-xs) var(--space-sm);">Schedule Call</a>
                                <a href="mailto:executive@aircraftexecutives.com" class="btn" style="text-align: center; font-size: var(--type-xs); padding: var(--space-xs) var(--space-sm);">Send Email</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <script>
        function showTab(tabName) {
            // Hide all tab contents
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            
            // Remove active class from all tab buttons
            const tabButtons = document.querySelectorAll('.tab-button');
            tabButtons.forEach(button => {
                button.classList.remove('active');
            });
            
            // Show selected tab content
            document.getElementById(tabName).classList.add('active');
            
            // Add active class to clicked button
            event.target.classList.add('active');
        }
    </script>
</body>
</html>`;
}

function getSpecificationsTable(specs) {
    return `
    <table class="specs-table">
        <thead>
            <tr>
                <th>Category</th>
                <th>Specification</th>
                <th>Value</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="specs-category" colspan="3">Performance</td>
            </tr>
            <tr>
                <td></td>
                <td>Maximum Range</td>
                <td>${specs.range}</td>
            </tr>
            <tr>
                <td></td>
                <td>Maximum Speed</td>
                <td>${specs.speed}</td>
            </tr>
            <tr>
                <td></td>
                <td>Service Ceiling</td>
                <td>${specs.ceiling}</td>
            </tr>
            <tr>
                <td></td>
                <td>Rate of Climb</td>
                <td>${specs.climb || '4,850 ft/min'}</td>
            </tr>
            
            <tr>
                <td class="specs-category" colspan="3">Dimensions</td>
            </tr>
            <tr>
                <td></td>
                <td>Overall Length</td>
                <td>${specs.length || 'N/A'}</td>
            </tr>
            <tr>
                <td></td>
                <td>Wing Span</td>
                <td>${specs.wingspan || 'N/A'}</td>
            </tr>
            <tr>
                <td></td>
                <td>Overall Height</td>
                <td>${specs.height || 'N/A'}</td>
            </tr>
            
            <tr>
                <td class="specs-category" colspan="3">Cabin</td>
            </tr>
            <tr>
                <td></td>
                <td>Passenger Capacity</td>
                <td>${specs.passengers}</td>
            </tr>
            <tr>
                <td></td>
                <td>Cabin Length</td>
                <td>${specs.cabinLength || 'N/A'}</td>
            </tr>
            <tr>
                <td></td>
                <td>Cabin Width</td>
                <td>${specs.cabinWidth || 'N/A'}</td>
            </tr>
            <tr>
                <td></td>
                <td>Cabin Height</td>
                <td>${specs.cabinHeight || 'N/A'}</td>
            </tr>
            
            <tr>
                <td class="specs-category" colspan="3">Aircraft Details</td>
            </tr>
            <tr>
                <td></td>
                <td>Year of Manufacture</td>
                <td>${specs.year}</td>
            </tr>
            <tr>
                <td></td>
                <td>Total Flight Hours</td>
                <td>${specs.hours}</td>
            </tr>
            <tr>
                <td></td>
                <td>Engine Type</td>
                <td>${specs.engines || 'N/A'}</td>
            </tr>
            <tr>
                <td></td>
                <td>Avionics Suite</td>
                <td>${specs.avionics || 'N/A'}</td>
            </tr>
        </tbody>
    </table>`;
}

// Main routing function
module.exports = async (req, res) => {
  const { url } = req;
  console.log('Ghost-static handler called for:', url);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }
  
  try {
    let content = '';
    let title = 'Home';
    let includeChat = true;
    
    // Route handling
    const cleanUrl = url.split('?')[0].replace(/\/$/, '') || '/';
    
    switch (cleanUrl) {
      case '':
      case '/':
        // Serve the homepage with full chat implementation
        try {
          const homepage = fs.readFileSync(
            path.join(__dirname, '..', 'elite-aircraft-homepage-with-chat.html'), 
            'utf8'
          );
          res.setHeader('Content-Type', 'text/html');
          res.statusCode = 200;
          return res.end(homepage);
        } catch (error) {
          console.error('Error loading homepage:', error);
          content = '<div class="section"><div class="container"><h1>Welcome to Elite Aircraft</h1><p>Homepage temporarily unavailable.</p></div></div>';
        }
        break;
        
      case '/services':
        content = getServicesContent();
        title = 'Services';
        break;
        
      case '/inventory':
        content = getInventoryContent();
        title = 'Aircraft Inventory';
        break;
        
      case '/journal':
        content = getJournalContent();
        title = 'Aviation Journal';
        break;
        
      case '/aircraft/gulfstream-g650er':
        // Custom aircraft detail page with global navigation and tabs
        const g650Specs = {
          category: 'Ultra-Long Range Jet',
          year: '2020',
          hours: '850',
          description: 'The Gulfstream G650ER represents the pinnacle of ultra-long-range aviation, offering unmatched performance and luxury for transcontinental missions.',
          features: [
            'Rolls-Royce BR725 engines with exceptional fuel efficiency',
            'PlaneView™ II cockpit with enhanced vision system',
            'Ka-band high-speed internet connectivity',
            'Four distinct living areas with maximum flexibility',
            'Advanced cabin management system',
            'Enhanced flight vision system (EFVS)'
          ],
          range: '7,500 nm',
          speed: 'Mach 0.925',
          passengers: '19',
          ceiling: '51,000 ft',
          climb: '4,850 ft/min',
          length: '99.75 ft',
          wingspan: '99.58 ft',
          height: '25.42 ft',
          cabinLength: '53.58 ft',
          cabinWidth: '8.5 ft',
          cabinHeight: '6.42 ft',
          engines: 'Rolls-Royce BR725 (16,900 lbf each)',
          avionics: 'PlaneView™ II',
          marketValue: '68',
          operatingCost: '4,750'
        };
        
        const g650HTML = getAircraftDetailContent('Gulfstream G650ER', g650Specs);
        res.setHeader('Content-Type', 'text/html');
        res.statusCode = 200;
        return res.end(g650HTML);
        
      case '/aircraft/citation-x-plus':
        // Custom aircraft detail page with global navigation and tabs
        const citationSpecs = {
          category: 'Super Mid-Size Jet',
          year: '2018',
          hours: '1,200',
          description: 'The Citation X+ delivers exceptional speed and efficiency for business aviation, combining Cessna reliability with cutting-edge performance capabilities.',
          features: [
            'Rolls-Royce AE3007C2 engines for superior performance',
            'Garmin G5000 integrated flight deck',
            'High-speed cruise capability at Mach 0.935',
            'Spacious cabin with flexible seating configurations',
            'Advanced weather radar and terrain awareness',
            'Enhanced cabin noise reduction technology'
          ],
          range: '3,460 nm',
          speed: 'Mach 0.935',
          passengers: '12',
          ceiling: '51,000 ft',
          climb: '4,560 ft/min',
          length: '72.17 ft',
          wingspan: '63.75 ft',
          height: '19.33 ft',
          cabinLength: '25.75 ft',
          cabinWidth: '5.5 ft',
          cabinHeight: '5.67 ft',
          engines: 'Rolls-Royce AE3007C2 (7,034 lbf each)',
          avionics: 'Garmin G5000',
          marketValue: '24',
          operatingCost: '3,200'
        };
        
        const citationHTML = getAircraftDetailContent('Citation X+', citationSpecs);
        res.setHeader('Content-Type', 'text/html');
        res.statusCode = 200;
        return res.end(citationHTML);
        
      case '/aircraft/bombardier-global-7500':
        // Custom aircraft detail page with global navigation and tabs
        const global7500Specs = {
          category: 'Ultra-Long Range Jet',
          year: '2021',
          hours: '420',
          description: 'The Bombardier Global 7500 redefines ultra-long-range travel with the industrys largest cabin and revolutionary wing design for exceptional performance.',
          features: [
            'General Electric Passport engines with advanced technology',
            'Bombardier Vision flight deck with synthetic vision',
            'Four living spaces including a dedicated bedroom suite',
            'Industry-leading cabin altitude and noise levels',
            'Advanced connectivity with Ka-band WiFi',
            'Revolutionary wing design for fuel efficiency'
          ],
          range: '7,700 nm',
          speed: 'Mach 0.925',
          passengers: '19',
          ceiling: '51,000 ft',
          climb: '5,900 ft/min',
          length: '109.8 ft',
          wingspan: '104 ft',
          height: '25.3 ft',
          cabinLength: '54.4 ft',
          cabinWidth: '8.2 ft',
          cabinHeight: '6.2 ft',
          engines: 'General Electric Passport (18,920 lbf each)',
          avionics: 'Bombardier Vision',
          marketValue: '78',
          operatingCost: '5,100'
        };
        
        const global7500HTML = getAircraftDetailContent('Bombardier Global 7500', global7500Specs);
        res.setHeader('Content-Type', 'text/html');
        res.statusCode = 200;
        return res.end(global7500HTML);
        
      case '/about':
        content = getAboutContent();
        title = 'About Us';
        break;
        
      case '/contact':
        content = getContactContent();
        title = 'Contact';
        break;
        
      case '/sell':
        content = getSellContent();
        title = 'Sell Your Aircraft';
        break;
        
      case '/valuation':
        content = getValuationContent();
        title = 'Aircraft Valuation';
        break;
        
      case '/market-analysis':
        content = getMarketAnalysisContent();
        title = 'Market Analysis';
        break;
        
      case '/ghost':
      case '/ghost/':
        // Ghost admin placeholder
        res.setHeader('Content-Type', 'text/html');
        res.statusCode = 200;
        return res.end(`
          <html>
          <head><title>Ghost Admin</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1>Ghost Admin Interface</h1>
            <p>The Ghost CMS admin is being configured.</p>
            <a href="/">Return to Site</a>
          </body>
          </html>
        `);
        
      default:
        // 404 page
        content = `
          <div class="hero-section">
            <div class="container">
              <div class="text-container" style="text-align: center;">
                <h1>Page Not Found</h1>
                <div class="divider"></div>
                <p>Sorry, we couldn't find the page you're looking for.</p>
                <div style="margin-top: var(--space-xl);">
                  <a href="/" class="btn" style="margin-right: var(--space-lg);">Go Home</a>
                  <a href="/contact" class="btn btn-primary">Contact Us</a>
                </div>
              </div>
            </div>
          </div>`;
        title = '404 - Page Not Found';
        res.statusCode = 404;
    }
    
    // Wrap content in layout and send response
    const html = wrapInLayout(content, title, includeChat);
    res.setHeader('Content-Type', 'text/html');
    res.statusCode = res.statusCode || 200;
    res.end(html);
    
  } catch (error) {
    console.error('Ghost serving error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/html');
    res.end(`
      <html>
      <head><title>Error</title></head>
      <body style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1>Server Error</h1>
        <p>We apologize for the inconvenience. Please try again later.</p>
        <a href="/">Return to Home</a>
      </body>
      </html>
    `);
  }
};