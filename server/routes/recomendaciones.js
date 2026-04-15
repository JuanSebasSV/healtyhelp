const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');       // tu middleware JWT existente
const Consumo = require('../models/Consumo');        // tu modelo de consumos
const User    = require('../models/User');
const { generarRecomendaciones } = require('../utils/motorRecomendaciones');

/**
 * GET /api/recomendaciones
 * Devuelve las recomendaciones para el usuario autenticado.
 */
router.get('/', protect, async (req, res) => {
  try {
    // Cargar usuario completo (healthProfile no viene en el token)
    const usuario = await User.findById(req.user._id)
      .select('name age weight height healthProfile')
      .lean();

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Consumos de los últimos 30 días
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    const consumos = await Consumo.find({
      usuario: req.user._id,
      createdAt: { $gte: hace30Dias },
    })
      .select('tipo fechaBogota nutri recetaSnapshot.nombre')
      .lean();

    // Generar recomendaciones con el motor local
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
