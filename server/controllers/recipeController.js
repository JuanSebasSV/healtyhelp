const Recipe   = require('../models/Recipe');
const AdminLog = require('../models/AdminLog');
const { crearNotifRespuesta, crearNotifNuevaReceta } = require('./notificationController');

// ─────────────────────────────────────────────
// 📊 Obtener todas las recetas
// ─────────────────────────────────────────────
exports.getAllRecipes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', cat = '', salud = '' } = req.query;
    const filters = {};
    if (search) {
      filters.$or = [
        { nombre: { $regex: search, $options: 'i' } },
        { desc:   { $regex: search, $options: 'i' } },
      ];
    }
    if (cat)   filters.cat   = cat;
    if (salud) filters.salud = salud;

    const total   = await Recipe.countDocuments(filters);
    const recipes = await Recipe.find(filters)
      .select('-resenas')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json({
      success: true,
      recipes,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo recetas' });
  }
};

exports.getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Receta no encontrada' });
    res.json({ success: true, recipe });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo receta' });
  }
};

exports.createRecipe = async (req, res) => {
  try {
    const recipeData = { ...req.body, createdBy: req.user._id };
    delete recipeData.resenas; delete recipeData.puntosProm; delete recipeData.totalResenas;
    const recipe = await Recipe.create(recipeData);
    await AdminLog.create({
      adminId:  req.user._id,
      action:   'CREATE_RECIPE',
      metadata: { recipeName: recipe.nombre, recipeId: recipe._id },
    });
    crearNotifNuevaReceta({
    recetaId:     recipe._id,
    recetaNombre: recipe.nombre,
    recetaCat:    recipe.cat,
    recetaSalud:  recipe.salud,
});
    res.status(201).json({ success: true, message: 'Receta creada correctamente', recipe });
  } catch (error) {
    res.status(500).json({ error: 'Error creando receta', details: error.message });
  }
};

exports.updateRecipe = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.resenas; delete updates.puntosProm; delete updates.totalResenas;
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!recipe) return res.status(404).json({ error: 'Receta no encontrada' });
    await AdminLog.create({
      adminId:  req.user._id,
      action:   'UPDATE_RECIPE',
      metadata: { recipeName: recipe.nombre, recipeId: recipe._id },
    });
    res.json({ success: true, message: 'Receta actualizada correctamente', recipe });
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando receta', details: error.message });
  }
};

exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Receta no encontrada' });

    // Eliminar notificaciones huérfanas de esta receta
    const Notification = require('../models/Notification');
    await Notification.deleteMany({ recetaId: req.params.id });

    await AdminLog.create({
      adminId:  req.user._id,
      action:   'DELETE_RECIPE',
      metadata: { recipeName: recipe.nombre },
    });
    res.json({ success: true, message: 'Receta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando receta' });
  }
};

exports.deleteMultipleRecipes = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return res.status(400).json({ error: 'IDs inválidos' });
    const result = await Recipe.deleteMany({ _id: { $in: ids } });
    await AdminLog.create({
      adminId:  req.user._id,
      action:   'DELETE_MULTIPLE_RECIPES',
      metadata: { count: result.deletedCount },
    });
    res.json({ success: true, message: `${result.deletedCount} recetas eliminadas`, deleted: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando recetas' });
  }
};

exports.importRecipes = async (req, res) => {
  try {
    const { recipes, mode } = req.body;
    if (!Array.isArray(recipes)) return res.status(400).json({ error: 'Formato inválido' });
    const validRecipes = []; const errors = [];
    recipes.forEach((recipe, index) => {
      if (!recipe.nombre || !recipe.desc || !recipe.cat) {
        errors.push(`Receta ${index + 1}: Faltan campos obligatorios`);
      } else {
        const clean = { ...recipe };
        delete clean.resenas; delete clean.puntosProm; delete clean.totalResenas;
        validRecipes.push(clean);
      }
    });
    if (errors.length > 0) return res.status(400).json({ error: 'Errores en recetas', details: errors });
    let result = {};
    if (mode === 'replace') {
      const count = await Recipe.countDocuments();
      await Recipe.deleteMany({});
      const created = await Recipe.insertMany(validRecipes);
      result = { deleted: count, created: created.length };
    } else {
      const created = await Recipe.insertMany(validRecipes);
      result = { created: created.length };
    }
    await AdminLog.create({ adminId: req.user._id, action: 'IMPORT_RECIPES', metadata: result });
    // ── Notificar a todos los usuarios sobre las recetas importadas ──
    if (result.created > 0) {
  const todas = await Recipe.find().sort({ createdAt: -1 }).limit(result.created).select('_id nombre cat salud').lean();
  for (const r of todas) {
    await crearNotifNuevaReceta({
      recetaId:     r._id,
      recetaNombre: r.nombre,
      recetaCat:    r.cat,
      recetaSalud:  r.salud,
    });
  }
}
    res.json({ success: true, message: `${result.created} recetas importadas`, result });
  } catch (error) {
    res.status(500).json({ error: 'Error importando recetas', details: error.message });
  }
};

exports.exportRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find().select('-__v -resenas').lean();
    res.json({ success: true, count: recipes.length, recipes });
  } catch (error) {
    res.status(500).json({ error: 'Error exportando recetas' });
  }
};

exports.getRecipeStats = async (req, res) => {
  try {
    const total      = await Recipe.countDocuments();
    const byCategory = await Recipe.aggregate([{ $group: { _id: '$cat', count: { $sum: 1 } } }]);
    const byHealth   = await Recipe.aggregate([
      { $unwind: '$salud' },
      { $group: { _id: '$salud', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ success: true, stats: { total, byCategory, byHealth } });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
};

// ═══════════════════════════════════════════════════════════════
// ⭐ SISTEMA DE RESEÑAS
// ═══════════════════════════════════════════════════════════════

/**
 * Serializa una reseña para el cliente.
 * La imagen solo se expone si está aprobada O si el userId coincide con el solicitante.
 */
const serializarResena = (r, userId) => {
  const esAutor    = userId && r.userId.toString() === userId.toString();
  const imgAprobada = r.imagen?.estado === 'aprobada';
  const imgPendiente = r.imagen?.estado === 'pendiente' && esAutor;

  let imagenCliente = null;
  // BUGFIX: imagen pendiente tiene url=null en DB → no depender de r.imagen?.url
  if (r.imagen && r.imagen.estado) {
    if (imgAprobada) {
      imagenCliente = { url: r.imagen.url, estado: 'aprobada' };
    } else if (imgPendiente) {
      imagenCliente = { url: null, estado: 'pendiente' };
    }
    // rechazada → null para todos
  }

  return {
    _id:        r._id,
    userId:     r.userId,
    userName:   r.userName,
    estrellas:  r.estrellas,
    texto:      r.texto,
    createdAt:  r.createdAt,
    updatedAt:  r.updatedAt,
    likes:      r.likes.length,
    dislikes:   r.dislikes.length,
    imagen:     imagenCliente,
    miVoto: userId
      ? r.likes.some(id => id.toString() === userId.toString())    ? 'like'
      : r.dislikes.some(id => id.toString() === userId.toString()) ? 'dislike'
      : null
      : null,
    respuestas: r.respuestas.map(rp => ({
      _id:       rp._id,
      userId:    rp.userId,
      userName:  rp.userName,
      texto:     rp.texto,
      createdAt: rp.createdAt,
    })),
  };
};

// ─────────────────────────────────────────────
// GET /recipes/:id/resenas?page=1&limit=5&orden=reciente|relevancia
// IMPORTANTE: esta ruta debe usar el middleware de auth OPCIONAL (optionalAuth o similar),
// no el middleware que rechaza la petición si no hay token. Así req.user?._id llega
// correctamente cuando el usuario está logueado y el autor puede ver su imagen pendiente.
// ─────────────────────────────────────────────
exports.getResenas = async (req, res) => {
  try {
    const { page = 1, limit = 5, orden = 'reciente' } = req.query;
    const skip   = (parseInt(page) - 1) * parseInt(limit);
    const userId = req.user?._id;

    const recipe = await Recipe.findById(req.params.id).select('resenas puntosProm totalResenas');
    if (!recipe) return res.status(404).json({ error: 'Receta no encontrada' });

    let ordenadas = [...recipe.resenas];

    if (orden === 'relevancia') {
      ordenadas.sort((a, b) => {
        const scoreA = a.likes.length - a.dislikes.length;
        const scoreB = b.likes.length - b.dislikes.length;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    } else {
      ordenadas.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const paginated = ordenadas.slice(skip, skip + parseInt(limit));

    res.json({
      success:      true,
      puntosProm:   recipe.puntosProm,
      totalResenas: recipe.totalResenas,
      resenas:      paginated.map(r => serializarResena(r, userId)),
      pagination: {
        total: recipe.resenas.length,
        page:  parseInt(page),
        pages: Math.ceil(recipe.resenas.length / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error obteniendo reseñas' });
  }
};

// ─────────────────────────────────────────────
// POST /recipes/:id/resenas — Crear reseña
// Acepta application/json (sin imagen) o multipart/form-data (con imagen)
// La imagen se procesa por uploadResena middleware ANTES de llegar aquí
// ─────────────────────────────────────────────
exports.crearResena = async (req, res) => {
  try {
    const { estrellas, texto = '' } = req.body;
    if (!estrellas || estrellas < 1 || estrellas > 5)
      return res.status(400).json({ error: 'La puntuación debe ser entre 1 y 5' });

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Receta no encontrada' });

    const yaReseno = recipe.resenas.find(r => r.userId.toString() === req.user._id.toString());
    if (yaReseno) return res.status(400).json({ error: 'Ya tienes una reseña en esta receta. Puedes editarla.' });

    // Si adjunta imagen, el texto es obligatorio
    if (req.file && !texto.trim())
      return res.status(400).json({ error: 'Escribe un comentario para acompañar la imagen' });

    // Si adjunta imagen, el texto es obligatorio
    if (req.file && !texto.trim())
      return res.status(400).json({ error: 'Escribe un comentario para acompañar la imagen' });

    // Construir objeto de reseña
    const nuevaResena = {
      userId:    req.user._id,
      userName:  req.user.name,
      estrellas: parseInt(estrellas),
      texto:     texto.trim(),
    };

    // Si multer adjuntó imagen (campo "imagen")
    if (req.file) {
      nuevaResena.imagen = {
        url:      req.file.path,       // Cloudinary devuelve la URL en req.file.path
        publicId: req.file.filename,   // y el public_id en req.file.filename
        estado:   'pendiente',
      };
    }

    recipe.resenas.push(nuevaResena);
    recipe.recalcularPuntos();
    await recipe.save();

    const nueva = recipe.resenas[recipe.resenas.length - 1];
    res.status(201).json({
      success:      true,
      message:      '¡Reseña publicada!',
      puntosProm:   recipe.puntosProm,
      totalResenas: recipe.totalResenas,
      resena:       serializarResena(nueva, req.user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al publicar la reseña' });
  }
};

// ─────────────────────────────────────────────
// POST /recipes/:id/resenas/:resenaId/imagen
// Sube imagen a una reseña ya existente (botón "Adjuntar imagen" post-publicación)
// Procesado por uploadResena middleware
// ─────────────────────────────────────────────
exports.subirImagenResena = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se recibió ninguna imagen' });

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Receta no encontrada' });

    const resena = recipe.resenas.id(req.params.resenaId);
    if (!resena) return res.status(404).json({ error: 'Reseña no encontrada' });

    // Solo el autor puede adjuntar imagen
    if (resena.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ error: 'No puedes modificar esta reseña' });

    // Si ya tiene imagen aprobada, no se permite reemplazar
    if (resena.imagen?.estado === 'aprobada')
      return res.status(400).json({ error: 'La imagen ya fue aprobada y no puede ser reemplazada' });

    // Si hay imagen previa pendiente en Cloudinary, borrarla antes
    const { cloudinary } = require('../config/cloudinary');
    if (resena.imagen?.publicId) {
      try { await cloudinary.uploader.destroy(resena.imagen.publicId); } catch {}
    }

    resena.imagen = {
      url:      req.file.path,
      publicId: req.file.filename,
      estado:   'pendiente',
    };

    await recipe.save();

    res.json({
      success: true,
      message: 'Imagen subida. Pendiente de aprobación (≈3 días).',
      imagen:  { url: null, estado: 'pendiente' }, // El autor ve placeholder
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error subiendo imagen' });
  }
};

// ─────────────────────────────────────────────
// PUT /recipes/:id/resenas — Editar propia reseña
// ─────────────────────────────────────────────
exports.editarResena = async (req, res) => {
  try {
    const { estrellas, texto = '' } = req.body;
    if (!estrellas || estrellas < 1 || estrellas > 5)
      return res.status(400).json({ error: 'La puntuación debe ser entre 1 y 5' });

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Receta no encontrada' });

    const resena = recipe.resenas.find(r => r.userId.toString() === req.user._id.toString());
    if (!resena) return res.status(404).json({ error: 'No tienes una reseña en esta receta' });

    resena.estrellas = parseInt(estrellas);
    resena.texto     = texto.trim();
    recipe.recalcularPuntos();
    await recipe.save();

    res.json({
      success:      true,
      message:      'Reseña actualizada',
      puntosProm:   recipe.puntosProm,
      totalResenas: recipe.totalResenas,
      resena:       serializarResena(resena, req.user._id),
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al editar la reseña' });
  }
};

// ─────────────────────────────────────────────
// DELETE /recipes/:id/resenas/:resenaId
// Borra propia reseña (o admin borra cualquiera)
// Si tenía imagen en Cloudinary, la elimina también
// ─────────────────────────────────────────────
exports.borrarResena = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Receta no encontrada' });

    const resena = recipe.resenas.id(req.params.resenaId);
    if (!resena) return res.status(404).json({ error: 'Reseña no encontrada' });

    const esAdmin = req.user.role === 'admin';
    const esAutor = resena.userId.toString() === req.user._id.toString();
    if (!esAutor && !esAdmin) return res.status(403).json({ error: 'No puedes borrar esta reseña' });

    // Eliminar imagen de Cloudinary si existe
    if (resena.imagen?.publicId) {
      const { cloudinary } = require('../config/cloudinary');
      try { await cloudinary.uploader.destroy(resena.imagen.publicId); } catch {}
    }

    resena.deleteOne();
    recipe.recalcularPuntos();
    await recipe.save();

    res.json({
      success:      true,
      message:      'Reseña eliminada',
      puntosProm:   recipe.puntosProm,
      totalResenas: recipe.totalResenas,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al borrar la reseña' });
  }
};

// ─────────────────────────────────────────────
// POST /recipes/:id/resenas/:resenaId/voto
// body: { tipo: 'like' | 'dislike' }
// ─────────────────────────────────────────────
exports.votarResena = async (req, res) => {
  try {
    const { tipo } = req.body;
    if (!['like', 'dislike'].includes(tipo))
      return res.status(400).json({ error: 'Tipo de voto inválido' });

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Receta no encontrada' });

    const resena = recipe.resenas.id(req.params.resenaId);
    if (!resena) return res.status(404).json({ error: 'Reseña no encontrada' });

    const uid        = req.user._id;
    const enLikes    = resena.likes.some(id => id.toString() === uid.toString());
    const enDislikes = resena.dislikes.some(id => id.toString() === uid.toString());

    if (tipo === 'like') {
      if (enLikes) {
        resena.likes = resena.likes.filter(id => id.toString() !== uid.toString());
      } else {
        resena.likes.push(uid);
        resena.dislikes = resena.dislikes.filter(id => id.toString() !== uid.toString());
      }
    } else {
      if (enDislikes) {
        resena.dislikes = resena.dislikes.filter(id => id.toString() !== uid.toString());
      } else {
        resena.dislikes.push(uid);
        resena.likes = resena.likes.filter(id => id.toString() !== uid.toString());
      }
    }

    await recipe.save();

    res.json({
      success:  true,
      likes:    resena.likes.length,
      dislikes: resena.dislikes.length,
      miVoto:   resena.likes.some(id => id.toString() === uid.toString())    ? 'like'
               : resena.dislikes.some(id => id.toString() === uid.toString()) ? 'dislike'
               : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al votar' });
  }
};

// ─────────────────────────────────────────────
// POST /recipes/:id/resenas/:resenaId/respuestas
// ─────────────────────────────────────────────
exports.responderResena = async (req, res) => {
  try {
    const { texto } = req.body;
    if (!texto || !texto.trim()) return res.status(400).json({ error: 'El texto es obligatorio' });

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Receta no encontrada' });

    const resena = recipe.resenas.id(req.params.resenaId);
    if (!resena) return res.status(404).json({ error: 'Reseña no encontrada' });

    resena.respuestas.push({ userId: req.user._id, userName: req.user.name, texto: texto.trim() });
    await recipe.save();

    const nueva = resena.respuestas[resena.respuestas.length - 1];

    // ── Notificar al autor de la reseña original ──
    crearNotifRespuesta({
      destinatarioId: resena.userId,
      fromUserId:     req.user._id,
      fromUserName:   req.user.name,
      recetaId:       recipe._id,
      recetaNombre:   recipe.nombre,
      resenaId:       resena._id,
      respuestaTexto: texto.trim(),
    }); // fire-and-forget — no await para no bloquear la respuesta
    res.status(201).json({
      success:   true,
      respuesta: {
        _id:       nueva._id,
        userId:    nueva.userId,
        userName:  nueva.userName,
        texto:     nueva.texto,
        createdAt: nueva.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al responder' });
  }
};

// ─────────────────────────────────────────────
// DELETE /recipes/:id/resenas/:resenaId/respuestas/:respId
// ─────────────────────────────────────────────
exports.borrarRespuesta = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Receta no encontrada' });

    const resena = recipe.resenas.id(req.params.resenaId);
    if (!resena) return res.status(404).json({ error: 'Reseña no encontrada' });

    const respuesta = resena.respuestas.id(req.params.respId);
    if (!respuesta) return res.status(404).json({ error: 'Respuesta no encontrada' });

    const esAdmin = req.user.role === 'admin';
    const esAutor = respuesta.userId.toString() === req.user._id.toString();
    if (!esAutor && !esAdmin) return res.status(403).json({ error: 'No puedes borrar esta respuesta' });

    respuesta.deleteOne();
    await recipe.save();

    res.json({ success: true, message: 'Respuesta eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al borrar la respuesta' });
  }
};

// ─────────────────────────────────────────────
// DELETE /recipes/:id/resenas/imagen
// Quita la imagen de la propia reseña del usuario (desde modo editar)
// ─────────────────────────────────────────────
exports.quitarImagenResena = async (req, res) => {
  try {
    const { cloudinary } = require('../config/cloudinary');
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Receta no encontrada' });

    const resena = recipe.resenas.find(r => r.userId.toString() === req.user._id.toString());
    if (!resena) return res.status(404).json({ error: 'No tienes reseña en esta receta' });
    if (!resena.imagen || !resena.imagen.estado)
      return res.status(400).json({ error: 'Esta reseña no tiene imagen' });

    if (resena.imagen.publicId) {
      try { await cloudinary.uploader.destroy(resena.imagen.publicId); } catch {}
    }
    resena.imagen.url      = null;
    resena.imagen.publicId = null;
    resena.imagen.estado   = undefined;
    await recipe.save();

    res.json({ success: true, message: 'Imagen eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al quitar la imagen' });
  }
};