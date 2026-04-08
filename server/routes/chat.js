const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const AIConfig = require('../models/AIConfig');
const Recipe = require('../models/Recipe.js');
const Precio = require('../models/Precios.js');


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/', protect, async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'El mensaje es requerido' });
    }

    const user = await User.findById(req.user._id);

    const condiciones = user.healthProfile?.condiciones?.length
      ? user.healthProfile.condiciones.join(', ')
      : 'ninguna indicada';

    const alergias = user.healthProfile?.alergias?.length
      ? user.healthProfile.alergias.join(', ')
      : 'ninguna indicada';

    const preferencias = user.healthProfile?.preferencias?.length
      ? user.healthProfile.preferencias.join(', ')
      : 'ninguna indicada';

    // Obtener recetas de la BD
    // Obtener recetas y precios de la BD
const recetas = await Recipe.find(
  {},
  'nombre desc cat salud ingredientes nutri.cal nutri.prot nutri.carb nutri.gras costoPorcion costoTotal porciones moneda ingredientesCosto'
).lean();

const recetasTexto = recetas.map(r => {
  const saludTags        = r.salud?.length ? r.salud.join(', ') : 'todos';
  const ingredientesList = r.ingredientes?.slice(0, 6).join(', ') || 'no especificados';
  const cal  = r.nutri?.cal  ?? 0;
  const prot = r.nutri?.prot ?? 0;
  const carb = r.nutri?.carb ?? 0;
  const gras = r.nutri?.gras ?? 0;

  // Costo
  const moneda       = r.moneda || 'COP';
  const costoPorcion = r.costoPorcion > 0 ? `${r.costoPorcion.toLocaleString('es-CO')} ${moneda}` : 'no disponible';
  const costoTotal   = r.costoTotal   > 0 ? `${r.costoTotal.toLocaleString('es-CO')} ${moneda}`   : 'no disponible';

  return `• ${r.nombre} [${r.cat}] | Apta para: ${saludTags} | Ingredientes principales: ${ingredientesList} | Nutrición: ${cal} kcal, ${prot}g proteína, ${carb}g carbs, ${gras}g grasas | Costo por porción: ${costoPorcion} | Costo total receta: ${costoTotal} (${r.porciones || 1} porciones) | Descripción: ${r.desc}`;
}).join('\n');

    let config = await AIConfig.findOne();
    if (!config) config = await AIConfig.create({});

    const systemPrompt = `
      ${config.prompt}

      RECETAS DISPONIBLES EN LA PLATAFORMA (${recetas.length} recetas):
      ${recetasTexto}

      Perfil del usuario "${user.name}":
      - Condiciones médicas: ${condiciones}
      - Alergias: ${alergias}
      - Preferencias alimenticias: ${preferencias}

      REGLAS IMPORTANTES:
      - Recomienda ÚNICAMENTE recetas de la lista anterior que existen en la plataforma.
      - Nunca inventes ni sugieras recetas que no estén en esa lista.
      - Filtra las recetas según las condiciones médicas y alergias del usuario.
      - Cuando recomiendes una receta, menciona su nombre exacto, categoría y por qué es adecuada para el usuario.
      - Si no hay recetas adecuadas para el usuario, indícalo amablemente.
      - Cuando el usuario pregunte por el costo de una receta, usa los campos "Costo por porción" y "Costo total receta".
      - Si el usuario menciona un presupuesto (ej: "tengo $20.000"), filtra y recomienda recetas cuyo costo por porción esté dentro de ese presupuesto.
      - Si una receta tiene costo "no disponible", indícalo amablemente sin inventar precios.
      - Los precios están en la moneda indicada entre paréntesis (COP, USD, EUR, MXN).
    `;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
    });

    const chatHistory = history.slice(-10).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    res.json({ reply });

  } catch (error) {
    console.error('❌ Error en chat:', error);

    if (error.status === 429) {
      return res.json({
        reply: 'Estoy recibiendo muchas consultas en este momento. Por favor intenta de nuevo en unos segundos.'
      });
    }

    res.status(500).json({ error: 'Error al procesar tu mensaje' });
  }
});

router.put('/health-profile', protect, async (req, res) => {
  try {
    const { condiciones, alergias, preferencias } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        healthProfile: {
          condiciones: condiciones || [],
          alergias: alergias || [],
          preferencias: preferencias || []
        }
      },
      { new: true }
    );

    res.json({
      message: 'Perfil de salud actualizado',
      healthProfile: user.healthProfile
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar perfil de salud' });
  }
});

router.get('/prompt', protect, async (req, res) => {
  try {
    let config = await AIConfig.findOne();
    if (!config) config = await AIConfig.create({});
    res.json({ prompt: config.prompt });
  } catch {
    res.status(500).json({ error: 'Error obteniendo prompt' });
  }
});

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