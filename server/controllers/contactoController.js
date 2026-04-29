const { enviarEmail, emailBase } = require('../utils/emailService');

const formatearFecha = (fecha) => {
  if (!fecha) return null;
  return new Date(fecha).toLocaleDateString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
};

exports.enviarMensajeContacto = async (req, res) => {
  try {
    const { nombre, email, asunto, mensaje } = req.body;

    if (!nombre || nombre.trim().length < 2)
      return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres' });

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !regexEmail.test(email))
      return res.status(400).json({ error: 'El correo no es válido' });

    if (!mensaje || mensaje.trim().length < 10)
      return res.status(400).json({ error: 'El mensaje debe tener al menos 10 caracteres' });

    if (mensaje.trim().length > 1000)
      return res.status(400).json({ error: 'El mensaje es muy largo (máximo 1000 caracteres)' });

    const usuario = req.user || null;

    const bloqueRemitente = `
      <div style="margin-bottom:20px;">
        <p style="color:rgba(255,255,255,0.5);font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;">De</p>
        <p style="color:#fff;font-size:15px;margin:0 0 2px;"><strong>${nombre.trim()}</strong></p>
        <p style="color:rgba(255,255,255,0.55);font-size:13px;margin:0;">${email}</p>
      </div>`;

    const bloqueAsunto = asunto ? `
      <div style="margin-bottom:20px;">
        <p style="color:rgba(255,255,255,0.5);font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Asunto</p>
        <p style="color:#fff;font-size:15px;margin:0;">${asunto.trim()}</p>
      </div>` : '';

    const bloqueMensaje = `
      <div style="margin-bottom:28px;">
        <p style="color:rgba(255,255,255,0.5);font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Mensaje</p>
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.10);border-radius:12px;padding:16px 20px;">
          <p style="color:rgba(255,255,255,0.85);font-size:14px;line-height:1.7;margin:0;white-space:pre-wrap;">${mensaje.trim()}</p>
        </div>
      </div>`;

    let bloqueUsuario = '';
    if (usuario) {
      const avatarHtml = usuario.avatar
        ? `<img src="${usuario.avatar}" width="56" height="56" style="border-radius:50%;object-fit:cover;display:block;" />`
        : `<div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#1a4d2e,#4f772d);display:flex;align-items:center;justify-content:center;font-size:22px;color:#fff;font-weight:700;">${usuario.name.charAt(0).toUpperCase()}</div>`;

      bloqueUsuario = `
        <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:24px;margin-top:4px;">
          <p style="color:rgba(255,255,255,0.5);font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;">Datos del miembro registrado</p>
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px;">
            ${avatarHtml}
            <div>
              <p style="color:#fff;font-size:15px;font-weight:700;margin:0 0 2px;">${usuario.name}</p>
              <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0;">${usuario.email}</p>
            </div>
          </div>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);width:40%;">
                <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:0;">Rol</p>
              </td>
              <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:0;text-transform:capitalize;">${usuario.role}</p>
              </td>
            </tr>
            ${usuario.birthDate ? `
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:0;">Fecha de nacimiento</p>
              </td>
              <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:0;">${formatearFecha(usuario.birthDate)}</p>
              </td>
            </tr>` : ''}
            <tr>
              <td style="padding:8px 0;">
                <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:0;">Miembro desde</p>
              </td>
              <td style="padding:8px 0;">
                <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:0;">${formatearFecha(usuario.createdAt)}</p>
              </td>
            </tr>
          </table>
        </div>`;
    }

    await enviarEmail({
      to: process.env.CONTACT_EMAIL || 'healtyhelp@gmail.com',
      subject: `📬 Nuevo mensaje de contacto${asunto ? `: ${asunto}` : ''} — Healthy Help`,
      html: emailBase({
        titulo: 'Nuevo mensaje de contacto',
        subtitulo: usuario
          ? `Mensaje enviado por un miembro registrado`
          : 'Alguien completó el formulario de contacto',
        contenido: bloqueRemitente + bloqueAsunto + bloqueMensaje + bloqueUsuario,
        footerTexto: `Responde directamente a ${email}`
      })
    });

    res.json({ success: true, message: 'Mensaje enviado correctamente' });
  } catch (error) {
    console.error('Error en contacto:', error.message);
    res.status(500).json({ error: 'Error al enviar el mensaje. Intenta de nuevo.' });
  }
};