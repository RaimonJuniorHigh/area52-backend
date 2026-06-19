import { Request, Response } from 'express';
import { listGuestsForAdmin } from '../services/guestService';

export const adminListGuests = async (_req: Request, res: Response): Promise<void> => {
    try {
        res.json(await listGuestsForAdmin());
    } catch (error) {
        console.error('Fout bij ophalen gasten:', error);
        res.status(500).json({ message: 'Gasten konden niet worden opgehaald.' });
    }
};
