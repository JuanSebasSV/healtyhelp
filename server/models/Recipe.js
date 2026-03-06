const mongoose = require('mongoose');

const nutriSchema = new mongoose.Schema({
  // Macronutrientes básicos
  cal:          { type: Number, default: 0 },
  prot:         { type: Number, default: 0 },
  carb:         { type: Number, default: 0 },
  gras:         { type: Number, default: 0 },
  fiber:        { type: Number, default: 0 },
  sodio:        { type: Number, default: 0 },

  // Azúcares
  azucar:       { type: Number, default: 0 },
  glucosa:      { type: Number, default: 0 },
  fructosa:     { type: Number, default: 0 },

  // Grasas detalladas
  grasSat:      { type: Number, default: 0 },
  grasMonoins:  { type: Number, default: 0 },
  grasPoliins:  { type: Number, default: 0 },
  omega3:       { type: Number, default: 0 },

  // Minerales
  calcio:       { type: Number, default: 0 },
  hierro:       { type: Number, default: 0 },
  potasio:      { type: Number, default: 0 },
  magnesio:     { type: Number, default: 0 },

  // Vitaminas
  vitA:         { type: Number, default: 0 },
  vitC:         { type: Number, default: 0 },
  vitD:         { type: Number, default: 0 },
  vitE:         { type: Number, default: 0 },
}, { _id: false });

const recipeSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      maxlength: [200, 'El nombre no puede superar 200 caracteres'],
    },

    desc: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
      maxlength: [1000, 'La descripción no puede superar 1000 caracteres'],
    },

    img: {
      type: String,
      default: '',
    },

    cat: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      enum: {
        values: ['desayuno', 'almuerzo', 'cena', 'postres-snacks'],
        message: 'Categoría inválida: {VALUE}',
      },
    },

    salud: {
      type: [String],
      default: [],
      // Valores permitidos — se validan en el frontend; aquí se deja abierto
      // para facilitar extensibilidad futura
    },

    puntos: {
      type: Number,
      default: 0,
      min: [0, 'La puntuación mínima es 0'],
      max: [5, 'La puntuación máxima es 5'],
    },

    ingredientes: {
      type: [String],
      default: [],
    },

    pasos: {
      type: [String],
      default: [],
    },

    nutri: {
      type: nutriSchema,
      default: () => ({}),
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true, // createdAt + updatedAt automáticos
    versionKey: false,
  }
);

// Índices para búsqueda eficiente con grandes volúmenes
recipeSchema.index({ nombre: 'text', desc: 'text' }); // búsqueda full-text
recipeSchema.index({ cat: 1 });
recipeSchema.index({ salud: 1 });
recipeSchema.index({ createdAt: -1 });
recipeSchema.index({ puntos: -1 });

module.exports = mongoose.model('Recipe', recipeSchema);