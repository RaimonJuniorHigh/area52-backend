import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { adminListUsers, adminUpdateUserRole, adminDeleteUser } from '../controllers/AdminGuestController';

const router = Router();
router.use(authenticateToken, requireRole('admin'));
router.get('/', adminListUsers);
router.patch('/:id/role', adminUpdateUserRole);
router.delete('/:id', adminDeleteUser);

export default router;
