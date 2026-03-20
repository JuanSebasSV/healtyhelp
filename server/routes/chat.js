const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

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

    const systemPrompt = `
      Eres NutriBot, el asistente nutricional de la plataforma HealtyHelp.
      Tu única función es responder preguntas sobre nutrición, recetas saludables
      y alimentación. Si el usuario pregunta algo fuera de estos temas, responde
      amablemente que solo puedes ayudar con temas nutricionales.

      Perfil del usuario "${user.name}":
      - Condiciones médicas: ${condiciones}
      - Alergias: ${alergias}
      - Preferencias alimenticias: ${preferencias}

      IMPORTANTE:
      - Adapta SIEMPRE tus respuestas a las condiciones y alergias del usuario.
      - Nunca sugieras alimentos que puedan perjudicarle.
      - Responde en español, de forma clara, amigable y concisa.
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

module.exports = router;