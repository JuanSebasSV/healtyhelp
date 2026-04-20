const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRE
});

const enviarEmail = async ({ to, subject, html }) => {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,   // ej: "Healthy Help <no-reply@tudominio.com>"
      to,
      subject,
      html
    })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Resend error: ${JSON.stringify(err)}`);
  }
  return res.json();
};

const emailBase = ({ titulo, subtitulo, contenido, footerTexto = 'Si no realizaste esta acción, ignora este correo.' }) => `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#0d1f13;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1f13;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr><td align="center" style="padding-bottom:24px;">
          <div style="display:inline-block;background:linear-gradient(135deg,#1a4d2e,#4f772d);border-radius:14px;padding:12px 24px;">
            <span style="color:#fff;font-size:20px;font-weight:700;font-family:Georgia,serif;">🌿 Healthy Help</span>
          </div>
        </td></tr>
        <tr><td style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:20px;padding:36px 32px;">
          <h1 style="color:#fff;font-size:24px;font-family:Georgia,serif;margin:0 0 6px;text-align:center;">${titulo}</h1>
          <p style="color:rgba(255,255,255,0.5);font-size:13px;text-align:center;margin:0 0 28px;">${subtitulo}</p>
          ${contenido}
        </td></tr>
        <tr><td align="center" style="padding-top:20px;">
          <p style="color:rgba(255,255,255,0.22);font-size:12px;margin:0;">${footerTexto}</p>
          <p style="color:rgba(255,255,255,0.12);font-size:11px;margin:5px 0 0;">© Healthy Help — Cuida tu salud con confianza</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const buildUserResponse = (user) => {
  // Calcular profileComplete dinámicamente desde los datos reales,
  // sin confiar en el campo almacenado (puede estar desincronizado).
  const profileComplete = !!(
    user.age    != null && user.age    >= 18 && user.age    <= 100 &&
    user.weight != null && user.weight >= 40 && user.weight <= 300 &&
    user.height != null && user.height >= 50 && user.height <= 210
  );

  const obj = {
    id:              user._id,
    name:            user.name,
    email:           user.email,
    role:            user.role,
    avatar:          user.avatar,
    googleId:        user.googleId,
    isVerified:      user.isVerified      || false,
    isSuperAdmin:    user.isSuperAdmin    || false,
    age:             user.age,
    weight:          user.weight,
    height:          user.height,
    termsAccepted:   user.termsAccepted   || false,
    termsVersion:    user.termsVersion    || '',
    profileComplete,
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

// REGISTRO
exports.register = async (req, res) => {
  try {
    const { name, email, password, age, weight, height } = req.body;

    const nameError = validarNombre(name);
    if (nameError) return res.status(400).json({ error: nameError });

    const edadNum = parseInt(age, 10);
    if (!age || isNaN(edadNum)) return res.status(400).json({ error: 'La edad es requerida' });
    if (edadNum < 18)           return res.status(400).json({ error: 'Debes ser mayor de 18 años para registrarte' });
    if (edadNum > 100)          return res.status(400).json({ error: 'La edad máxima permitida es 100 años' });

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

    // profileComplete = true solo si age, weight Y height están presentes y son válidos
    const profileComplete = !!(
      edadNum >= 18 &&
      pesoNum  && pesoNum  >= 40 && pesoNum  <= 300 &&
      altNum   && altNum   >= 50 && altNum   <= 210
    );

    await User.create({
      name, email, password,
      age: edadNum,
      ...(pesoNum && { weight: pesoNum }),
      ...(altNum  && { height: altNum  }),
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

// VERIFICAR EMAIL
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

    // Recalcular profileComplete con validación de rangos completa,
    // por si quedó en false aunque los datos ya existían.
    user.profileComplete = !!(
      user.age    != null && user.age    >= 18 && user.age    <= 100 &&
      user.weight != null && user.weight >= 40 && user.weight <= 300 &&
      user.height != null && user.height >= 50 && user.height <= 210
    );

    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    res.json({ success: true, token, user: buildUserResponse(user) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PERFIL DEL USUARIO AUTENTICADO
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

// ACEPTAR TÉRMINOS
exports.acceptTerms = async (req, res) => {
  try {
    const { version } = req.body;
    if (!version) return res.status(400).json({ error: 'Versión requerida' });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { termsAccepted: true, termsVersion: version, termsAcceptedAt: new Date() },
      { new: true }
    );

    res.json({ success: true, user: buildUserResponse(user) });
  } catch (error) {
    res.status(500).json({ error: 'Error guardando la aceptación de términos' });
  }
};

// COMPLETAR PERFIL
exports.completeProfile = async (req, res) => {
  try {
    // Verificar estado real en BD antes de procesar
    const userActual = await User.findById(req.user._id);
    if (!userActual) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Si ya tiene los 3 campos válidos, solo corregir profileComplete y responder
    const yaCompleto = (
      userActual.age    != null && userActual.age    >= 18 && userActual.age    <= 100 &&
      userActual.weight != null && userActual.weight >= 40 && userActual.weight <= 300 &&
      userActual.height != null && userActual.height >= 50 && userActual.height <= 210
    );

    if (yaCompleto) {
      if (!userActual.profileComplete) {
        userActual.profileComplete = true;
        await userActual.save({ validateBeforeSave: false });
      }
      return res.json({ success: true, user: buildUserResponse(userActual) });
    }

    // Flujo normal: validar y guardar los datos enviados
    const { age, weight, height } = req.body;

    const edadNum = parseInt(age, 10);
    const pesoNum = parseFloat(weight);
    const altNum  = parseFloat(height);

    if (!age    || isNaN(edadNum) || edadNum < 18 || edadNum > 100)
      return res.status(400).json({ error: 'Edad válida entre 18 y 100' });
    if (!weight || isNaN(pesoNum) || pesoNum < 40 || pesoNum > 300)
      return res.status(400).json({ error: 'Peso válido entre 40 y 300 kg' });
    if (!height || isNaN(altNum)  || altNum  < 50 || altNum  > 210)
      return res.status(400).json({ error: 'Altura válida entre 50 y 210 cm' });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { age: edadNum, weight: pesoNum, height: altNum, profileComplete: true },
      { new: true, runValidators: true }
    );

    res.json({ success: true, user: buildUserResponse(user) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');

    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

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
    res.json({ success: true, token, user: buildUserResponse(user) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ESTABLECER CONTRASEÑA EN CUENTA GOOGLE
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
    res.json({ success: true, token, user: buildUserResponse(user) });
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

// OLVIDÉ CONTRASEÑA
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

// RESETEAR CONTRASEÑA
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
    res.json({ success: true, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// REENVIAR CÓDIGO
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