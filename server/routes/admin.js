const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getAllUsers,
  deleteUser,
  updateUserRole,
  getStats
} = require('../controllers/adminController');

// 🔒 TODAS las rutas requieren: autenticación + ser admin
router.use(protect); // Primero verificar que esté logueado
router.use(admin);   // Luego verificar que sea admin

// Rutas del panel
router.get('/users', getAllUsers);
router.get('/stats', getStats);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', updateUserRole);

module.exports = router;