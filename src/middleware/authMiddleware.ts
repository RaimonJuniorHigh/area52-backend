import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../config/jwt';

/**
 * ==========================================
 * ARCHITECTUUR NOTITIES - AREA52 MIDDLEWARE
 * Doel: Beveiligen van private routes met JWT verificatie.
 * ==========================================
 */

// Breid de standaard Express Request uit zodat we de ingelogde user data kunnen doorgeven
export interface AuthRequest extends Request {
    user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    // 1. Haal de Authorization header op uit het verzoek
    const authHeader = req.header('Authorization');
    
    // 2. Check of de header bestaat en of deze begint met 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: "Toegang geweigerd. Geen geldig authenticatie pasje (token) gevonden." });
        return;
    }

    // 3. Knip het woordje 'Bearer ' eraf zodat we alleen de pure token overhouden
    const token = authHeader.split(' ')[1];

    try {
        // 4. Verifieer de token met onze geheime sleutel
        const verified = jwt.verify(token, getJwtSecret());
        
        // 5. Plak de ontcijferde data (id en role) aan het verzoek vast voor de volgende stap
        req.user = verified;
        
        // 6. next() betekent: "Alles is goed, ga door naar de daadwerkelijke route!"
        next();
    } catch (error) {
        // Als de token is vervalst, verlopen of onjuist is, komen we hier terecht.
        res.status(403).json({ message: "Ongeldige of verlopen token." });
    }
};