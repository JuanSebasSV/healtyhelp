const express = require('express');
const router  = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  deleteMultipleRecipes,
  importRecipes,
  exportRecipes,
  getRecipeStats,
  // Reseñas
  crearResena,
  editarResena,
  getResenas,
} = require('../controllers/recipeController');

// ─────────────────────────────────────────────
// 🌐 Rutas públicas
// ─────────────────────────────────────────────
router.get('/',    getAllRecipes);
router.get('/:id', getRecipeById);

// ─────────────────────────────────────────────
// ⭐ Reseñas — requiere login pero NO admin
// Deben ir ANTES del bloque router.use(admin)
// ─────────────────────────────────────────────
router.get ('/:id/resenas', getResenas);           // ver reseñas (público)
router.post('/:id/resenas', protect, crearResena); // crear reseña (usuario)
router.put ('/:id/resenas', protect, editarResena);// editar propia reseña

// ─────────────────────────────────────────────
// 🔒 Rutas de admin
// Las rutas con segmentos fijos van ANTES de /:id
// ─────────────────────────────────────────────
router.use(protect);
router.use(admin);

router.get ('/export/all',      exportRecipes);
router.get ('/stats/summary',   getRecipeStats);
router.post('/import',          importRecipes);
router.post('/delete-multiple', deleteMultipleRecipes);

router.post  ('/',     createRecipe);
router.put   ('/:id',  updateRecipe);
router.delete('/:id',  deleteRecipe);

module.exports = router;