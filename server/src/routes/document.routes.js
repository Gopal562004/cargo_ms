import { Router } from 'express';
import {
  getDocumentTypes,
  createDocument,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  duplicateDocument,
  updateStatus,
  getHistory,
  downloadPDF,
  parseInvoiceDocument,
} from '../controllers/document.controller.js';
import { authenticate, requireActiveSubscription } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createDocumentSchema,
  updateDocumentSchema,
  updateStatusSchema,
  listDocumentsQuerySchema,
} from '../validations/document.validation.js';

const router = Router();

// All document routes require authentication
router.use(authenticate);

// Auto-extract invoice/bill data from uploaded PDF/file
router.post('/parse-invoice', requireActiveSubscription, parseInvoiceDocument);

// Document types metadata (read-only allowed)
router.get('/types', getDocumentTypes);

// CRUD
router.post('/', requireActiveSubscription, validate(createDocumentSchema), createDocument);
router.get('/', validate(listDocumentsQuerySchema, 'query'), getAllDocuments);
router.get('/:id', getDocumentById);
router.put('/:id', requireActiveSubscription, validate(updateDocumentSchema), updateDocument);
router.delete('/:id', requireActiveSubscription, deleteDocument);

// Actions
router.post('/:id/duplicate', requireActiveSubscription, duplicateDocument);
router.patch('/:id/status', requireActiveSubscription, validate(updateStatusSchema), updateStatus);
router.get('/:id/history', getHistory);
router.get('/:id/pdf', downloadPDF);

export default router;
