import prisma from '../config/database.js';
import { AppError } from '../middleware/error.middleware.js';
import {
  hydrateDocument,
  hydrateDocuments,
  dehydrateDocumentData,
  parseJsonField,
  stringifyJsonField,
  isDesktopMode,
  stringifyAllowedServices,
} from '../utils/sqlite-helpers.js';
import { getCloudApiUrl } from './auth.service.js';

const EXPORT_SCHEMA_VERSION = '1.0.0';

/**
 * Export all user data as a portable JSON payload.
 * Includes: documents (with packages + statusHistory), contacts, templates.
 */
export async function exportUserData(userId) {
  const [documents, contacts, templates] = await Promise.all([
    prisma.document.findMany({
      where: { createdById: userId },
      include: {
        packages: true,
        statusHistory: { orderBy: { changedAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.contact.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.template.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  // Hydrate for consistent output (handles SQLite JSON string → object)
  const hydratedDocs = documents.map((doc) => ({
    ...doc,
    data: parseJsonField(doc.data, {}),
    packages: doc.packages || [],
    statusHistory: doc.statusHistory || [],
  }));

  // Deduplicate documents: prioritize active documents over CANCELLED duplicates
  const docMap = new Map();
  const unNumberedDocs = [];
  for (const doc of hydratedDocs) {
    if (!doc.documentNumber) {
      unNumberedDocs.push(doc);
      continue;
    }
    const existing = docMap.get(doc.documentNumber);
    if (!existing) {
      docMap.set(doc.documentNumber, doc);
    } else {
      // If previously stored duplicate was CANCELLED and current one is active, replace with active
      if (existing.status === 'CANCELLED' && doc.status !== 'CANCELLED') {
        docMap.set(doc.documentNumber, doc);
      }
    }
  }
  const exportedDocuments = [...docMap.values(), ...unNumberedDocs];

  const hydratedTemplates = templates.map((tpl) => ({
    ...tpl,
    data: parseJsonField(tpl.data, {}),
  }));

  return {
    schemaVersion: EXPORT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    source: isDesktopMode() ? 'DESKTOP' : 'WEB',
    summary: {
      documents: exportedDocuments.length,
      contacts: contacts.length,
      templates: hydratedTemplates.length,
    },
    documents: exportedDocuments,
    contacts,
    templates: hydratedTemplates,
  };
}

/**
 * Import user data from a backup payload into the database.
 * Deduplicates by documentNumber (documents), name+email (contacts), and id (templates).
 */
export async function importUserData(userId, payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Invalid backup payload', 400);
  }

  const { documents = [], contacts = [], templates = [] } = payload;
  const stats = { documents: 0, contacts: 0, templates: 0, skipped: 0 };

  // ─── Import Documents ──────────────────────────────────────
  for (const doc of documents) {
    try {
      const docDate = doc.createdAt ? new Date(doc.createdAt) : new Date();
      const updatedDate = doc.updatedAt ? new Date(doc.updatedAt) : new Date();

      // If a document with the same documentNumber already exists, update it with cloud data
      if (doc.documentNumber) {
        const existing = await prisma.document.findFirst({
          where: { documentNumber: doc.documentNumber, createdById: userId },
        });
        if (existing) {
          // If the existing record is active and incoming is CANCELLED, do not downgrade to CANCELLED
          if (existing.status !== 'CANCELLED' && doc.status === 'CANCELLED') {
            stats.skipped++;
            continue;
          }

          await prisma.document.update({
            where: { id: existing.id },
            data: {
              title: doc.title || existing.title,
              category: doc.category || existing.category,
              documentType: doc.documentType || existing.documentType,
              status: doc.status || existing.status,
              version: doc.version || existing.version,
              data: dehydrateDocumentData(doc.data || {}),
              createdAt: docDate,
              updatedAt: updatedDate,
            },
          });
          stats.documents++;
          continue;
        }
      }

      const category = doc.category || 'OTHER';
      const documentType = doc.documentType;
      if (!documentType) {
        stats.skipped++;
        continue;
      }

      const created = await prisma.document.create({
        data: {
          documentType,
          category,
          title: doc.title || `${documentType} - ${doc.documentNumber || 'Imported'}`,
          documentNumber: doc.documentNumber || null,
          status: doc.status || 'DRAFT',
          version: doc.version || 1,
          data: dehydrateDocumentData(doc.data || {}),
          createdById: userId,
          createdAt: docDate,
          updatedAt: updatedDate,
          ...(doc.packages && doc.packages.length > 0 && {
            packages: {
              create: doc.packages.map((pkg) => ({
                pieceNumber: pkg.pieceNumber || 1,
                length: pkg.length || null,
                width: pkg.width || null,
                height: pkg.height || null,
                dimensionUnit: pkg.dimensionUnit || 'CM',
                weight: pkg.weight || 0,
                weightUnit: pkg.weightUnit || 'KG',
                description: pkg.description || null,
                marks: pkg.marks || null,
                hazClass: pkg.hazClass || null,
                unNumber: pkg.unNumber || null,
              })),
            },
          }),
          statusHistory: {
            create: {
              status: doc.status || 'DRAFT',
              note: 'Imported from backup',
              changedBy: userId,
            },
          },
        },
      });

      stats.documents++;
    } catch (err) {
      console.warn('[Migration] Skipped document import:', doc.documentNumber, err.message);
      stats.skipped++;
    }
  }

  // ─── Import Contacts ──────────────────────────────────────
  for (const contact of contacts) {
    try {
      if (!contact.name || !contact.type) {
        stats.skipped++;
        continue;
      }

      // Deduplicate by name (case-insensitive) for this user
      const existingContact = await prisma.contact.findFirst({
        where: {
          createdById: userId,
          name: contact.name,
          type: contact.type,
        },
      });

      if (existingContact) {
        stats.skipped++;
        continue;
      }

      await prisma.contact.create({
        data: {
          type: contact.type,
          name: contact.name,
          company: contact.company || null,
          address: contact.address || null,
          city: contact.city || null,
          state: contact.state || null,
          country: contact.country || null,
          postalCode: contact.postalCode || null,
          phone: contact.phone || null,
          email: contact.email || null,
          fax: contact.fax || null,
          iataCode: contact.iataCode || null,
          accountNumber: contact.accountNumber || null,
          taxId: contact.taxId || null,
          notes: contact.notes || null,
          createdById: userId,
        },
      });

      stats.contacts++;
    } catch (err) {
      console.warn('[Migration] Skipped contact import:', contact.name, err.message);
      stats.skipped++;
    }
  }

  // ─── Import Templates ──────────────────────────────────────
  for (const tpl of templates) {
    try {
      if (!tpl.name || !tpl.documentType) {
        stats.skipped++;
        continue;
      }

      // Deduplicate by name + documentType
      const existingTpl = await prisma.template.findFirst({
        where: {
          createdById: userId,
          name: tpl.name,
          documentType: tpl.documentType,
        },
      });

      if (existingTpl) {
        stats.skipped++;
        continue;
      }

      await prisma.template.create({
        data: {
          name: tpl.name,
          description: tpl.description || null,
          documentType: tpl.documentType,
          data: dehydrateDocumentData(tpl.data || {}),
          isDefault: tpl.isDefault || false,
          createdById: userId,
        },
      });

      stats.templates++;
    } catch (err) {
      console.warn('[Migration] Skipped template import:', tpl.name, err.message);
      stats.skipped++;
    }
  }

  // Automatically archive all imported documents to local disk on device
  try {
    const { syncAllDocumentsToArchive } = await import('./localStorage.service.js');
    await syncAllDocumentsToArchive(userId);
    console.log(`[Migration] Auto-archived imported documents to local disk storage.`);
  } catch (err) {
    console.warn('[Migration] Auto-archive to local storage failed:', err.message);
  }

  return stats;
}

/**
 * Direct Cloud Migration: Pull all user data from a remote CargoMS Web API
 * into the local desktop database.
 */
export async function directCloudMigrate({ cloudUrl, email, username, password, licenseKey, userId }) {
  // Resolve the cloud API URL
  let apiUrl = cloudUrl;
  if (!apiUrl) {
    apiUrl = await getCloudApiUrl();
  }
  apiUrl = apiUrl.replace(/\/+$/, '');
  if (!apiUrl.endsWith('/api')) {
    apiUrl = `${apiUrl}/api`;
  }

  const identifier = email || username || licenseKey || '';
  if (!identifier) {
    throw new AppError('Please provide your web account email, username, or license key', 400);
  }

  // Step 1: Authenticate with the cloud
  let accessToken;
  try {
    const authRes = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier,
        email: email || undefined,
        username: username || undefined,
        password,
        licenseKey: licenseKey || undefined,
      }),
      signal: AbortSignal.timeout(15000),
    });

    const authJson = await authRes.json();
    if (!authRes.ok) {
      throw new AppError(
        authJson?.message || 'Cloud authentication failed. Check your credentials.',
        authRes.status || 401
      );
    }
    accessToken = authJson?.data?.accessToken;
    if (!accessToken) {
      throw new AppError('No access token received from cloud server', 401);
    }
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(`Could not connect to cloud server: ${err.message}`, 502);
  }

  // Step 2: Fetch the migration export payload from cloud
  let exportPayload;
  try {
    const exportRes = await fetch(`${apiUrl}/migration/export`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      signal: AbortSignal.timeout(30000),
    });

    const exportJson = await exportRes.json();
    if (!exportRes.ok) {
      throw new AppError(
        exportJson?.message || 'Failed to fetch data from cloud server',
        exportRes.status || 500
      );
    }
    exportPayload = exportJson?.data || exportJson;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(`Cloud data download failed: ${err.message}`, 502);
  }

  // Step 3: Import the payload into local database
  const stats = await importUserData(userId, exportPayload);

  return {
    ...stats,
    source: apiUrl,
    importedAt: new Date().toISOString(),
  };
}
