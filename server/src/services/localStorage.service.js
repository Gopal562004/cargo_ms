import fs from 'fs';
import path from 'path';
import prisma from '../config/database.js';

/**
 * Local File Storage Service
 * 
 * Automatically saves documents (PDF + JSON metadata) to the user's local
 * file system in a structured folder hierarchy:
 * 
 *   [StorageRoot]/[Company]/[Year]/[Category]/[DocType]/[DocNumber].pdf
 *   [StorageRoot]/[Company]/[Year]/[Category]/[DocType]/[DocNumber].json
 */

// Category to folder name mapping
const CATEGORY_FOLDERS = {
  AIR_FREIGHT: 'Air_Freight',
  SEA_FREIGHT: 'Sea_Freight',
  EDI: 'EDI_Messages',
  OTHER: 'Invoices_and_Finance',
};

// Document type to subfolder name mapping
const DOCTYPE_FOLDERS = {
  MAWB: 'MAWB',
  HAWB: 'HAWB',
  MANIFEST: 'Manifests',
  DGD: 'DGD',
  LABEL: 'Labels',
  CARGO_POUCH_LABEL: 'Cargo_Pouch_Labels',
  CSD: 'Security_Declarations',
  FWB: 'FWB',
  FHL: 'FHL',
  XFWB: 'XFWB',
  XFZB: 'XFZB',
  FFR: 'FFR',
  HAWB_FHL: 'HAWB_FHL',
  BILL_OF_LADING: 'Bill_of_Lading',
  BOL_MANIFEST: 'Sea_Manifest',
  IMO_DGD: 'IMO_DGD',
  SOLAS_VGM: 'VGM',
  TAX_INVOICE: 'Tax_Invoice',
  PROFORMA_INVOICE: 'Proforma_Invoice',
  BOOKING: 'Bookings',
  WAREHOUSE_RECEIPT: 'Warehouse_Receipt',
  DOCK_RECEIPT: 'Dock_Receipt',
  CERTIFICATE_OF_ORIGIN: 'Certificate_of_Origin',
  DELIVERY_ORDER: 'Delivery_Order',
  DELIVERY_NOTE: 'Delivery_Note',
  FCR: 'FCR',
  CMR: 'CMR',
  ARRIVAL_NOTICE: 'Arrival_Notice',
  SECURITY_DECLARATION: 'Security_Declaration',
  LETTER: 'Letters',
};

/**
 * Get the current storage root path from AppConfig, or use default.
 */
export async function getStorageRootPath() {
  try {
    const config = await prisma.appConfig.findUnique({
      where: { key: 'STORAGE_ROOT' },
    });
    if (config?.value) return config.value;
  } catch {
    // AppConfig table may not exist yet
  }

  // Fallback to env var or OS default
  return process.env.STORAGE_ROOT || path.join(
    process.env.HOME || process.env.USERPROFILE || '.',
    'Documents',
    'CargoArchive'
  );
}

/**
 * Set the storage root path in AppConfig.
 */
export async function setStorageRootPath(newPath) {
  await prisma.appConfig.upsert({
    where: { key: 'STORAGE_ROOT' },
    update: { value: newPath },
    create: { key: 'STORAGE_ROOT', value: newPath },
  });
  invalidateLocalStorageCache();
  return newPath;
}

/**
 * Build the full directory path for a document.
 */
function buildDocumentPath(storageRoot, document, companyName = 'Default_Company') {
  const year = new Date(document.createdAt).getFullYear().toString();
  const categoryFolder = CATEGORY_FOLDERS[document.category] || 'Other';
  const docTypeFolder = DOCTYPE_FOLDERS[document.documentType] || document.documentType;
  const safeCompany = (companyName || 'Default_Company').replace(/[<>:"/\\|?*]/g, '_').trim();

  return path.join(storageRoot, safeCompany, `Year_${year}`, categoryFolder, docTypeFolder);
}

/**
 * Generate a safe filename from a document number.
 */
function buildFileName(documentNumber) {
  return (documentNumber || 'UNNAMED').replace(/[<>:"/\\|?*]/g, '_').replace(/\s+/g, '_');
}

/**
 * Save a document's PDF and JSON metadata to the local file system.
 */
export async function saveDocumentLocally(document, pdfBuffer, companyName) {
  const storageRoot = await getStorageRootPath();
  const dirPath = buildDocumentPath(storageRoot, document, companyName);
  const fileName = buildFileName(document.documentNumber);

  // Create directory recursively
  fs.mkdirSync(dirPath, { recursive: true });

  // Save PDF
  const pdfPath = path.join(dirPath, `${fileName}.pdf`);
  fs.writeFileSync(pdfPath, pdfBuffer);

  // Save JSON metadata (document snapshot)
  const jsonPath = path.join(dirPath, `${fileName}.json`);
  const metadata = {
    id: document.id,
    documentNumber: document.documentNumber,
    documentType: document.documentType,
    category: document.category,
    title: document.title,
    status: document.status,
    version: document.version,
    data: typeof document.data === 'string' ? JSON.parse(document.data) : document.data,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
    savedAt: new Date().toISOString(),
    pdfPath,
  };
  fs.writeFileSync(jsonPath, JSON.stringify(metadata, null, 2), 'utf-8');
  invalidateLocalStorageCache();
  return { pdfPath, jsonPath, dirPath };
}

// In-memory cache for fast local disk document listing
let _cachedLocalDocs = null;
let _cacheTimestamp = 0;
const CACHE_TTL_MS = 5000; // 5 seconds fresh cache

export function invalidateLocalStorageCache() {
  _cachedLocalDocs = null;
  _cacheTimestamp = 0;
}

/**
 * List all locally saved documents by scanning the storage directory.
 * Uses intelligent in-memory caching for near-instant response times.
 */
export async function listLocalDocuments(filters = {}) {
  const storageRoot = await getStorageRootPath();

  if (!fs.existsSync(storageRoot)) {
    return [];
  }

  const now = Date.now();
  let allDocuments = [];

  if (_cachedLocalDocs && (now - _cacheTimestamp) < CACHE_TTL_MS) {
    allDocuments = _cachedLocalDocs;
  } else {
    function scanDir(dir) {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            scanDir(fullPath);
          } else if (entry.name.endsWith('.json') && !entry.name.startsWith('.')) {
            try {
              const content = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
              const pdfPath = content.pdfPath || fullPath.replace('.json', '.pdf');
              const pdfExists = fs.existsSync(pdfPath);
              let fileSize = 0;
              if (pdfExists) {
                try {
                  fileSize = fs.statSync(pdfPath).size;
                } catch {}
              }

              allDocuments.push({
                ...content,
                jsonPath: fullPath,
                pdfPath,
                hasPdf: pdfExists,
                fileSize,
              });
            } catch {
              // Skip malformed JSON files
            }
          }
        }
      } catch {
        // Skip inaccessible directories
      }
    }

    scanDir(storageRoot);

    function extractDocSequence(docNo = '') {
      const match = String(docNo).match(/\/(\d+)\//);
      if (match) return parseInt(match[1], 10);
      const numMatch = String(docNo).match(/(\d+)/);
      return numMatch ? parseInt(numMatch[1], 10) : 0;
    }

    // Sort descending by sequence or creation date
    allDocuments.sort((a, b) => {
      const seqA = extractDocSequence(a.documentNumber);
      const seqB = extractDocSequence(b.documentNumber);
      if (seqA > 0 && seqB > 0 && seqA !== seqB) {
        return seqB - seqA;
      }
      return new Date(b.createdAt || b.savedAt || 0) - new Date(a.createdAt || a.savedAt || 0);
    });

    _cachedLocalDocs = allDocuments;
    _cacheTimestamp = now;
  }

  // Apply filters in-memory (instantaneous)
  let filtered = allDocuments;
  if (filters.year) {
    filtered = filtered.filter(d => (d.jsonPath || '').includes(`Year_${filters.year}`));
  }
  if (filters.category) {
    filtered = filtered.filter(d => d.category === filters.category);
  }
  if (filters.documentType) {
    filtered = filtered.filter(d => d.documentType === filters.documentType);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    filtered = filtered.filter(d =>
      (d.documentNumber || '').toLowerCase().includes(q) ||
      (d.title || '').toLowerCase().includes(q) ||
      JSON.stringify(d.data || {}).toLowerCase().includes(q)
    );
  }

  return filtered;
}

/**
 * Get storage statistics (total docs, total size).
 */
export async function getStorageStats() {
  const storageRoot = await getStorageRootPath();

  if (!fs.existsSync(storageRoot)) {
    return { totalDocuments: 0, totalSizeBytes: 0, totalSizeMB: 0, totalSizeFormatted: '0 KB', storagePath: storageRoot };
  }

  // Calculate quickly using listLocalDocuments (benefitting from cache)
  const docs = await listLocalDocuments();
  const totalFiles = docs.filter(d => d.hasPdf).length;
  const totalSize = docs.reduce((acc, d) => acc + (d.fileSize || 0), 0);
  const formatted = totalSize >= 1024 * 1024
    ? `${(totalSize / (1024 * 1024)).toFixed(2)} MB`
    : `${Math.round(totalSize / 1024)} KB`;

  return {
    totalDocuments: totalFiles,
    totalSizeBytes: totalSize,
    totalSizeMB: Math.round((totalSize / (1024 * 1024)) * 100) / 100,
    totalSizeFormatted: formatted,
    storagePath: storageRoot,
  };
}

/**
 * Sync and archive all active documents in the database to local disk.
 */
export async function syncAllDocumentsToArchive(userId) {
  const { generateDocumentPDF } = await import('./pdf.service.js');
  const { hydrateDocument } = await import('../utils/sqlite-helpers.js');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const fallbackCompany = user?.companyName || user?.company || 'DGR GLOBAL LOGISTICS';

  const docs = await prisma.document.findMany({
    where: { createdById: userId, status: { not: 'CANCELLED' } },
    include: { packages: true, createdBy: true },
  });

  let syncedCount = 0;
  for (const doc of docs) {
    try {
      const hydrated = hydrateDocument(doc);
      const pdfBuffer = await generateDocumentPDF(hydrated);
      const company = hydrated.data?.companyName || fallbackCompany;
      await saveDocumentLocally(hydrated, pdfBuffer, company);
      syncedCount++;
    } catch (err) {
      console.warn(`[LocalStorage] Failed to archive doc ${doc.documentNumber}:`, err.message);
    }
  }

  const stats = await getStorageStats();
  return {
    syncedCount,
    totalDocuments: docs.length,
    stats,
  };
}

/**
 * Delete local document files (.pdf and .json) by document number or file path.
 * Cleans up empty parent folders if necessary.
 */
export async function deleteLocalDocumentFiles(documentNumberOrPath) {
  if (!documentNumberOrPath) return false;

  const storageRoot = await getStorageRootPath();
  if (!fs.existsSync(storageRoot)) return false;

  const targetSafeName = String(documentNumberOrPath).replace(/[<>:"/\\|?*]/g, '_').replace(/\s+/g, '_');
  let deletedCount = 0;

  function removeMatches(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          removeMatches(fullPath);
          // Clean up empty directory
          try {
            if (fs.existsSync(fullPath) && fs.readdirSync(fullPath).length === 0) {
              fs.rmdirSync(fullPath);
            }
          } catch {}
        } else {
          const isMatch =
            (targetSafeName && (entry.name === `${targetSafeName}.pdf` || entry.name === `${targetSafeName}.json`)) ||
            (fullPath === documentNumberOrPath) ||
            (fullPath === String(documentNumberOrPath).replace('.json', '.pdf')) ||
            (fullPath === String(documentNumberOrPath).replace('.pdf', '.json'));

          if (isMatch) {
            try {
              fs.unlinkSync(fullPath);
              deletedCount++;
            } catch (err) {
              console.warn(`[LocalStorage] Failed to delete file ${fullPath}:`, err.message);
            }
          }
        }
      }
    } catch {}
  }

  removeMatches(storageRoot);
  invalidateLocalStorageCache();
  return deletedCount > 0;
}

/**
 * Purges any archived files (.pdf/.json) on disk whose documents have been cancelled/deleted in the database.
 */
export async function purgeCancelledDocumentsFromArchive() {
  try {
    const cancelledDocs = await prisma.document.findMany({
      where: {
        status: 'CANCELLED',
      },
      select: { documentNumber: true, id: true },
    });

    for (const doc of cancelledDocs) {
      if (doc.documentNumber) {
        await deleteLocalDocumentFiles(doc.documentNumber);
      }
    }
  } catch (err) {
    // Non-fatal if database query fails or tables not initialized
  }
}



