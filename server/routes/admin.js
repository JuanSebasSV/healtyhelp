// routes/admin.js

const express = require('express');
const router  = express.Router();

const { protect, admin, requireAdmin } = require('../middleware/auth');

const {
  getAllUsers,
  deleteUser,
  updateUserRole,
  getStats,
  createLog,
  getLogs,
  inviteAdmin,
  acceptAdminInvite,
  getPendingInvitations,
  revokeInvitation,
  // ── Imágenes de reseñas ──
  getImagenesResenas,
  aprobarImagenResena,
  rechazarImagenResena,
  // ── Baneo ──
  banearUsuario,
  desbanearUsuario,
  getBanInfo,
} = require('../controllers/adminController');

const User          = require('../models/User');
const TermsDocument = require('../models/TermsDocument');

// =====================================================================
// ✅ RUTAS PÚBLICAS
// =====================================================================
router.post('/accept-invite/:token', acceptAdminInvite);

// =====================================================================
// 🛡️ A partir de aquí todas las rutas requieren auth + rol admin
// =====================================================================
router.use(protect);
router.use(admin || requireAdmin);

// =====================================================================
// 📊 ESTADÍSTICAS
// =====================================================================
router.get('/stats', getStats);

// =====================================================================
// 👥 USUARIOS
// =====================================================================
router.get   ('/users',          getAllUsers);
router.delete('/users/:id',      deleteUser);
router.put   ('/users/:id/role', updateUserRole);

// =====================================================================
// 🔨 BANEO DE USUARIOS
// PUT /admin/users/:id/ban    — { motivo, dias } (dias=null → permanente)
// PUT /admin/users/:id/unban  — desbanear
// GET /admin/users/:id/ban    — info de baneo
// =====================================================================
router.put('/users/:id/ban',   banearUsuario);
router.put('/users/:id/unban', desbanearUsuario);
router.get('/users/:id/ban',   getBanInfo);

// =====================================================================
// 📝 LOGS
// =====================================================================
router.post('/logs', createLog);
router.get ('/logs', getLogs);

// =====================================================================
// 📨 INVITACIONES
// =====================================================================
router.post  ('/invite',              inviteAdmin);
router.get   ('/invitations',         getPendingInvitations);
router.delete('/invitations/:id',     revokeInvitation);

// =====================================================================
// 🖼️  IMÁGENES DE RESEÑAS
// GET  /admin/imagenes-resenas?estado=pendiente|aprobada|rechazada
// PUT  /admin/imagenes-resenas/:recipeId/:resenaId/aprobar
// PUT  /admin/imagenes-resenas/:recipeId/:resenaId/rechazar
// =====================================================================
router.get('/imagenes-resenas',                                  getImagenesResenas);
router.put('/imagenes-resenas/:recipeId/:resenaId/aprobar',      aprobarImagenResena);
router.put('/imagenes-resenas/:recipeId/:resenaId/rechazar',     rechazarImagenResena);

// =====================================================================
// 📄 TÉRMINOS Y CONDICIONES
// =====================================================================
router.get('/terms', async (req, res) => {
  try {
    const terms = await TermsDocument.findOne().sort({ publishedAt: -1 });
    res.json({ terms: terms || null });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo términos' });
  }
});

router.put('/terms', async (req, res) => {
  try {
    const { version, content } = req.body;
    if (!version || !content)
      return res.status(400).json({ error: 'Versión y contenido son obligatorios' });

    const current = await TermsDocument.findOne().sort({ publishedAt: -1 });
    if (current && current.version === version)
      return res.status(400).json({ error: 'La versión publicada debe ser diferente a la actual' });

    const newTerms = await TermsDocument.create({
      version,
      content,
      publishedBy: req.user._id,
      publishedAt: new Date(),
    });

    await User.updateMany(
      { _id: { $ne: req.user._id } },
      { $set: { termsAccepted: false, termsVersion: '' } }
    );

    res.json({ success: true, terms: newTerms });
  } catch (error) {
    res.status(500).json({ error: 'Error publicando términos' });
  }
});

module.exports = router;