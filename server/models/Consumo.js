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
    fechaBogota: {
      type: String,
      required: true,
    },
    horaBogota: {
      type: String,
      required: true,
    },
    nutri: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true, versionKey: false }
);

consumoSchema.index({ userId: 1, fechaBogota: 1 });

consumoSchema.index(
  { userId: 1, fechaBogota: 1, tipo: 1 },
  {
    unique: true,
    partialFilterExpression: { tipo: { $in: ['desayuno', 'almuerzo', 'cena'] } },
    name: 'unique_comida_principal',
  }
);

module.exports = mongoose.model('Consumo', consumoSchema);