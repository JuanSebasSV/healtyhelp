// authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const TermsDocument = require('../models/TermsDocument');
const { enviarEmail, emailBase } = require('../utils/emailService');
const { AUTH_COOKIE_OPTS, CLEAR_COOKIE_OPTS } = require('../config/cookies');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRE
});

const parseJwtExpireToMs = (expire) => {
  if (!expire) return 7 * 24 * 60 * 60 * 1000;
  const match = /^(\d+)([smhd])$/.exec(String(expire).trim());
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const n = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return n * multipliers[unit];
};

const COOKIE_OPTS = {
  ...AUTH_COOKIE_OPTS,
  maxAge: parseJwtExpireToMs(process.env.JWT_EXPIRE),
};

const setAuthCookie = (res, token) => {
  res.cookie('token', token, COOKIE_OPTS);
};

const clearAuthCookie = (res) => {
  res.clearCookie('token', CLEAR_COOKIE_OPTS);
};

const buildAuthResponse = async (user) => {
  const activeTerms = await TermsDocument.findOne().sort({ publishedAt: -1 }).select('version');
  const activeTermsVersion = activeTerms?.version || null;
  return { ...buildUserResponse(user), activeTermsVersion };
};

const calcularEdad = (birthDate) => {
  if (!birthDate) return null;
  const hoy = new Date();
  const nac = new Date(birthDate);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
};

const buildUserResponse = (user) => {
  const obj = {
    id:              user._id,
    name:            user.name,
    email:           user.email,
    role:            user.role,
    avatar:          user.avatar,
    googleId:        user.googleId,
    isVerified:      user.isVerified      || false,
    isSuperAdmin:    user.isSuperAdmin    || false,
    birthDate:       user.birthDate,
    age:             calcularEdad(user.birthDate),
    weight:          user.weight,
    alergia: user.alergia || '',
    height:          user.height,
    termsAccepted:   user.termsAccepted   || false,
    termsVersion:    user.termsVersion    || '',
    profileComplete: user.profileComplete || false,
    createdAt:       user.createdAt
  };
  if (user.password !== undefined) obj.hasPassword = !!user.password;
  return obj;
};

const validarNombre = (name) => {
  if (!name || name.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
  if (name.trim().length > 50)         return 'El nombre es muy largo';
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) return 'El nombre solo puede contener letras';
  if (/(.)\1{2,}/.test(name))          return 'El nombre no puede tener letras repetidas consecutivamente';
  return null;
};

const validarPassword = (password) => {
  if (!password || password.length < 8) return 'Debe tener al menos 8 caracteres';
  if (!/[a-z]/.test(password))          return 'Debe contener al menos una letra minúscula';
  if (!/[A-Z]/.test(password))          return 'Debe contener al menos una letra mayúscula';
  if (!/\d/.test(password))             return 'Debe contener al menos un número';
  return null;
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, birthDate, weight, height, alergia } = req.body;

    if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    const nameError = validarNombre(name);
    if (nameError) return res.status(400).json({ error: nameError });

    const pwdError = validarPassword(password);
    if (pwdError) return res.status(400).json({ error: pwdError });

    if (!birthDate) return res.status(400).json({ error: 'La fecha de nacimiento es requerida' });
    const fechaNac = new Date(birthDate);
    if (isNaN(fechaNac.getTime())) return res.status(400).json({ error: 'Fecha de nacimiento inválida' });
    const edadNum = calcularEdad(fechaNac);
    if (edadNum < 18) return res.status(400).json({ error: 'Debes ser mayor de 18 años para registrarte' });
    if (edadNum > 120) return res.status(400).json({ error: 'Fecha de nacimiento inválida' });

    const userExists = await User.findOne({ email });
    if (userExists) {
      if (userExists.googleId && !userExists.password) {
        return res.status(400).json({
          error: 'Este correo ya está registrado con Google. Usa el botón "Continuar con Google".'
        });
      }
      if (!userExists.isVerified) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        userExists.verificationCode   = crypto.createHash('sha256').update(code).digest('hex');
        userExists.verificationExpire = Date.now() + 15 * 60 * 1000;
        await userExists.save({ validateBeforeSave: false });
        await enviarCodigoVerificacion(userExists.email, userExists.name, code);
        return res.status(400).json({
          error: 'Este correo ya está registrado pero no verificado. Te reenviamos el código.',
          needsVerification: true,
          email: userExists.email
        });
      }
      return res.status(400).json({ error: 'Este correo ya está registrado. Intenta iniciar sesión.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const pesoNum  = weight  ? parseFloat(weight)  : null;
    const altNum   = height  ? parseFloat(height)  : null;

    const profileComplete = !!(
      edadNum >= 18 &&
      pesoNum && pesoNum >= 40 && pesoNum <= 300 &&
      altNum  && altNum  >= 50 && altNum  <= 210
    );

    await User.create({
      name, email, password,
      birthDate: fechaNac,
      ...(pesoNum && { weight: pesoNum }),
      ...(altNum  && { height: altNum  }),
      ...(alergia  && { alergia: alergia.trim() }),

      profileComplete,
      isVerified:         false,
      verificationCode:   crypto.createHash('sha256').update(code).digest('hex'),
      verificationExpire: Date.now() + 15 * 60 * 1000
    });

    await enviarCodigoVerificacion(email, name, code);

    res.status(201).json({
      success: true,
      needsVerification: true,
      email,
      message: 'Cuenta creada. Revisa tu correo para verificar.'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

async function enviarCodigoVerificacion(email, name, code) {
  const digitos = code.split('').map(d =>
    `<span style="display:inline-block;width:44px;height:52px;line-height:52px;text-align:center;background:rgba(255,255,255,0.08);border:1.5px solid rgba(255,255,255,0.18);border-radius:10px;color:#fff;font-size:26px;font-weight:800;margin:0 4px;">${d}</span>`
  ).join('');

  await enviarEmail({
    to: email,
    subject: '🔐 Verifica tu cuenta — Healthy Help',
    html: emailBase({
      titulo: 'Verifica tu cuenta',
      subtitulo: 'Ingresa este código para activar tu cuenta',
      contenido: `
        <p style="color:rgba(255,255,255,0.75);font-size:15px;margin:0 0 24px;text-align:center;">
          Hola <strong style="color:#fff;">${name}</strong>, usa el siguiente código para verificar tu cuenta.
          Expira en <strong style="color:#f77f00;">15 minutos</strong>.
        </p>
        <div style="text-align:center;margin:0 0 28px;">${digitos}</div>
        <p style="color:rgba(255,255,255,0.35);font-size:12px;text-align:center;margin:0;">
          Si no creaste esta cuenta, ignora este correo.
        </p>`,
      footerTexto: 'Este código expira en 15 minutos.'
    })
  });
}

exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Email y código son requeridos' });

    const hashedCode = crypto.createHash('sha256').update(code.trim()).digest('hex');

    const user = await User.findOne({
      email,
      verificationCode:   hashedCode,
      verificationExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ error: 'Código inválido o expirado' });

    user.isVerified         = true;
    user.verificationCode   = undefined;
    user.verificationExpire = undefined;

    const edadVerif = calcularEdad(user.birthDate);
    const datosCompletos = !!(
      edadVerif   != null && edadVerif   >= 18 && edadVerif   <= 120 &&
      user.weight != null && user.weight >= 40 && user.weight <= 300 &&
      user.height != null && user.height >= 50 && user.height <= 210
    );
    if (datosCompletos) user.profileComplete = true;

    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    setAuthCookie(res, token);
    res.json({ success: true, token, user: await buildAuthResponse(user) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const TermsDocument = require('../models/TermsDocument');
    const activeTerms = await TermsDocument.findOne().sort({ publishedAt: -1 }).select('version');
    const activeTermsVersion = activeTerms?.version || '1.0.0';

    res.json({ success: true, user: { ...buildUserResponse(user), activeTermsVersion } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.acceptTerms = async (req, res) => {
  try {
    const { version } = req.body;
    if (!version || typeof version !== 'string' || !version.trim()) {
      return res.status(400).json({ error: 'Versión requerida' });
    }

    const activeTerms    = await TermsDocument.findOne().sort({ publishedAt: -1 });
    const activeVersion  = activeTerms?.version || '1.0.0';

    if (version !== activeVersion) {
      return res.status(409).json({
        error: 'La versión de términos que aceptaste está desactualizada. Recarga los términos antes de aceptar.',
        activeVersion,
        providedVersion: version,
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { termsAccepted: true, termsVersion: activeVersion, termsAcceptedAt: new Date() },
      { new: true }
    );

    res.json({ success: true, user: buildUserResponse(user), version: activeVersion });
  } catch (error) {
    console.error('acceptTerms error:', error);
    res.status(500).json({ error: 'Error guardando la aceptación de términos' });
  }
};

exports.completeProfile = async (req, res) => {
  try {
    const userActual = await User.findById(req.user._id);
    if (!userActual) return res.status(404).json({ error: 'Usuario no encontrado' });

    const edadActual = calcularEdad(userActual.birthDate);
    const yaCompleto = (
      edadActual      != null && edadActual      >= 18 && edadActual      <= 120 &&
      userActual.weight != null && userActual.weight >= 40 && userActual.weight <= 300 &&
      userActual.height != null && userActual.height >= 50 && userActual.height <= 210
    );

    if (yaCompleto) {
      if (!userActual.profileComplete) {
        userActual.profileComplete = true;
        await userActual.save({ validateBeforeSave: false });
      }
      return       res.json({ success: true, user: await buildAuthResponse(userActual) });
    }

    const { weight, height } = req.body;

    const pesoNum = parseFloat(weight);
    const altNum  = parseFloat(height);

    if (!weight || isNaN(pesoNum) || pesoNum < 40 || pesoNum > 300)
      return res.status(400).json({ error: 'Peso válido entre 40 y 300 kg' });
    if (!height || isNaN(altNum)  || altNum  < 50 || altNum  > 210)
      return res.status(400).json({ error: 'Altura válida entre 50 y 210 cm' });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { weight: pesoNum, height: altNum, profileComplete: true },
      { new: true, runValidators: true }
    );

    res.json({ success: true, user: await buildAuthResponse(user) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email) || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');

    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const banVigente =
      user.baneado &&
      (!user.baneadoHasta || new Date(user.baneadoHasta).getTime() > Date.now());
    if (banVigente) {
      const permanente = !user.baneadoHasta;
      const hastaIso = permanente ? null : new Date(user.baneadoHasta).toISOString();
      const mensaje = permanente
        ? `Tu cuenta está suspendida permanentemente${user.baneadoMotivo ? `. Motivo: ${user.baneadoMotivo}` : ''}.`
        : `Tu cuenta está suspendida hasta ${hastaIso}${user.baneadoMotivo ? `. Motivo: ${user.baneadoMotivo}` : ''}.`;
      return res.status(403).json({
        error: mensaje,
        banned: true,
        permanente,
        baneadoHasta: hastaIso,
        baneadoMotivo: user.baneadoMotivo || null,
      });
    }

    if (user.isLocked) {
      const minutosRestantes = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        error: `Cuenta bloqueada por demasiados intentos fallidos. Intenta en ${minutosRestantes} minuto${minutosRestantes !== 1 ? 's' : ''}.`,
        locked: true,
        lockUntil: user.lockUntil
      });
    }

    if (user.googleId && !user.password) {
      const token = generateToken(user._id);
      setAuthCookie(res, token);
      return res.status(200).json({
        needsGooglePassword: true,
        token,
        user: buildUserResponse(user),
        message: 'Esta cuenta fue creada con Google. Crea una contraseña para iniciar sesión también con tu correo.'
      });
    }

    if (!user.isVerified && user.verificationCode) {
      return res.status(401).json({
        error: 'Debes verificar tu correo antes de iniciar sesión.',
        needsVerification: true,
        email
      });
    }

    const esValida = await user.comparePassword(password);
    if (!esValida) {
      await user.incLoginAttempts();

      if (user.loginAttempts + 1 >= 5) {
        await enviarAlertaBloqueo(user.email, user.name);
        return res.status(423).json({
          error: 'Cuenta bloqueada por 15 minutos por demasiados intentos fallidos. Te enviamos un correo con instrucciones.',
          locked: true,
          lockUntil: Date.now() + 15 * 60 * 1000
        });
      }

      const restantes = 5 - (user.loginAttempts + 1);
      return res.status(401).json({
        error: `Credenciales inválidas. Te quedan ${restantes} intento${restantes !== 1 ? 's' : ''} antes de bloquear la cuenta.`,
        attemptsLeft: restantes
      });
    }

    await user.resetLoginAttempts();
    const token = generateToken(user._id);
    setAuthCookie(res, token);
    res.json({ success: true, token, user: await buildAuthResponse(user) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.setGooglePassword = async (req, res) => {
  try {
    const { password } = req.body;

    const pwdError = validarPassword(password);
    if (pwdError) return res.status(400).json({ error: pwdError });

    const user = await User.findById(req.user._id).select('+password');
    if (!user)          return res.status(404).json({ error: 'Usuario no encontrado' });
    if (!user.googleId) return res.status(400).json({ error: 'Esta ruta es exclusiva para cuentas de Google' });
    if (user.password)  return res.status(400).json({ error: 'Esta cuenta ya tiene contraseña establecida' });

    user.password = password;
    await user.save();

    const token = generateToken(user._id);
    setAuthCookie(res, token);
    res.json({ success: true, token, user: await buildAuthResponse(user) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

async function enviarAlertaBloqueo(email, name) {
  const resetUrl = `${process.env.FRONTEND_URL}/recuperar`;

  await enviarEmail({
    to: email,
    subject: '⚠️ Actividad sospechosa en tu cuenta — Healthy Help',
    html: emailBase({
      titulo: 'Acceso bloqueado',
      subtitulo: 'Detectamos múltiples intentos fallidos en tu cuenta',
      contenido: `
        <div style="background:rgba(220,53,69,0.1);border:1px solid rgba(220,53,69,0.3);border-radius:12px;padding:16px 20px;margin-bottom:24px;">
          <p style="color:#ff8a8a;font-size:14px;margin:0;text-align:center;">
            ⚠️ Se realizaron 5 intentos fallidos de inicio de sesión
          </p>
        </div>
        <p style="color:rgba(255,255,255,0.75);font-size:15px;margin:0 0 8px;">
          Hola <strong style="color:#fff;">${name}</strong>,
        </p>
        <p style="color:rgba(255,255,255,0.65);font-size:14px;line-height:1.6;margin:0 0 24px;">
          Tu cuenta ha sido bloqueada temporalmente por <strong style="color:#f77f00;">15 minutos</strong>
          debido a múltiples intentos de inicio de sesión fallidos.
          Si fuiste tú, espera y vuelve a intentarlo. Si no fuiste tú, te recomendamos cambiar tu contraseña.
        </p>
        <div style="text-align:center;margin-bottom:8px;">
          <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#f77f00,#d66e00);color:#fff;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px;box-shadow:0 4px 16px rgba(247,127,0,0.35);">
            Cambiar contraseña
          </a>
        </div>`,
      footerTexto: 'Si reconoces esta actividad, puedes ignorar este correo.'
    })
  });
}

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.json({ success: true, message: 'Si el correo existe, recibirás un enlace' });

    if (user.googleId && !user.password) {
      return res.status(400).json({ error: 'Esta cuenta usa Google. No necesita contraseña.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken  = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await enviarEmail({
      to: user.email,
      subject: '🔐 Recupera tu contraseña — Healthy Help',
      html: emailBase({
        titulo: 'Recupera tu contraseña',
        subtitulo: 'Sigue el enlace para crear una nueva contraseña',
        contenido: `
          <p style="color:rgba(255,255,255,0.75);font-size:15px;margin:0 0 8px;">
            Hola <strong style="color:#fff;">${user.name}</strong>,
          </p>
          <p style="color:rgba(255,255,255,0.65);font-size:14px;line-height:1.6;margin:0 0 28px;">
            Recibimos una solicitud para restablecer tu contraseña.
            Este enlace expira en <strong style="color:#f77f00;">30 minutos</strong>.
          </p>
          <div style="text-align:center;margin-bottom:24px;">
            <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#1a4d2e,#4f772d);color:#fff;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px;box-shadow:0 4px 16px rgba(26,77,46,0.4);">
              Restablecer contraseña
            </a>
          </div>
          <p style="color:rgba(255,255,255,0.3);font-size:12px;text-align:center;margin:0;">
            O copia este enlace: <span style="color:rgba(255,255,255,0.5);">${resetUrl}</span>
          </p>`,
        footerTexto: 'Si no solicitaste este cambio, ignora este correo. Tu contraseña no cambiará.'
      })
    });

    res.json({ success: true, message: 'Email enviado' });
  } catch (error) {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (user) {
        user.resetPasswordToken  = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
      }
    } catch (_) {}
    console.error('Error forgotPassword:', error);
    res.status(500).json({ error: 'Error al enviar el correo. Intenta más tarde.' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ error: 'Token inválido o expirado. Solicita un nuevo enlace.' });

    const pwdError = validarPassword(req.body.password || '');
    if (pwdError) return res.status(400).json({ error: pwdError });

    user.password            = req.body.password;
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    user.loginAttempts       = 0;
    user.lockUntil           = undefined;
    await user.save();

    const token = generateToken(user._id);
    setAuthCookie(res, token);
    const userSafe = await User.findById(user._id);
    res.json({ success: true, token, user: await buildAuthResponse(userSafe) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.resendCode = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user)           return res.status(404).json({ error: 'Usuario no encontrado' });
    if (user.isVerified) return res.status(400).json({ error: 'Esta cuenta ya está verificada' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode   = crypto.createHash('sha256').update(code).digest('hex');
    user.verificationExpire = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    await enviarCodigoVerificacion(email, user.name, code);
    res.json({ success: true, message: 'Código reenviado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};