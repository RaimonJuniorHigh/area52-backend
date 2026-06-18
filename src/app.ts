import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import authRoutes from './routes/authRoutes';

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes); 

app.get('/', (req, res) => res.send('Area52 Backend is LIVE!'));

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080; 

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server draait op ${PORT}`);
}).on('error', (err) => {
  console.error("FOUT:", err);
});