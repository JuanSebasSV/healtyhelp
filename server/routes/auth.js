const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const TermsDocument = require('../models/TermsDocument');
require('../config/passport');

const {
  register, login, forgotPassword, resetPassword,
  verifyEmail, resendCode, setGooglePassword
} = require('../controllers/authController');

(async () => {
  try {
    const calcEdadMig = (bd) => {
      if (!bd) return null;
      const hoy = new Date();
      const nac = new Date(bd);
      let e = hoy.getFullYear() - nac.getFullYear();
      const m = hoy.getMonth() - nac.getMonth();
      if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) e--;
      return e;
    };

    // Fase 1: asignar birthDate a cuentas legacy con age en número
    const sinFecha = await User.find(
      { birthDate: { $exists: false }, age: { $exists: true, $ne: null } }
    ).lean();
    if (sinFecha.length > 0) {
      const ahora = new Date();
      for (const doc of sinFecha) {
        const edadLegacy = Number(doc.age);
        if (!edadLegacy || isNaN(edadLegacy) || edadLegacy < 1 || edadLegacy > 120) continue;
        const mes     = Math.floor(Math.random() * 12);
        let anioNac   = ahora.getFullYear() - edadLegacy;
        const diasMax = new Date(anioNac, mes + 1, 0).getDate();
        const dia     = Math.floor(Math.random() * diasMax) + 1;
        const bdTest  = new Date(anioNac, mes, dia);
        if (calcEdadMig(bdTest) < edadLegacy) anioNac -= 1;
        const bd      = new Date(anioNac, mes, dia);
        const edad    = calcEdadMig(bd);
        const update  = { birthDate: bd };
        if (
          edad >= 18 && edad <= 120 &&
          doc.weight >= 40 && doc.weight <= 300 &&
          doc.height >= 50 && doc.height <= 210
        ) update.profileComplete = true;
        await User.updateOne({ _id: doc._id }, { $set: update });
      }
      console.log(`[migración] birthDate asignada a ${sinFecha.length} cuenta(s) legacy`);
    }

    // Fase 2: cuentas que ya tienen birthDate pero profileComplete false con datos completos
    const sinCompletar = await User.find(
      { birthDate: { $exists: true }, profileComplete: { $ne: true } }
    ).lean();
    let corregidas = 0;
    for (const doc of sinCompletar) {
      const edad = calcEdadMig(doc.birthDate);
      if (
        edad >= 18 && edad <= 120 &&
        doc.weight >= 40 && doc.weight <= 300 &&
        doc.height >= 50 && doc.height <= 210
      ) {
        await User.updateOne({ _id: doc._id }, { $set: { profileComplete: true } });
        corregidas++;
      }
    }
    if (corregidas > 0) console.log(`[migración] profileComplete corregido en ${corregidas} cuenta(s)`);
  } catch (e) {
    console.error('[migración] Error:', e.message);
  }
})();

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

const calcularEdadLocal = (birthDate) => {
  if (!birthDate) return null;
  const hoy = new Date();
  const nac = new Date(birthDate);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
};

// RUTAS AUTH
router.post('/register',             register);
router.post('/login',                login);
router.post('/verify-email',         verifyEmail);
router.post('/resend-code',          resendCode);
router.post('/forgot-password',      forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.post('/set-google-password',  protect, setGooglePassword);

// USUARIO ACTUAL
router.get('/me', protect, async (req, res) => {
  try {
    const user     = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });

    const userRaw  = await User.findById(req.user._id).lean();
    const activeTerms = await TermsDocument.findOne().sort({ publishedAt: -1 });
    const activeVersion = activeTerms?.version || '1.0.0';

    const edadCalculada = user.birthDate
      ? calcularEdadLocal(user.birthDate)
      : (userRaw.age ?? null);

    res.json({
      user: {
        id: user._id, name: user.name, email: user.email,
        role: user.role, avatar: user.avatar,
        googleId: user.googleId, isVerified: user.isVerified,
        hasPassword: !!user.password,
        isSuperAdmin: user.isSuperAdmin || false,
        birthDate: user.birthDate, age: edadCalculada,
        weight: user.weight, height: user.height,
        termsAccepted:      user.termsAccepted   || false,
        termsVersion:       user.termsVersion    || '',
        profileComplete:    user.profileComplete  || false,
        activeTermsVersion: activeVersion,
        createdAt: user.createdAt,
        autoLogoutEnabled: user.autoLogoutEnabled ?? false,
        autoLogoutMinutes: user.autoLogoutMinutes ?? 15,
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// GOOGLE OAUTH
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

// ACTUALIZAR PERFIL
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, password, weight } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (name)   user.name   = name.trim();
    if (weight) user.weight = parseFloat(weight);

    const edadActual = calcularEdadLocal(user.birthDate);
    const pesoActual = user.weight;
    const altActual  = user.height;
    if (
      edadActual != null && edadActual >= 18  && edadActual <= 120 &&
      pesoActual != null && pesoActual >= 40  && pesoActual <= 300 &&
      altActual  != null && altActual  >= 50  && altActual  <= 210
    ) {
      user.profileComplete = true;
    }

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
    const edadResp = calcularEdadLocal(updatedUser.birthDate);
    res.json({
      user: {
        id: updatedUser._id, name: updatedUser.name, email: updatedUser.email,
        role: updatedUser.role, avatar: updatedUser.avatar,
        googleId: updatedUser.googleId, isVerified: updatedUser.isVerified,
        birthDate: updatedUser.birthDate, age: edadResp,
        weight: updatedUser.weight, height: updatedUser.height,
        isSuperAdmin: updatedUser.isSuperAdmin || false,
        termsAccepted:   updatedUser.termsAccepted   || false,
        termsVersion:    updatedUser.termsVersion    || '',
        profileComplete: updatedUser.profileComplete  || false,
        createdAt: updatedUser.createdAt
      },
      message: 'Perfil actualizado'
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

// SUBIR AVATAR
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
        termsVersion:    user.termsVersion    || '',
        profileComplete: user.profileComplete  || false,
        createdAt: user.createdAt
      },
      message: 'Avatar actualizado'
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al subir la imagen' });
  }
});

// ELIMINAR AVATAR
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

// ELIMINAR CUENTA
router.delete('/account', protect, async (req, res) => {
  try {
    const { confirmacion } = req.body;
    if (confirmacion !== 'ELIMINAR') {
      return res.status(400).json({ error: 'Confirmación incorrecta' });
    }

    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (user.isSuperAdmin) {
      return res.status(403).json({ error: 'La cuenta Super Administrador no puede eliminarse' });
    }

    if (user.avatar && user.avatar.includes('cloudinary.com')) {
      const publicId = user.avatar.split('/').slice(-2).join('/').split('.')[0];
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    }

    const Consumo = require('../models/Consumo');
    await Consumo.deleteMany({ userId });

    const Recipe = require('../models/Recipe');
    await Recipe.updateMany(
      { 'resenas.userId': userId },
      { $pull: { resenas: { userId } } }
    );
    const recetasAfectadas = await Recipe.find({ resenas: { $exists: true } });
    for (const receta of recetasAfectadas) {
      receta.recalcularPuntos();
      await receta.save();
    }

    await user.deleteOne();
    res.json({ success: true, message: 'Cuenta eliminada correctamente' });
  } catch (error) {
    console.error('Error eliminando cuenta:', error);
    res.status(500).json({ error: 'Error al eliminar la cuenta' });
  }
});

// ACEPTAR TÉRMINOS
router.post('/accept-terms', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const activeTerms = await TermsDocument.findOne().sort({ publishedAt: -1 });
    const activeVersion = activeTerms?.version || '1.0.0';

    user.termsAccepted   = true;
    user.termsAcceptedAt = new Date();
    user.termsVersion    = activeVersion;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, version: activeVersion });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar aceptación de términos' });
  }
});

// COMPLETAR PERFIL
router.post('/complete-profile', protect, async (req, res) => {
  try {
    const { age, birthDate, weight, height } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Prioridad: birthDate enviado > birthDate ya almacenado > age legacy
    if (birthDate) {
      const fechaParsed = new Date(birthDate);
      if (isNaN(fechaParsed.getTime()) || fechaParsed > new Date())
        return res.status(400).json({ error: 'Fecha de nacimiento inválida' });
      user.birthDate = fechaParsed;
    } else if (!user.birthDate) {
      const edadNum = parseInt(age, 10);
      if (!age || isNaN(edadNum) || edadNum < 18 || edadNum > 120)
        return res.status(400).json({ error: 'Fecha de nacimiento requerida' });
      const ahora = new Date();
      const anioNac = ahora.getFullYear() - edadNum;
      const mes     = Math.floor(Math.random() * 12);
      const diasMax = new Date(anioNac, mes + 1, 0).getDate();
      const dia     = Math.floor(Math.random() * diasMax) + 1;
      user.birthDate = new Date(anioNac, mes, dia);
    }

    const edadComputed = calcularEdadLocal(user.birthDate);
    if (!edadComputed || edadComputed < 18)
      return res.status(400).json({ error: 'Debes ser mayor de 18 años' });

    const pesoNum = parseFloat(weight);
    const altNum  = parseFloat(height);

    if (!weight || isNaN(pesoNum) || pesoNum < 40 || pesoNum > 300)
      return res.status(400).json({ error: 'Peso inválido (40-300 kg)' });
    if (!height || isNaN(altNum)  || altNum  < 50 || altNum  > 210)
      return res.status(400).json({ error: 'Altura inválida (50-210 cm)' });

    user.weight          = pesoNum;
    user.height          = altNum;
    user.profileComplete = true;
    await user.save({ validateBeforeSave: false });

    const edadResp = calcularEdadLocal(user.birthDate);
    res.json({
      success: true,
      user: {
        id: user._id, name: user.name, email: user.email,
        role: user.role, avatar: user.avatar,
        googleId: user.googleId, isVerified: user.isVerified,
        isSuperAdmin: user.isSuperAdmin || false,
        birthDate: user.birthDate, age: edadResp,
        weight: user.weight, height: user.height,
        termsAccepted:   user.termsAccepted   || false,
        termsVersion:    user.termsVersion    || '',
        profileComplete: user.profileComplete  || false,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al completar perfil' });
  }
});


// ACTUALIZAR PREFERENCIAS DE SESIÓN (cierre automático)
router.patch('/preferences', protect, async (req, res) => {
  try {
    const { autoLogoutEnabled, autoLogoutMinutes } = req.body;

    const update = {};

    if (typeof autoLogoutEnabled === 'boolean') {
      update.autoLogoutEnabled = autoLogoutEnabled;
    }

    if (autoLogoutMinutes !== undefined) {
      const mins = parseInt(autoLogoutMinutes, 10);
      if (isNaN(mins) || mins < 1 || mins > 480) {
        return res.status(400).json({ error: 'Los minutos deben estar entre 1 y 480' });
      }
      update.autoLogoutMinutes = mins;
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: 'No se enviaron preferencias válidas' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: update },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      preferences: {
        autoLogoutEnabled: user.autoLogoutEnabled,
        autoLogoutMinutes: user.autoLogoutMinutes,
      },
    });
  } catch (error) {
    console.error('Error al actualizar preferencias:', error);
    res.status(500).json({ error: 'Error al actualizar preferencias' });
  }
});

module.exports = router;