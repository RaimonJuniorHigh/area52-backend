import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { listEventsForGuest, bookEventForGuest } from '../services/bikeRentalService';

export const guestListEvents = (req: AuthRequest, res: Response): void => {
    res.json(listEventsForGuest(req.user!.id));
};

export const guestBookEvent = (req: AuthRequest, res: Response): void => {
    const { eventId, age } = req.body;
    const result = bookEventForGuest(req.user!.id, Number(eventId), Number(age ?? 18));
    if (!result.ok) {
        res.status(400).json({ message: result.message });
        return;
    }
    res.status(201).json({ message: result.message });
};
