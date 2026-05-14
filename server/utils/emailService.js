const enviarEmail = async ({ to, subject, html }) => {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
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

module.exports = { enviarEmail, emailBase };
