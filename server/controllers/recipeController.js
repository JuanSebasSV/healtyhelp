// ─────────────────────────────────────────────────────────────────────────────
// recipeController.js
// ─────────────────────────────────────────────────────────────────────────────
const Recipe = require('../models/Recipe');

// ── Helpers ───────────────────────────────────────────────────────────────────

const calcularCostos = (ingredientesCosto = [], porciones = 1) => {
  const total = ingredientesCosto.reduce(
    (acc, ing) => acc + (parseFloat(ing.costo) || 0), 0
  );
  const costoTotal   = Math.round(total * 100) / 100;
  const costoPorcion = porciones > 0
    ? Math.round((total / porciones) * 100) / 100
    : costoTotal;
  return { costoTotal, costoPorcion };
};

// ── CRUD estándar ─────────────────────────────────────────────────────────────

exports.getRecipes = async (req, res) => {
  try {
    const { cat, salud, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (cat)    filter.cat   = cat;
    if (salud)  filter.salud = { $in: salud.split(',') };
    if (search) filter.$text = { $search: search };

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Recipe.countDocuments(filter);
    const data  = await Recipe.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-resenas');

    res.json({ ok: true, total, page: parseInt(page), data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

exports.getRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ ok: false, error: 'Receta no encontrada' });
    res.json({ ok: true, data: recipe });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

exports.createRecipe = async (req, res) => {
  try {
    const body = { ...req.body, createdBy: req.user?.id };
    if (body.ingredientesCosto?.length) {
      const { costoTotal, costoPorcion } = calcularCostos(body.ingredientesCosto, body.porciones);
      body.costoTotal   = costoTotal;
      body.costoPorcion = costoPorcion;
    }
    const recipe = await Recipe.create(body);
    res.status(201).json({ ok: true, data: recipe });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
};

exports.updateRecipe = async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.ingredientesCosto?.length !== undefined) {
      const { costoTotal, costoPorcion } = calcularCostos(body.ingredientesCosto, body.porciones);
      body.costoTotal   = costoTotal;
      body.costoPorcion = costoPorcion;
    }
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!recipe) return res.status(404).json({ ok: false, error: 'Receta no encontrada' });
    res.json({ ok: true, data: recipe });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
};

exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) return res.status(404).json({ ok: false, error: 'Receta no encontrada' });
    res.json({ ok: true, message: 'Receta eliminada' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

// ── Costos (REW006) ───────────────────────────────────────────────────────────

exports.updateCostos = async (req, res) => {
  try {
    const { ingredientesCosto = [], porciones = 1, moneda } = req.body;
    if (!Array.isArray(ingredientesCosto))
      return res.status(400).json({ ok: false, error: 'ingredientesCosto debe ser un array' });
    if (porciones < 1)
      return res.status(400).json({ ok: false, error: 'Las porciones deben ser al menos 1' });

    const { costoTotal, costoPorcion } = calcularCostos(ingredientesCosto, porciones);
    const update = { ingredientesCosto, porciones, costoTotal, costoPorcion, ...(moneda && { moneda }) };
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!recipe) return res.status(404).json({ ok: false, error: 'Receta no encontrada' });

    res.json({ ok: true, message: 'Costos actualizados', resumen: { costoTotal, costoPorcion, porciones, moneda: recipe.moneda }, data: recipe });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

exports.getCostos = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .select('nombre porciones ingredientesCosto costoTotal costoPorcion moneda');
    if (!recipe) return res.status(404).json({ ok: false, error: 'Receta no encontrada' });
    res.json({ ok: true, data: { ...recipe.toObject(), tieneCosto: recipe.costoTotal > 0 } });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

exports.getStatsSummary = async (req, res) => {
  try {
    const total = await Recipe.countDocuments();
    const byCategory = await Recipe.aggregate([
      { $group: { _id: '$cat', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ ok: true, stats: { total, byCategory } });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

// ── Reseñas ───────────────────────────────────────────────────────────────────

// GET /api/recipes/:id/resenas?page=1&limit=5&orden=reciente|relevancia
exports.getResenas = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).select('resenas puntosProm totalResenas');
    if (!recipe) return res.status(404).json({ ok: false, error: 'Receta no encontrada' });

    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 5);
    const orden = req.query.orden || 'reciente';

    let resenas = [...recipe.resenas];
    if (orden === 'reciente') {
      resenas.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (orden === 'relevancia') {
      resenas.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
    }

    const total    = resenas.length;
    const pages    = Math.ceil(total / limit) || 1;
    const start    = (page - 1) * limit;
    const paginadas = resenas.slice(start, start + limit);

    const userId = req.user?._id?.toString() || req.user?.id?.toString();
    const enriquecidas = paginadas.map(r => {
      const obj     = r.toObject ? r.toObject() : { ...r };
      obj.likes     = r.likes?.length    || 0;
      obj.dislikes  = r.dislikes?.length || 0;
      if (userId) {
        const likeIds    = (r.likes    || []).map(id => id.toString());
        const dislikeIds = (r.dislikes || []).map(id => id.toString());
        obj.miVoto = likeIds.includes(userId) ? 'like'
                   : dislikeIds.includes(userId) ? 'dislike'
                   : null;
      }
      return obj;
    });

    res.json({
      ok:           true,
      resenas:      enriquecidas,
      puntosProm:   recipe.puntosProm,
      totalResenas: recipe.totalResenas,
      pagination:   { page, limit, total, pages },
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

// POST /api/recipes/:id/resenas
exports.createResena = async (req, res) => {
  try {
    const { estrellas, texto } = req.body;
    const userId   = req.user._id || req.user.id;
    const userName = req.user.name || req.user.nombre || 'Usuario';

    if (!estrellas || estrellas < 1 || estrellas > 5)
      return res.status(400).json({ ok: false, error: 'Estrellas debe ser entre 1 y 5' });

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ ok: false, error: 'Receta no encontrada' });

    const yaExiste = recipe.resenas.find(r => r.userId.toString() === userId.toString());
    if (yaExiste)
      return res.status(400).json({ ok: false, error: 'Ya tienes una reseña para esta receta' });

    recipe.resenas.push({ userId, userName, estrellas, texto: texto?.trim() || '' });
    recipe.recalcularPuntos();
    await recipe.save();

    const nueva = recipe.resenas[recipe.resenas.length - 1];
    res.status(201).json({ ok: true, resena: nueva, puntosProm: recipe.puntosProm, totalResenas: recipe.totalResenas });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

// PUT /api/recipes/:id/resenas
exports.updateResena = async (req, res) => {
  try {
    const { estrellas, texto } = req.body;
    const userId = (req.user._id || req.user.id).toString();

    if (!estrellas || estrellas < 1 || estrellas > 5)
      return res.status(400).json({ ok: false, error: 'Estrellas debe ser entre 1 y 5' });

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ ok: false, error: 'Receta no encontrada' });

    const resena = recipe.resenas.find(r => r.userId.toString() === userId);
    if (!resena) return res.status(404).json({ ok: false, error: 'No tienes una reseña para editar' });

    resena.estrellas = estrellas;
    resena.texto     = texto?.trim() || '';
    recipe.recalcularPuntos();
    await recipe.save();

    res.json({ ok: true, resena, puntosProm: recipe.puntosProm, totalResenas: recipe.totalResenas });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

// DELETE /api/recipes/:id/resenas/:resenaId
exports.deleteResena = async (req, res) => {
  try {
    const userId  = (req.user._id || req.user.id).toString();
    const esAdmin = req.user.role === 'admin';

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ ok: false, error: 'Receta no encontrada' });

    const resena = recipe.resenas.id(req.params.resenaId);
    if (!resena) return res.status(404).json({ ok: false, error: 'Reseña no encontrada' });

    if (!esAdmin && resena.userId.toString() !== userId)
      return res.status(403).json({ ok: false, error: 'No puedes borrar esta reseña' });

    resena.deleteOne();
    recipe.recalcularPuntos();
    await recipe.save();

    res.json({ ok: true, message: 'Reseña eliminada', puntosProm: recipe.puntosProm, totalResenas: recipe.totalResenas });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

// POST /api/recipes/:id/resenas/:resenaId/voto
exports.votarResena = async (req, res) => {
  try {
    const { tipo } = req.body;
    if (!['like', 'dislike'].includes(tipo))
      return res.status(400).json({ ok: false, error: 'tipo debe ser like o dislike' });

    const userId = req.user._id || req.user.id;
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ ok: false, error: 'Receta no encontrada' });

    const resena = recipe.resenas.id(req.params.resenaId);
    if (!resena) return res.status(404).json({ ok: false, error: 'Reseña no encontrada' });

    const likeIdx    = resena.likes.findIndex(id => id.toString() === userId.toString());
    const dislikeIdx = resena.dislikes.findIndex(id => id.toString() === userId.toString());

    if (tipo === 'like') {
      if (likeIdx >= 0) { resena.likes.splice(likeIdx, 1); }
      else { resena.likes.push(userId); if (dislikeIdx >= 0) resena.dislikes.splice(dislikeIdx, 1); }
    } else {
      if (dislikeIdx >= 0) { resena.dislikes.splice(dislikeIdx, 1); }
      else { resena.dislikes.push(userId); if (likeIdx >= 0) resena.likes.splice(likeIdx, 1); }
    }

    await recipe.save();

    const nuevoLikeIdx = resena.likes.findIndex(id => id.toString() === userId.toString());
    const nuevoDisIdx  = resena.dislikes.findIndex(id => id.toString() === userId.toString());
    const miVoto = nuevoLikeIdx >= 0 ? 'like' : nuevoDisIdx >= 0 ? 'dislike' : null;

    res.json({ ok: true, likes: resena.likes.length, dislikes: resena.dislikes.length, miVoto });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

// POST /api/recipes/:id/resenas/:resenaId/respuestas
exports.createRespuesta = async (req, res) => {
  try {
    const { texto } = req.body;
    if (!texto?.trim()) return res.status(400).json({ ok: false, error: 'El texto es obligatorio' });

    const userId   = req.user._id || req.user.id;
    const userName = req.user.name || req.user.nombre || 'Usuario';

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ ok: false, error: 'Receta no encontrada' });

    const resena = recipe.resenas.id(req.params.resenaId);
    if (!resena) return res.status(404).json({ ok: false, error: 'Reseña no encontrada' });

    resena.respuestas.push({ userId, userName, texto: texto.trim() });
    await recipe.save();

    const nueva = resena.respuestas[resena.respuestas.length - 1];
    res.status(201).json({ ok: true, respuesta: nueva });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

// DELETE /api/recipes/:id/resenas/:resenaId/respuestas/:respId
exports.deleteRespuesta = async (req, res) => {
  try {
    const userId  = (req.user._id || req.user.id).toString();
    const esAdmin = req.user.role === 'admin';

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ ok: false, error: 'Receta no encontrada' });

    const resena = recipe.resenas.id(req.params.resenaId);
    if (!resena) return res.status(404).json({ ok: false, error: 'Reseña no encontrada' });

    const respuesta = resena.respuestas.id(req.params.respId);
    if (!respuesta) return res.status(404).json({ ok: false, error: 'Respuesta no encontrada' });

    if (!esAdmin && respuesta.userId.toString() !== userId)
      return res.status(403).json({ ok: false, error: 'No puedes borrar esta respuesta' });

    respuesta.deleteOne();
    await recipe.save();

    res.json({ ok: true, message: 'Respuesta eliminada' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};