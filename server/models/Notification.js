const mongoose = require('mongoose');

// Tipos de notificación:
 
const notificationSchema = new mongoose.Schema(
  {
    // Destinatario
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ['reply', 'message', 'new_recipe'],
      required: true,
    },

    // Leída o no
    leida: { type: Boolean, default: false },

    // Quién respondió
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    fromUserName: { type: String, default: '' },

    // Contexto de la receta/comentario
    recetaId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', default: null },
    recetaNombre: { type: String, default: '' },
    resenaId:       { type: mongoose.Schema.Types.ObjectId, default: null },
    respuestaId:    { type: mongoose.Schema.Types.ObjectId, default: null }, // deep-link directo a la respuesta
    respuestaTexto: { type: String, default: '' }, // preview de la respuesta

    // El remitente es un admin — guardamos nombre para mostrarlo aunque se elimine
    adminId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    adminName: { type: String, default: '' },
    mensaje:   { type: String, default: '', maxlength: 1000 },
    asunto:    { type: String, default: '', maxlength: 120 },
    recetaCat:   { type: String, default: '' },
    recetaSalud: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Índice compuesto para cargar notificaciones no leídas rápido
notificationSchema.index({ userId: 1, leida: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);