import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { exportData, importData, cloudImport } from '../controllers/migration.controller.js';

const router = Router();

// All migration routes require authentication
router.use(authenticate);

// Export user data as JSON backup
router.get('/export', exportData);

// Import user data from JSON backup
router.post('/import', importData);

// Direct cloud-to-desktop migration
router.post('/cloud-import', cloudImport);

export default router;
