import express = require('express');
import { authenticateToken, AuthRequest } from './src/middleware/authMiddleware';
import path = require('path');
import cors from 'cors';
import type { Request, Response } from 'express';
import authRoutes from './src/routes/authRoutes';

const app = express();
const port = process.env.PORT || 8080;

app.use(cors()); // CORS staat bovenaan
app.use(express.json());
app.use(express.static(__dirname)); // Serveert html-bestanden uit de hoofdmap

// Routes naar je HTML pagina's
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'regist.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'dashboard.html')));

// API Routes
app.use('/api/auth', authRoutes);
app.get('/api/admin/dashboard', authenticateToken, (req: AuthRequest, res: Response) => {
  res.json({ status: "Toegang verleend", message: "Welkom!" });
});

app.listen(port, () => console.log(`Server draait op poort ${port}`));