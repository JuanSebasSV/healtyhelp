const express  = require('express');
const router   = express.Router();
const User     = require('../models/User');
const { protect } = require('../middleware/auth'); // ajusta el path a tu middleware

// GET /api/favoritos — obtener IDs de favoritos del usuario
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('favoritos');
    res.json({ favoritos: user.favoritos || [] });
  } catch {
    res.status(500).json({ error: 'Error obteniendo favoritos' });
  }
});

// POST /api/favoritos/:recetaId — toggle favorito
router.post('/:recetaId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id); 
    const recetaId = req.params.recetaId;
    
    if (!user.favoritos) user.favoritos = [];

    const idx = user.favoritos.findIndex(id => id.toString() === recetaId);

    if (idx === -1) {
      // . Verificación del límite  
      if (user.favoritos.length >= 100) {
        return res.status(400).json({ error: 'Límite de favoritos alcanzado' });
      }
      user.favoritos.push(recetaId);
    } else {
      user.favoritos.splice(idx, 1);
    }

    // . Guardamos los cambios
    await user.save(); 
    res.json({ favoritos: user.favoritos });

  } catch (error) {
    console.error("Error en el servidor:", error); // Para que veas el error real en la terminal
    res.status(500).json({ error: 'Error actualizando favorito' });
  }
});

module.exports = router;