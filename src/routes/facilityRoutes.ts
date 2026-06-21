import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import {
    adminListFacilities,
    adminGetFacility,
    adminCreateFacility,
    adminUpdateFacility,
    adminDeleteFacility,
    adminReorderFacilities,
    adminGetFacilityCategories,
    guestListFacilities,
} from '../controllers/FacilityController';

const adminRouter = Router();
adminRouter.use(authenticateToken, requireRole('admin'));
adminRouter.get('/categories', adminGetFacilityCategories);
adminRouter.put('/reorder', adminReorderFacilities);
adminRouter.get('/', adminListFacilities);
adminRouter.get('/:id', adminGetFacility);
adminRouter.post('/', adminCreateFacility);
adminRouter.put('/:id', adminUpdateFacility);
adminRouter.delete('/:id', adminDeleteFacility);

const guestRouter = Router();
guestRouter.use(authenticateToken, requireRole('guest'));
guestRouter.get('/', guestListFacilities);

export { adminRouter as adminFacilityRoutes, guestRouter as guestFacilityRoutes };
