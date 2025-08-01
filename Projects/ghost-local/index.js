const ghost = require('ghost');
const path = require('path');

// Ghost configuration for Vercel
const config = {
    url: process.env.url || 'https://aircraftexecutives.vercel.app',
    server: {
        host: process.env.server__host || '0.0.0.0',
        port: process.env.PORT || process.env.server__port || 2368
    },
    database: {
        client: 'mysql2',
        connection: {
            host: process.env.database__connection__host,
            user: process.env.database__connection__user,
            password: process.env.database__connection__password,
            database: process.env.database__connection__database,
            charset: 'utf8mb4'
        }
    },
    mail: {
        transport: 'Direct'
    },
    logging: {
        transports: ['stdout']
    },
    process: 'local',
    paths: {
        contentPath: path.join(__dirname, 'content/')
    },
    privacy: {
        useGravatar: false
    }
};

let ghostServer;

async function startGhost() {
    if (!ghostServer) {
        ghostServer = await ghost(config);
        await ghostServer.start();
    }
    return ghostServer;
}

module.exports = async (req, res) => {
    try {
        const server = await startGhost();
        return server.rootApp(req, res);
    } catch (error) {
        console.error('Ghost server error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// For local development
if (require.main === module) {
    startGhost().then(() => {
        console.log('Ghost server started successfully');
    }).catch(error => {
        console.error('Failed to start Ghost server:', error);
        process.exit(1);
    });
}