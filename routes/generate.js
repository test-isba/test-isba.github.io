'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
const archiver = require('archiver');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { generateSiteContent } = require('../services/claudeService');
const { buildSite } = require('../services/siteBuilder');
const { NICHES } = require('../data/niches');

const router = express.Router();

const validationRules = [
  body('businessName').trim().notEmpty().isLength({ max: 100 }).withMessage('Nom requis (max 100 car.)'),
  body('nicheId').notEmpty().withMessage('Niche requise'),
  body('city').trim().notEmpty().isLength({ max: 100 }).withMessage('Ville requise'),
  body('phone').optional().trim().isLength({ max: 20 }),
  body('email').optional().trim().isEmail().normalizeEmail().withMessage('Email invalide'),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('tagline').optional().trim().isLength({ max: 200 }),
  body('ownerName').optional().trim().isLength({ max: 100 }),
  body('address').optional().trim().isLength({ max: 200 }),
  body('primaryColor').optional().matches(/^#[0-9a-fA-F]{6}$/).withMessage('Couleur hex invalide'),
  body('services').optional()
];

// POST /api/generate
router.post('/generate', validationRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const niche = NICHES.find(n => n.id === req.body.nicheId);
  if (!niche) {
    return res.status(400).json({ error: 'Niche inconnue' });
  }

  const formData = {
    businessName: req.body.businessName,
    tagline: req.body.tagline || '',
    description: req.body.description || '',
    services: Array.isArray(req.body.services)
      ? req.body.services
      : (req.body.services ? req.body.services.split(',').map(s => s.trim()) : []),
    city: req.body.city,
    phone: req.body.phone || '',
    email: req.body.email || '',
    ownerName: req.body.ownerName || '',
    address: req.body.address || '',
    primaryColor: req.body.primaryColor || '#2563eb'
  };

  try {
    const aiContent = await generateSiteContent(formData, niche);
    if (!aiContent) throw new Error('generateSiteContent returned null');
    aiContent.niche = niche;

    const sessionId = uuidv4();
    buildSite(sessionId, aiContent, formData, niche);

    res.json({
      id: sessionId,
      preview_url: `/api/preview/${sessionId}`,
      download_url: `/api/download/${sessionId}`
    });
  } catch (err) {
    console.error('[generate] FULL ERROR:', err.stack || err.message);
    if (err.message.includes('401') || err.message.includes('invalid_api_key')) {
      return res.status(401).json({ error: 'Clé API Groq invalide. Vérifiez GROQ_API_KEY dans votre .env.' });
    }
    if (err.message.includes('JSON')) {
      return res.status(500).json({ error: 'La génération a échoué. Réessayez.' });
    }
    res.status(500).json({ error: 'Erreur serveur. Vérifiez votre clé API.' });
  }
});

// GET /api/preview/:id
router.get('/preview/:id', (req, res) => {
  const id = sanitizeId(req.params.id);
  if (!id) return res.status(400).send('ID invalide');

  const filePath = path.join(__dirname, '..', 'tmp', id, 'index.html');
  if (!fs.existsSync(filePath)) return res.status(404).send('Aperçu non trouvé');

  res.sendFile(filePath);
});

// GET /api/download/:id
router.get('/download/:id', (req, res) => {
  const id = sanitizeId(req.params.id);
  if (!id) return res.status(400).send('ID invalide');

  const siteDir = path.join(__dirname, '..', 'tmp', id);
  if (!fs.existsSync(siteDir)) return res.status(404).send('Fichiers non trouvés');

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="site-${id.slice(0, 8)}.zip"`);

  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.on('error', (err) => { throw err; });
  archive.pipe(res);
  archive.directory(siteDir, false);
  archive.finalize().then(() => {
    // Nettoyer après envoi
    setTimeout(() => {
      fs.rmSync(siteDir, { recursive: true, force: true });
    }, 5000);
  });
});

function sanitizeId(id) {
  if (!id) return null;
  const clean = id.replace(/[^a-f0-9-]/gi, '');
  return clean.length > 10 ? clean : null;
}

module.exports = router;
