import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * ==========================================
 * NOTITIES - AREA52 AUTHENTICATIE
 * Doel: Uitleg implementatiekeuze JWT & Bcrypt voor het team en projectdocumentatie.
 * ==========================================
 * * WAAROM KIES IK VOOR JWT (JSON Web Tokens):
 * 1. Stateless Design: Onze Node.js backend hoeft geen actieve sessies in het geheugen te houden. 
 * Dit bespaart serverkracht en maakt onze applicatie makkelijker schaalbaar op Google Cloud.
 * 2. Ontkoppelde Architectuur: Omdat onze React-frontend en Node.js-backend los van elkaar draaien, 
 * is JWT de ideale standaard. Het fungeert als een 'digitaal pasje'. De frontend ontvangt dit pasje 
 * na het inloggen en stuurt het veilig mee bij elk volgend verzoek.
 * 3. Integriteit: De token wordt aan de backend-kant digitaal ondertekend met een secret key. 
 * Als de token aan de client-side wordt gemanipuleerd, wijst onze backend dit direct af.
 */

// TODO: Deze sleutel verplaatsen naar een beveiligd .env bestand voordat we naar productie gaan.
const JWT_SECRET = process.env.JWT_SECRET || 'super_geheime_area52_sleutel_123';

// Tijdelijke in-memory datastructuur om te testen (Wordt in een later vervangen door onze PostgreSQL database)
const usersDB: any[] = []; 

// ==========================================
// REGISTER LOGICA
// ==========================================
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, role } = req.body;

        // 1. Validatie: Check of de gebruiker al bestaat in ons systeem
        const userExists = usersDB.find(u => u.email === email);
        if (userExists) {
            res.status(400).json({ message: "Gebruiker bestaat al binnen Area52!" });
            return;
        }

        // 2. Security: Wachtwoord versleutelen (Hashing)
        // We gebruiken bcrypt met een salt-round van 10. We slaan wachtwoorden nooit als plain-text op.
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Gebruiker aanmaken en toevoegen aan de database
        const newUser = {
            id: usersDB.length + 1,
            email,
            password: hashedPassword,
            role: role || 'guest' // Standaard rol is gast, tenzij expliciet 'admin' wordt vereist
        };
        usersDB.push(newUser);

        res.status(201).json({ message: "Account succesvol aangemaakt!" });
    } catch (error) {
        res.status(500).json({ message: "Fout opgetreden tijdens het registratieproces", error });
    }
};

// ==========================================
// LOGIN LOGICA
// ==========================================
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // 1. Authenticatie: Zoek de gebruiker op
        const user = usersDB.find(u => u.email === email);
        if (!user) {
            res.status(400).json({ message: "Ongeldige inloggegevens." });
            return;
        }

        // 2. Verificatie: Vergelijk het ingevoerde wachtwoord met de opgeslagen gehashte versie
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            res.status(400).json({ message: "Ongeldige inloggegevens." });
            return;
        }

        // 3. Autorisatie: Genereer de JWT Token
        // Payload bevat user ID en de rol, zodat de frontend weet welke rechten de gebruiker heeft.
        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: '2h' } // Token vervalt na 2 uur uit veiligheidsoverwegingen
        );

        // 4. Stuur token terug naar de frontend-applicatie
        res.status(200).json({
            message: "Authenticatie succesvol",
            token: token
        });

    } catch (error) {
        res.status(500).json({ message: "Interne serverfout tijdens het inloggen", error });
    }
};
