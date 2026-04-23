const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const Consumo = require('../models/Consumo');
const User    = require('../models/User');
const { generarRecomendaciones } = require('../utils/motorRecomendaciones');

// GET /api/recomendaciones/filtros
router.get('/filtros', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('healthProfile.condiciones healthProfile.categorias')
      .lean();

    res.json({
      condiciones: user?.healthProfile?.condiciones || [],
      categorias:  user?.healthProfile?.categorias  || [],
    });
  } catch (err) {
    console.error('[recomendaciones/filtros]', err);
    res.status(500).json({ error: 'Error al obtener filtros' });
  }
});

// GET /api/recomendaciones
router.get('/', protect, async (req, res) => {
  try {
    const usuario = await User.findById(req.user._id)
      .select('name age weight height healthProfile.condiciones healthProfile.categorias')
      .lean();

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    const consumos = await Consumo.find({
      usuario: req.user._id,
      createdAt: { $gte: hace30Dias },
    })
      .select('tipo fechaBogota nutri recetaSnapshot.nombre')
      .lean();

    const recomendaciones = generarRecomendaciones(usuario, consumos);

    res.json({
      ok: true,
      nombre: usuario.name,
      recomendaciones,
    });
  } catch (err) {
    console.error('[recomendaciones]', err);
    res.status(500).json({ error: 'Error generando recomendaciones' });
  }
});

module.exports = router;