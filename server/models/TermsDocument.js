const mongoose = require('mongoose');

// Guarda la versión activa de los Términos y Condiciones.
// Solo existe UN documento activo a la vez (singleton).
// Cuando el admin publica una nueva versión se actualiza este documento
// y todos los usuarios cuyo termsVersion !== version deberán aceptar de nuevo.

const termsDocumentSchema = new mongoose.Schema({
  version:   { type: String, required: true },   // Ej: '1.0.0', '1.1.0', '2.0.0'
  content:   { type: String, required: true },   // HTML o texto plano con el cuerpo completo
  publishedAt: { type: Date, default: Date.now },
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('TermsDocument', termsDocumentSchema);
