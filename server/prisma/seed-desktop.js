import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function seedDesktop() {
  console.log('🌱 Seeding SQLite Desktop Database...');

  // Import desktop PrismaClient
  const { PrismaClient } = await import('../node_modules/.prisma/desktop-client/index.js');
  
  // Point explicitly to the desktop database file
  const dbFile = process.env.DESKTOP_DATABASE_URL || `file:${path.join(__dirname, 'desktop.db')}`;
  console.log(`[SeedDesktop] Database: ${dbFile}`);
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: dbFile,
      },
    },
  });

  try {
    const allServices = JSON.stringify([
      'AIR_FREIGHT',
      'EDI_CARGO',
      'SEA_FREIGHT',
      'SALES_BILLING',
      'PURCHASE_BILLS',
      'BILLING_TEMPLATES',
      'CONTACTS_DIRECTORY',
      'TEMPLATES_MANAGEMENT',
      'MASTER_ADMIN',
    ]);

    // 1. Admin User
    const adminHash = await bcrypt.hash('Admin@2004', 12);
    await prisma.user.upsert({
      where: { username: 'admin' },
      update: {
        passwordHash: adminHash,
        role: 'ADMIN',
        isActive: true,
        allowedServices: allServices,
      },
      create: {
        username: 'admin',
        email: 'admin@cargologistics.com',
        passwordHash: adminHash,
        name: 'Master Administrator',
        company: 'Global Cargo Logistics',
        department: 'Management',
        role: 'ADMIN',
        isActive: true,
        allowedServices: allServices,
        subscriptionPlan: 'ENTERPRISE',
        subscriptionStatus: 'ACTIVE',
        subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });
    console.log('✅ Created/Updated user: admin (Password: Admin@2004)');

    // 2. Mayur52004 User
    const mayurHash = await bcrypt.hash('Mayur@2004', 12);
    await prisma.user.upsert({
      where: { username: 'mayur52004' },
      update: {
        passwordHash: mayurHash,
        role: 'OPERATOR',
        isActive: true,
        allowedServices: allServices,
      },
      create: {
        username: 'mayur52004',
        email: 'mayur@cargologistics.com',
        passwordHash: mayurHash,
        name: 'Demo Operator',
        company: 'Global Cargo Logistics',
        department: 'Accounts & Billing',
        phone: '+91 98000 00000',
        role: 'OPERATOR',
        isActive: true,
        allowedServices: allServices,
        subscriptionPlan: 'ENTERPRISE',
        subscriptionStatus: 'ACTIVE',
        subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });
    console.log('✅ Created/Updated user: mayur52004 (Password: Mayur@2004)');

    // 3. Mayur56004 alias (user typed in screenshot)
    await prisma.user.upsert({
      where: { username: 'mayur56004' },
      update: {
        passwordHash: mayurHash,
        role: 'ADMIN',
        isActive: true,
        allowedServices: allServices,
      },
      create: {
        username: 'mayur56004',
        email: 'mayur56004@cargologistics.com',
        passwordHash: mayurHash,
        name: 'Demo Operator',
        company: 'Global Cargo Logistics',
        department: 'Logistics Operations',
        phone: '+91 98000 00000',
        role: 'ADMIN',
        isActive: true,
        allowedServices: allServices,
        subscriptionPlan: 'ENTERPRISE',
        subscriptionStatus: 'ACTIVE',
        subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });
    console.log('✅ Created/Updated user: mayur56004 (Password: Mayur@2004)');

    console.log('🎉 SQLite Desktop Database seeded successfully!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

seedDesktop().catch((err) => {
  console.error(err);
  process.exit(1);
});
