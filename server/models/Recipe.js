const mongoose = require('mongoose');

// ─────────────────────────────────────────────
// Sub-esquema nutricional completo
// ─────────────────────────────────────────────
const nutriSchema = new mongoose.Schema({
  cal:          { type: Number, default: 0 },
  carb:         { type: Number, default: 0 },
  gras:         { type: Number, default: 0 },
  prot:         { type: Number, default: 0 },
  carbNetos:    { type: Number, default: 0 },
  fiber:        { type: Number, default: 0 },
  sodio:        { type: Number, default: 0 },
  colesterol:   { type: Number, default: 0 },
  calcio:       { type: Number, default: 0 },
  hierro:       { type: Number, default: 0 },
  potasio:      { type: Number, default: 0 },
  vitD:         { type: Number, default: 0 },
  alfaCaroteno: { type: Number, default: 0 },
  betaCaroteno: { type: Number, default: 0 },
  cafeina:      { type: Number, default: 0 },
  colina:       { type: Number, default: 0 },
  cobre:        { type: Number, default: 0 },
  fluor:        { type: Number, default: 0 },
  folato:       { type: Number, default: 0 },
  licopeno:     { type: Number, default: 0 },
  magnesio:     { type: Number, default: 0 },
  manganeso:    { type: Number, default: 0 },
  niacina:      { type: Number, default: 0 },
  acidoPant:    { type: Number, default: 0 },
  fosforo:      { type: Number, default: 0 },
  retinol:      { type: Number, default: 0 },
  riboflavina:  { type: Number, default: 0 },
  selenio:      { type: Number, default: 0 },
  teobromina:   { type: Number, default: 0 },
  tiamina:      { type: Number, default: 0 },
  vitAui:       { type: Number, default: 0 },
  vitA:         { type: Number, default: 0 },
  vitB12:       { type: Number, default: 0 },
  vitB6:        { type: Number, default: 0 },
  vitC:         { type: Number, default: 0 },
  vitDui:       { type: Number, default: 0 },
  vitD2:        { type: Number, default: 0 },
  vitD3:        { type: Number, default: 0 },
  vitE:         { type: Number, default: 0 },
  vitK:         { type: Number, default: 0 },
  zinc:         { type: Number, default: 0 },
  azucar:       { type: Number, default: 0 },
  sacarosa:     { type: Number, default: 0 },
  glucosa:      { type: Number, default: 0 },
  fructosa:     { type: Number, default: 0 },
  lactosa:      { type: Number, default: 0 },
  maltosa:      { type: Number, default: 0 },
  galactosa:    { type: Number, default: 0 },
  almidon:      { type: Number, default: 0 },
  grasSat:      { type: Number, default: 0 },
  grasMonoins:  { type: Number, default: 0 },
  grasPoliins:  { type: Number, default: 0 },
  grasTrans:    { type: Number, default: 0 },
  omega3:       { type: Number, default: 0 },
  omega6:       { type: Number, default: 0 },
  ala:          { type: Number, default: 0 },
  dha:          { type: Number, default: 0 },
  epa:          { type: Number, default: 0 },
  dpa:          { type: Number, default: 0 },
  alanina:      { type: Number, default: 0 },
  arginina:     { type: Number, default: 0 },
  acidoAsp:     { type: Number, default: 0 },
  cistina:      { type: Number, default: 0 },
  acidoGlu:     { type: Number, default: 0 },
  glicina:      { type: Number, default: 0 },
  histidina:    { type: Number, default: 0 },
  hidroxiprol:  { type: Number, default: 0 },
  isoleucina:   { type: Number, default: 0 },
  leucina:      { type: Number, default: 0 },
  lisina:       { type: Number, default: 0 },
  metionina:    { type: Number, default: 0 },
  fenilalanina: { type: Number, default: 0 },
  prolina:      { type: Number, default: 0 },
  serina:       { type: Number, default: 0 },
  treonina:     { type: Number, default: 0 },
  triptofano:   { type: Number, default: 0 },
  tirosina:     { type: Number, default: 0 },
  valina:       { type: Number, default: 0 },
}, { _id: false });

// ─────────────────────────────────────────────
// Sub-esquema de respuesta (dentro de una reseña)
// ─────────────────────────────────────────────
const respuestaSchema = new mongoose.Schema(
  {
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    texto:    { type: String, required: true, trim: true, maxlength: [500, 'Máximo 500 caracteres'] },
  },
  { timestamps: true }
);

// ─────────────────────────────────────────────
// Sub-esquema de reseña
// likes    = array de userIds que marcaron "Es útil"
// dislikes = array de userIds que marcaron "No es útil"
// respuestas = comentarios anidados (estilo YouTube)
// ─────────────────────────────────────────────
const resenaSchema = new mongoose.Schema(
  {
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName:   { type: String, required: true },
    estrellas:  { type: Number, required: true, min: 1, max: 5 },
    texto:      { type: String, trim: true, maxlength: [500, 'Máximo 500 caracteres'], default: '' },
    // Votos de utilidad
    likes:      { type: [mongoose.Schema.Types.ObjectId], default: [] },   // userIds
    dislikes:   { type: [mongoose.Schema.Types.ObjectId], default: [] },   // userIds
    // Respuestas anidadas
    respuestas: { type: [respuestaSchema], default: [] },
  },
  { timestamps: true }
);

// ─────────────────────────────────────────────
// Esquema principal de receta
// ─────────────────────────────────────────────
const recipeSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      maxlength: [200, 'Máximo 200 caracteres'],
    },
    desc: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
      maxlength: [1000, 'Máximo 1000 caracteres'],
    },
    img:          { type: String, default: '' },
    cat: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      enum: {
        values: ['desayuno', 'almuerzo', 'cena', 'postres-snacks'],
        message: 'Categoría inválida: {VALUE}',
      },
    },
    salud:        { type: [String], default: [] },
    ingredientes: { type: [String], default: [] },
    pasos:        { type: [String], default: [] },

    resenas:      { type: [resenaSchema], default: [] },
    puntosProm:   { type: Number, default: 0 },
    totalResenas: { type: Number, default: 0 },

    nutri:     { type: nutriSchema, default: () => ({}) },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

// ── Recalcular promedio ──
recipeSchema.methods.recalcularPuntos = function () {
  const total = this.resenas.length;
  if (total === 0) {
    this.puntosProm   = 0;
    this.totalResenas = 0;
  } else {
    const suma = this.resenas.reduce((acc, r) => acc + r.estrellas, 0);
    this.puntosProm   = Math.round((suma / total) * 10) / 10;
    this.totalResenas = total;
  }
};

recipeSchema.index({ nombre: 'text', desc: 'text' });
recipeSchema.index({ cat: 1 });
recipeSchema.index({ salud: 1 });
recipeSchema.index({ createdAt: -1 });
recipeSchema.index({ puntosProm: -1 });

module.exports = mongoose.model('Recipe', recipeSchema);