const mongoose = require('mongoose');

const consumoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recetaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      required: true,
    },
    // Snapshot básico de la receta para mostrar sin refetch
    recetaSnapshot: {
      nombre: String,
      img:    String,
      desc:   String,
    },
    tipo: {
      type: String,
      enum: ['desayuno', 'almuerzo', 'cena', 'snack'],
      required: true,
    },
    // Fecha en zona Bogotá — se guarda como string 'YYYY-MM-DD'
    fechaBogota: {
      type: String,
      required: true,
    },
    // Hora de registro en Bogotá — string 'HH:mm'
    horaBogota: {
      type: String,
      required: true,
    },
    // Snapshot nutricional de la receta al momento del consumo
    nutri: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true, versionKey: false }
);

// Índices para consultas rápidas
consumoSchema.index({ userId: 1, fechaBogota: 1 });

module.exports = mongoose.model('Consumo', consumoSchema);