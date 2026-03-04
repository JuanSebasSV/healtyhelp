const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
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

// ✅ Ruta pública — aceptar invitación con token
router.post('/accept-invite/:token', acceptAdminInvite);

// 🛡️ Todas las demás rutas requieren auth + admin
router.use(protect);
router.use(admin);

// 📊 Estadísticas
router.get('/stats', getStats);

// 👥 Usuarios
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', updateUserRole);

// 📝 Logs
router.post('/logs', createLog);
router.get('/logs', getLogs);

// 📨 Invitaciones
router.post('/invite', inviteAdmin);
router.get('/invitations', getPendingInvitations);
router.delete('/invitations/:id', revokeInvitation);

module.exports = router;