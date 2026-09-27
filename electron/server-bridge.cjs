const { app } = require('electron');
const { fork } = require('child_process');
const path = require('path');
const fs = require('fs');
const net = require('net');

let serverProcess = null;
let serverPort = null;

/**
 * Find an available port on the system.
 */
function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.on('error', reject);
  });
}

/**
 * Get the user data directory where the SQLite database and config files are stored.
 */
function getDataDir() {
  const dataDir = path.join(app.getPath('userData'), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return dataDir;
}

/**
 * Get the default storage root directory for saved documents (PDFs/JSONs).
 */
function getDefaultStorageRoot() {
  const storageRoot = path.join(app.getPath('documents'), 'CargoArchive');
  if (!fs.existsSync(storageRoot)) {
    fs.mkdirSync(storageRoot, { recursive: true });
  }
  return storageRoot;
}

/**
 * Start the embedded Express server as a child process.
 * Sets up environment variables for SQLite and storage paths.
 */
async function startEmbeddedServer() {
  const port = await findFreePort();
  serverPort = port;

  const dataDir = getDataDir();
  const dbPath = path.join(dataDir, 'cargo_data.db');
  const storageRoot = getDefaultStorageRoot();

  // If database doesn't exist or is empty, seed from template desktop.db
  const templateDb = app.isPackaged
    ? path.join(process.resourcesPath, 'server', 'prisma', 'desktop.db')
    : path.join(__dirname, '..', 'server', 'prisma', 'desktop.db');

  if (fs.existsSync(templateDb) && (!fs.existsSync(dbPath) || fs.statSync(dbPath).size === 0)) {
    console.log(`[ServerBridge] Initializing new SQLite database from template: ${templateDb}`);
    try {
      fs.copyFileSync(templateDb, dbPath);
    } catch (err) {
      console.warn('[ServerBridge] Failed to copy template database:', err.message);
    }
  }

  // Determine the server entry point path
  let serverEntryPath;
  if (app.isPackaged) {
    // In packaged app, server files are bundled alongside Electron
    serverEntryPath = path.join(process.resourcesPath, 'server', 'src', 'server.js');
  } else {
    // In development, use the local server directory
    serverEntryPath = path.join(__dirname, '..', 'server', 'src', 'server.js');
  }

  console.log(`[ServerBridge] Starting embedded server on port ${port}`);
  console.log(`[ServerBridge] Database: ${dbPath}`);
  console.log(`[ServerBridge] Storage: ${storageRoot}`);
  console.log(`[ServerBridge] Entry: ${serverEntryPath}`);

  // Stable persistent secret across desktop restarts
  const secretFile = path.join(dataDir, '.desktop_secret');
  let desktopSecret;
  if (fs.existsSync(secretFile)) {
    try {
      desktopSecret = fs.readFileSync(secretFile, 'utf8').trim();
    } catch {}
  }
  if (!desktopSecret) {
    desktopSecret = 'cargo-ms-desktop-secret-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    try {
      fs.writeFileSync(secretFile, desktopSecret, 'utf8');
    } catch {}
  }

  return new Promise((resolve, reject) => {
    // Fork the Express server as a child process
    serverProcess = fork(serverEntryPath, [], {
      env: {
        ...process.env,
        EMBEDDED_PORT: String(port),
        PORT: String(port),
        ELECTRON_EMBEDDED: 'true',
        DATABASE_URL: `file:${dbPath}`,
        DESKTOP_DATABASE_URL: `file:${dbPath}`,
        STORAGE_ROOT: storageRoot,
        CLOUD_API_URL: process.env.CLOUD_API_URL || 'http://localhost:5000/api',
        JWT_SECRET: desktopSecret + '-access',
        JWT_REFRESH_SECRET: desktopSecret + '-refresh',
        JWT_EXPIRES_IN: '30d',
        JWT_REFRESH_EXPIRES_IN: '30d',
        NODE_ENV: 'production',
      },
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
    });

    // Listen for the server ready signal
    serverProcess.on('message', (msg) => {
      if (msg.type === 'SERVER_READY') {
        console.log(`[ServerBridge] ✅ Server ready on port ${msg.port}`);
        resolve(msg.port);
      }
    });

    serverProcess.stdout?.on('data', (data) => {
      console.log(`[Server] ${data.toString().trim()}`);
    });

    serverProcess.stderr?.on('data', (data) => {
      console.error(`[Server Error] ${data.toString().trim()}`);
    });

    serverProcess.on('error', (err) => {
      console.error('[ServerBridge] Failed to start server:', err.message);
      reject(err);
    });

    serverProcess.on('exit', (code) => {
      console.log(`[ServerBridge] Server process exited with code ${code}`);
      serverProcess = null;
    });

    // Timeout fallback: if no IPC message received, assume server is ready after a delay
    setTimeout(() => {
      if (serverProcess && !serverProcess.killed) {
        console.log(`[ServerBridge] Assuming server ready (timeout fallback)`);
        resolve(port);
      }
    }, 5000);
  });
}

/**
 * Gracefully stop the embedded server.
 */
async function stopEmbeddedServer() {
  if (serverProcess) {
    console.log('[ServerBridge] Stopping embedded server...');
    serverProcess.kill('SIGTERM');
    serverProcess = null;
    serverPort = null;
  }
}

/**
 * Get the current server port.
 */
function getServerPort() {
  return serverPort;
}

module.exports = { startEmbeddedServer, stopEmbeddedServer, getServerPort };
