const express = require('express');
const router = express.Router();
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
  getRecipeStats
} = require('../controllers/recipeController');

// ─────────────────────────────────────────────
// 🌐 Rutas públicas (sin autenticación)
// ─────────────────────────────────────────────
router.get('/', getAllRecipes);
router.get('/:id', getRecipeById);

// ─────────────────────────────────────────────
// 🔒 A partir de aquí: requiere auth + admin
// IMPORTANTE: las rutas con segmentos fijos como
// /export/all y /stats/summary deben declararse
// ANTES de /:id para que Express no las confunda
// con un parámetro dinámico.
// ─────────────────────────────────────────────
router.use(protect);
router.use(admin);

// Exportar / Importar / Estadísticas (rutas fijas primero)
router.get('/export/all', exportRecipes);
router.get('/stats/summary', getRecipeStats);
router.post('/import', importRecipes);
router.post('/delete-multiple', deleteMultipleRecipes);

// CRUD individual
router.post('/', createRecipe);
router.put('/:id', updateRecipe);
router.delete('/:id', deleteRecipe);

module.exports = router;