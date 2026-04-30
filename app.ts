import express = require('express');
import type { Request, Response } from 'express';

const app = express();
const port = 8080;

app.get('/', (req: Request, res: Response) => {
  res.send('<h1>Welkom bij Area52!</h1><p>De backend draait op TypeScript.</p>');
});

app.listen(port, () => {
  console.log(`De Hello World pagina draait op http://localhost:${port}`);
});