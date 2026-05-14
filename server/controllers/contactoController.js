const { enviarEmail } = require('../utils/emailService');

const DOMINIOS_PERMITIDOS = new Set([
  'gmail.com',
  'hotmail.com', 'hotmail.es', 'hotmail.co.uk', 'hotmail.fr', 'hotmail.de',
  'outlook.com', 'outlook.es', 'live.com', 'live.com.mx', 'live.co.uk',
  'msn.com',
  'yahoo.com', 'yahoo.es', 'yahoo.co.uk', 'yahoo.fr', 'yahoo.de',
  'yahoo.com.mx', 'yahoo.com.ar', 'yahoo.com.co',
  'icloud.com', 'me.com', 'mac.com',
  'protonmail.com', 'proton.me', 'pm.me',
  'tutanota.com', 'tuta.io',
  'zoho.com',
  'aol.com', 'aol.co.uk',
  'mail.com', 'email.com', 'gmx.com', 'gmx.de', 'gmx.net',
  'yandex.com', 'yandex.ru',
  'bol.com.br', 'ig.com.br', 'uol.com.br', 'terra.com.br',
  'hotmail.com.br',
]);

const esEmailPermitido = (email) => {
  const partes = email.split('@');
  if (partes.length !== 2) return false;
  return DOMINIOS_PERMITIDOS.has(partes[1].toLowerCase());
};

const formatearFecha = (fecha) => {
  if (!fecha) return null;
  return new Date(fecha).toLocaleDateString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
};

const construirEmail = ({ nombre, email, asunto, mensaje, usuario }) => {
  const avatarHtml = usuario
    ? usuario.avatar
      ? `<img src="${usuario.avatar}" width="52" height="52" style="border-radius:50%;object-fit:cover;display:block;border:2px solid rgba(212,160,23,0.5);" />`
      : `<table cellpadding="0" cellspacing="0"><tr><td width="52" height="52" style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#1a4d2e,#4f772d);text-align:center;vertical-align:middle;border:2px solid rgba(212,160,23,0.5);font-size:20px;color:#fff;font-weight:700;">${usuario.name.charAt(0).toUpperCase()}</td></tr></table>`
    : '';

  const insigniaRol = usuario
    ? `<span style="display:inline-block;background:linear-gradient(135deg,rgba(212,160,23,0.18),rgba(247,127,0,0.18));border:1px solid rgba(212,160,23,0.35);border-radius:20px;padding:2px 10px;font-size:11px;color:#d4a017;font-weight:600;text-transform:capitalize;letter-spacing:0.5px;">${usuario.role}</span>`
    : '';

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#080f0a;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#080f0a;padding:36px 16px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

      <!-- LOGO -->
      <tr><td align="center" style="padding-bottom:28px;">
        <table cellpadding="0" cellspacing="0"><tr><td style="background:linear-gradient(135deg,#1a4d2e,#2d6a40);border-radius:14px;padding:11px 26px;">
          <span style="color:#fff;font-size:19px;font-weight:700;font-family:Georgia,serif;">🌿 Healthy Help</span>
        </td></tr></table>
      </td></tr>

      <!-- TARJETA PRINCIPAL -->
      <tr><td style="background:linear-gradient(160deg,rgba(26,77,46,0.25),rgba(13,31,19,0.95));border:1px solid rgba(255,255,255,0.09);border-radius:22px;overflow:hidden;">

        <!-- BARRA DORADA SUPERIOR -->
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="height:3px;background:linear-gradient(90deg,transparent,#d4a017,#f77f00,#d4a017,transparent);"></td>
        </tr></table>

        <!-- CABECERA -->
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:32px 36px 24px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 10px;font-size:13px;color:#d4a017;font-weight:600;letter-spacing:2px;text-transform:uppercase;">📬 Formulario de contacto</p>
          <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#fff;font-family:Georgia,serif;line-height:1.2;">Nuevo mensaje recibido</h1>
          <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.4);">${usuario ? 'Enviado por un miembro registrado' : 'Enviado por un visitante'}</p>
        </td></tr></table>

        <!-- CUERPO -->
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:28px 36px;">

          <!-- DE -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;"><tr>
            <td style="background:rgba(212,160,23,0.07);border:1px solid rgba(212,160,23,0.2);border-radius:12px;padding:14px 18px;">
              <p style="margin:0 0 4px;font-size:10px;color:#d4a017;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Remitente</p>
              <p style="margin:0 0 2px;font-size:16px;font-weight:700;color:#fff;">${nombre.trim()}</p>
              <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.5);">${email}</p>
            </td>
          </tr></table>

          ${asunto ? `
          <!-- ASUNTO -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;"><tr>
            <td style="border-left:3px solid #d4a017;padding:4px 0 4px 14px;">
              <p style="margin:0 0 3px;font-size:10px;color:#d4a017;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Asunto</p>
              <p style="margin:0;font-size:15px;color:#fff;font-weight:500;">${asunto.trim()}</p>
            </td>
          </tr></table>` : ''}

          <!-- SEPARADOR -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;"><tr>
            <td style="height:1px;background:linear-gradient(90deg,transparent,rgba(212,160,23,0.3),transparent);"></td>
          </tr></table>

          <!-- MENSAJE -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:${usuario ? '28px' : '8px'};"><tr><td>
            <p style="margin:0 0 10px;font-size:10px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Mensaje</p>
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:18px 20px;">
                <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.82);line-height:1.75;white-space:pre-wrap;">${mensaje.trim()}</p>
              </td>
            </tr></table>
          </td></tr></table>

          <!-- SEPARADOR DORADO -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr><td>
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td style="height:1px;background:linear-gradient(90deg,transparent,rgba(212,160,23,0.4),transparent);"></td>
            </tr></table>
            <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding-top:16px;">
              <span style="display:inline-block;background:linear-gradient(135deg,rgba(212,160,23,0.15),rgba(247,127,0,0.1));border:1px solid rgba(212,160,23,0.3);border-radius:20px;padding:4px 16px;font-size:10px;color:#d4a017;font-weight:700;letter-spacing:2px;text-transform:uppercase;">${usuario ? 'Datos del miembro' : 'Tipo de remitente'}</span>
            </td></tr></table>
          </td></tr></table>

          ${usuario ? `
          <!-- TARJETA MIEMBRO REGISTRADO -->
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="background:linear-gradient(135deg,rgba(212,160,23,0.06),rgba(26,77,46,0.2));border:1px solid rgba(212,160,23,0.18);border-radius:14px;padding:18px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;"><tr>
                <td width="60" valign="middle" style="padding-right:14px;">${avatarHtml}</td>
                <td valign="middle">
                  <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#fff;">${usuario.name}</p>
                  <p style="margin:0 0 6px;font-size:12px;color:rgba(255,255,255,0.45);">${usuario.email}</p>
                  ${insigniaRol}
                </td>
              </tr></table>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(255,255,255,0.07);padding-top:14px;">
                ${usuario.birthDate ? `<tr>
                  <td style="padding:6px 0;width:45%;"><p style="margin:0;font-size:12px;color:rgba(255,255,255,0.38);">Fecha de nacimiento</p></td>
                  <td style="padding:6px 0;"><p style="margin:0;font-size:12px;color:rgba(255,255,255,0.78);font-weight:500;">${formatearFecha(usuario.birthDate)}</p></td>
                </tr>` : ''}
                <tr>
                  <td style="padding:6px 0;"><p style="margin:0;font-size:12px;color:rgba(255,255,255,0.38);">Miembro desde</p></td>
                  <td style="padding:6px 0;"><p style="margin:0;font-size:12px;color:rgba(255,255,255,0.78);font-weight:500;">${formatearFecha(usuario.createdAt)}</p></td>
                </tr>
              </table>
            </td>
          </tr></table>` : `
          <!-- TARJETA VISITANTE -->
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.09);border-radius:14px;padding:16px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0"><tr>
                <td width="48" valign="middle" style="padding-right:14px;">
                  <table cellpadding="0" cellspacing="0"><tr><td width="48" height="48" style="width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.14);text-align:center;vertical-align:middle;font-size:22px;">👤</td></tr></table>
                </td>
                <td valign="middle">
                  <p style="margin:0 0 3px;font-size:15px;font-weight:700;color:#fff;">Usuario invitado</p>
                  <p style="margin:0 0 7px;font-size:12px;color:rgba(255,255,255,0.38);">No tiene cuenta registrada en Healthy Help</p>
                  <span style="display:inline-block;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.13);border-radius:20px;padding:2px 10px;font-size:11px;color:rgba(255,255,255,0.4);font-weight:600;letter-spacing:0.5px;">Visitante</span>
                </td>
              </tr></table>
            </td>
          </tr></table>`}

        </td></tr></table>

        <!-- BARRA DORADA INFERIOR -->
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="height:2px;background:linear-gradient(90deg,transparent,rgba(212,160,23,0.5),transparent);"></td>
        </tr></table>

      </td></tr>

      <!-- FOOTER -->
      <tr><td align="center" style="padding-top:22px;">
        <p style="margin:0 0 4px;font-size:12px;color:rgba(255,255,255,0.2);">Responde directamente a <span style="color:rgba(255,255,255,0.4);">${email}</span></p>
        <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.12);">© Healthy Help — Cuida tu salud con confianza</p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
};

exports.enviarMensajeContacto = async (req, res) => {
  try {
    const { nombre, email, asunto, mensaje } = req.body;

    if (!nombre || nombre.trim().length < 2)
      return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres' });

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !regexEmail.test(email))
      return res.status(400).json({ error: 'El correo no es válido' });

    if (!esEmailPermitido(email))
      return res.status(400).json({ error: 'Usa un proveedor de correo reconocido (Gmail, Hotmail, Outlook, etc.)' });

    if (!mensaje || mensaje.trim().length < 10)
      return res.status(400).json({ error: 'El mensaje debe tener al menos 10 caracteres' });

    if (mensaje.trim().length > 1000)
      return res.status(400).json({ error: 'El mensaje es muy largo (máximo 1000 caracteres)' });

    const usuario = req.user || null;

    await enviarEmail({
      to: process.env.CONTACT_EMAIL || 'healtyhelp@gmail.com',
      subject: `📬 Mensaje de contacto${asunto ? `: ${asunto}` : ''} · ${nombre.trim()} — Healthy Help`,
      html: construirEmail({ nombre, email, asunto, mensaje, usuario })
    });

    res.json({ success: true, message: 'Mensaje enviado correctamente' });
  } catch (error) {
    console.error('Error en contacto:', error.message);
    res.status(500).json({ error: 'Error al enviar el mensaje. Intenta de nuevo.' });
  }
};