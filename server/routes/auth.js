const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
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
        googleId: user.googleId, isVerified: user.isVerified,
        isSuperAdmin: user.isSuperAdmin || false,
        age: user.age, weight: user.weight, height: user.height,
        termsAccepted:   user.termsAccepted   || false,
        profileComplete: user.profileComplete  || false,
        createdAt: user.createdAt
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
    const { name, password, age, weight, height } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (name)   user.name   = name.trim();
    if (age)    user.age    = parseInt(age, 10);
    if (weight) user.weight = parseFloat(weight);
    if (height) user.height = parseFloat(height);

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
        googleId: updatedUser.googleId, isVerified: updatedUser.isVerified,
        age: updatedUser.age, weight: updatedUser.weight, height: updatedUser.height,
        isSuperAdmin: updatedUser.isSuperAdmin || false,
        termsAccepted:   updatedUser.termsAccepted   || false,
        profileComplete: updatedUser.profileComplete  || false,
        createdAt: updatedUser.createdAt
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
        googleId: user.googleId, isVerified: user.isVerified,
        isSuperAdmin: user.isSuperAdmin || false,
        age: user.age, weight: user.weight, height: user.height,
        termsAccepted:   user.termsAccepted   || false,
        profileComplete: user.profileComplete  || false,
        createdAt: user.createdAt
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

// ===== ELIMINAR CUENTA =====
router.delete('/account', protect, async (req, res) => {
  try {
    const { confirmacion } = req.body;
    if (confirmacion !== 'ELIMINAR') {
      return res.status(400).json({ error: 'Confirmación incorrecta' });
    }

    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Proteger superadmin
    if (user.isSuperAdmin) {
      return res.status(403).json({ error: 'La cuenta Super Administrador no puede eliminarse' });
    }

    // Eliminar avatar de Cloudinary si existe
    if (user.avatar && user.avatar.includes('cloudinary.com')) {
      const publicId = user.avatar.split('/').slice(-2).join('/').split('.')[0];
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    }

    // Eliminar todos los consumos del usuario
    const Consumo = require('../models/Consumo');
    await Consumo.deleteMany({ userId });

    // Eliminar todas las reseñas del usuario de las recetas
    const Recipe = require('../models/Recipe');
    await Recipe.updateMany(
      { 'resenas.userId': userId },
      { $pull: { resenas: { userId } } }
    );
    // Recalcular promedios de recetas afectadas
    const recetasAfectadas = await Recipe.find({ 'resenas': { $exists: true } });
    for (const receta of recetasAfectadas) {
      receta.recalcularPuntos();
      await receta.save();
    }

    // Eliminar el usuario
    await user.deleteOne();

    res.json({ success: true, message: 'Cuenta eliminada correctamente' });
  } catch (error) {
    console.error('Error eliminando cuenta:', error);
    res.status(500).json({ error: 'Error al eliminar la cuenta' });
  }
});

// ===== ACEPTAR TÉRMINOS =====
router.post('/accept-terms', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    user.termsAccepted   = true;
    user.termsAcceptedAt = new Date();
    user.termsVersion    = '1.0.0';
    await user.save({ validateBeforeSave: false });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar aceptación' });
  }
});

// ===== COMPLETAR PERFIL =====
router.post('/complete-profile', protect, async (req, res) => {
  try {
    const { age, weight, height } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const edadNum = parseInt(age, 10);
    const pesoNum = parseFloat(weight);
    const altNum  = parseFloat(height);

    if (!age || isNaN(edadNum) || edadNum < 18 || edadNum > 100)
      return res.status(400).json({ error: 'Edad inválida (18-100)' });
    if (!weight || isNaN(pesoNum) || pesoNum < 40 || pesoNum > 150)
      return res.status(400).json({ error: 'Peso inválido (40-150 kg)' });
    if (!height || isNaN(altNum) || altNum < 50 || altNum > 210)
      return res.status(400).json({ error: 'Altura inválida (50-210 cm)' });

    user.age             = edadNum;
    user.weight          = pesoNum;
    user.height          = altNum;
    user.profileComplete = true;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      user: {
        id: user._id, name: user.name, email: user.email,
        role: user.role, avatar: user.avatar,
        googleId: user.googleId, isVerified: user.isVerified,
        isSuperAdmin: user.isSuperAdmin || false,
        age: user.age, weight: user.weight, height: user.height,
        termsAccepted:   user.termsAccepted   || false,
        profileComplete: user.profileComplete  || false,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al completar perfil' });
  }
});

module.exports = router;