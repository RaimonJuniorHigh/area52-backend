import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { UserRole } from '../types/auth';
import { listUsersForAdmin, updateUserRole, deleteUser } from '../services/guestService';

export const adminListUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const role = req.query.role as UserRole | undefined;
        if (role && role !== 'guest' && role !== 'admin') {
            res.status(400).json({ message: 'Ongeldige rolfilter.' });
            return;
        }
        res.json(await listUsersForAdmin(role));
    } catch (error) {
        console.error('Fout bij ophalen gebruikers:', error);
        res.status(500).json({ message: 'Gebruikers konden niet worden opgehaald.' });
    }
};

export const adminUpdateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = Number(req.params.id);
        const { role } = req.body;
        const result = await updateUserRole(userId, role, req.user!.id);
        if (!result.ok) {
            res.status(result.error === 'Account niet gevonden.' ? 404 : 400).json({ message: result.error });
            return;
        }
        res.json({ message: role === 'admin' ? 'Account is nu admin.' : 'Account is nu gast.' });
    } catch (error) {
        console.error('Fout bij wijzigen rol:', error);
        res.status(500).json({ message: 'Rol kon niet worden gewijzigd.' });
    }
};

export const adminDeleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = Number(req.params.id);
        const result = await deleteUser(userId, req.user!.id);
        if (!result.ok) {
            res.status(result.error === 'Account niet gevonden.' ? 404 : 400).json({ message: result.error });
            return;
        }
        res.json({ message: 'Account verwijderd.' });
    } catch (error) {
        console.error('Fout bij verwijderen account:', error);
        res.status(500).json({ message: 'Account kon niet worden verwijderd.' });
    }
};
