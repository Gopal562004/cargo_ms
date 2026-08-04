import 'dotenv/config';
import app from './app.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

globalThis.prisma = prisma;

async function main() {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });

  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL database connected successfully');
  } catch (error) {
    console.error('\n⚠️  [DATABASE CONNECTION ERROR]');
    console.error('Could not connect to PostgreSQL database.');
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
