import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db/db';

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, role } = req.body;

        // 1. Validatie: Check of velden aanwezig zijn
        if (!email || !password) {
            res.status(400).json({ message: "E-mail en wachtwoord zijn verplicht." });
            return;
        }

        // 2. Database logic: Check of de gebruiker al bestaat
        // We gebruiken $1 als placeholder om SQL-injectie te voorkomen
        const checkQuery = 'SELECT * FROM users WHERE email = $1';
        const userExists = await pool.query(checkQuery, [email]);

        if (userExists.rows.length > 0) {
            res.status(400).json({ message: "Gebruiker bestaat al binnen Area52!" });
            return;
        }

        // 3. Security: Wachtwoord hashen
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Database logic: Nieuwe gebruiker invoegen
        const insertQuery = 'INSERT INTO users (email, password, role) VALUES ($1, $2, $3)';
        const userRole = role || 'guest'; // Standaardwaarde
        
        await pool.query(insertQuery, [email, hashedPassword, userRole]);

        // 5. Succesrespons
        res.status(201).json({ message: "Account succesvol aangemaakt!" });

    } catch (error) {
        // Log de fout naar de server-console voor debugging
        console.error("Fout tijdens registratie:", error);
        
        // Stuur een algemene foutmelding naar de frontend
        res.status(500).json({ message: "Er is een fout opgetreden tijdens de registratie." });
    }
};