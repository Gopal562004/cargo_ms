import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import app from './app.js';
import prisma from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.EMBEDDED_PORT || process.env.PORT || 5000;
const IS_EMBEDDED = process.env.ELECTRON_EMBEDDED === 'true';

async function main() {
  const server = app.listen(PORT, () => {
    if (IS_EMBEDDED) {
      console.log(`⚡ Embedded server running on http://localhost:${PORT}`);
      // Signal to Electron parent process that server is ready
      if (process.send) {
        process.send({ type: 'SERVER_READY', port: PORT });
      }
    } else {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    }
  });

  // Embedded desktop self-healing: verify database has tables before connecting
  if (IS_EMBEDDED) {
    try {
      const dbUrl = process.env.DESKTOP_DATABASE_URL || process.env.DATABASE_URL;
      if (dbUrl && dbUrl.startsWith('file:')) {
        const rawDbPath = dbUrl.replace(/^file:/, '');
        const targetDbPath = path.isAbsolute(rawDbPath)
          ? rawDbPath
          : path.resolve(process.cwd(), rawDbPath);

        const isTargetEmpty = !fs.existsSync(targetDbPath) || fs.statSync(targetDbPath).size < 32768;

        if (isTargetEmpty) {
          const candidateTemplates = [
            process.env.DESKTOP_TEMPLATE_DB,
            path.join(__dirname, '..', 'prisma', 'desktop.db'),
            path.join(process.cwd(), 'prisma', 'desktop.db'),
            path.join(process.cwd(), 'server', 'prisma', 'desktop.db'),
          ].filter(Boolean);

          const templatePath = candidateTemplates.find((p) => {
            try {
              return fs.existsSync(p) && fs.statSync(p).size > 32768;
            } catch {
              return false;
            }
          });

          if (templatePath) {
            console.log(`[Server] Auto-restoring empty/missing SQLite database from template: ${templatePath}`);
            const targetDir = path.dirname(targetDbPath);
            if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
            if (fs.existsSync(targetDbPath)) {
              try { fs.unlinkSync(targetDbPath); } catch {}
            }
            fs.copyFileSync(templatePath, targetDbPath);
            console.log(`[Server] ✅ SQLite database restored (${fs.statSync(targetDbPath).size} bytes)`);
          }
        }
      }
    } catch (dbInitErr) {
      console.warn('[Server] Note on DB initialization check:', dbInitErr.message);
    }
  }

  try {
    await prisma.$connect();
    console.log('✅ SQLite database connected successfully');

    if (IS_EMBEDDED) {
      try {
        const userCount = await prisma.user.count();
        console.log(`✅ Table verified: ${userCount} user(s) ready in local database`);
      } catch (tableErr) {
        console.error('❌ Table check failed:', tableErr.message);
      }
    }
  } catch (error) {
    console.error('\n⚠️  [DATABASE CONNECTION ERROR]');
    console.error('Could not connect to SQLite database.');
    console.error('Details:', error.message);
  }
}

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

main();
