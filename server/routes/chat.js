const express = require('express');
const router  = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { protect } = require('../middleware/auth');
const User     = require('../models/User');
const AIConfig = require('../models/AIConfig');
const Recipe   = require('../models/Recipe.js');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── POST /chat ───────────────────────────────────────────────────────────────

router.post('/', protect, async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ error: 'El mensaje es requerido' });

    // Selección explícita para garantizar que healthProfile llega completo
    const user = await User.findById(req.user._id)
      .select('name healthProfile')
      .lean();

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const hp           = user.healthProfile || {};
    const condiciones  = hp.condiciones?.length  ? hp.condiciones.join(', ')  : 'ninguna';
    const categorias   = hp.categorias?.length   ? hp.categorias.join(', ')   : 'todas (sin restricción)';
    const alergias     = hp.alergias?.length     ? hp.alergias.join(', ')     : 'ninguna';
    const preferencias = hp.preferencias?.length ? hp.preferencias.join(', ') : 'ninguna';

    const recetas = await Recipe.find(
      {},
      'nombre desc cat salud ingredientes nutri.cal nutri.prot nutri.carb nutri.gras'
    ).lean();

    const catFiltro       = hp.categorias || [];
    const recetasFiltradas = catFiltro.length
      ? recetas.filter(r => catFiltro.includes(r.cat))
      : recetas;

    const recetasTexto = recetasFiltradas.map(r => {
      const saludTags        = r.salud?.length        ? r.salud.join(', ')                  : 'todos';
      const ingredientesList = r.ingredientes?.length ? r.ingredientes.slice(0, 6).join(', ') : 'no especificados';
      return `• ${r.nombre} [${r.cat}] | Apta para: ${saludTags} | Ingredientes: ${ingredientesList} | Nutrición: ${r.nutri?.cal ?? 0} kcal, ${r.nutri?.prot ?? 0}g prot, ${r.nutri?.carb ?? 0}g carbs, ${r.nutri?.gras ?? 0}g grasas | ${r.desc}`;
    }).join('\n');

    let config = await AIConfig.findOne();
    if (!config) config = await AIConfig.create({});


    // Detectar si es el primer mensaje del turno actual
    const esPrimerMensaje = history.length === 0;
    const systemPrompt = `
${config.prompt}

RECETAS DISPONIBLES (${recetasFiltradas.length}${catFiltro.length ? ` — filtradas por: ${categorias}` : ''}):
${recetasTexto}

Perfil de "${user.name}":
- Condiciones / dieta: ${condiciones}
- Tipo de comida activo: ${categorias}
- Alergias: ${alergias}
- Preferencias: ${preferencias}

REGLAS:
- Recomienda SOLO recetas de la lista anterior.
- Nunca inventes recetas que no estén en esa lista.
- Respeta condiciones médicas y alergias.
- Si el usuario pregunta qué filtros tiene activos, responde exactamente con los valores del perfil de arriba, sin inventar ni asumir nada.
- Si condiciones = "ninguna", dile que no tiene condiciones seleccionadas.
- Si categorias = "todas (sin restricción)", dile que no tiene tipo de comida filtrado.
- ${esPrimerMensaje
    ? `Es el PRIMER mensaje. Saluda a ${user.name} por su nombre una sola vez, de forma breve y natural.`
    : `Ya saludaste antes. NO menciones el nombre del usuario ni lo saludes de nuevo. Ve directo a responder.`
  }
`.trim();

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
    });

    const chatHistory = history.slice(-10).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));

    const chat   = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message);
    res.json({ reply: result.response.text() });

  } catch (error) {
    console.error('❌ Error en chat:', error);
    if (error.status === 429) {
      return res.json({ reply: 'Estoy recibiendo muchas consultas ahora mismo. Intenta de nuevo en unos segundos.' });
    }
    res.status(500).json({ error: 'Error al procesar tu mensaje' });
  }
});

// ─── GET /chat/filtros ────────────────────────────────────────────────────────

router.get('/filtros', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('healthProfile')
      .lean();
    res.json({
      condiciones:  user.healthProfile?.condiciones  || [],
      categorias:   user.healthProfile?.categorias   || [],
      alergias:     user.healthProfile?.alergias     || [],
      preferencias: user.healthProfile?.preferencias || [],
    });
  } catch {
    res.status(500).json({ error: 'Error al obtener filtros' });
  }
});

// ─── GET /chat/debug-perfil ───────────────────────────────────────────────────
// Ruta temporal de diagnóstico — muestra exactamente lo que hay en MongoDB
// ELIMINAR después de confirmar que los datos son correctos

router.get('/debug-perfil', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('name email healthProfile')
      .lean();
    res.json({
      userId:       req.user._id,
      name:         user?.name,
      email:        user?.email,
      healthProfile: user?.healthProfile,
      tokenUserId:  req.user._id?.toString(),
      match:        user?._id?.toString() === req.user._id?.toString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /chat/health-profile ─────────────────────────────────────────────────

router.put('/health-profile', protect, async (req, res) => {
  try {
    const { condiciones, categorias, alergias, preferencias } = req.body;

    const userActual = await User.findById(req.user._id)
      .select('healthProfile')
      .lean();
    const hp = userActual?.healthProfile || {};

    const nuevoHP = {
      condiciones:  Array.isArray(condiciones)  ? condiciones  : hp.condiciones  || [],
      categorias:   Array.isArray(categorias)   ? categorias   : hp.categorias   || [],
      alergias:     Array.isArray(alergias)     ? alergias     : hp.alergias     || [],
      preferencias: Array.isArray(preferencias) ? preferencias : hp.preferencias || [],
    };

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { healthProfile: nuevoHP } },
      { new: true, select: 'healthProfile' }
    );

    res.json({ message: 'Perfil actualizado', healthProfile: updated.healthProfile });
  } catch {
    res.status(500).json({ error: 'Error al actualizar perfil de salud' });
  }
});

// ─── GET /chat/prompt ─────────────────────────────────────────────────────────

router.get('/prompt', protect, async (req, res) => {
  try {
    let config = await AIConfig.findOne();
    if (!config) config = await AIConfig.create({});
    res.json({ prompt: config.prompt });
  } catch {
    res.status(500).json({ error: 'Error obteniendo prompt' });
  }
});

// ─── PUT /chat/prompt ─────────────────────────────────────────────────────────

router.put('/prompt', protect, async (req, res) => {
  try {
    const { prompt } = req.body;
    let config = await AIConfig.findOne();
    if (!config) config = await AIConfig.create({ prompt });
    else { config.prompt = prompt; await config.save(); }
    res.json({ message: 'Prompt actualizado', prompt: config.prompt });
  } catch {
    res.status(500).json({ error: 'Error guardando el prompt' });
  }
});

module.exports = router;