import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { getGuestDashboard, getGuestBookings } from '../services/bikeRentalService';

export const guestDashboard = (req: AuthRequest, res: Response): void => {
    res.json(getGuestDashboard(req.user!.id));
};

export const guestHistory = (req: AuthRequest, res: Response): void => {
    const all = getGuestBookings(req.user!.id);
    res.json(all.filter(b => b.status === 'completed'));
};
