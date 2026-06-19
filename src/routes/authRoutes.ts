import { Router } from 'express';
import { register } from '../controllers/RegisterController';
import { login } from '../controllers/LoginController';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';

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

router.get('/me', authenticateToken, (req: AuthRequest, res) => {
    res.json({ id: req.user?.id, email: req.user?.email, role: req.user?.role });
});

export default router;