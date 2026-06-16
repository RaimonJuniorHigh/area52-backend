import express = require('express');
import { authenticateToken, AuthRequest } from './src/middleware/authMiddleware';
import path = require('path');
import cors = require('cors');
import type { Request, Response } from 'express';
import authRoutes from './src/routes/authRoutes';

const app = express();

// 1. CORS staat nu bovenaan, veilig voor je live-omgeving
app.use(cors());

const port = process.env.PORT || 8080; 

app.use(express.static(__dirname));
app.use(express.json());

// ============================================================================
// ROUTES VOOR PAGINA'S (NOTES: Dit zorgt dat je /login en /register kunt bezoeken)
// ============================================================================
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'regist.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// ============================================================================
// API ROUTES
// ============================================================================
app.use('/api/auth', authRoutes);

app.get('/api/admin/dashboard', authenticateToken, (req: AuthRequest, res: Response) => {
  res.json({ 
    status: "Toegang verleend",
    message: "Welkom in het afgeschermde Admin Dashboard!", 
    ingelogdeGebruiker: req.user 
  });
});

// Abdou & Tom endpoints
app.get('/api/abdou', (req, res) => res.json({ message: "API-koppeling Abdou gereed." }));
app.get('/api/tom', (req, res) => res.json({ message: "API-koppeling Tom gereed." }));

app.listen(port, () => {
  console.log(`De Area52 server draait live op poort ${port}`);
});