#!/usr/bin/env node

const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 2600;

app.use(express.json());
app.use(express.static('/Users/hilmes/Projects'));

// Serve the dashboard
app.get('/', (req, res) => {
    res.sendFile('/Users/hilmes/Projects/project-dashboard-complete.html');
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
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Dashboard server running at http://localhost:${PORT}`);
    console.log(`Dashboard available at http://localhost:${PORT}/`);
});