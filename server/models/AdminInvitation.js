const mongoose = require('mongoose');

const adminInvitationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  used: {
    type: Boolean,
    default: false
  },
  usedAt: Date
}, { timestamps: true });

// Índice para limpiar invitaciones expiradas automáticamente
adminInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('AdminInvitation', adminInvitationSchema);