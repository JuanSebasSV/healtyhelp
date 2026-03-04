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
      'DELETE_USER',
      'CHANGE_ROLE',
      'CREATE_RECIPE',
      'UPDATE_RECIPE',
      'DELETE_RECIPE',
      'BAN_USER',
      'UNBAN_USER',
      'VERIFY_USER',
      'SYSTEM_CONFIG',
      'INVITE_ADMIN',
      'ADMIN_INVITE_ACCEPTED',
      'REVOKE_INVITATION'
    ]
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: String,
  userAgent: String
}, { timestamps: true });

adminLogSchema.index({ adminId: 1, createdAt: -1 });
adminLogSchema.index({ action: 1, createdAt: -1 });
adminLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AdminLog', adminLogSchema);