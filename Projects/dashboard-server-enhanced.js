#!/usr/bin/env node

const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 2600;

app.use(express.json());
app.use(express.static('/Users/hilmes/Projects'));

// Theme configuration
const themes = {
    original: {
        name: 'Original Dashboard',
        file: '/Users/hilmes/Projects/project-dashboard-complete-light.html',
        description: 'Dark theme with colorful accents (now with light mode)'
    },
    excellence: {
        name: 'Swiss Excellence',
        file: '/Users/hilmes/Projects/project-dashboard-excellence-dark.html',
        description: 'Swiss design with Japanese aesthetic principles'
    },
    executive: {
        name: 'Executive Operations',
        file: '/Users/hilmes/Projects/executive-dashboard-dark.html',
        description: 'Executive-focused with advanced data visualization'
    }
};

// Store current theme in memory (in production, use a database or file)
// We'll also use a simple file to persist the selection
const THEME_PREFERENCE_FILE = path.join(__dirname, '.dashboard-theme-preference');
console.log('Theme preference file location:', THEME_PREFERENCE_FILE);

// Load saved theme preference
let currentTheme = 'original';
try {
    if (fs.existsSync(THEME_PREFERENCE_FILE)) {
        currentTheme = fs.readFileSync(THEME_PREFERENCE_FILE, 'utf8').trim();
    }
} catch (err) {
    console.log('No saved theme preference found, using default');
}

// Theme selector route
app.get('/themes', (req, res) => {
    serveThemeSelector(res);
});

// Theme switcher page
app.get('/', (req, res) => {
    const theme = req.query.theme;
    
    // If no theme specified, use the saved preference
    if (!theme) {
        // Redirect to the saved theme preference
        return res.redirect(`/?theme=${currentTheme}`);
    }
    
    if (themes[theme]) {
        // Save the theme preference
        currentTheme = theme;
        try {
            fs.writeFileSync(THEME_PREFERENCE_FILE, theme);
        } catch (err) {
            console.error('Failed to save theme preference:', err);
        }
        res.sendFile(themes[theme].file);
    } else {
        // Serve theme switcher if invalid theme
        serveThemeSelector(res);
    }
});

function serveThemeSelector(res) {
        res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Theme Selector</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, sans-serif;
            background: #0a0a0a;
            color: #ffffff;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            width: 100%;
        }
        
        h1 {
            font-size: 2.5rem;
            font-weight: 300;
            letter-spacing: -0.03em;
            margin-bottom: 48px;
            text-align: center;
        }
        
        .themes-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 24px;
            margin-bottom: 48px;
        }
        
        .theme-card {
            background: #111111;
            border: 1px solid #262626;
            border-radius: 8px;
            padding: 32px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }
        
        .theme-card:hover {
            border-color: #3b82f6;
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(59, 130, 246, 0.1);
        }
        
        .theme-card.active {
            border-color: #10b981;
            background: #10b981;
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%);
        }
        
        .theme-name {
            font-size: 1.5rem;
            font-weight: 500;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .theme-description {
            color: #999999;
            font-size: 0.875rem;
            line-height: 1.6;
            margin-bottom: 24px;
        }
        
        .theme-preview {
            width: 100%;
            height: 200px;
            background: #0a0a0a;
            border-radius: 4px;
            margin-bottom: 24px;
            position: relative;
            overflow: hidden;
        }
        
        .theme-preview img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0.8;
        }
        
        .theme-features {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 24px;
        }
        
        .feature-tag {
            padding: 4px 12px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            font-size: 0.75rem;
            color: #cccccc;
        }
        
        .theme-button {
            display: inline-block;
            padding: 12px 24px;
            background: #3b82f6;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 500;
            transition: all 0.2s ease;
            text-align: center;
        }
        
        .theme-button:hover {
            background: #2563eb;
            transform: translateY(-1px);
        }
        
        .current-theme {
            text-align: center;
            color: #666666;
            font-size: 0.875rem;
            margin-bottom: 24px;
        }
        
        .keyboard-shortcuts {
            text-align: center;
            color: #666666;
            font-size: 0.75rem;
            margin-top: 48px;
        }
        
        .shortcut {
            display: inline-block;
            padding: 2px 8px;
            background: #1a1a1a;
            border: 1px solid #333333;
            border-radius: 4px;
            font-family: monospace;
            margin: 0 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Dashboard Theme Selector</h1>
        
        <div class="current-theme">
            Current theme: <strong>${themes[currentTheme].name}</strong>
        </div>
        
        <div class="themes-grid">
            <div class="theme-card ${currentTheme === 'original' ? 'active' : ''}" onclick="selectTheme('original')">
                <h2 class="theme-name">
                    🌀 ${themes.original.name}
                </h2>
                <p class="theme-description">${themes.original.description}</p>
                <div class="theme-preview" style="background: linear-gradient(135deg, #000 0%, #030712 100%)"></div>
                <div class="theme-features">
                    <span class="feature-tag">Dark Mode</span>
                    <span class="feature-tag">Colorful Accents</span>
                    <span class="feature-tag">Emoji Icons</span>
                    <span class="feature-tag">PM2 Integration</span>
                </div>
                <a href="/?theme=original" class="theme-button">Open Dashboard</a>
            </div>
            
            <div class="theme-card ${currentTheme === 'excellence' ? 'active' : ''}" onclick="selectTheme('excellence')">
                <h2 class="theme-name">
                    ${themes.excellence.name}
                </h2>
                <p class="theme-description">${themes.excellence.description}</p>
                <div class="theme-preview" style="background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)"></div>
                <div class="theme-features">
                    <span class="feature-tag">Swiss Grid</span>
                    <span class="feature-tag">Typography Focus</span>
                    <span class="feature-tag">Dark Mode</span>
                    <span class="feature-tag">Data Visualization</span>
                </div>
                <a href="/?theme=excellence" class="theme-button">Open Dashboard</a>
            </div>
            
            <div class="theme-card ${currentTheme === 'executive' ? 'active' : ''}" onclick="selectTheme('executive')">
                <h2 class="theme-name">
                    ${themes.executive.name}
                </h2>
                <p class="theme-description">${themes.executive.description}</p>
                <div class="theme-preview" style="background: linear-gradient(135deg, #fafafa 0%, #e5e5e5 100%)"></div>
                <div class="theme-features">
                    <span class="feature-tag">Executive KPIs</span>
                    <span class="feature-tag">Dark Mode</span>
                    <span class="feature-tag">Tufte Charts</span>
                    <span class="feature-tag">Risk Metrics</span>
                </div>
                <a href="/?theme=executive" class="theme-button">Open Dashboard</a>
            </div>
        </div>
        
        <div class="keyboard-shortcuts">
            Quick switch: <span class="shortcut">1</span> Original | <span class="shortcut">2</span> Excellence | <span class="shortcut">3</span> Executive
        </div>
    </div>
    
    <script>
        function selectTheme(theme) {
            window.location.href = '/?theme=' + theme;
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case '1':
                    selectTheme('original');
                    break;
                case '2':
                    selectTheme('excellence');
                    break;
                case '3':
                    selectTheme('executive');
                    break;
            }
        });
    </script>
</body>
</html>
        `);
}

// API endpoint to get current theme
app.get('/api/theme', (req, res) => {
    res.json({
        current: currentTheme,
        available: Object.keys(themes).map(key => ({
            id: key,
            ...themes[key]
        }))
    });
});

// API endpoint to set theme
app.post('/api/theme', (req, res) => {
    const { theme } = req.body;
    
    if (themes[theme]) {
        currentTheme = theme;
        try {
            fs.writeFileSync(THEME_PREFERENCE_FILE, theme);
        } catch (err) {
            console.error('Failed to save theme preference:', err);
        }
        res.json({ success: true, theme: currentTheme });
    } else {
        res.status(400).json({ error: 'Invalid theme' });
    }
});

// API endpoint to launch servers
app.post('/api/launch-server', (req, res) => {
    const { dir, cmd } = req.body;
    
    if (!dir || !cmd) {
        return res.status(400).json({ error: 'Missing dir or cmd' });
    }
    
    // Check if directory exists
    if (!fs.existsSync(dir)) {
        return res.status(404).json({ error: `Directory not found: ${dir}` });
    }
    
    console.log(`Launching: ${cmd} in ${dir}`);
    
    // Parse command
    const [command, ...args] = cmd.split(' ');
    
    // Spawn the process
    const child = spawn(command, args, {
        cwd: dir,
        detached: true,
        stdio: 'ignore'
    });
    
    child.unref();
    
    res.json({ 
        success: true, 
        message: `Launched ${cmd} in ${dir}`,
        pid: child.pid 
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        currentTheme: currentTheme 
    });
});

app.listen(PORT, () => {
    console.log(`Enhanced Dashboard server running at http://localhost:${PORT}`);
    console.log(`Current theme preference: ${currentTheme}`);
    console.log(`Dashboard will open at: http://localhost:${PORT}/ (${themes[currentTheme].name})`);
    console.log(`\nAvailable themes:`);
    console.log(`  - Original: http://localhost:${PORT}/?theme=original`);
    console.log(`  - Excellence: http://localhost:${PORT}/?theme=excellence`);
    console.log(`  - Executive: http://localhost:${PORT}/?theme=executive`);
    console.log(`\nTheme selector: http://localhost:${PORT}/themes`);
});