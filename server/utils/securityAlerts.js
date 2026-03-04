const sendSecurityAlert = async (action, adminUser, details) => {
  // Enviar email a TODOS los admins cuando:
  // - Se crea un nuevo admin
  // - Se elimina un admin
  // - Se cambia un rol
  // - Intentos fallidos de acceso al panel
  
  const allAdmins = await User.find({ role: 'admin' });
  
  for (const admin of allAdmins) {
    await sendEmail({
      to: admin.email,
      subject: `🔔 Alerta de Seguridad: ${action}`,
      html: `
        <h2>Acción de Administrador Detectada</h2>
        <p><strong>Acción:</strong> ${action}</p>
        <p><strong>Realizada por:</strong> ${adminUser.name} (${adminUser.email})</p>
        <p><strong>Detalles:</strong> ${JSON.stringify(details)}</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
      `
    });
  }
};