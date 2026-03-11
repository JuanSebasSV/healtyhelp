const User = require('../models/User');
const AdminLog = require('../models/AdminLog');
const AdminInvitation = require('../models/AdminInvitation');
const crypto = require('crypto');

// ─────────────────────────────────────────────
// 📊 Obtener todos los usuarios
// ─────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'No autenticado' });
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Acceso denegado' });

    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    console.error('Error en getAllUsers:', error);
    res.status(500).json({ error: 'Error obteniendo usuarios' });
  }
};

// ─────────────────────────────────────────────
// 📊 Estadísticas
// ─────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const [totalUsers, admins, regularUsers, verifiedUsers, googleUsers, recentUsers] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'admin' }),
        User.countDocuments({ role: 'user' }),
        User.countDocuments({ isVerified: true }),
        User.countDocuments({ googleId: { $exists: true } }),
        User.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        })
      ]);

    res.json({
      success: true,
      stats: { totalUsers, admins, regularUsers, verifiedUsers, googleUsers, recentUsers }
    });
  } catch (error) {
    console.error('Error en getStats:', error);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
};

// ─────────────────────────────────────────────
// 🗑️ Eliminar usuario
// ─────────────────────────────────────────────
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'No puedes eliminar al único administrador' });
      }
    }

    await logAdminAction(req.user._id, 'DELETE_USER', id, {
      userName:  user.name,
      userEmail: user.email
    });
    await user.deleteOne();

    res.json({ success: true, message: `Usuario ${user.name} eliminado correctamente` });
  } catch (error) {
    console.error('Error en deleteUser:', error);
    res.status(500).json({ error: 'Error eliminando usuario' });
  }
};

// ─────────────────────────────────────────────
// 🔄 Cambiar rol
// ─────────────────────────────────────────────
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Rol inválido. Debe ser "user" o "admin"' });
    }

    if (id === req.user._id.toString()) {
      return res.status(400).json({ error: 'No puedes modificar tu propio rol' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (user.role === 'admin' && role !== 'admin') {
      if (!req.user.isSuperAdmin) {
        return res.status(403).json({ error: 'Solo el super administrador puede degradar admins' });
      }
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'No puedes quitar el rol al único administrador' });
      }
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    await logAdminAction(req.user._id, 'CHANGE_ROLE', id, {
      userName: user.name,
      oldRole,
      newRole: role
    });

    res.json({
      success: true,
      message: `Rol de ${user.name} actualizado a ${role}`,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Error en updateUserRole:', error);
    res.status(500).json({ error: 'Error actualizando rol' });
  }
};

// ─────────────────────────────────────────────
// 📝 Crear log manual (desde el frontend)
// Normaliza action a mayúsculas para consistencia
// ─────────────────────────────────────────────
exports.createLog = async (req, res) => {
  try {
    const { action, targetUserId, metadata } = req.body;

    // Normalizar a mayúsculas para compatibilidad con el enum
    const normalizedAction = action?.toUpperCase().replace(/ /g, '_');

    await logAdminAction(req.user._id, normalizedAction, targetUserId || null, metadata || {});
    res.json({ success: true });
  } catch (error) {
    console.error('Error creando log:', error);
    // No reventar — el log es secundario
    res.status(500).json({ error: 'Error registrando acción' });
  }
};

// ─────────────────────────────────────────────
// 📊 Obtener logs
// ─────────────────────────────────────────────
exports.getLogs = async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;

    const logs = await AdminLog.find()
      .populate('adminId', 'name email')
      .populate('targetUserId', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await AdminLog.countDocuments();

    res.json({
      success: true,
      logs,
      pagination: {
        total,
        page:  parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error obteniendo logs:', error);
    res.status(500).json({ error: 'Error obteniendo logs' });
  }
};

// ─────────────────────────────────────────────
// 📧 Invitar admin
// ─────────────────────────────────────────────
exports.inviteAdmin = async (req, res) => {
  try {
    const { email, name } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ error: 'Email ya registrado' });

    const inviteToken   = crypto.randomBytes(32).toString('hex');
    const inviteExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await AdminInvitation.create({
      email,
      name,
      invitedBy:  req.user._id,
      token:      crypto.createHash('sha256').update(inviteToken).digest('hex'),
      expiresAt:  inviteExpires
    });

    const inviteUrl = `${process.env.FRONTEND_URL}/admin/accept-invite/${inviteToken}`;
    console.log('Invite URL generada:', inviteUrl);

    await logAdminAction(req.user._id, 'INVITE_ADMIN', null, {
      invitedEmail: email,
      invitedName:  name
    });

    res.json({
      success:   true,
      message:   `Invitación enviada a ${email}`,
      expiresAt: inviteExpires
    });
  } catch (error) {
    console.error('Error invitando admin:', error);
    res.status(500).json({ error: 'Error enviando invitación' });
  }
};

// ─────────────────────────────────────────────
// ✅ Aceptar invitación
// ─────────────────────────────────────────────
exports.acceptAdminInvite = async (req, res) => {
  try {
    const { token }    = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const invitation = await AdminInvitation.findOne({
      token:     hashedToken,
      expiresAt: { $gt: Date.now() },
      used:      false
    });

    if (!invitation) return res.status(400).json({ error: 'Invitación inválida o expirada' });

    const newAdmin = await User.create({
      name:       invitation.name,
      email:      invitation.email,
      password,
      role:       'admin',
      isVerified: true
    });

    invitation.used   = true;
    invitation.usedAt = new Date();
    await invitation.save();

    await logAdminAction(invitation.invitedBy, 'ADMIN_INVITE_ACCEPTED', newAdmin._id, {
      newAdminEmail: newAdmin.email
    });

    res.json({
      success: true,
      message: 'Cuenta de admin creada exitosamente',
      user:    { id: newAdmin._id, name: newAdmin.name, email: newAdmin.email, role: newAdmin.role }
    });
  } catch (error) {
    console.error('Error aceptando invitación:', error);
    res.status(500).json({ error: 'Error creando cuenta' });
  }
};

// ─────────────────────────────────────────────
// 📋 Invitaciones pendientes
// ─────────────────────────────────────────────
exports.getPendingInvitations = async (req, res) => {
  try {
    const invitations = await AdminInvitation.find({ used: false })
      .populate('invitedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, invitations });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo invitaciones' });
  }
};

// ─────────────────────────────────────────────
// 🗑️ Revocar invitación
// ─────────────────────────────────────────────
exports.revokeInvitation = async (req, res) => {
  try {
    const { id } = req.params;

    const invitation = await AdminInvitation.findByIdAndDelete(id);
    if (!invitation) return res.status(404).json({ error: 'Invitación no encontrada' });

    await logAdminAction(req.user._id, 'REVOKE_INVITATION', null, {
      revokedEmail: invitation.email
    });

    res.json({ success: true, message: 'Invitación revocada' });
  } catch (error) {
    res.status(500).json({ error: 'Error revocando invitación' });
  }
};

// ─────────────────────────────────────────────
// 🔧 Helper interno — nunca lanza, solo loguea error
// ─────────────────────────────────────────────
async function logAdminAction(adminId, action, targetUserId, metadata = {}) {
  try {
    await AdminLog.create({
      adminId,
      action,
      targetUserId: targetUserId || null,
      metadata,
    });
  } catch (error) {
    console.error('Error creando log de auditoría:', error.message);
  }
}

exports.logAdminAction = logAdminAction;