// Importeren van de benodigde webserver-frameworks en hulpprogramma's voor bestandspaden.
import express = require('express');
import path = require('path');
import type { Request, Response } from 'express';

// Importeren van de beveiligde authenticatie routes 
import authRoutes from './src/routes/authRoutes';
// Initialisatie van de Express applicatie.
const app = express();

// Dynamische poortconfiguratie: geeft prioriteit aan omgevingsvariabelen (vereist voor Google Cloud Run),
// met een fallback naar poort 8080 voor de lokale testomgeving op de MacBook Air M5.
const port = process.env.PORT || 8080; 

// Middleware configuratie: definieert de huidige map als de bron voor statische frontend-bestanden.
app.use(express.static(__dirname));

// Middleware voor JSON-verwerking: stelt de server in staat om inkomende JSON-data (bijv. vanuit formulieren) te lezen.
app.use(express.json());

// ============================================================================
// MODULAIRE API ROUTING (Team Integratiepunten)
// ============================================================================
// Deze endpoints fungeren als geïsoleerde test-routes voor de teamleden.
// In een latere fase kunnen hier aparte 'router' bestanden aan gekoppeld worden.

// Gereserveerd endpoint voor de functionaliteit van Abdou (Fietsenverhuur)
app.get('/api/abdou', (req: Request, res: Response) => {
  res.json({ status: "Succes", message: "API-koppeling voor Abdou's module is gereed." });
});

// Gereserveerd endpoint voor de functionaliteit van Tom (Openingstijden & Overzicht)
app.get('/api/tom', (req: Request, res: Response) => {
  res.json({ status: "Succes", message: "API-koppeling voor Tom's module is gereed." });
});

// ============================================================================
// AUTHENTICATIE & AUTORISATIE ROUTING 
// ============================================================================
// Koppel de geëxporteerde router aan het basis-pad '/api/auth'. 
// Hierdoor luistert de server nu o.a. naar '/api/auth/login' en '/api/auth/register'.
app.use('/api/auth', authRoutes);

// ============================================================================

// Definiëren van het 'root' endpoint: retourneert het lege Area52 UI canvas aan de browser.
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Initialiseren van de webserver zodat deze actief luistert naar inkomende HTTP-verzoeken.
app.listen(port, () => {
  console.log(`De Area52 server draait lokaal op http://localhost:${port}`);
});