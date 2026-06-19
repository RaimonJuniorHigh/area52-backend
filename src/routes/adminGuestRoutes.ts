import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { adminListGuests } from '../controllers/AdminGuestController';

const router = Router();
router.use(authenticateToken, requireRole('admin'));
router.get('/', adminListGuests);

export default router;
