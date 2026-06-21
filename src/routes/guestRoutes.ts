import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { guestListEvents, guestBookEvent } from '../controllers/EventController';
import { guestDashboard, guestHistory } from '../controllers/GuestBookingController';

const router = Router();
router.use(authenticateToken, requireRole('guest'));

router.get('/events', guestListEvents);
router.post('/events/book', guestBookEvent);
router.get('/dashboard', guestDashboard);
router.get('/history', guestHistory);

export default router;
