import { Router } from 'express';
import path from 'path';
import fs from 'fs';

const router = Router();

/**
 * GET /api/download/info
 * Returns metadata about available desktop software downloads.
 */
router.get('/info', (req, res) => {
  res.json({
    success: true,
    version: '1.0.0',
    name: 'CargoMS Desktop',
    platforms: {
      windows: {
        installer: {
          name: 'CargoMS-Setup-1.0.0.exe',
          type: 'NSIS Installer (64-bit)',
          arch: 'x64',
          recommended: true,
        },
        portable: {
          name: 'CargoMS-Portable-1.0.0.exe',
          type: 'Portable Executable',
          arch: 'x64',
        },
      },
      mac: {
        arm64: {
          name: 'CargoMS-1.0.0-arm64.dmg',
          type: 'Apple Silicon DMG (M1/M2/M3/M4)',
          arch: 'arm64',
          recommended: true,
        },
        x64: {
          name: 'CargoMS-1.0.0-x64.dmg',
          type: 'Intel Mac DMG',
          arch: 'x64',
        },
      },
      linux: {
        appimage: {
          name: 'CargoMS-1.0.0.AppImage',
          type: 'Universal AppImage',
          arch: 'x64',
        },
        deb: {
          name: 'CargoMS-1.0.0.deb',
          type: 'Debian / Ubuntu Package',
          arch: 'x64',
        },
      },
    },
  });
});

/**
 * GET /api/download/desktop
 * Serves the compiled desktop client binary or guides the user.
 */
router.get('/desktop', (req, res) => {
  const os = (req.query.os || 'windows').toLowerCase();
  const filename = req.query.file || (os === 'mac' ? 'CargoMS-1.0.0-arm64.dmg' : 'CargoMS-Setup-1.0.0.exe');

  // Search candidate directories where electron-builder outputs
  const candidateDirs = [
    path.join(process.cwd(), 'dist-electron'),
    path.join(process.cwd(), '..', 'dist-electron'),
    path.resolve(process.cwd(), '..', 'dist-electron'),
    path.resolve(process.cwd(), 'dist-electron'),
    path.join(process.cwd(), 'downloads'),
  ];

  // Exact filename search
  for (const dir of candidateDirs) {
    if (!fs.existsSync(dir)) continue;
    const targetPath = path.join(dir, filename);
    if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
      return res.download(targetPath, filename);
    }
  }

  // Fallback: Fuzzy search in candidate directories for electron-builder generated files
  for (const dir of candidateDirs) {
    if (!fs.existsSync(dir)) continue;
    try {
      const files = fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isFile());
      
      let matchedFile = null;
      if (os === 'windows') {
        const isPortable = filename.toLowerCase().includes('portable');
        if (isPortable) {
          matchedFile = files.find(f => f.endsWith('.exe') && f.toLowerCase().includes('portable'));
        } else {
          matchedFile = files.find(f => f.endsWith('.exe') && f.toLowerCase().includes('setup')) ||
                        files.find(f => f.endsWith('.exe') && !f.toLowerCase().includes('portable'));
        }
      } else if (os === 'mac') {
        const isArm = filename.toLowerCase().includes('arm64');
        if (isArm) {
          matchedFile = files.find(f => f.endsWith('.dmg') && f.toLowerCase().includes('arm64')) ||
                        files.find(f => f.endsWith('.dmg'));
        } else {
          matchedFile = files.find(f => f.endsWith('.dmg') && (f.toLowerCase().includes('x64') || f.toLowerCase().includes('intel'))) ||
                        files.find(f => f.endsWith('.dmg'));
        }
      } else if (os === 'linux') {
        if (filename.endsWith('.deb')) {
          matchedFile = files.find(f => f.endsWith('.deb'));
        } else {
          matchedFile = files.find(f => f.endsWith('.appimage') || f.endsWith('.AppImage'));
        }
      }

      if (matchedFile) {
        const fullPath = path.join(dir, matchedFile);
        console.log(`[Download] Serving binary: ${fullPath}`);
        return res.download(fullPath, matchedFile);
      }
    } catch (e) {
      console.warn('[Download] Error inspecting candidate directory:', e.message);
    }
  }

  // If binary is not yet compiled on this machine, return 404 so browsers don't save JSON as an .exe
  return res.status(404).json({
    success: false,
    message: `Installer binary "${filename}" is currently compiling or not yet generated.`,
    downloadDetails: {
      file: filename,
      os,
      version: '1.0.0',
      instruction: 'To build the standalone installer on your system, run: npm run electron:build:win',
      buildOutputsDirectory: 'dist-electron/',
    },
  });
});

export default router;
