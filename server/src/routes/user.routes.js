import { Router } from 'express';
import {
  listUsers,
  createUser,
  updateUser,
  updateUserPassword,
  deleteUser,
  extendSubscription,
  regenerateLicenseKey,
  getUserActivityLogs,
} from '../controllers/user.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Require auth & ADMIN role for all Master user administration routes
router.use(authenticate, requireRole('ADMIN'));

router.get('/', listUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.put('/:id/password', updateUserPassword);
router.post('/:id/extend', extendSubscription);
router.post('/:id/regenerate-license', regenerateLicenseKey);
router.get('/:id/activity', getUserActivityLogs);
router.delete('/:id', deleteUser);

export default router;
