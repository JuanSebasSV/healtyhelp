// routes/admin.js

const express = require('express');
const router  = express.Router();

// Middleware — se importan ambos nombres por compatibilidad
const { protect, admin, requireAdmin } = require('../middleware/auth');

// Controladores externos (del archivo original)
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
  revokeInvitation
} = require('../controllers/adminController');

// Modelos (usados por las rutas de Terms & Conditions)
const User          = require('../models/User');
const TermsDocument = require('../models/TermsDocument');

// =====================================================================
// ✅ RUTAS PÚBLICAS — no requieren autenticación
// =====================================================================

// Aceptar invitación de admin mediante token
router.post('/accept-invite/:token', acceptAdminInvite);

// =====================================================================
// 🛡️ A partir de aquí todas las rutas requieren auth + rol admin
// Se aplica el middleware con ambos nombres para compatibilidad
// =====================================================================
router.use(protect);
router.use(admin || requireAdmin); // usa el que esté definido en auth.js

// =====================================================================
// 📊 ESTADÍSTICAS
// =====================================================================
router.get('/stats', getStats);

// =====================================================================
// 👥 USUARIOS
// =====================================================================
router.get('/users',            getAllUsers);
router.delete('/users/:id',     deleteUser);
router.put('/users/:id/role',   updateUserRole);

// =====================================================================
// 📝 LOGS
// =====================================================================
router.post('/logs', createLog);
router.get('/logs',  getLogs);

// =====================================================================
// 📨 INVITACIONES
// =====================================================================
router.post('/invite',                inviteAdmin);
router.get('/invitations',            getPendingInvitations);
router.delete('/invitations/:id',     revokeInvitation);

// =====================================================================
// 📄 TÉRMINOS Y CONDICIONES
// =====================================================================

// GET /admin/terms — devuelve la versión activa (para el panel admin)
router.get('/terms', async (req, res) => {
  try {
    const terms = await TermsDocument.findOne().sort({ publishedAt: -1 });
    res.json({ terms: terms || null });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo términos' });
  }
});

// PUT /admin/terms — publica una nueva versión o actualiza la actual
// Body: { version: '1.1.0', content: '<h3>...</h3>' }
router.put('/terms', async (req, res) => {
  try {
    const { version, content } = req.body;
    if (!version || !content)
      return res.status(400).json({ error: 'Versión y contenido son obligatorios' });

    // Verificar que la versión sea diferente a la actual
    const current = await TermsDocument.findOne().sort({ publishedAt: -1 });
    if (current && current.version === version)
      return res.status(400).json({ error: 'La versión publicada debe ser diferente a la actual' });

    // Crear el nuevo documento de términos
    const newTerms = await TermsDocument.create({
      version,
      content,
      publishedBy: req.user._id,
      publishedAt: new Date()
    });

    // ⚠️ Forzar re-aceptación a TODOS los usuarios (excepto el admin que publicó)
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