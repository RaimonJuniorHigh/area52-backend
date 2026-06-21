import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { register } from './src/controllers/RegisterController';
import { login } from './src/controllers/LoginController';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'views')));

// API Routes: De backend voert enkel uit wat de DB toestaat
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

app.listen(port, () => {
    console.log(`Area52 server luistert op poort ${port}`);
});