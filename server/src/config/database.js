import { PrismaClient as StandardPrismaClient } from '@prisma/client';

/**
 * Database Configuration — Dual Mode
 * 
 * WEB MODE (default):
 *   - Uses PostgreSQL via DATABASE_URL from .env
 *   - Standard Prisma Client from schema.prisma
 * 
 * DESKTOP MODE (ELECTRON_EMBEDDED=true):
 *   - Uses SQLite via DESKTOP_DATABASE_URL / DATABASE_URL set by Electron server-bridge
 *   - Prisma Client generated from schema.desktop.prisma (.prisma/desktop-client)
 *   - All JSON/array fields are stored as strings (handled by sqlite-helpers.js)
 */

let ClientClass = StandardPrismaClient;

if (process.env.ELECTRON_EMBEDDED === 'true') {
  try {
    const desktop = await import('../../node_modules/.prisma/desktop-client/index.js');
    ClientClass = desktop.PrismaClient;
    console.log('[Database] Loaded SQLite Desktop Prisma Client');
  } catch (err) {
    console.warn('[Database] Could not load desktop SQLite client, using standard:', err.message);
  }
}

let clientOptions = {};
if (process.env.ELECTRON_EMBEDDED === 'true') {
  const dbUrl = process.env.DESKTOP_DATABASE_URL || process.env.DATABASE_URL;
  if (dbUrl) {
    clientOptions = {
      datasources: {
        db: { url: dbUrl },
      },
    };
  }
}

const prisma = globalThis.prisma || new ClientClass(clientOptions);

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
