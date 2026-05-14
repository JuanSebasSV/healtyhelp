const User            = require('../models/User');
const AdminLog        = require('../models/AdminLog');
const AdminInvitation = require('../models/AdminInvitation');
const Recipe          = require('../models/Recipe');
const crypto          = require('crypto');

exports.getAllUsers = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'No autenticado' });
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Acceso denegado' });

    const users = await User.find()
      .select('name email role avatar googleId createdAt isSuperAdmin baneado baneadoHasta baneadoMotivo baneadoEn')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: users.length, users });
  } catch (error) {
    console.error('Error en getAllUsers:', error);
    res.status(500).json({ error: 'Error obteniendo usuarios' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalUsers   = await User.countDocuments();
    const admins       = await User.countDocuments({ role: 'admin' });
    const regularUsers = await User.countDocuments({ role: 'user' });
    const superAdmins  = await User.countDocuments({ isSuperAdmin: true });

    const imagenesPendientes = await Recipe.aggregate([
      { $unwind: '$resenas' },
      { $match: { 'resenas.imagen.estado': 'pendiente' } },
      { $count: 'total' },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        admins: admins - superAdmins,
        superAdmins,
        regularUsers,
        imagenesPendientes: imagenesPendientes[0]?.total ?? 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const userToDelete = await User.findById(id);
    if (!userToDelete) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (userToDelete.isSuperAdmin === true) {
      return res.status(403).json({
        error: 'La cuenta Super Administrador no puede ser eliminada bajo ninguna circunstancia',
      });
    }

    if (id === req.user._id.toString()) {
      return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
    }

    if (!req.user.isSuperAdmin && userToDelete.role === 'admin') {
      return res.status(403).json({
        error: 'Solo el Super Administrador puede eliminar a otros Administradores',
      });
    }

    await logAdminAction(req.user._id, 'DELETE_USER', id, {
      userName:  userToDelete.name,
      userEmail: userToDelete.email,
    });

    await userToDelete.deleteOne();

    res.json({ success: true, message: `Usuario ${userToDelete.name} eliminado correctamente` });
  } catch (error) {
    console.error('Error en deleteUser:', error);
    res.status(500).json({ error: 'Error eliminando usuario' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id }   = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role))
      return res.status(400).json({ error: 'Rol inválido. Debe ser "user" o "admin"' });

    const targetUser = await User.findById(id);
    if (!targetUser) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (targetUser.isSuperAdmin === true) {
      return res.status(403).json({
        error: 'El rol del Super Administrador no puede ser modificado bajo ninguna circunstancia',
      });
    }

    if (id === req.user._id.toString())
      return res.status(400).json({ error: 'No puedes modificar tu propio rol' });

    if (!req.user.isSuperAdmin) {
      if (targetUser.role === 'admin')
        return res.status(403).json({ error: 'Solo el Super Administrador puede modificar a otros Administradores' });
      if (role === 'admin')
        return res.status(403).json({ error: 'Solo el Super Administrador puede promover a Administrador' });
    }

    const oldRole    = targetUser.role;
    targetUser.role  = role;
    await targetUser.save();

    await logAdminAction(req.user._id, 'CHANGE_ROLE', id, {
      userName: targetUser.name, oldRole, newRole: role,
    });

    res.json({
      success: true,
      message: `Rol de ${targetUser.name} actualizado a ${role}`,
      user: { _id: targetUser._id, name: targetUser.name, email: targetUser.email, role: targetUser.role },
    });
  } catch (error) {
    console.error('Error en updateUserRole:', error);
    res.status(500).json({ error: 'Error actualizando rol' });
  }
};

exports.createLog = async (req, res) => {
  try {
    const { action, targetUserId, metadata } = req.body;
    const normalizedAction = action?.toUpperCase().replace(/ /g, '_');
    await logAdminAction(req.user._id, normalizedAction, targetUserId || null, metadata || {});
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error registrando acción' });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const logs = await AdminLog.find()
      .populate('adminId',      'name email')
      .populate('targetUserId', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await AdminLog.countDocuments();
    res.json({
      success: true,
      logs,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo logs' });
  }
};

exports.inviteAdmin = async (req, res) => {
  try {
    const { email, name } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ error: 'Email ya registrado' });

    const inviteToken   = crypto.randomBytes(32).toString('hex');
    const inviteExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await AdminInvitation.create({
      email, name,
      invitedBy:  req.user._id,
      token:      crypto.createHash('sha256').update(inviteToken).digest('hex'),
      expiresAt:  inviteExpires,
    });

    const inviteUrl = `${process.env.FRONTEND_URL}/admin/accept-invite/${inviteToken}`;
    console.log('Invite URL generada:', inviteUrl);

    await logAdminAction(req.user._id, 'INVITE_ADMIN', null, {
      invitedEmail: email, invitedName: name,
    });

    res.json({ success: true, message: `Invitación enviada a ${email}`, expiresAt: inviteExpires });
  } catch (error) {
    res.status(500).json({ error: 'Error enviando invitación' });
  }
};

exports.acceptAdminInvite = async (req, res) => {
  try {
    const { token }    = req.params;
    const { password } = req.body;
    const hashedToken  = crypto.createHash('sha256').update(token).digest('hex');

    const invitation = await AdminInvitation.findOne({
      token:     hashedToken,
      expiresAt: { $gt: Date.now() },
      used:      false,
    });

    if (!invitation) return res.status(400).json({ error: 'Invitación inválida o expirada' });

    const newAdmin = await User.create({
      name:     invitation.name,
      email:    invitation.email,
      password,
      role:     'admin',
    });

    invitation.used   = true;
    invitation.usedAt = new Date();
    await invitation.save();

    await logAdminAction(invitation.invitedBy, 'ADMIN_INVITE_ACCEPTED', newAdmin._id, {
      newAdminEmail: newAdmin.email,
    });

    res.json({
      success: true,
      message: 'Cuenta de admin creada exitosamente',
      user: { id: newAdmin._id, name: newAdmin.name, email: newAdmin.email, role: newAdmin.role },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error creando cuenta' });
  }
};

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

exports.revokeInvitation = async (req, res) => {
  try {
    const { id }     = req.params;
    const invitation = await AdminInvitation.findByIdAndDelete(id);
    if (!invitation) return res.status(404).json({ error: 'Invitación no encontrada' });

    await logAdminAction(req.user._id, 'REVOKE_INVITATION', null, { revokedEmail: invitation.email });
    res.json({ success: true, message: 'Invitación revocada' });
  } catch (error) {
    res.status(500).json({ error: 'Error revocando invitación' });
  }
};

exports.getImagenesResenas = async (req, res) => {
  try {
    const { estado = 'pendiente', page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const pipeline = [
      { $unwind: '$resenas' },
      { $match: { 'resenas.imagen.estado': estado } },
      {
        $project: {
          _id:            0,
          recipeId:       '$_id',
          recipeNombre:   '$nombre',
          resenaId:       '$resenas._id',
          userId:         '$resenas.userId',
          userName:       '$resenas.userName',
          texto:          '$resenas.texto',
          estrellas:      '$resenas.estrellas',
          createdAt:      '$resenas.createdAt',
          imagenUrl:      '$resenas.imagen.url',
          imagenPublicId: '$resenas.imagen.publicId',
          imagenEstado:   '$resenas.imagen.estado',
        },
      },
      { $sort: { createdAt: -1 } },
    ];

    const totalPipeline = [...pipeline, { $count: 'total' }];
    const [{ total = 0 } = {}] = await Recipe.aggregate(totalPipeline);

    const items = await Recipe.aggregate([
      ...pipeline,
      { $skip:  skip },
      { $limit: parseInt(limit) },
    ]);

    res.json({
      success: true,
      items,
      pagination: {
        total,
        page:  parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error obteniendo imágenes' });
  }
};

exports.aprobarImagenResena = async (req, res) => {
  try {
    const { recipeId, resenaId } = req.params;

    const updated = await Recipe.findOneAndUpdate(
      { _id: recipeId, 'resenas._id': resenaId },
      { $set: { 'resenas.$.imagen.estado': 'aprobada' } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Receta o reseña no encontrada' });

    const resena = updated.resenas.id(resenaId);

    await logAdminAction(req.user._id, 'APPROVE_RESENA_IMAGE', null, {
      recipeId, resenaId, userName: resena?.userName,
    });

    res.json({ success: true, message: 'Imagen aprobada. Ya es visible para todos.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error aprobando imagen' });
  }
};

exports.rechazarImagenResena = async (req, res) => {
  try {
    const { recipeId, resenaId } = req.params;
    const { cloudinary }         = require('../config/cloudinary');

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) return res.status(404).json({ error: 'Receta no encontrada' });

    const resena = recipe.resenas.id(resenaId);
    if (!resena) return res.status(404).json({ error: 'Reseña no encontrada' });

    if (!resena.imagen) return res.status(400).json({ error: 'Esta reseña no tiene imagen asociada' });

    if (resena.imagen.publicId) {
      try {
        await cloudinary.uploader.destroy(resena.imagen.publicId);
      } catch (e) {
        console.error('Error eliminando de Cloudinary:', e.message);
      }
    }

    await Recipe.findOneAndUpdate(
      { _id: recipeId, 'resenas._id': resenaId },
      {
        $set: {
          'resenas.$.imagen.estado':   'rechazada',
          'resenas.$.imagen.url':      null,
          'resenas.$.imagen.publicId': null,
        },
      }
    );

    await logAdminAction(req.user._id, 'REJECT_RESENA_IMAGE', null, {
      recipeId, resenaId, userName: resena.userName,
    });

    res.json({ success: true, message: 'Imagen rechazada y eliminada de Cloudinary.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error rechazando imagen' });
  }
};

exports.banearUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo = '', dias = null } = req.body;

    const target = await User.findById(id);
    if (!target) return res.status(404).json({ error: 'Usuario no encontrado' });
    if (target._id.toString() === req.user._id.toString())
      return res.status(400).json({ error: 'No puedes banearte a ti mismo' });
    if (target.isSuperAdmin)
      return res.status(400).json({ error: 'No se puede banear al Super Admin' });
    if (!req.user.isSuperAdmin && target.role === 'admin')
      return res.status(403).json({ error: 'No tienes permisos para banear a otro administrador' });

    target.baneado       = true;
    target.baneadoMotivo = motivo.trim();
    target.baneadoPor    = req.user._id;
    target.baneadoEn     = new Date();
    target.baneadoHasta  = dias ? new Date(Date.now() + dias * 24 * 60 * 60 * 1000) : null;
    await target.save();

    await logAdminAction(req.user._id, 'BAN_USER', target._id, {
      motivo, dias: dias || 'permanente', userName: target.name,
    });

    res.json({
      success: true,
      message: dias ? `Usuario baneado por ${dias} día${dias !== 1 ? 's' : ''}` : 'Usuario baneado permanentemente',
      baneadoHasta: target.baneadoHasta,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al banear usuario' });
  }
};

exports.desbanearUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const target  = await User.findById(id);
    if (!target) return res.status(404).json({ error: 'Usuario no encontrado' });

    target.baneado       = false;
    target.baneadoHasta  = null;
    target.baneadoMotivo = '';
    target.baneadoPor    = null;
    target.baneadoEn     = null;
    await target.save();

    await logAdminAction(req.user._id, 'UNBAN_USER', target._id, { userName: target.name });
    res.json({ success: true, message: 'Usuario desbaneado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al desbanear usuario' });
  }
};

exports.getBanInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const target  = await User.findById(id).select('name baneado baneadoHasta baneadoMotivo baneadoEn baneadoPor');
    if (!target) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({
      success: true,
      ban: {
        baneado:       target.baneado,
        baneadoHasta:  target.baneadoHasta,
        baneadoMotivo: target.baneadoMotivo,
        baneadoEn:     target.baneadoEn,
        permanente:    target.baneado && !target.baneadoHasta,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo info de ban' });
  }
};

exports.eliminarImagenResena = async (req, res) => {
  try {
    const { recipeId, resenaId } = req.params;
    const { cloudinary }         = require('../config/cloudinary');

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) return res.status(404).json({ error: 'Receta no encontrada' });

    const resena = recipe.resenas.id(resenaId);
    if (!resena) return res.status(404).json({ error: 'Reseña no encontrada' });

    const estadoActual = resena.imagen?.estado;
    if (!estadoActual || estadoActual === 'pendiente') {
      return res.status(400).json({ error: 'Solo se puede eliminar el historial de imágenes aprobadas o rechazadas' });
    }

    if (resena.imagen?.publicId) {
      try {
        await cloudinary.uploader.destroy(resena.imagen.publicId);
      } catch (e) {
        console.error('Error eliminando de Cloudinary:', e.message);
      }
    }

    await Recipe.findOneAndUpdate(
      { _id: recipeId, 'resenas._id': resenaId },
      {
        $unset: { 'resenas.$.imagen': '' },
      }
    );

    await logAdminAction(req.user._id, 'DELETE_RESENA_IMAGE_HISTORY', null, {
      recipeId, resenaId, userName: resena.userName, estadoEliminado: estadoActual,
    });

    res.json({ success: true, message: 'Registro eliminado del historial.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error eliminando imagen del historial' });
  }
};

exports.eliminarImagenesResenasMasivo = async (req, res) => {
  try {
    const { items } = req.body; // [{ recipeId, resenaId }]
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Se requiere una lista de items para eliminar' });
    }

    const { cloudinary } = require('../config/cloudinary');
    let ok = 0, fail = 0;

    await Promise.allSettled(
      items.map(async ({ recipeId, resenaId }) => {
        try {
          const recipe = await Recipe.findById(recipeId);
          if (!recipe) { fail++; return; }

          const resena = recipe.resenas.id(resenaId);
          if (!resena || !resena.imagen || resena.imagen.estado === 'pendiente') { fail++; return; }

          if (resena.imagen.publicId) {
            try { await cloudinary.uploader.destroy(resena.imagen.publicId); } catch (_) {}
          }

          await Recipe.findOneAndUpdate(
            { _id: recipeId, 'resenas._id': resenaId },
            { $unset: { 'resenas.$.imagen': '' } }
          );

          ok++;
        } catch {
          fail++;
        }
      })
    );

    await logAdminAction(req.user._id, 'DELETE_RESENA_IMAGE_HISTORY_MASIVO', null, {
      total: items.length, ok, fail,
    });

    res.json({ success: true, ok, fail, message: `${ok} registro${ok !== 1 ? 's' : ''} eliminado${ok !== 1 ? 's' : ''} del historial.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en eliminación masiva' });
  }
};

async function logAdminAction(adminId, action, targetUserId, metadata = {}) {
  try {
    await AdminLog.create({ adminId, action, targetUserId: targetUserId || null, metadata });
  } catch (error) {
    console.error('Error creando log de auditoría:', error.message);
  }
}

exports.logAdminAction = logAdminAction;