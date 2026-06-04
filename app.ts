// Importeren van de benodigde webserver-frameworks en hulpprogramma's voor bestandspaden.
import express = require('express');
import path = require('path');
import type { Request, Response } from 'express';

// Initialisatie van de Express applicatie.
const app = express();

// Dynamische poortconfiguratie: geeft prioriteit aan omgevingsvariabelen (vereist voor cloud-omgevingen zoals Google Cloud Run) 
// met een fallback naar poort 8080 voor lokale ontwikkelingsdoeleinden.
const port = process.env.PORT || 8080; 

// Middleware configuratie: definieert de huidige map als de bron voor statische bestanden.
// Dit stelt de server in staat om client-side assets (zoals gecompileerde JavaScript- of CSS-bestanden) correct af te leveren aan de browser.
app.use(express.static(__dirname));

// Definiëren van het 'root' endpoint (de hoofdpagina van de applicatie).
app.get('/', (req: Request, res: Response) => {
  // In plaats van een standaard tekstrespons, verwerkt en retourneert de server het volledige HTML-document.
  // De 'path' module wordt gebruikt om een veilig en absoluut bestandspad naar 'index.html' te genereren.
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Initialiseren van de webserver zodat deze actief luistert naar inkomende HTTP-verzoeken op de geconfigureerde poort.
app.listen(port, () => {
  console.log(`De Area52 server draait lokaal op http://localhost:${port}`);
});