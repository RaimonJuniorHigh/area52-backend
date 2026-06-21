import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../config/jwt';
import { JwtPayload, UserRole } from '../types/auth';

/**
 * ==========================================
 * ARCHITECTUUR NOTITIES - AREA52 MIDDLEWARE
 * Doel: Beveiligen van private routes met JWT verificatie en rolcontrole.
 * ==========================================
 */

export interface AuthRequest extends Request {
    user?: JwtPayload;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Toegang geweigerd. Geen geldig authenticatie pasje (token) gevonden.' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const verified = jwt.verify(token, getJwtSecret()) as JwtPayload;
        req.user = verified;
        next();
    } catch {
        res.status(403).json({ message: 'Ongeldige of verlopen token.' });
    }
};

/** Controleert of de ingelogde gebruiker een van de opgegeven rollen heeft. */
export const requireRole = (...roles: UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user?.role || !roles.includes(req.user.role)) {
            res.status(403).json({ message: 'Onvoldoende rechten voor deze actie.' });
            return;
        }
        next();
    };
};
