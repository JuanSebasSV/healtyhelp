const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      //  Usuarios 
      'DELETE_USER',
      'CHANGE_ROLE',
      'BAN_USER',
      'UNBAN_USER',
      'VERIFY_USER',
      //  Recetas 
      'CREATE_RECIPE',
      'UPDATE_RECIPE',
      'DELETE_RECIPE',
      'DELETE_MULTIPLE_RECIPES',
      'IMPORT_RECIPES',
      'EXPORT_RECIPES',
      //  Sistema / Admin 
      'SYSTEM_CONFIG',
      'INVITE_ADMIN',
      'ADMIN_INVITE_ACCEPTED',
      'REVOKE_INVITATION',
      'DELETE_RESENA',
      'APPROVE_RESENA',
      'REJECT_RESENA',
      'REJECT_RESENA_IMAGE',
      'DELETE_RESENA_IMAGE'
    ]
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: String,
  userAgent: String
}, { timestamps: true, versionKey: false });

adminLogSchema.index({ adminId: 1, createdAt: -1 });
adminLogSchema.index({ action: 1, createdAt: -1 });
adminLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AdminLog', adminLogSchema);