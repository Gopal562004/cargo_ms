const { app, BrowserWindow, ipcMain, dialog, shell, Menu, Tray, nativeImage } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');
const { startEmbeddedServer, stopEmbeddedServer, getServerPort } = require('./server-bridge.cjs');

// Disable hardware acceleration for better compatibility
app.disableHardwareAcceleration();

// Set Application User Model ID so Windows taskbar displays our custom BrandLogo icon
if (process.platform === 'win32') {
  app.setAppUserModelId('com.cargoms.desktop');
}

let mainWindow = null;
let tray = null;
const IS_DEV = !app.isPackaged;

function getAppIcon() {
  const icoPath = path.join(__dirname, '..', 'assets', 'icon.ico');
  const pngPath = path.join(__dirname, '..', 'assets', 'icon.png');
  if (process.platform === 'win32' && fs.existsSync(icoPath)) {
    return icoPath;
  }
  return pngPath;
}

/**
 * Create the main application window.
 */
async function createWindow() {
  // Start the embedded Express server first
  const port = await startEmbeddedServer();
  const iconPath = getAppIcon();

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'CargoMS Desktop - Logistics OS',
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    show: false,
    backgroundColor: '#0f172a',
  });

  if (process.platform === 'win32') {
    mainWindow.setIcon(iconPath);
  }

  // Load the app
  if (IS_DEV) {
    // In development, load from Vite dev server
    mainWindow.loadURL(`http://localhost:5173`);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    // In production, load the built React app from disk
    mainWindow.loadFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
  }

  // Inject the API URL into the renderer once loaded
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript(`
      window.__ELECTRON_API_PORT__ = ${port};
      window.__ELECTRON_API_URL__ = 'http://localhost:${port}/api';
    `);
  });

  // Security: Restrict new windows and open external URLs in OS default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:') || url.startsWith('mailto:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Security: Prevent in-app navigation away from application bundle
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    try {
      const parsedUrl = new URL(navigationUrl);
      const isDevVite = IS_DEV && parsedUrl.host === 'localhost:5173';
      const isFileProtocol = parsedUrl.protocol === 'file:';
      if (!isDevVite && !isFileProtocol) {
        event.preventDefault();
        if (navigationUrl.startsWith('http:') || navigationUrl.startsWith('https:')) {
          shell.openExternal(navigationUrl);
        }
      }
    } catch {
      event.preventDefault();
    }
  });

  // Show window once ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('close', (event) => {
    // Minimize to tray instead of closing on Windows
    if (process.platform === 'win32' && tray) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Create system tray icon.
 */
function createTray() {
  const iconPath = path.join(__dirname, '..', 'assets', 'icon.png');
  let trayIcon;
  try {
    trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  } catch {
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon);
  tray.setToolTip('CargoMS Desktop');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open CargoMS',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

/**
 * Set up application menu.
 */
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Document',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow?.webContents.executeJavaScript(`window.location.hash = '#/new'`);
          },
        },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow?.webContents.executeJavaScript(`window.location.hash = '#/settings'`);
          },
        },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About CargoMS Desktop',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About CargoMS Desktop',
              message: `CargoMS Desktop v${app.getVersion()}`,
              detail: 'Enterprise Cargo Document Management & Billing Software\n\n© 2026 CargoMS. All rights reserved.',
            });
          },
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ─── IPC Handlers (called from preload.cjs) ─────────

// Native file dialog: select folder
ipcMain.handle('dialog:selectFolder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
    title: 'Choose Document Storage Folder',
  });
  return result.canceled ? null : result.filePaths[0];
});

// Open a file with the default OS application (safeguarded against executable execution)
ipcMain.handle('shell:openFile', async (_event, filePath) => {
  if (!filePath || typeof filePath !== 'string') return;
  const ext = path.extname(filePath).toLowerCase();
  const dangerousExts = ['.exe', '.bat', '.cmd', '.ps1', '.vbs', '.js', '.msi', '.com', '.reg', '.wsf', '.scr'];
  if (dangerousExts.includes(ext)) {
    console.warn(`[Electron] Blocked opening potentially harmful file: ${filePath}`);
    return;
  }
  return shell.openPath(filePath);
});

// Reveal a file in Windows Explorer / macOS Finder
ipcMain.handle('shell:showInFolder', async (_event, filePath) => {
  shell.showItemInFolder(filePath);
});

// Get the current API port
ipcMain.handle('app:getApiPort', () => {
  return getServerPort();
});

// Get app version
ipcMain.handle('app:getVersion', () => {
  return app.getVersion();
});

// Get app data path (for SQLite, config, etc.)
ipcMain.handle('app:getDataPath', () => {
  return app.getPath('userData');
});

// ─── Auto-Updater (Method 1: GitHub Releases) ─────────

function sendToRenderer(channel, data) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, data);
  }
}

function setupAutoUpdater() {
  autoUpdater.logger = console;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    console.log('[AutoUpdater] Checking for updates on GitHub Releases...');
    sendToRenderer('updater:status', { status: 'checking' });
  });

  autoUpdater.on('update-available', (info) => {
    console.log('[AutoUpdater] Update available:', info?.version);
    sendToRenderer('updater:status', {
      status: 'available',
      version: info?.version,
      releaseNotes: info?.releaseNotes,
    });
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('[AutoUpdater] Application is up-to-date.');
    sendToRenderer('updater:status', {
      status: 'not-available',
      version: app.getVersion(),
    });
  });

  autoUpdater.on('download-progress', (progressObj) => {
    sendToRenderer('updater:status', {
      status: 'downloading',
      percent: Math.round(progressObj.percent || 0),
      transferred: progressObj.transferred,
      total: progressObj.total,
      bytesPerSecond: progressObj.bytesPerSecond,
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('[AutoUpdater] Update downloaded successfully:', info?.version);
    sendToRenderer('updater:status', {
      status: 'downloaded',
      version: info?.version,
    });
  });

  autoUpdater.on('error', (err) => {
    console.warn('[AutoUpdater] Error checking/downloading update:', err?.message || err);
    sendToRenderer('updater:status', {
      status: 'error',
      error: err?.message || 'Failed to check for updates',
    });
  });
}

// IPC Handlers for Auto-Updater
ipcMain.handle('updater:check', async () => {
  if (IS_DEV) {
    return {
      success: true,
      isDev: true,
      message: 'Running in development mode. Auto-update checks activate in the packaged installer (.exe).',
    };
  }
  try {
    const result = await autoUpdater.checkForUpdates();
    return { success: true, updateInfo: result?.updateInfo };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('updater:quitAndInstall', () => {
  if (!IS_DEV) {
    autoUpdater.quitAndInstall();
  }
});

// ─── App Lifecycle ───────────────────────────────────

app.whenReady().then(async () => {
  createMenu();
  createTray();
  setupAutoUpdater();
  await createWindow();

  // Background update check in packaged app (runs 8s after launch)
  if (!IS_DEV) {
    setTimeout(() => {
      autoUpdater.checkForUpdates().catch((err) => {
        console.log('[AutoUpdater] Background check notification:', err.message);
      });
    }, 8000);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  app.isQuitting = true;
  await stopEmbeddedServer();
});
