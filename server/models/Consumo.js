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
      // ✅ NUEVO: 'snack' agregado — permite postres y snacks además de las 3 comidas
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

// ✅ CAMBIO CRÍTICO: Se elimina el índice único compuesto por (userId, fechaBogota, tipo)
// porque 'snack' puede aparecer hasta 3 veces por día (no es único por tipo).
// La unicidad para desayuno/almuerzo/cena ahora se controla en el controller.
// Para snacks se controla con un límite de 3 por día también en el controller.
//
// ⚠️  IMPORTANTE — migración en producción:
//   Antes de desplegar, elimina el índice viejo en MongoDB Atlas o mongosh:
//   db.consumos.dropIndex("userId_1_fechaBogota_1_tipo_1")
//   (o desde Atlas: Indexes → eliminar ese índice compuesto)

module.exports = mongoose.model('Consumo', consumoSchema);