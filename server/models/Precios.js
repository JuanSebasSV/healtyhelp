const mongoose = require('mongoose');

const PrecioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true, lowercase: true, trim: true },
  precio_unidad: { type: Number, required: true },
  unidad: { type: String, required: true, enum: ['litro', 'kilogramo', 'unidad', 'gramo'] },
  ultima_actualizacion: { type: Date, default: Date.now },
  fuente: { type: String, default: 'manual' }
});

module.exports = mongoose.model('Precio', PrecioSchema);