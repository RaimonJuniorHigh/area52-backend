"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const RegisterController_1 = require("../controllers/RegisterController");
const LoginController_1 = require("../controllers/LoginController");
/**
 * ==========================================
 * ARCHITECTUUR NOTITIES - AREA52 ROUTING
 * Doel: Route-definitie voor Area52 authenticatie.
 * ==========================================
 */
const router = (0, express_1.Router)();
// ==========================================
// AUTHENTICATIE ENDPOINTS
// ==========================================
// Endpoint: POST /api/auth/register
// Functie: Routeert de registratie-aanvraag naar de RegisterController
router.post('/register', RegisterController_1.register);
// Endpoint: POST /api/auth/login
// Functie: Routeert de inlogpoging naar de LoginController en geeft JWT token terug
router.post('/login', LoginController_1.login);
exports.default = router;
