const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
require('../config/passport');

// Importar controladores
const {
  register,
  login,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');

// Función helper para generar JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// ===== RUTAS NORMALES =====
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Obtener usuario actual (protegido)
router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user });
});

// ===== RUTAS DE GOOGLE OAUTH =====

// Iniciar login con Google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback de Google
router.get('/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`
  }),
  (req, res) => {
    try {
      // Generar JWT
      const token = generateToken(req.user._id);
      
      // Redirigir al frontend con el token
      res.redirect(`${process.env.FRONTEND_URL}/google-callback?token=${token}`);
    } catch (error) {
      console.error('Error en Google callback:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
  }
);

module.exports = router;