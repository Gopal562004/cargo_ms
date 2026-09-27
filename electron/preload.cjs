const { contextBridge, ipcRenderer } = require('electron');

/**
 * Electron Preload Script
 * Exposes safe, sandboxed APIs from the Electron main process
 * to the React renderer via window.electronAPI
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // ─── File System & Shell ────────────────────────────
  selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
  openFile: (filePath) => ipcRenderer.invoke('shell:openFile', filePath),
  showInFolder: (filePath) => ipcRenderer.invoke('shell:showInFolder', filePath),

  // ─── App Info ───────────────────────────────────────
  getApiPort: () => ipcRenderer.invoke('app:getApiPort'),
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getDataPath: () => ipcRenderer.invoke('app:getDataPath'),

  // ─── Utility ────────────────────────────────────────
  isElectron: true,

  // ─── Auto Updater ────────────────────────────────────
  checkForUpdates: () => ipcRenderer.invoke('updater:check'),
  quitAndInstall: () => ipcRenderer.invoke('updater:quitAndInstall'),
  onUpdaterStatus: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('updater:status', handler);
    return () => ipcRenderer.removeListener('updater:status', handler);
  },

  /**
   * Get the full API base URL for the embedded Express server.
   * Used by the React client's api.js to determine where to send requests.
   */
  getApiUrl: async () => {
    const port = await ipcRenderer.invoke('app:getApiPort');
    return `http://localhost:${port}/api`;
  },
});
