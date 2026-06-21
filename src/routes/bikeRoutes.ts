import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import {
    adminListBikes,
    adminGetBike,
    adminCreateBike,
    adminUpdateBike,
    adminDeleteBike,
    guestListBikes,
    guestRentBike,
} from '../controllers/BikeController';

const adminRouter = Router();
adminRouter.use(authenticateToken, requireRole('admin'));
adminRouter.get('/', adminListBikes);
adminRouter.get('/:id', adminGetBike);
adminRouter.post('/', adminCreateBike);
adminRouter.put('/:id', adminUpdateBike);
adminRouter.delete('/:id', adminDeleteBike);

const guestRouter = Router();
guestRouter.use(authenticateToken, requireRole('guest'));
guestRouter.get('/', guestListBikes);
guestRouter.post('/rent', guestRentBike);

export { adminRouter as adminBikeRoutes, guestRouter as guestBikeRoutes };
