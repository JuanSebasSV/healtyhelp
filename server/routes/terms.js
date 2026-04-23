// routes/terms.js
const express        = require('express');
const router         = express.Router();
const TermsDocument  = require('../models/TermsDocument');

// GET /api/terms — devuelve la versión activa más reciente
router.get('/', async (req, res) => {
  try {
    const terms = await TermsDocument.findOne().sort({ publishedAt: -1 }).select('-publishedBy');
    if (!terms) {
      return res.json({
        terms: {
          version: '1.0.0',
          content: null,
          publishedAt: null
        }
      });
    }
    res.json({ terms });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo términos' });
  }
});

module.exports = router;
