import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/authRoutes';
import { authenticateToken, requireRole, AuthRequest } from './middleware/authMiddleware';

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

const viewsPath = path.join(__dirname, '..', 'views');

app.use(cors());
app.use(express.json());
app.use(express.static(viewsPath));

app.get('/', (_req, res) => res.redirect('/login'));
app.get('/login', (_req, res) => res.sendFile(path.join(viewsPath, 'login.html')));
app.get('/register', (_req, res) => res.sendFile(path.join(viewsPath, 'regist.html')));
app.get('/portal', (_req, res) => res.sendFile(path.join(viewsPath, 'portal.html')));
app.get('/dashboard', (_req, res) => res.sendFile(path.join(viewsPath, 'dashboard.html')));

app.use('/api/auth', authRoutes);

app.get('/api/guest/portal', authenticateToken, requireRole('guest'), (_req: AuthRequest, res) => {
  res.json({ status: 'ok', message: 'Welkom bij Area52!', role: 'guest' });
});

app.get('/api/admin/dashboard', authenticateToken, requireRole('admin'), (_req: AuthRequest, res) => {
  res.json({ status: 'ok', message: 'Welkom in het Admin Dashboard!', role: 'admin' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Area52 server draait op poort ${port}`);
});
