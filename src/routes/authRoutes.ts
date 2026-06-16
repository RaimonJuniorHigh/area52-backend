import { Router } from 'express';
import { register, login } from '../controllers/authController';

/**
 * ==========================================
 * ARCHITECTUUR NOTITIES - AREA52 ROUTING
 * Doel: Uitleg over de mappenstructuur en route-afhandeling voor het team en documentatie.
 * ==========================================
 * * WAAROM WE ROUTES EN CONTROLLERS SCHEIDEN (Separation of Concerns):
 * 1. Overzichtelijkheid: In dit bestand definiëren we alléén de 'knooppunten' (URL endpoints) 
 *    die de frontend kan aanroepen. De daadwerkelijke logica (het denkwerk) zit geïsoleerd 
 *    in de authController. Dit houdt onze code schoon, leesbaar en makkelijk testbaar.
 * 2. RESTful API Design: We gebruiken de HTTP POST methode voor zowel login als register. 
 *    Dit doen we specifiek omdat we gevoelige data (wachtwoorden, e-mails) in de versleutelde 
 *    'body' van het verzoek moeten meesturen, en absoluut niet in de URL (zoals bij een GET request).
 */

const router = Router();

// ==========================================
// AUTHENTICATIE ENDPOINTS (Gekoppeld aan de React Frontend)
// ==========================================

// Endpoint: POST /api/auth/register
// Functie: Ontvangt de payload (email, wachtwoord, rol) en routeert deze naar de register-controller.
router.post('/register', register);

// Endpoint: POST /api/auth/login
// Functie: Routeert de inlogpoging naar de logica en retourneert bij succes de JWT token.
// @Abdou: Jouw frontend moet de token die uit deze route komt veilig opslaan (bijv. in localStorage) 
// en vanaf dan in de 'Authorization' header meesturen bij alle beveiligde verzoeken naar de backend!
router.post('/login', login);

export default router;