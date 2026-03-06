const Recipe = require('../models/Recipe');
const AdminLog = require('../models/AdminLog');
const fs = require('fs').promises;
const path = require('path');

// 📤 Importar recetas desde JSON
exports.importRecipes = async (req, res) => {
  try {
    const { recipes, mode } = req.body;

    if (!Array.isArray(recipes)) {
      return res.status(400).json({ 
        error: 'Formato inválido: se esperaba un array de recetas' 
      });
    }

    // Validar estructura de cada receta
    const validRecipes = [];
    const errors = [];

    recipes.forEach((recipe, index) => {
      if (!recipe.nombre || !recipe.desc || !recipe.cat) {
        errors.push(`Receta ${index + 1}: Faltan campos obligatorios`);
      } else {
        validRecipes.push(recipe);
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({ 
        error: 'Algunas recetas tienen errores',
        details: errors
      });
    }

    let result = {};

    if (mode === 'replace') {
      const count = await Recipe.countDocuments();
      await Recipe.deleteMany({});
      const created = await Recipe.insertMany(validRecipes);
      result = {
        deleted: count,
        created: created.length
      };
    } else {
      const created = await Recipe.insertMany(validRecipes);
      result = {
        created: created.length
      };
    }

    // Log de auditoría
    await AdminLog.create({
      adminId: req.user._id,
      action: 'IMPORT_RECIPES',
      metadata: result
    });

    res.json({
      success: true,
      message: `${result.created} recetas importadas correctamente`,
      result
    });
  } catch (error) {
    console.error('Error importando recetas:', error);
    res.status(500).json({ 
      error: 'Error importando recetas',
      details: error.message 
    });
  }
};

// 📥 Exportar todas las recetas a JSON
exports.exportRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find().select('-__v').lean();

    res.json({
      success: true,
      count: recipes.length,
      recipes
    });
  } catch (error) {
    res.status(500).json({ error: 'Error exportando recetas' });
  }
};

// 📊 Obtener todas las recetas (con paginación y filtros)
exports.getAllRecipes = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      cat = '', 
      salud = '' 
    } = req.query;

    // Construir filtros
    const filters = {};
    
    if (search) {
      filters.$or = [
        { nombre: { $regex: search, $options: 'i' } },
        { desc: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (cat) {
      filters.cat = cat;
    }
    
    if (salud) {
      filters.salud = salud;
    }

    const total = await Recipe.countDocuments(filters);
    const recipes = await Recipe.find(filters)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json({
      success: true,
      recipes,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo recetas' });
  }
};

// 🔍 Obtener una receta por ID
exports.getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    res.json({ success: true, recipe });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo receta' });
  }
};

// ➕ Crear receta
exports.createRecipe = async (req, res) => {
  try {
    const recipeData = req.body;
    recipeData.createdBy = req.user._id;

    const recipe = await Recipe.create(recipeData);

    await AdminLog.create({
      adminId: req.user._id,
      action: 'CREATE_RECIPE',
      metadata: { recipeName: recipe.nombre, recipeId: recipe._id }
    });

    res.status(201).json({
      success: true,
      message: 'Receta creada correctamente',
      recipe
    });
  } catch (error) {
    console.error('Error creando receta:', error);
    res.status(500).json({ 
      error: 'Error creando receta',
      details: error.message 
    });
  }
};

// ✏️ Actualizar receta
exports.updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const recipe = await Recipe.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!recipe) {
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    await AdminLog.create({
      adminId: req.user._id,
      action: 'UPDATE_RECIPE',
      metadata: { recipeName: recipe.nombre, recipeId: recipe._id }
    });

    res.json({
      success: true,
      message: 'Receta actualizada correctamente',
      recipe
    });
  } catch (error) {
    console.error('Error actualizando receta:', error);
    res.status(500).json({ 
      error: 'Error actualizando receta',
      details: error.message 
    });
  }
};

// 🗑️ Eliminar receta
exports.deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = await Recipe.findByIdAndDelete(id);

    if (!recipe) {
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    // Eliminar imagen si existe
    if (recipe.img && recipe.img.includes('/uploads/')) {
      const imagePath = path.join(__dirname, '..', recipe.img);
      try {
        await fs.unlink(imagePath);
      } catch (err) {
        console.log('Error eliminando imagen:', err);
      }
    }

    await AdminLog.create({
      adminId: req.user._id,
      action: 'DELETE_RECIPE',
      metadata: { recipeName: recipe.nombre }
    });

    res.json({ 
      success: true, 
      message: 'Receta eliminada correctamente' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando receta' });
  }
};

// 🗑️ Eliminar múltiples recetas
exports.deleteMultipleRecipes = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'IDs inválidos' });
    }

    const result = await Recipe.deleteMany({ _id: { $in: ids } });

    await AdminLog.create({
      adminId: req.user._id,
      action: 'DELETE_MULTIPLE_RECIPES',
      metadata: { count: result.deletedCount }
    });

    res.json({
      success: true,
      message: `${result.deletedCount} recetas eliminadas`,
      deleted: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando recetas' });
  }
};

// 📊 Estadísticas de recetas
exports.getRecipeStats = async (req, res) => {
  try {
    const total = await Recipe.countDocuments();
    
    const byCategory = await Recipe.aggregate([
      { $group: { _id: '$cat', count: { $sum: 1 } } }
    ]);

    const byHealth = await Recipe.aggregate([
      { $unwind: '$salud' },
      { $group: { _id: '$salud', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      stats: {
        total,
        byCategory,
        byHealth
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
};