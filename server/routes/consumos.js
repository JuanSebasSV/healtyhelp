const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  registrarConsumo,
  cancelarConsumo,
  editarTipo,
  agregarManual,
  getHoy,
  getDiasConConsumos,
  getDia,
  getSemana,
  getMes,
  getConsumoHoyPorReceta,
} = require('../controllers/consumoController');

// Todas las rutas requieren login
router.use(protect);

// Consultas
router.get('/hoy',              getHoy);
router.get('/dias',             getDiasConConsumos);
router.get('/dia/:fecha',       getDia);
router.get('/semana/:lunes',    getSemana);
router.get('/mes/:yearMes',     getMes);
router.get('/receta/:recetaId/hoy', getConsumoHoyPorReceta);

// Acciones
router.post('/manual',               agregarManual);
router.post('/:recetaId',            registrarConsumo);
router.delete('/:consumoId',         cancelarConsumo);
router.put('/:consumoId/tipo',       editarTipo);

module.exports = router;