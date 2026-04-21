const Notification = require("../models/Notification");
const User = require("../models/User");

// ─────────────────────────────────────────────
// GET /api/notifications
// Devuelve las últimas 30 notificaciones del usuario autenticado
// ─────────────────────────────────────────────
exports.getMisNotificaciones = async (req, res) => {
  try {
    const notifs = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const noLeidas = notifs.filter((n) => !n.leida).length;

    res.json({ success: true, notificaciones: notifs, noLeidas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo notificaciones" });
  }
};

// ─────────────────────────────────────────────
// PUT /api/notifications/leer-todas
// Marca todas las notificaciones del usuario como leídas
// ─────────────────────────────────────────────
exports.leerTodas = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, leida: false },
      { $set: { leida: true } },
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error marcando notificaciones" });
  }
};

// ─────────────────────────────────────────────
// PUT /api/notifications/:id/leer
// Marca una notificación específica como leída
// ─────────────────────────────────────────────
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
    res.status(500).json({ error: "Error marcando notificación" });
  }
};

// ─────────────────────────────────────────────
// GET /api/notifications/no-leidas
// Devuelve solo el conteo de no leídas (para el badge del navbar)
// ─────────────────────────────────────────────
exports.contarNoLeidas = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user._id,
      leida: false,
    });
    res.json({ success: true, noLeidas: count });
  } catch (error) {
    res.status(500).json({ error: "Error contando notificaciones" });
  }
};

// ─────────────────────────────────────────────
// POST /api/notifications/mensaje
// Solo admins — envía un mensaje a un usuario específico
// Body: { userId, asunto, mensaje }
// ─────────────────────────────────────────────
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
      userId: destino._id,
      type: "message",
      adminId: req.user._id,
      adminName: req.user.name,
      asunto: asunto.trim().slice(0, 120),
      mensaje: mensaje.trim(),
    });

    res.status(201).json({ success: true, message: "Mensaje enviado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error enviando mensaje" });
  }
};

// ─────────────────────────────────────────────
// Función interna (no ruta) — usada desde recipeController
// Crea una notificación de tipo 'reply'
// ─────────────────────────────────────────────
exports.crearNotifRespuesta = async ({
  destinatarioId, // ObjectId del autor del comentario original
  fromUserId,
  fromUserName,
  recetaId,
  recetaNombre,
  resenaId,
  respuestaId,    // _id de la respuesta nueva — necesario para el deep-link
  respuestaTexto,
}) => {
  // No notificar si alguien se responde a sí mismo
  if (destinatarioId.toString() === fromUserId.toString()) return;

  try {
    await Notification.create({
      userId: destinatarioId,
      type: "reply",
      fromUserId,
      fromUserName,
      recetaId,
      recetaNombre,
      resenaId,
      respuestaId,  // ← guardado para que el frontend pueda hacer scroll directo
      respuestaTexto: respuestaTexto?.slice(0, 120) || "",
    });
  } catch (err) {
    // No interrumpir el flujo principal si falla la notificación
    console.error("Error creando notificación de respuesta:", err.message);
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
      userId: u._id,
      type: "new_recipe",
      recetaId,
      recetaNombre,
      recetaCat,
      recetaSalud: recetaSalud || [],
    }));

    await Notification.insertMany(notifs, { ordered: false });
  } catch (err) {
    console.error("Error creando notificaciones de nueva receta:", err.message);
  }
};

exports.limpiarNotifHuerfanas = async (req, res) => {
  try {
    const Recipe = require("../models/Recipe");
    const notifs = await Notification.find({ type: "new_recipe" });
    let borradas = 0;
    for (const n of notifs) {
      const existe = await Recipe.findById(n.recetaId);
      if (!existe) {
        await Notification.deleteOne({ _id: n._id });
        borradas++;
      }
    }
    res.json({ success: true, borradas });
  } catch (error) {
    res.status(500).json({ error: "Error limpiando notificaciones" });
  }
};

exports.eliminarUna = async (req, res) => {
  try {
    const notif = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!notif)
      return res.status(404).json({ error: "Notificación no encontrada" });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error eliminando notificación" });
  }
};