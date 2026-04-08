const express = require('express');
const router = express.Router();
const Precio = require('../models/Precios.js');
const Receta = require('../models/Recipe.js');

// Obtener todos los precios
router.get('/', async (req, res) => {
  try {
    const precios = await Precio.find().sort({ nombre: 1 });
    res.json(precios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear nuevo precio
router.post('/', async (req, res) => {
  try {
    const precio = new Precio({
      ...req.body,
      nombre: req.body.nombre.toLowerCase().trim(),
      ultima_actualizacion: new Date()
    });
    await precio.save();
    res.status(201).json(precio);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Actualizar precio — esto dispara la actualización en cascada
router.put('/:id', async (req, res) => {
  try {
    const precioActualizado = await Precio.findByIdAndUpdate(
      req.params.id,
      { ...req.body, ultima_actualizacion: new Date() },
      { new: true }
    );

    // Actualización en cascada: recalcular todas las recetas que usan este ingrediente
    await recalcularRecetasConIngrediente(precioActualizado.nombre);

    res.json(precioActualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar precio
router.delete('/:id', async (req, res) => {
  try {
    const precio = await Precio.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Precio eliminado', nombre: precio.nombre });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// Lógica de actualización en cascada
// =====================================================
async function recalcularRecetasConIngrediente(nombreIngrediente) {
  // Buscar recetas que tengan ese ingrediente en ingredientesCosto
  const recetas = await Receta.find({
    'ingredientesCosto.nombre': new RegExp(`^${nombreIngrediente}$`, 'i')
  });

  for (const receta of recetas) {
    // Obtener todos los nombres de ingredientesCosto de esta receta
    const nombres = receta.ingredientesCosto.map(i => i.nombre.toLowerCase().trim());

    // Traer todos los precios de esos ingredientes de una sola vez
    const precios = await Precio.find({
      nombre: { $in: nombres }
    });

    const mapaPrecios = {};
    precios.forEach(p => { mapaPrecios[p.nombre.toLowerCase().trim()] = p.precio_unidad; });

    let costoTotal = 0;

    const ingredientesCostoActualizado = receta.ingredientesCosto.map(ing => {
      const key = ing.nombre.toLowerCase().trim();
      const nuevoCosto = mapaPrecios[key] !== undefined
        ? mapaPrecios[key]
        : ing.costo; // si no hay precio en BD, conservar el manual

      costoTotal += nuevoCosto || 0;

      return {
        nombre: ing.nombre,
        cantidad: ing.cantidad,
        costo: nuevoCosto || 0,
      };
    });

    const porciones = receta.porciones || 1;

    await Receta.findByIdAndUpdate(receta._id, {
      ingredientesCosto: ingredientesCostoActualizado,
      costoTotal: Math.round(costoTotal * 100) / 100,
      costoPorcion: Math.round((costoTotal / porciones) * 100) / 100,
    });
  }
}

module.exports = router;
module.exports.recalcularRecetasConIngrediente = recalcularRecetasConIngrediente;