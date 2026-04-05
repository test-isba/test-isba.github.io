'use strict';

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const generateRouter = require('./routes/generate');

const app = express();
const PORT = process.env.PORT || 3000;

// Sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      frameSrc: ["'self'"]
    }
  }
}));

// Rate limiting — 15 générations par heure par IP
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de requêtes. Réessayez dans une heure.' }
});

app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

// Routes API
app.use('/api', apiLimiter, generateRouter);

// Frontend statique
app.use(express.static(path.join(__dirname, 'public')));

// Fallback SPA
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Démarrage
app.listen(PORT, () => {
  console.log(`Générateur de sites démarré sur http://localhost:${PORT}`);
  if (!process.env.GROQ_API_KEY) {
    console.warn('ATTENTION : GROQ_API_KEY manquante — ajoutez-la dans .env');
  }
});
