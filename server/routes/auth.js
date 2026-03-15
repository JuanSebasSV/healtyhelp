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
  register,
  login,
  forgotPassword,
  resetPassword,
  validatePassword
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// ===== CONFIGURACIÓN DE MULTER PARA SUBIR IMÁGENES =====
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/avatars');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      console.log('Directorio de avatares verificado:', uploadDir);
      cb(null, uploadDir);
    } catch (error) {
      console.error('Error creando directorio:', error);
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`;
    console.log('Guardando archivo como:', uniqueName);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    console.log('Validando archivo:', {
      filename: file.originalname,
      mimetype: file.mimetype,
      extname: path.extname(file.originalname),
      isValid: extname && mimetype
    });
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpg, png, webp)'));
    }
  }
});

// ===== RUTAS NORMALES =====
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// ===== OBTENER USUARIO ACTUAL =====
router.get('/me', protect, async (req, res) => {
  try {
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

// ===== ACTUALIZAR PERFIL (CON VALIDACIÓN UNIFICADA) =====
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (name) {
      user.name = name;
    }

    if (password) {
      // ✅ AHORA SÍ PERMITIR que usuarios de Google establezcan contraseña
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({ 
          error: passwordValidation.errors.join('. ')
        });
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

// ===== SUBIR AVATAR =====
router.post('/upload-avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ninguna imagen' });
    }

    const user = await User.findById(req.user._id);
    const oldAvatar = user.avatar; // Guardar el avatar anterior por si falla

    // Eliminar avatar anterior SOLO si NO es de Google
    if (user.avatar && !user.avatar.includes('googleusercontent.com') && !user.avatar.startsWith('http')) {
      const oldAvatarPath = path.join(__dirname, '../uploads/avatars', path.basename(user.avatar));
      try {
        await fs.unlink(oldAvatarPath);
        console.log('Avatar anterior eliminado:', oldAvatarPath);
      } catch (err) {
        console.log('No se pudo eliminar avatar anterior (puede no existir):', err.message);
      }
    }

    // Guardar nueva ruta del avatar
    const newAvatarPath = `/uploads/avatars/${req.file.filename}`;
    user.avatar = newAvatarPath;
    
    try {
      await user.save();
      console.log('Avatar guardado exitosamente:', newAvatarPath);
    } catch (saveError) {
      // Si falla al guardar, eliminar el archivo subido y restaurar el anterior
      console.error('Error al guardar usuario:', saveError);
      try {
        await fs.unlink(path.join(__dirname, '../uploads/avatars', req.file.filename));
      } catch (_) {}
      
      user.avatar = oldAvatar; // Restaurar avatar anterior
      return res.status(500).json({ error: 'Error al guardar la imagen en la base de datos' });
    }

    res.json({
      success: true,
      avatar: user.avatar,
      message: 'Foto de perfil actualizada'
    });
  } catch (error) {
    console.error('Error subiendo avatar:', error);
    
    // Intentar eliminar el archivo subido si existe
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (_) {}
    }
    
    res.status(500).json({ error: 'Error al subir la imagen: ' + error.message });
  }
});

// ===== ELIMINAR AVATAR =====
router.delete('/delete-avatar', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // No permitir eliminar avatar de Google
    if (user.avatar && user.avatar.includes('googleusercontent.com')) {
      return res.status(400).json({ 
        error: 'No puedes eliminar tu foto de Google. Puedes cambiarla subiendo una nueva.' 
      });
    }

    // Eliminar archivo físico
    if (user.avatar) {
      const avatarPath = path.join(__dirname, '../uploads/avatars', path.basename(user.avatar));
      try {
        await fs.unlink(avatarPath);
      } catch (err) {
        console.log('Archivo no encontrado:', err.message);
      }
    }

    user.avatar = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Foto de perfil eliminada'
    });
  } catch (error) {
    console.error('Error eliminando avatar:', error);
    res.status(500).json({ error: 'Error al eliminar la imagen' });
  }
});

module.exports = router;