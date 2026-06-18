import { Router } from 'express';
import { register } from '../controllers/RegisterController';
import { login } from '../controllers/LoginController';

/**
 * ==========================================
 * ARCHITECTUUR NOTITIES - AREA52 ROUTING
 * Doel: Route-definitie voor Area52 authenticatie.
 * ==========================================
 */

const router = Router();

// ==========================================
// AUTHENTICATIE ENDPOINTS
// ==========================================

// Endpoint: POST /api/auth/register
// Functie: Routeert de registratie-aanvraag naar de RegisterController
router.post('/register', register);

// Endpoint: POST /api/auth/login
// Functie: Routeert de inlogpoging naar de LoginController en geeft JWT token terug
router.post('/login', login);

export default router;