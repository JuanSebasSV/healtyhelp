// routes/terms.js
// Ruta pública — no requiere autenticación.
// El frontend la usa para cargar el texto vigente de Términos y Condiciones.

const express        = require('express');
const router         = express.Router();
const TermsDocument  = require('../models/TermsDocument');

// GET /api/terms — devuelve la versión activa más reciente
router.get('/', async (req, res) => {
  try {
    const terms = await TermsDocument.findOne().sort({ publishedAt: -1 }).select('-publishedBy');
    if (!terms) {
      // Si aún no hay ningún documento en BD, devolver la versión base hardcoded
      // para que el modal no quede en blanco durante el primer despliegue.
      return res.json({
        terms: {
          version: '1.0.0',
          content: null,   // null = el frontend usa su contenido estático de respaldo
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
