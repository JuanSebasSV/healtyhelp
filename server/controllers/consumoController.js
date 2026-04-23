const Consumo  = require('../models/Consumo');
const Recipe   = require('../models/Recipe');

//  Utilidad: fecha y hora actual en Bogotá 
const bogotaAhora = () => {
  const ahora = new Date();
  const offsetMs = -5 * 60 * 60 * 1000;
  const bogota   = new Date(ahora.getTime() + offsetMs);

  const yyyy = bogota.getUTCFullYear();
  const mm   = String(bogota.getUTCMonth() + 1).padStart(2, '0');
  const dd   = String(bogota.getUTCDate()).padStart(2, '0');
  const hh   = String(bogota.getUTCHours()).padStart(2, '0');
  const min  = String(bogota.getUTCMinutes()).padStart(2, '0');

  return {
    fecha: `${yyyy}-${mm}-${dd}`,
    hora:  `${hh}:${min}`,
    hora24: bogota.getUTCHours(),
  };
};

//  Determinar tipo según hora Bogotá 
const tipoSegunHora = (hora24) => {
  if (hora24 >= 6  && hora24 < 12) return 'desayuno';
  if (hora24 >= 12 && hora24 < 17) return 'almuerzo';
  return 'cena';
};

//  Tipos válidos (incluye snack) 
const TIPOS_VALIDOS = ['desayuno', 'almuerzo', 'cena', 'snack'];

//  Límite de snacks por día 
const MAX_SNACKS_DIA = 3;

const verificarLimite = async (userId, fechaBogota, tipo) => {
  if (tipo === 'snack') {
    const count = await Consumo.countDocuments({ userId, fechaBogota, tipo: 'snack' });
    if (count >= MAX_SNACKS_DIA) {
      return { bloqueado: true, error: `Máximo ${MAX_SNACKS_DIA} snacks o postres por día` };
    }
  }
  // desayuno/almuerzo/cena: sin restricción de cantidad
  return { bloqueado: false };
};

//  Helper: extraer nutri de forma segura 
const extraerNutri = (receta) => {
  try {
    if (!receta.nutri) return {};
    return receta.nutri.toObject ? receta.nutri.toObject() : { ...receta.nutri };
  } catch {
    return receta.nutri || {};
  }
};

// 
// POST /api/consumos/:recetaId — Registrar consumo rápido (desde BtnConsumo)
// Detecta el tipo según la hora actual en Bogotá.
// 
exports.registrarConsumo = async (req, res) => {
  try {
    const { recetaId } = req.params;
    const userId = req.user._id;

    const receta = await Recipe.findById(recetaId);
    if (!receta) return res.status(404).json({ error: 'Receta no encontrada' });

    const { fecha, hora, hora24 } = bogotaAhora();

    // ✅ Si la receta es de categoría 'postres-snacks', usar tipo 'snack' automáticamente
    const tipo = receta.cat === 'postres-snacks' ? 'snack' : tipoSegunHora(hora24);

    const limite = await verificarLimite(userId, fecha, tipo);
    if (limite.bloqueado) {
      return res.status(409).json({ error: limite.error });
    }

    const consumo = await Consumo.create({
      userId,
      recetaId,
      recetaSnapshot: { nombre: receta.nombre, img: receta.img, desc: receta.desc },
      tipo,
      fechaBogota: fecha,
      horaBogota:  hora,
      nutri: extraerNutri(receta),
    });

    res.status(201).json({ consumo });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Ya existe un consumo de ese tipo para ese día' });
    }
    res.status(500).json({ error: err.message });
  }
};

// 
// DELETE /api/consumos/:consumoId — Cancelar consumo
// 
exports.cancelarConsumo = async (req, res) => {
  try {
    if (!req.params.consumoId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'ID de consumo inválido' });
    }

    const consumo = await Consumo.findOne({
      _id:    req.params.consumoId,
      userId: req.user._id,
    });

    if (!consumo) {
      return res.status(404).json({ error: 'Consumo no encontrado', alreadyDeleted: true });
    }

    await consumo.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'ID de consumo inválido' });
    }
    res.status(500).json({ error: err.message });
  }
};

// 
// PUT /api/consumos/:consumoId/tipo — Editar tipo
// ✅ NUEVO: ahora acepta 'snack' como tipo válido
// 
exports.editarTipo = async (req, res) => {
  try {
    const { tipo } = req.body;
    if (!TIPOS_VALIDOS.includes(tipo)) {
      return res.status(400).json({ error: 'Tipo inválido' });
    }

    if (!req.params.consumoId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'ID de consumo inválido' });
    }

    const consumo = await Consumo.findOne({
      _id:    req.params.consumoId,
      userId: req.user._id,
    });
    if (!consumo) return res.status(404).json({ error: 'Consumo no encontrado' });

    const limite = await verificarLimite(req.user._id, consumo.fechaBogota, tipo);
    // Para edición, excluir el consumo actual del conteo
    // (si el tipo no cambia, o si snack ya tiene espacio)
    if (limite.bloqueado && consumo.tipo !== tipo) {
      // Si es snack, verificar excluyendo el consumo actual
      if (tipo === 'snack') {
        const snacksOtros = await Consumo.countDocuments({
          userId: req.user._id,
          fechaBogota: consumo.fechaBogota,
          tipo: 'snack',
          _id: { $ne: consumo._id },
        });
        if (snacksOtros >= MAX_SNACKS_DIA) {
          return res.status(409).json({ error: `Máximo ${MAX_SNACKS_DIA} snacks o postres por día` });
        }
      } else {
        // Para comidas principales, verificar excluyendo el consumo actual
        const conflicto = await Consumo.findOne({
          userId:      req.user._id,
          fechaBogota: consumo.fechaBogota,
          tipo,
          _id:         { $ne: consumo._id },
        });
        if (conflicto) {
          return res.status(409).json({ error: `Ya tienes un ${tipo} registrado ese día` });
        }
      }
    }

    consumo.tipo = tipo;
    await consumo.save();
    res.json({ consumo });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'ID de consumo inválido' });
    }
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Ya existe un consumo de ese tipo para ese día' });
    }
    res.status(500).json({ error: err.message });
  }
};

// 
// POST /api/consumos/manual — Añadir consumo manual
// Body: { recetaId, tipo, fecha }
// ✅ El usuario elige cualquier receta en cualquier tipo — sin restricción por cat.
// ✅ 'snack' permite hasta MAX_SNACKS_DIA por día.
// 
exports.agregarManual = async (req, res) => {
  try {
    const { recetaId, tipo, fecha } = req.body;
    const userId = req.user._id;

    if (!TIPOS_VALIDOS.includes(tipo)) {
      return res.status(400).json({ error: 'Tipo inválido' });
    }

    if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return res.status(400).json({ error: 'Fecha inválida. Use formato YYYY-MM-DD' });
    }

    const receta = await Recipe.findById(recetaId);
    if (!receta) return res.status(404).json({ error: 'Receta no encontrada' });

    // ✅ Verificar límite según tipo (1 para comidas, 3 para snacks)
    const limite = await verificarLimite(userId, fecha, tipo);
    if (limite.bloqueado) {
      return res.status(409).json({ error: limite.error });
    }

    const { hora } = bogotaAhora();

    const consumo = await Consumo.create({
      userId,
      recetaId,
      recetaSnapshot: { nombre: receta.nombre, img: receta.img, desc: receta.desc },
      tipo,
      fechaBogota: fecha,
      horaBogota:  hora,
      nutri: extraerNutri(receta),
    });

    res.status(201).json({ consumo });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Ya existe un consumo de ese tipo para ese día' });
    }
    res.status(500).json({ error: err.message });
  }
};

// 
// GET /api/consumos/hoy
// 
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

// 
// GET /api/consumos/dias
// 
exports.getDiasConConsumos = async (req, res) => {
  try {
    const dias = await Consumo.distinct('fechaBogota', { userId: req.user._id });
    dias.sort((a, b) => b.localeCompare(a));
    res.json({ dias });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 
// GET /api/consumos/dia/:fecha
// 
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

// 
// GET /api/consumos/semana/:lunes
// 
exports.getSemana = async (req, res) => {
  try {
    const lunes = req.params.lunes;
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

// 
// GET /api/consumos/mes/:yearMes
// 
exports.getMes = async (req, res) => {
  try {
    const yearMes = req.params.yearMes;
    const inicio = `${yearMes}-01`;
    const [y, m]  = yearMes.split('-').map(Number);
    const nextMonth = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
    const fin = `${nextMonth}-01`;

    const consumos = await Consumo.find({
      userId:      req.user._id,
      fechaBogota: { $gte: inicio, $lt: fin },
    }).sort({ fechaBogota: 1, horaBogota: 1 });

    res.json({ mes: yearMes, consumos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 
// GET /api/consumos/receta/:recetaId/hoy
// ✅ NUEVO: también considera snacks (no bloquea si ya hay snacks, solo si
//    el tipo automático de la hora está lleno)
// 
exports.getConsumoHoyPorReceta = async (req, res) => {
  try {
    const { fecha, hora24 } = bogotaAhora();

    const receta = await Recipe.findById(req.params.recetaId).select('cat');
    const esSnack = receta?.cat === 'postres-snacks';
    const tipoActual = esSnack ? 'snack' : tipoSegunHora(hora24);

    const consumosHoy = await Consumo.find({
      userId:      req.user._id,
      fechaBogota: fecha,
    });

    const consumoReceta = consumosHoy.find(
      c => c.recetaId.toString() === req.params.recetaId
    );

    // Para snacks: bloqueado si ya hay 3 y esta receta no está entre ellos
    // Para comidas: bloqueado si ya hay 1 del mismo tipo y no es esta receta
    let bloqueado = false;
    let motivoBloqueado = null;

    if (!consumoReceta) {
      if (esSnack) {
        const snacksHoy = consumosHoy.filter(c => c.tipo === 'snack').length;
        if (snacksHoy >= MAX_SNACKS_DIA) {
          bloqueado = true;
          motivoBloqueado = `Máximo ${MAX_SNACKS_DIA} snacks o postres por día`;
        }
      } else {
        const consumoTipoActual = consumosHoy.find(c => c.tipo === tipoActual);
        if (consumoTipoActual) {
          bloqueado = true;
          motivoBloqueado = `Ya registraste un ${tipoActual} hoy`;
        }
      }
    }

    res.json({
      tipoActual,
      registrado:      !!consumoReceta,
      consumoId:       consumoReceta?._id || null,
      tipo:            consumoReceta?.tipo || null,
      bloqueado,
      motivoBloqueado,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};