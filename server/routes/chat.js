const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { protect } = require("../middleware/auth");
const User = require("../models/User");
const AIConfig = require("../models/AIConfig");
const Recipe = require("../models/Recipe.js");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

//  Caché de configuración del bot (prompt base)
let _configCache = null;
let _configCacheAt = 0;
const CONFIG_TTL_MS = 60 * 1000; // 1 minuto

async function getConfig() {
  if (_configCache && Date.now() - _configCacheAt < CONFIG_TTL_MS)
    return _configCache;
  let config = await AIConfig.findOne();
  if (!config) config = await AIConfig.create({});
  _configCache = config;
  _configCacheAt = Date.now();
  return config;
}

//  Retry con backoff exponencial para errores de Gemini
async function callGeminiWithRetry(chat, message, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await chat.sendMessage(message);
      return result.response.text();
    } catch (err) {
      const isRateLimit =
        [429, 503, 500].includes(err.status) ||
        err.message?.includes("quota") ||
        err.message?.includes("overloaded");
      if (isRateLimit && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1500; // 1.5 s, 3 s, 6 s
        console.warn(
          `⚠️  Rate limit Gemini (intento ${attempt + 1}/${maxRetries}). Esperando ${delay} ms…`,
        );
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
}

function filtrarPorAlergias(recetas, alergias) {
  if (!alergias?.length) return recetas;

  // Normaliza a minúsculas para comparación insensible a mayúsculas/tildes
  const alergiasNorm = alergias.map((a) => a.toLowerCase().trim());

  return recetas.filter((receta) => {
    const ingredientes = receta.ingredientes ?? [];
    // Excluye la receta si algún ingrediente contiene una alergia como substring
    return !ingredientes.some((ing) =>
      alergiasNorm.some((al) => ing.toLowerCase().includes(al)),
    );
  });
}

//  POST /chat

router.post("/", protect, async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message)
      return res.status(400).json({ error: "El mensaje es requerido" });

    // Consultas en paralelo para reducir latencia
    const [user, todasLasRecetas, config] = await Promise.all([
      User.findById(req.user._id).select("name healthProfile").lean(),
      Recipe.find(
        {},
        "nombre desc cat salud ingredientes nutri.cal nutri.prot nutri.carb nutri.gras",
      ).lean(),
      getConfig(),
    ]);

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const hp = user.healthProfile || {};
    const condiciones = hp.condiciones?.length
      ? hp.condiciones.join(", ")
      : "ninguna";
    const categorias = hp.categorias?.length
      ? hp.categorias.join(", ")
      : "todas (sin restricción)";
    const alergias = hp.alergias?.length ? hp.alergias.join(", ") : "ninguna";
    const preferencias = hp.preferencias?.length
      ? hp.preferencias.join(", ")
      : "ninguna";

    // 1. Filtra por categoría (como antes)
    const catFiltro = hp.categorias || [];
    let recetasFiltradas = catFiltro.length
      ? todasLasRecetas.filter((r) => catFiltro.includes(r.cat))
      : todasLasRecetas;

    // 2. FIX C2: filtra por alergias a nivel de backend antes de enviar a Gemini
    recetasFiltradas = filtrarPorAlergias(recetasFiltradas, hp.alergias);

    const recetasTexto = recetasFiltradas
      .slice(0, 30)
      .map((r) => {
        const saludTags = r.salud?.length ? r.salud.join(", ") : "todos";
        const ingredientesList = r.ingredientes?.length
          ? r.ingredientes.slice(0, 6).join(", ")
          : "no especificados";
        return `• ${r.nombre} [${r.cat}] | Apta para: ${saludTags} | Ingredientes: ${ingredientesList} | Nutrición: ${r.nutri?.cal ?? 0} kcal, ${r.nutri?.prot ?? 0}g prot, ${r.nutri?.carb ?? 0}g carbs, ${r.nutri?.gras ?? 0}g grasas | ${r.desc}`;
      })
      .join("\n");

    // Detectar si es el primer mensaje del turno actual
    const esPrimerMensaje = history.length === 0;

    const systemPrompt = `
${config.prompt}

RECETAS DISPONIBLES (${recetasFiltradas.length}${catFiltro.length ? ` — filtradas por: ${categorias}` : ""}):
${recetasTexto}

Perfil de "${user.name}":
- Condiciones / dieta: ${condiciones}
- Tipo de comida activo: ${categorias}
- Alergias: ${alergias}
- Preferencias: ${preferencias}

REGLAS:
- Recomienda SOLO recetas de la lista anterior. Esa lista ya fue filtrada por alergias del usuario.
- Nunca inventes recetas que no estén en esa lista.
- Respeta condiciones médicas.
- Si el usuario pregunta qué filtros tiene activos, responde exactamente con los valores del perfil de arriba.
- Si condiciones = "ninguna", dile que no tiene condiciones seleccionadas.
- Si categorias = "todas (sin restricción)", dile que no tiene tipo de comida filtrado.
- ${
      esPrimerMensaje
        ? `Es el PRIMER mensaje. Saluda a ${user.name} por su nombre una sola vez, de forma breve y natural.`
        : `Ya saludaste antes. NO menciones el nombre del usuario ni lo saludes de nuevo. Ve directo a responder.`
    }
`.trim();

    const model = genAI.getGenerativeModel({
      model: "gmodel: 'gemini-2.0-flash",
      systemInstruction: systemPrompt,
    });

    let chatHistory = history.slice(-10).map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));

    while (chatHistory.length > 0 && chatHistory[0].role !== "user") {
      chatHistory.shift();
    }

    const chat = model.startChat({ history: chatHistory });
    const reply = await callGeminiWithRetry(chat, message);
    res.json({ reply });
  } catch (error) {
    console.error(
      "❌ Error en POST /chat:",
      error?.status,
      error?.message ?? error,
    );
    const status = error?.status ?? error?.httpStatus;
    if (
      [429, 503, 500, 400].includes(status) ||
      error?.message?.includes("quota")
    ) {
      return res.status(429).json({
        error: "rate_limit",
        reply:
          "Estoy recibiendo muchas consultas ahora mismo. Intenta de nuevo en unos segundos.",
      });
    }
    res.status(500).json({ error: "Error al procesar tu mensaje" });
  }
});

//  GET /chat/filtros

router.get("/filtros", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("healthProfile")
      .lean();
    res.json({
      condiciones: user.healthProfile?.condiciones || [],
      categorias: user.healthProfile?.categorias || [],
      alergias: user.healthProfile?.alergias || [],
      preferencias: user.healthProfile?.preferencias || [],
    });
  } catch (err) {
    console.error("❌ Error en GET /filtros:", err?.message ?? err);
    res.status(500).json({ error: "Error al obtener filtros" });
  }
});

//  PUT /chat/health-profile

router.put("/health-profile", protect, async (req, res) => {
  try {
    const { condiciones, categorias, alergias, preferencias } = req.body;

    const userActual = await User.findById(req.user._id)
      .select("healthProfile")
      .lean();
    const hp = userActual?.healthProfile || {};

    const nuevoHP = {
      condiciones: Array.isArray(condiciones)
        ? condiciones
        : hp.condiciones || [],
      categorias: Array.isArray(categorias) ? categorias : hp.categorias || [],
      alergias: Array.isArray(alergias) ? alergias : hp.alergias || [],
      preferencias: Array.isArray(preferencias)
        ? preferencias
        : hp.preferencias || [],
    };

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { healthProfile: nuevoHP } },
      { new: true, select: "healthProfile" },
    );

    res.json({
      message: "Perfil actualizado",
      healthProfile: updated.healthProfile,
    });
  } catch (err) {
    // FIX W3: log con detalle
    console.error("❌ Error en PUT /health-profile:", err?.message ?? err);
    res.status(500).json({ error: "Error al actualizar perfil de salud" });
  }
});

//  GET /chat/prompt

router.get("/prompt", protect, async (req, res) => {
  try {
    const config = await getConfig();
    res.json({ prompt: config.prompt });
  } catch (err) {
    console.error("❌ Error en GET /prompt:", err?.message ?? err);
    res.status(500).json({ error: "Error obteniendo prompt" });
  }
});

//  PUT /chat/prompt

router.put("/prompt", protect, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "El prompt no puede estar vacío" });
    }
    let config = await AIConfig.findOne();
    if (!config) config = await AIConfig.create({ prompt });
    else {
      config.prompt = prompt;
      await config.save();
    }
    _configCache = null; // invalida caché para que el siguiente request use el nuevo prompt
    res.json({ message: "Prompt actualizado", prompt: config.prompt });
  } catch (err) {
    console.error("❌ Error en PUT /prompt:", err?.message ?? err);
    res.status(500).json({ error: "Error guardando el prompt" });
  }
});

module.exports = router;
