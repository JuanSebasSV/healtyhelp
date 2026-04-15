const express = require('express');
const router  = express.Router();
const axios   = require('axios');

router.get('/proxy-imagen', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url requerida' });
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 8000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HealtyHelp/1.0)' },
    });
    res.set('Content-Type', response.headers['content-type'] || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(response.data);
  } catch {
    res.status(502).json({ error: 'No se pudo cargar la imagen' });
  }
});

module.exports = router;