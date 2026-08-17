import { Router } from 'express';
import {
  listUsers,
  createUser,
  updateUser,
  updateUserPassword,
  deleteUser,
} from '../controllers/user.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Require auth & ADMIN role for all Master user administration routes
router.use(authenticate, requireRole('ADMIN'));

router.get('/', listUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.put('/:id/password', updateUserPassword);
router.delete('/:id', deleteUser);

export default router;
