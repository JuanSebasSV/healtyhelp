const Notification = require("../models/Notification");
const User         = require("../models/User");
const Recipe       = require("../models/Recipe");

// ─── GET /api/notifications ───────────────────────────────────────────────────
// Devuelve las últimas 30 notificaciones del usuario autenticado
exports.getMisNotificaciones = async (req, res) => {
  try {
    const notifs = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const noLeidas = notifs.filter((n) => !n.leida).length;

    res.json({ success: true, notificaciones: notifs, noLeidas });
  } catch (error) {
    console.error("getMisNotificaciones error:", error);
    res.status(500).json({ error: "Error obteniendo notificaciones" });
  }
};

// ─── PUT /api/notifications/leer-todas ───────────────────────────────────────
// Marca todas las notificaciones del usuario como leídas
exports.leerTodas = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, leida: false },
      { $set: { leida: true } },
    );
    res.json({ success: true });
  } catch (error) {
    console.error("leerTodas error:", error);
    res.status(500).json({ error: "Error marcando notificaciones" });
  }
};

// ─── PUT /api/notifications/:id/leer ─────────────────────────────────────────
// Marca una notificación específica como leída
exports.leerUna = async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { leida: true } },
      { new: true },
    );
    if (!notif)
      return res.status(404).json({ error: "Notificación no encontrada" });
    res.json({ success: true, notificacion: notif });
  } catch (error) {
    console.error("leerUna error:", error);
    res.status(500).json({ error: "Error marcando notificación" });
  }
};

// ─── GET /api/notifications/no-leidas ────────────────────────────────────────
// Devuelve solo el conteo de no leídas (para el badge del navbar)
exports.contarNoLeidas = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user._id,
      leida:  false,
    });
    res.json({ success: true, noLeidas: count });
  } catch (error) {
    console.error("contarNoLeidas error:", error);
    res.status(500).json({ error: "Error contando notificaciones" });
  }
};

// ─── POST /api/notifications/mensaje (solo admins) ───────────────────────────
exports.enviarMensaje = async (req, res) => {
  try {
    const { userId, asunto = "", mensaje } = req.body;

    if (!userId)
      return res.status(400).json({ error: "userId es obligatorio" });
    if (!mensaje?.trim())
      return res.status(400).json({ error: "El mensaje no puede estar vacío" });
    if (mensaje.trim().length > 1000)
      return res.status(400).json({ error: "Máximo 1000 caracteres" });

    const destino = await User.findById(userId);
    if (!destino)
      return res.status(404).json({ error: "Usuario no encontrado" });

    await Notification.create({
      userId:    destino._id,
      type:      "message",
      adminId:   req.user._id,
      adminName: req.user.name,
      asunto:    asunto.trim().slice(0, 120),
      mensaje:   mensaje.trim(),
    });

    res.status(201).json({ success: true, message: "Mensaje enviado" });
  } catch (error) {
    console.error("enviarMensaje error:", error);
    res.status(500).json({ error: "Error enviando mensaje" });
  }
};

// ─── DELETE /api/notifications/limpiar-huerfanas (solo admins) ───────────────
// Elimina notificaciones de tipo new_recipe cuya receta ya no existe.
// Estrategia: 3 queries en total en lugar del patrón N+1 original.
exports.limpiarNotifHuerfanas = async (req, res) => {
  try {
    // 1. Obtener todos los recetaIds referenciados en notificaciones new_recipe
    const notifs = await Notification.find(
      { type: "new_recipe" },
      { _id: 1, recetaId: 1 },
    ).lean();

    if (!notifs.length) return res.json({ success: true, borradas: 0 });

    // 2. Identificar qué recetas siguen existiendo (una sola query)
    const recetaIds = [...new Set(
      notifs.map((n) => n.recetaId?.toString()).filter(Boolean),
    )];

    const existentes = await Recipe.find(
      { _id: { $in: recetaIds } },
      { _id: 1 },
    ).lean();

    const existentesSet = new Set(existentes.map((r) => r._id.toString()));

    // 3. Filtrar huérfanas y eliminar de una sola vez
    const huerfanasIds = notifs
      .filter((n) => !n.recetaId || !existentesSet.has(n.recetaId.toString()))
      .map((n) => n._id);

    if (!huerfanasIds.length) return res.json({ success: true, borradas: 0 });

    const { deletedCount } = await Notification.deleteMany({
      _id: { $in: huerfanasIds },
    });

    res.json({ success: true, borradas: deletedCount });
  } catch (error) {
    console.error("limpiarNotifHuerfanas error:", error);
    res.status(500).json({ error: "Error limpiando notificaciones" });
  }
};

// ─── DELETE /api/notifications/:id ───────────────────────────────────────────
exports.eliminarUna = async (req, res) => {
  try {
    const notif = await Notification.findOneAndDelete({
      _id:    req.params.id,
      userId: req.user._id,
    });
    if (!notif)
      return res.status(404).json({ error: "Notificación no encontrada" });
    res.json({ success: true });
  } catch (error) {
    console.error("eliminarUna error:", error);
    res.status(500).json({ error: "Error eliminando notificación" });
  }
};

// ─── Helpers internos (no expuestos como rutas HTTP) ─────────────────────────

exports.crearNotifRespuesta = async ({
  destinatarioId,
  fromUserId,
  fromUserName,
  recetaId,
  recetaNombre,
  resenaId,
  respuestaId,
  respuestaTexto,
}) => {
  // No notificar si alguien se responde a sí mismo
  if (destinatarioId.toString() === fromUserId.toString()) return;

  try {
    await Notification.create({
      userId:         destinatarioId,
      type:           "reply",
      fromUserId,
      fromUserName,
      recetaId,
      recetaNombre,
      resenaId,
      respuestaId,
      respuestaTexto: respuestaTexto?.slice(0, 120) || "",
    });
  } catch (err) {
    // No interrumpir el flujo principal si falla la notificación
    console.error("crearNotifRespuesta error:", err.message);
  }
};

exports.crearNotifNuevaReceta = async ({
  recetaId,
  recetaNombre,
  recetaCat,
  recetaSalud,
}) => {
  try {
    const usuarios = await User.find({}, "_id").lean();
    if (!usuarios.length) return;

    const notifs = usuarios.map((u) => ({
      userId:      u._id,
      type:        "new_recipe",
      recetaId,
      recetaNombre,
      recetaCat,
      recetaSalud: recetaSalud || [],
    }));

    await Notification.insertMany(notifs, { ordered: false });
  } catch (err) {
    console.error("crearNotifNuevaReceta error:", err.message);
  }
};