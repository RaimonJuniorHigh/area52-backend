import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { getGuestDashboard, getGuestBookings } from '../services/bikeRentalService';

export const guestDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        res.json(await getGuestDashboard(req.user!.id));
    } catch (error) {
        console.error('Fout bij ophalen dashboard:', error);
        res.status(500).json({ message: 'Dashboard kon niet worden geladen.' });
    }
};

export const guestHistory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const all = await getGuestBookings(req.user!.id);
        res.json(all.filter(b => b.status === 'completed'));
    } catch (error) {
        console.error('Fout bij ophalen historie:', error);
        res.status(500).json({ message: 'Historie kon niet worden geladen.' });
    }
};
