const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Generar JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// ============================================================
// REGISTRO
// ============================================================
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Email ya registrado' });
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
        role: user.role
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

    // Usuarios de Google no tienen contraseña
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Si es usuario de Google, no puede hacer login con contraseña
    if (user.googleId && !user.password) {
      return res.status(401).json({ error: 'Esta cuenta usa Google para iniciar sesión' });
    }

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
        role: user.role
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
      // Por seguridad, no revelar si el email existe o no
      return res.json({ success: true, message: 'Si el correo existe, recibirás un enlace' });
    }

    // Usuarios de Google no pueden resetear contraseña
    if (user.googleId && !user.password) {
      return res.status(400).json({ error: 'Esta cuenta usa Google para iniciar sesión' });
    }

    // Generar token de reseteo
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // ✅ 30 minutos (antes eran 10)

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
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
              Haz clic en el botón para crear una nueva contraseña. Este enlace expira en <strong>30 minutos</strong>.
            </p>
            <div style="text-align: center; margin: 2rem 0;">
              <a href="${resetUrl}"
                style="background: #f77f00; color: white; padding: 1rem 2rem; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 1rem; display: inline-block;">
                Restablecer contraseña
              </a>
            </div>
            <p style="color: #999; font-size: 0.85rem; line-height: 1.6;">
              Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña no cambiará.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 1.5rem 0;">
            <p style="color: #bbb; font-size: 0.8rem; text-align: center;">
              © Healthy Help — Cuida tu salud con confianza
            </p>
          </div>
        </div>
      `
    });

    res.json({ success: true, message: 'Email enviado' });

  } catch (error) {
    // Si falla el email, limpiar el token para no dejar datos colgados
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
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Token inválido o expirado. Solicita un nuevo enlace.' });
    }

    // Validar que la contraseña tenga mínimo 6 caracteres
    if (!req.body.password || req.body.password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
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