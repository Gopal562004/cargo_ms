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
} from '../controllers/document.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
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

// Document types metadata
router.get('/types', getDocumentTypes);

// CRUD
router.post('/', validate(createDocumentSchema), createDocument);
router.get('/', validate(listDocumentsQuerySchema, 'query'), getAllDocuments);
router.get('/:id', getDocumentById);
router.put('/:id', validate(updateDocumentSchema), updateDocument);
router.delete('/:id', deleteDocument);

// Actions
router.post('/:id/duplicate', duplicateDocument);
router.patch('/:id/status', validate(updateStatusSchema), updateStatus);
router.get('/:id/history', getHistory);
router.get('/:id/pdf', downloadPDF);

export default router;
