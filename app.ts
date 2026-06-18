import dotenv from 'dotenv';
dotenv.config(); // MOET als eerste

import express from 'express';
import authRoutes from './src/routes/authRoutes';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 8080; 
app.listen(PORT, () => {
  console.log(`Server draait op poort ${PORT}`);
});