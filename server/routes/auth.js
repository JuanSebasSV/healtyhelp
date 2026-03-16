// server/routes/auth.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const User = require('../models/User');
require('../config/passport');

const {
  register, login, forgotPassword, resetPassword,
  verifyEmail, resendCode
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');
const { uploadAvatar, cloudinary } = require('../config/cloudinary');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8)     errors.push('Debe tener al menos 8 caracteres');
  if (!/[a-z]/.test(password)) errors.push('Debe contener al menos una letra minúscula');
  if (!/[A-Z]/.test(password)) errors.push('Debe contener al menos una letra mayúscula');
  if (!/\d/.test(password))    errors.push('Debe contener al menos un número');
  return errors;
};

// ===== RUTAS AUTH =====
router.post('/register',               register);
router.post('/login',                  login);
router.post('/verify-email',           verifyEmail);
router.post('/resend-code',            resendCode);
router.post('/forgot-password',        forgotPassword);
router.put('/reset-password/:token',   resetPassword);

// ===== USUARIO ACTUAL =====
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
    res.json({
      user: {
        id: user._id, name: user.name, email: user.email,
        role: user.role, avatar: user.avatar,
        googleId: user.googleId, isVerified: user.isVerified, createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// ===== GOOGLE OAUTH =====
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed` }),
  (req, res) => {
    try {
      const token = generateToken(req.user._id);
      res.redirect(`${process.env.FRONTEND_URL}/google-callback?token=${token}`);
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
  }
);

// ===== ACTUALIZAR PERFIL =====
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (name) user.name = name.trim();

    if (password) {
      if (user.googleId && !user.password) {
        return res.status(400).json({ error: 'Las cuentas de Google no pueden cambiar la contraseña' });
      }
      const errors = validatePassword(password);
      if (errors.length > 0) return res.status(400).json({ error: errors[0] });
      user.password = password;
    }

    await user.save();
    const updatedUser = await User.findById(req.user._id);
    res.json({
      user: {
        id: updatedUser._id, name: updatedUser.name, email: updatedUser.email,
        role: updatedUser.role, avatar: updatedUser.avatar,
        googleId: updatedUser.googleId, isVerified: updatedUser.isVerified, createdAt: updatedUser.createdAt
      },
      message: 'Perfil actualizado'
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

// ===== SUBIR AVATAR =====
router.put('/avatar', protect, uploadAvatar.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se recibió ninguna imagen' });

    const user = await User.findById(req.user._id);
    if (user.avatar && user.avatar.includes('cloudinary.com')) {
      const publicId = user.avatar.split('/').slice(-2).join('/').split('.')[0];
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    }

    user.avatar = req.file.path;
    await user.save({ validateBeforeSave: false });

    res.json({
      user: {
        id: user._id, name: user.name, email: user.email,
        role: user.role, avatar: user.avatar,
        googleId: user.googleId, isVerified: user.isVerified, createdAt: user.createdAt
      },
      message: 'Avatar actualizado'
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al subir la imagen' });
  }
});

// ===== ELIMINAR AVATAR =====
router.delete('/avatar', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.avatar && user.avatar.includes('cloudinary.com')) {
      const publicId = user.avatar.split('/').slice(-2).join('/').split('.')[0];
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    }
    user.avatar = undefined;
    await user.save({ validateBeforeSave: false });
    res.json({ message: 'Avatar eliminado', user: { ...user.toObject(), avatar: null } });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar avatar' });
  }
});

module.exports = router;