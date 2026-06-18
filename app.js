import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { register } from './src/controllers/RegisterController';
import { login } from './src/controllers/LoginController';    

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;
localStorage.setItem('area52_token', data.token);

app.use(express.static(__dirname));
app.use(express.json());

// ============================================================================
// API ROUTES
// ============================================================================

// Nu roep je de functies uit je controllers aan
app.post('/register', register);
app.post('/login', login);

// Je test-endpoints
app.get('/api/abdou', (req, res) => {
    res.json({ status: "Succes", message: "API-koppeling voor Abdou's module is gereed." });
});

app.get('/api/tom', (req, res) => {
    res.json({ status: "Succes", message: "API-koppeling voor Tom's module is gereed." });
});

// ============================================================================
// UI ROUTE
// ============================================================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`De Area52 server draait lokaal op http://localhost:${port}`);
});