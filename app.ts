import dotenv from 'dotenv';
dotenv.config();
import express from 'express';

// import authRoutes from './routes/authRoutes'; // <-- UITGEZET

const app = express();
app.use(express.json());

// app.use('/api/auth', authRoutes); // <-- UITGEZET

// Simpele test-route
app.get('/', (req, res) => res.send('Backend test succesvol!'));

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080; 

// DE CRUCIALE FIX VOOR CLOUD RUN: '0.0.0.0' is hier toegevoegd
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server draait succesvol op poort ${PORT} via 0.0.0.0`);
}).on('error', (err) => {
  console.error("FATALE SERVER FOUT TIJDENS OPSTARTEN:", err);
});