const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const Consumo = require('../models/Consumo');
const User    = require('../models/User');
const { generarRecomendaciones } = require('../utils/motorRecomendaciones');

/**
 * GET /api/recomendaciones/filtros
 * Devuelve SOLO condiciones y categorias del usuario.
 * No devuelve alergias ni preferencias — esos campos no pertenecen
 * al sistema de filtros de recomendaciones y causaban datos fantasma.
 */
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

/**
 * GET /api/recomendaciones
 * El motor lee SOLO healthProfile.condiciones y healthProfile.categorias —
 * nunca alergias, preferencias, cookies ni estado del cliente.
 */
router.get('/', protect, async (req, res) => {
  try {
    const usuario = await User.findById(req.user._id)
      .select('name birthDate weight height healthProfile.condiciones healthProfile.categorias')
      .lean();

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const ahora      = new Date();
    const offsetMs   = -5 * 60 * 60 * 1000;
    const bogota     = new Date(ahora.getTime() + offsetMs);
    const horaActual = bogota.getUTCHours();
    const fechaHoy   = bogota.toISOString().split('T')[0];

    const hace30Dias = new Date(bogota.getTime() - 30 * 24 * 60 * 60 * 1000);
    const fechaInicio = hace30Dias.toISOString().split('T')[0];

    const [consumos, consumosHoy] = await Promise.all([
      Consumo.find({
        userId:      req.user._id,
        fechaBogota: { $gte: fechaInicio },
      })
        .select('tipo fechaBogota nutri recetaSnapshot.nombre horaBogota')
        .lean(),

      Consumo.find({
        userId:      req.user._id,
        fechaBogota: fechaHoy,
      })
        .select('tipo nutri horaBogota')
        .lean(),
    ]);

    const recomendaciones = generarRecomendaciones(usuario, consumos, consumosHoy, horaActual);

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