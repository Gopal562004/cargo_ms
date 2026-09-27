import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        subscriptionExpiresAt: true,
        licenseKey: true,
      },
    });
    console.log('✅ Found users in Cloud PostgreSQL:');
    console.dir(users, { depth: null });
  } catch (err) {
    console.error('❌ Error reading Cloud DB:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
