import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/authRoutes';
import { adminBikeRoutes, guestBikeRoutes } from './routes/bikeRoutes';
import guestRoutes from './routes/guestRoutes';
import { authenticateToken, requireRole, AuthRequest } from './middleware/authMiddleware';

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

// views/ en BikeRental/ staan in de projectroot (niet in dist/)
const viewsPath = path.join(process.cwd(), 'views');
const bikeImagesPath = path.join(process.cwd(), 'BikeRental', 'public', 'bike-images');

app.use(cors());
app.use(express.json());
app.use(express.static(viewsPath));
app.use('/bike-images', express.static(bikeImagesPath));

app.get('/', (_req, res) => res.redirect('/login'));
app.get('/login', (_req, res) => res.sendFile(path.join(viewsPath, 'login.html')));
app.get('/register', (_req, res) => res.sendFile(path.join(viewsPath, 'regist.html')));
app.get('/portal', (_req, res) => res.sendFile(path.join(viewsPath, 'portal.html')));
app.get('/fietsen', (_req, res) => res.sendFile(path.join(viewsPath, 'fietsen.html')));
app.get('/evenementen', (_req, res) => res.sendFile(path.join(viewsPath, 'evenementen.html')));
app.get('/historie', (_req, res) => res.sendFile(path.join(viewsPath, 'historie.html')));
app.get('/dashboard', (_req, res) => res.sendFile(path.join(viewsPath, 'dashboard.html')));
app.get('/bikes', (_req, res) => res.sendFile(path.join(viewsPath, 'bikes.html')));

app.use('/api/auth', authRoutes);
app.use('/api/admin/bikes', adminBikeRoutes);
app.use('/api/guest/bikes', guestBikeRoutes);
app.use('/api/guest', guestRoutes);

app.get('/api/guest/portal', authenticateToken, requireRole('guest'), (_req: AuthRequest, res) => {
  res.json({ status: 'ok', message: 'Welkom bij Area52!', role: 'guest' });
});

app.get('/api/admin/dashboard', authenticateToken, requireRole('admin'), (_req: AuthRequest, res) => {
  res.json({ status: 'ok', message: 'Welkom in het Admin Dashboard!', role: 'admin' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Area52 server draait op poort ${port}`);
});
