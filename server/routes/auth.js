const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('../config/passport');

const {
  register,
  login,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');

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

// ===== OBTENER USUARIO ACTUAL =====
router.get('/me', protect, async (req, res) => {
  try {
    // Buscar usuario fresco desde BD con todos los campos
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        googleId: user.googleId,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// ===== RUTAS DE GOOGLE OAUTH =====
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`
  }),
  (req, res) => {
    try {
      const token = generateToken(req.user._id);
      res.redirect(`${process.env.FRONTEND_URL}/google-callback?token=${token}`);
    } catch (error) {
      console.error('Error en Google callback:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
  }
);

// ===== ACTUALIZAR PERFIL =====
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (name) user.name = name;

    if (password) {
      if (user.googleId && !user.password) {
        return res.status(400).json({ error: 'Las cuentas de Google no pueden cambiar la contraseña' });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      }
      user.password = password;
    }

    await user.save();

    const updatedUser = await User.findById(req.user._id);
    res.json({
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        googleId: updatedUser.googleId,
        isVerified: updatedUser.isVerified,
        createdAt: updatedUser.createdAt
      },
      message: 'Perfil actualizado'
    });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

module.exports = router;