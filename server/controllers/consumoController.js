const Consumo  = require('../models/Consumo');
const Recipe   = require('../models/Recipe');

// ─── Utilidad: fecha y hora actual en Bogotá ───────────────────────────────
const bogotaAhora = () => {
  const ahora = new Date();
  // UTC-5 fijo (Bogotá no usa horario de verano)
  const offsetMs = -5 * 60 * 60 * 1000;
  const bogota   = new Date(ahora.getTime() + offsetMs);

  const yyyy = bogota.getUTCFullYear();
  const mm   = String(bogota.getUTCMonth() + 1).padStart(2, '0');
  const dd   = String(bogota.getUTCDate()).padStart(2, '0');
  const hh   = String(bogota.getUTCHours()).padStart(2, '0');
  const min  = String(bogota.getUTCMinutes()).padStart(2, '0');

  return {
    fecha: `${yyyy}-${mm}-${dd}`,   // 'YYYY-MM-DD'
    hora:  `${hh}:${min}`,          // 'HH:mm'
    hora24: bogota.getUTCHours(),   // número 0-23
  };
};

// ─── Determinar tipo según hora Bogotá ─────────────────────────────────────
const tipoSegunHora = (hora24) => {
  if (hora24 >= 6  && hora24 < 12) return 'desayuno';
  if (hora24 >= 12 && hora24 < 17) return 'almuerzo';
  return 'cena'; // 17:00 - 23:59 y 00:00 - 05:59
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/consumos/:recetaId — Registrar consumo
// ─────────────────────────────────────────────────────────────────────────────
exports.registrarConsumo = async (req, res) => {
  try {
    const { recetaId } = req.params;
    const userId = req.user._id;

    const receta = await Recipe.findById(recetaId);
    if (!receta) return res.status(404).json({ error: 'Receta no encontrada' });

    const { fecha, hora, hora24 } = bogotaAhora();
    const tipo = tipoSegunHora(hora24);

    // Verificar si ya existe consumo del mismo tipo hoy
    const existe = await Consumo.findOne({ userId, fechaBogota: fecha, tipo });
    if (existe) {
      return res.status(409).json({
        error: `Ya registraste un ${tipo} hoy`,
        consumo: existe,
      });
    }

    const consumo = await Consumo.create({
      userId,
      recetaId,
      recetaSnapshot: {
        nombre: receta.nombre,
        img:    receta.img,
        desc:   receta.desc,
      },
      tipo,
      fechaBogota: fecha,
      horaBogota:  hora,
      nutri: receta.nutri.toObject ? receta.nutri.toObject() : receta.nutri,
    });

    res.status(201).json({ consumo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/consumos/:consumoId — Cancelar consumo
// ─────────────────────────────────────────────────────────────────────────────
exports.cancelarConsumo = async (req, res) => {
  try {
    const consumo = await Consumo.findOne({
      _id:    req.params.consumoId,
      userId: req.user._id,
    });
    if (!consumo) return res.status(404).json({ error: 'Consumo no encontrado' });

    await consumo.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/consumos/:consumoId/tipo — Editar tipo (desayuno/almuerzo/cena)
// ─────────────────────────────────────────────────────────────────────────────
exports.editarTipo = async (req, res) => {
  try {
    const { tipo } = req.body;
    if (!['desayuno', 'almuerzo', 'cena'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo inválido' });
    }

    const consumo = await Consumo.findOne({
      _id:    req.params.consumoId,
      userId: req.user._id,
    });
    if (!consumo) return res.status(404).json({ error: 'Consumo no encontrado' });

    // Verificar que no haya ya otro consumo del mismo tipo en esa fecha
    const conflicto = await Consumo.findOne({
      userId:      req.user._id,
      fechaBogota: consumo.fechaBogota,
      tipo,
      _id:         { $ne: consumo._id },
    });
    if (conflicto) {
      return res.status(409).json({ error: `Ya tienes un ${tipo} registrado ese día` });
    }

    consumo.tipo = tipo;
    await consumo.save();
    res.json({ consumo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/consumos/manual — Añadir consumo manual (para días vacíos)
// Body: { recetaId, tipo, fecha }  — fecha: 'YYYY-MM-DD'
// ─────────────────────────────────────────────────────────────────────────────
exports.agregarManual = async (req, res) => {
  try {
    const { recetaId, tipo, fecha } = req.body;
    const userId = req.user._id;

    if (!['desayuno', 'almuerzo', 'cena'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo inválido' });
    }

    const receta = await Recipe.findById(recetaId);
    if (!receta) return res.status(404).json({ error: 'Receta no encontrada' });

    // Verificar duplicado
    const existe = await Consumo.findOne({ userId, fechaBogota: fecha, tipo });
    if (existe) {
      return res.status(409).json({ error: `Ya tienes un ${tipo} registrado ese día` });
    }

    const { hora } = bogotaAhora();

    const consumo = await Consumo.create({
      userId,
      recetaId,
      recetaSnapshot: {
        nombre: receta.nombre,
        img:    receta.img,
        desc:   receta.desc,
      },
      tipo,
      fechaBogota: fecha,
      horaBogota:  hora,
      nutri: receta.nutri.toObject ? receta.nutri.toObject() : receta.nutri,
    });

    res.status(201).json({ consumo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/consumos/hoy — Consumos de hoy en Bogotá
// ─────────────────────────────────────────────────────────────────────────────
exports.getHoy = async (req, res) => {
  try {
    const { fecha } = bogotaAhora();
    const consumos = await Consumo.find({
      userId:      req.user._id,
      fechaBogota: fecha,
    }).sort({ horaBogota: 1 });

    res.json({ fecha, consumos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/consumos/dias — Días únicos con consumos (para el selector)
// ─────────────────────────────────────────────────────────────────────────────
exports.getDiasConConsumos = async (req, res) => {
  try {
    const dias = await Consumo.distinct('fechaBogota', { userId: req.user._id });
    dias.sort((a, b) => b.localeCompare(a)); // más reciente primero
    res.json({ dias });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/consumos/dia/:fecha — Consumos de un día específico ('YYYY-MM-DD')
// ─────────────────────────────────────────────────────────────────────────────
exports.getDia = async (req, res) => {
  try {
    const consumos = await Consumo.find({
      userId:      req.user._id,
      fechaBogota: req.params.fecha,
    }).sort({ horaBogota: 1 });

    res.json({ consumos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/consumos/semana/:lunes — Consumos de una semana ('YYYY-MM-DD' del lunes)
// ─────────────────────────────────────────────────────────────────────────────
exports.getSemana = async (req, res) => {
  try {
    const lunes = req.params.lunes;
    // Calcular el domingo (6 días después del lunes)
    const d = new Date(lunes + 'T00:00:00Z');
    const domingo = new Date(d.getTime() + 6 * 24 * 60 * 60 * 1000);
    const domStr = domingo.toISOString().split('T')[0];

    const consumos = await Consumo.find({
      userId:      req.user._id,
      fechaBogota: { $gte: lunes, $lte: domStr },
    }).sort({ fechaBogota: 1, horaBogota: 1 });

    res.json({ semana: { inicio: lunes, fin: domStr }, consumos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/consumos/mes/:yearMes — Consumos de un mes ('YYYY-MM')
// ─────────────────────────────────────────────────────────────────────────────
exports.getMes = async (req, res) => {
  try {
    const yearMes = req.params.yearMes; // 'YYYY-MM'
    const consumos = await Consumo.find({
      userId:      req.user._id,
      fechaBogota: { $regex: `^${yearMes}` },
    }).sort({ fechaBogota: 1, horaBogota: 1 });

    res.json({ mes: yearMes, consumos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/consumos/receta/:recetaId/hoy — Verifica si ya consumió esta receta hoy
// ─────────────────────────────────────────────────────────────────────────────
exports.getConsumoHoyPorReceta = async (req, res) => {
  try {
    const { fecha, hora24 } = bogotaAhora();
    const tipoActual = tipoSegunHora(hora24);

    // Todos los consumos de hoy del usuario
    const consumosHoy = await Consumo.find({
      userId:      req.user._id,
      fechaBogota: fecha,
    });

    // El consumo de esta receta específica (si existe)
    const consumoReceta = consumosHoy.find(
      c => c.recetaId.toString() === req.params.recetaId
    );

    // Si ya hay un consumo del tipo actual (sin importar receta), no se puede registrar
    const consumoTipoActual = consumosHoy.find(c => c.tipo === tipoActual);

    res.json({
      tipoActual,
      consumoReceta:     consumoReceta || null,
      bloqueado:         !!consumoTipoActual && !consumoReceta,
      motivoBloqueado:   consumoTipoActual && !consumoReceta
        ? `Ya registraste un ${tipoActual} hoy`
        : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};