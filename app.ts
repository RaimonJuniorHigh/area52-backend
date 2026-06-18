import dotenv from 'dotenv';
dotenv.config();
import express from 'express';

// import authRoutes from './routes/authRoutes'; // <-- UITGEZET

const app = express();
app.use(express.json());

// app.use('/api/auth', authRoutes); // <-- UITGEZET

// Simpele test-route
app.get('/', (req, res) => res.send('Backend test succesvol!'));

const PORT = process.env.PORT || 8080; 
app.listen(PORT, () => {
  console.log(`Server draait op poort ${PORT}`);
});