import express = require('express');
import { authenticateToken, AuthRequest } from './src/middleware/authMiddleware';
import path = require('path');
import cors from 'cors';
import type { Request, Response } from 'express';
import authRoutes from './src/routes/authRoutes';

const app = express();
const port = process.env.PORT || 8080;

// 1. CORS voor live communicatie
app.use(cors());
app.use(express.json());

// 2. STATIC FILES: Hier zoekt hij in de map 'views' naar je HTML bestanden.
// Zorg dat je bestanden in GitHub dus in een map genaamd 'views' staan!
app.use(express.static(path.join(__dirname, 'views')));

// 3. PAGE ROUTES: Directe koppeling naar je HTML pagina's
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'views', 'regist.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'views', 'dashboard.html')));

// 4. API ROUTES
app.use('/api/auth', authRoutes);

app.get('/api/admin/dashboard', authenticateToken, (req: AuthRequest, res: Response) => {
  res.json({ status: "Toegang verleend", message: "Welkom in het afgeschermde Admin Dashboard!" });
});

// Test routes
app.get('/api/abdou', (req, res) => res.json({ message: "API-koppeling Abdou gereed." }));
app.get('/api/tom', (req, res) => res.json({ message: "API-koppeling Tom gereed." }));

app.listen(port, () => console.log(`Area52 server draait op poort ${port}`));