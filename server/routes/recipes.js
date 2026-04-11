const express  = require('express');
const router   = express.Router();
const { protect, admin } = require('../middleware/auth');
const { uploadResena }   = require('../config/cloudinary');

const {
  getAllRecipes, getRecipeById, createRecipe, updateRecipe,
  deleteRecipe, deleteMultipleRecipes, importRecipes, exportRecipes, getRecipeStats,
  getResenas, crearResena, editarResena, borrarResena,
  votarResena, responderResena, borrarRespuesta,
  subirImagenResena,
  quitarImagenResena,
} = require('../controllers/recipeController');

// ── Públicas ──
router.get('/',    getAllRecipes);
router.get('/:id', getRecipeById);

// ── Reseñas (protect pero NO admin) ──
router.get   ('/:id/resenas',                              getResenas);

// crearResena: acepta JSON plano o multipart con campo "imagen"
router.post  ('/:id/resenas',
  protect,
  uploadResena.single('imagen'),   // si no hay fichero, next() igual
  crearResena
);

router.put   ('/:id/resenas',                protect,      editarResena);
router.delete('/:id/resenas/:resenaId',      protect,      borrarResena);
router.post  ('/:id/resenas/:resenaId/voto', protect,      votarResena);

// ── Imagen en reseña existente ──
// IMPORTANTE: esta ruta fija debe ir ANTES de /:id/resenas/:resenaId
router.delete('/:id/resenas/imagen', protect, quitarImagenResena);

router.post(
  '/:id/resenas/:resenaId/imagen',
  protect,
  uploadResena.single('imagen'),
  subirImagenResena
);

// ── Respuestas ──
router.post  ('/:id/resenas/:resenaId/respuestas',            protect, responderResena);
router.delete('/:id/resenas/:resenaId/respuestas/:respId',    protect, borrarRespuesta);

// ── Admin (rutas fijas ANTES de /:id para evitar colisiones) ──
router.use(protect);
router.use(admin);
router.get   ('/export/all',      exportRecipes);
router.get   ('/stats/summary',   getRecipeStats);
router.post  ('/import',          importRecipes);
router.post  ('/delete-multiple', deleteMultipleRecipes);
router.post  ('/',                createRecipe);
router.put   ('/:id',             updateRecipe);
router.delete('/:id',             deleteRecipe);

module.exports = router;