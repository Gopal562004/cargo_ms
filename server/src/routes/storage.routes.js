import { Router } from 'express';
import prisma from '../config/database.js';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  getStorageRootPath,
  setStorageRootPath,
  listLocalDocuments,
  getStorageStats,
} from '../services/localStorage.service.js';

const router = Router();

// All storage routes require authentication
router.use(authenticate);

/**
 * GET /api/storage/documents
 * List all locally saved documents with optional filters.
 */
router.get('/documents', async (req, res, next) => {
  try {
    const { year, category, documentType, search } = req.query;
    const documents = await listLocalDocuments({ year, category, documentType, search });
    res.json({ success: true, data: { documents, total: documents.length } });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/storage/stats
 * Get storage statistics (total docs, disk usage).
 */
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await getStorageStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/storage/config
 * Get current storage root path.
 */
router.get('/config', async (req, res, next) => {
  try {
    const storagePath = await getStorageRootPath();
    res.json({ success: true, data: { storagePath } });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/storage/config
 * Update the storage root path.
 */
router.put('/config', async (req, res, next) => {
  try {
    const { storagePath } = req.body;
    if (!storagePath) {
      return res.status(400).json({ success: false, message: 'storagePath is required' });
    }
    const updatedPath = await setStorageRootPath(storagePath);
    res.json({ success: true, data: { storagePath: updatedPath }, message: 'Storage path updated successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/storage/sync
 * Sync and archive all active documents to the local storage root.
 */
router.post('/sync', async (req, res, next) => {
  try {
    const { syncAllDocumentsToArchive } = await import('../services/localStorage.service.js');
    const result = await syncAllDocumentsToArchive(req.user.id);
    res.json({
      success: true,
      data: result,
      message: `Successfully archived ${result.syncedCount} of ${result.totalDocuments} documents to local disk.`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/storage/documents
 * Delete a local archived document from disk and mark CANCELLED in database if it exists.
 */
router.delete('/documents', async (req, res, next) => {
  try {
    const { documentNumber, pdfPath, id } = req.body;
    const { deleteLocalDocumentFiles } = await import('../services/localStorage.service.js');
    const { deleteDocument } = await import('../services/document.service.js');

    // Delete physical files (.pdf and .json) from device disk
    await deleteLocalDocumentFiles(pdfPath || documentNumber);

    // If document exists in database, soft-delete it
    if (id) {
      try {
        await deleteDocument(id, req.user.id);
      } catch {}
    } else if (documentNumber) {
      try {
        const doc = await prisma.document.findFirst({
          where: { documentNumber, createdById: req.user.id },
        });
        if (doc) {
          await deleteDocument(doc.id, req.user.id);
        }
      } catch {}
    }

    res.json({
      success: true,
      message: `Document ${documentNumber || 'file'} deleted from device storage.`,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
