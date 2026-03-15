const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// ============================================================
// VALIDACIÓN DE CONTRASEÑA CENTRALIZADA
// ============================================================
const validatePassword = (password) => {
  const errors = [];
  
  if (!password || password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  }
  
  // Debe contener al menos una letra
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra');
  }
  
  // Debe contener al menos un número
  if (!/[0-9]/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }
  
  // No puede ser solo números
  if (/^\d+$/.test(password)) {
    errors.push('La contraseña no puede ser solo números');
  }
  
  // No puede ser solo letras
  if (/^[a-zA-Z]+$/.test(password)) {
    errors.push('La contraseña no puede ser solo letras');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ============================================================
// REGISTRO
// ============================================================
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // VALIDACIÓN DE CONTRASEÑA
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        error: passwordValidation.errors.join('. ')
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      // Si existe pero es de Google, sugerirle que use Google
      if (userExists.googleId && !userExists.password) {
        return res.status(400).json({ 
          error: 'Este correo ya está registrado con Google. Usa el botón "Continuar con Google".' 
        });
      }
      return res.status(400).json({ error: 'Este correo ya está registrado. Intenta iniciar sesión.' });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
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
    res.status(400).json({ error: error.message });
  }
};

// ============================================================
// LOGIN
// ============================================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Si es usuario de Google SIN contraseña, no puede hacer login normal
    if (user.googleId && !user.password) {
      return res.status(401).json({ 
        error: 'Esta cuenta usa Google para iniciar sesión. Usa el botón "Continuar con Google".' 
      });
    }

    // Si tiene googleId pero TAMBIÉN tiene contraseña (vinculó ambos), permitir login normal
    if (!(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
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
    res.status(400).json({ error: error.message });
  }
};

// ============================================================
// OLVIDÉ CONTRASEÑA
// ============================================================
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.json({ success: true, message: 'Si el correo existe, recibirás un enlace' });
    }

    if (user.googleId && !user.password) {
      return res.status(400).json({ error: 'Esta cuenta usa Google para iniciar sesión. No necesita contraseña.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Healthy Help 🌿" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🔐 Recupera tu contraseña — Healthy Help',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 2rem; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 2rem;">
            <h1 style="color: #1a4d2e; font-family: Georgia, serif; margin: 0;">🌿 Healthy Help</h1>
          </div>
          <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h2 style="color: #2d2d2d; margin-top: 0;">Recupera tu contraseña</h2>
            <p style="color: #555; line-height: 1.6;">
              Hola <strong>${user.name}</strong>, recibimos una solicitud para restablecer la contraseña de tu cuenta.
            </p>
            <p style="color: #555; line-height: 1.6;">
              Este enlace expira en <strong>30 minutos</strong>.
            </p>
            <div style="text-align: center; margin: 2rem 0;">
              <a href="${resetUrl}" style="background: #f77f00; color: white; padding: 1rem 2rem; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 1rem; display: inline-block;">
                Restablecer contraseña
              </a>
            </div>
            <p style="color: #999; font-size: 0.85rem;">Si no solicitaste este cambio, ignora este correo.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 1.5rem 0;">
            <p style="color: #bbb; font-size: 0.8rem; text-align: center;">© Healthy Help — Cuida tu salud con confianza</p>
          </div>
        </div>
      `
    });

    res.json({ success: true, message: 'Email enviado' });

  } catch (error) {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (user) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
      }
    } catch (_) {}
    console.error('Error forgotPassword:', error);
    res.status(500).json({ error: 'Error al enviar el correo. Intenta más tarde.' });
  }
};

// ============================================================
// RESETEAR CONTRASEÑA
// ============================================================
exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Token inválido o expirado. Solicita un nuevo enlace.' });
    }

    // VALIDACIÓN DE CONTRASEÑA
    const passwordValidation = validatePassword(req.body.password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        error: passwordValidation.errors.join('. ')
      });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user._id);
    res.json({ success: true, token });

  } catch (error) {
    console.error('Error resetPassword:', error);
    res.status(400).json({ error: error.message });
  }
};

// Exportar la función de validación
module.exports.validatePassword = validatePassword;