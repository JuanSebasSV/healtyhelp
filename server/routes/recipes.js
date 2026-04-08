const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/recipeController');
const { protect, admin } = require('../middleware/auth');

// ── CRUD ──────────────────────────────────────────────────────────────────────
router.get('/',               controller.getRecipes);
router.get('/stats/summary',  controller.getStatsSummary);
router.get('/:id',            controller.getRecipe);

router.post('/',      protect, admin, controller.createRecipe);
router.put('/:id',    protect, admin, controller.updateRecipe);
router.delete('/:id', protect, admin, controller.deleteRecipe);

// ── Costos ────────────────────────────────────────────────────────────────────
router.put('/:id/costos', protect, admin, controller.updateCostos);
router.get('/:id/costos',              controller.getCostos);

// ── Reseñas ───────────────────────────────────────────────────────────────────
router.get('/:id/resenas',                                        controller.getResenas);
router.post('/:id/resenas',                    protect,           controller.createResena);
router.put('/:id/resenas',                     protect,           controller.updateResena);
router.delete('/:id/resenas/:resenaId',        protect,           controller.deleteResena);
router.post('/:id/resenas/:resenaId/voto',     protect,           controller.votarResena);

// ── Respuestas a reseñas ──────────────────────────────────────────────────────
router.post('/:id/resenas/:resenaId/respuestas',              protect, controller.createRespuesta);
router.delete('/:id/resenas/:resenaId/respuestas/:respId',    protect, controller.deleteRespuesta);

module.exports = router;