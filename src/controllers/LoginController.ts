import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/db';
import { getJwtSecret } from '../config/jwt';
import { UserRole } from '../types/auth';

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // 1. Validatie: Check input
        if (!email || !password) {
            res.status(400).json({ message: "E-mail en wachtwoord zijn verplicht." });
            return;
        }

        // 2. Database logic: Zoek de gebruiker op
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            res.status(401).json({ message: "Ongeldige inloggegevens." });
            return;
        }

        // 3. Verificatie: Vergelijk het wachtwoord
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            res.status(401).json({ message: "Ongeldige inloggegevens." });
            return;
        }

        const role = user.role as UserRole;
        if (role !== 'guest' && role !== 'admin') {
            res.status(403).json({ message: 'Onbekende gebruikersrol.' });
            return;
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role },
            getJwtSecret(),
            { expiresIn: '2h' }
        );

        res.status(200).json({
            message: 'Authenticatie succesvol',
            token,
            role,
            email: user.email,
        });

    } catch (error) {
        console.error("Fout tijdens inloggen:", error);
        res.status(500).json({ message: "Interne serverfout tijdens het inloggen." });
    }
};