import 'dotenv/config';
import app from './app.js';
import prisma from './config/database.js';

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

  try {
    await prisma.$connect();
    console.log('✅ SQLite database connected successfully');
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
