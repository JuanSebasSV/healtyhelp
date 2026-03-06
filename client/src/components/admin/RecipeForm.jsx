import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import './RecipeForm.css';

const RecipeForm = ({ recipe, onSuccess, onCancel }) => {
  const isEditing = !!recipe;
  
  const [formData, setFormData] = useState({
    nombre: '',
    desc: '',
    img: '',
    cat: 'almuerzo',
    salud: [],
    puntos: 0,
    ingredientes: [''],
    pasos: [''],
    nutri: {
      cal: 0, prot: 0, carb: 0, gras: 0, fiber: 0, sodio: 0
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [showAdvancedNutri, setShowAdvancedNutri] = useState(false);

  const categorias = [
    { id: 'desayuno', nombre: 'Desayuno' },
    { id: 'almuerzo', nombre: 'Almuerzo' },
    { id: 'cena', nombre: 'Cena' },
    { id: 'postres-snacks', nombre: 'Postres & Snacks' }
  ];

  const condicionesSalud = [
    'diabetes', 'hipertension', 'celiaco', 'intolerancia-lactosa',
    'vegano', 'vegetariano', 'bajo-sodio', 'bajo-carbohidratos',
    'keto', 'paleo', 'sin-frutos-secos', 'sin-mariscos',
    'bajo-grasa', 'sin-azucar', 'colesterol-alto', 'enfermedad-renal',
    'gastritis', 'sindrome-intestino'
  ];

  useEffect(() => {
    if (recipe) {
      setFormData({
        ...recipe,
        ingredientes: recipe.ingredientes || [''],
        pasos: recipe.pasos || [''],
        nutri: recipe.nutri || {
          cal: 0, prot: 0, carb: 0, gras: 0, fiber: 0, sodio: 0
        }
      });
    }
  }, [recipe]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNutriChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      nutri: {
        ...prev.nutri,
        [field]: parseFloat(value) || 0
      }
    }));
  };

  const handleSaludToggle = (condicion) => {
    setFormData(prev => {
      const saludArray = prev.salud || [];
      const exists = saludArray.includes(condicion);
      
      return {
        ...prev,
        salud: exists
          ? saludArray.filter(s => s !== condicion)
          : [...saludArray, condicion]
      };
    });
  };

  const handleIngredienteChange = (index, value) => {
    const newIngredientes = [...formData.ingredientes];
    newIngredientes[index] = value;
    setFormData(prev => ({ ...prev, ingredientes: newIngredientes }));
  };

  const addIngrediente = () => {
    setFormData(prev => ({
      ...prev,
      ingredientes: [...prev.ingredientes, '']
    }));
  };

  const removeIngrediente = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredientes: prev.ingredientes.filter((_, i) => i !== index)
    }));
  };

  const handlePasoChange = (index, value) => {
    const newPasos = [...formData.pasos];
    newPasos[index] = value;
    setFormData(prev => ({ ...prev, pasos: newPasos }));
  };

  const addPaso = () => {
    setFormData(prev => ({
      ...prev,
      pasos: [...prev.pasos, '']
    }));
  };

  const removePaso = (index) => {
    setFormData(prev => ({
      ...prev,
      pasos: prev.pasos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación
    if (!formData.nombre || !formData.desc || !formData.cat) {
      toast.error('❌ Completa los campos obligatorios');
      return;
    }

    // Limpiar arrays vacíos
    const cleanData = {
      ...formData,
      ingredientes: formData.ingredientes.filter(i => i.trim()),
      pasos: formData.pasos.filter(p => p.trim())
    };

    setLoading(true);

    try {
      if (isEditing) {
        await api.put(`/recipes/${recipe._id}`, cleanData);
        toast.success('✅ Receta actualizada correctamente');
      } else {
        await api.post('/recipes', cleanData);
        toast.success('✅ Receta creada correctamente');
      }
      
      onSuccess();
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error guardando receta';
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recipe-form">
      <h2>{isEditing ? '✏️ Editar Receta' : '➕ Crear Nueva Receta'}</h2>

      <form onSubmit={handleSubmit}>
        {/* Información Básica */}
        <div className="form-section">
          <h3>📋 Información Básica</h3>

          <div className="form-group">
            <label>Nombre de la Receta *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Ensalada Mediterránea"
              required
            />
          </div>

          <div className="form-group">
            <label>Descripción *</label>
            <textarea
              name="desc"
              value={formData.desc}
              onChange={handleChange}
              placeholder="Describe brevemente la receta..."
              rows="3"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>URL de Imagen *</label>
              <input
                type="url"
                name="img"
                value={formData.img}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

            <div className="form-group">
              <label>Categoría *</label>
              <select
                name="cat"
                value={formData.cat}
                onChange={handleChange}
                required
              >
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Puntuación (0-5)</label>
              <input
                type="number"
                name="puntos"
                value={formData.puntos}
                onChange={handleChange}
                min="0"
                max="5"
                step="0.1"
              />
            </div>
          </div>
        </div>

        {/* Condiciones de Salud */}
        <div className="form-section">
          <h3>🏥 Condiciones de Salud</h3>
          <div className="salud-grid">
            {condicionesSalud.map(condicion => (
              <label key={condicion} className="salud-checkbox">
                <input
                  type="checkbox"
                  checked={formData.salud?.includes(condicion)}
                  onChange={() => handleSaludToggle(condicion)}
                />
                <span>{condicion.replace(/-/g, ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Ingredientes */}
        <div className="form-section">
          <h3>🥗 Ingredientes</h3>
          {formData.ingredientes.map((ingrediente, index) => (
            <div key={index} className="dynamic-input">
              <input
                type="text"
                value={ingrediente}
                onChange={(e) => handleIngredienteChange(index, e.target.value)}
                placeholder={`Ingrediente ${index + 1}`}
              />
              {formData.ingredientes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngrediente(index)}
                  className="btn-remove"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addIngrediente}
            className="btn-add"
          >
            ➕ Agregar Ingrediente
          </button>
        </div>

        {/* Pasos */}
        <div className="form-section">
          <h3>👨‍🍳 Pasos de Preparación</h3>
          {formData.pasos.map((paso, index) => (
            <div key={index} className="dynamic-input">
              <span className="paso-number">{index + 1}.</span>
              <textarea
                value={paso}
                onChange={(e) => handlePasoChange(index, e.target.value)}
                placeholder={`Paso ${index + 1}`}
                rows="2"
              />
              {formData.pasos.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePaso(index)}
                  className="btn-remove"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addPaso}
            className="btn-add"
          >
            ➕ Agregar Paso
          </button>
        </div>

        {/* Información Nutricional Básica */}
        <div className="form-section">
          <h3>📊 Información Nutricional Básica</h3>
          <div className="nutri-grid">
            <div className="form-group">
              <label>Calorías</label>
              <input
                type="number"
                value={formData.nutri.cal || 0}
                onChange={(e) => handleNutriChange('cal', e.target.value)}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Proteínas (g)</label>
              <input
                type="number"
                value={formData.nutri.prot || 0}
                onChange={(e) => handleNutriChange('prot', e.target.value)}
                min="0"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label>Carbohidratos (g)</label>
              <input
                type="number"
                value={formData.nutri.carb || 0}
                onChange={(e) => handleNutriChange('carb', e.target.value)}
                min="0"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label>Grasas (g)</label>
              <input
                type="number"
                value={formData.nutri.gras || 0}
                onChange={(e) => handleNutriChange('gras', e.target.value)}
                min="0"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label>Fibra (g)</label>
              <input
                type="number"
                value={formData.nutri.fiber || 0}
                onChange={(e) => handleNutriChange('fiber', e.target.value)}
                min="0"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label>Sodio (mg)</label>
              <input
                type="number"
                value={formData.nutri.sodio || 0}
                onChange={(e) => handleNutriChange('sodio', e.target.value)}
                min="0"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvancedNutri(!showAdvancedNutri)}
            className="btn-toggle-advanced"
          >
            {showAdvancedNutri ? '▼' : '▶'} Información Nutricional Avanzada
          </button>

          {showAdvancedNutri && (
            <div className="advanced-nutri">
              <p className="nutri-note">
                💡 Tip: Deja en 0 los valores que no conozcas. Puedes agregarlos después.
              </p>
              
              <h4>Minerales</h4>
              <div className="nutri-grid">
                <div className="form-group">
                  <label>Calcio (mg)</label>
                  <input
                    type="number"
                    value={formData.nutri.calcio || 0}
                    onChange={(e) => handleNutriChange('calcio', e.target.value)}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Hierro (mg)</label>
                  <input
                    type="number"
                    value={formData.nutri.hierro || 0}
                    onChange={(e) => handleNutriChange('hierro', e.target.value)}
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label>Potasio (mg)</label>
                  <input
                    type="number"
                    value={formData.nutri.potasio || 0}
                    onChange={(e) => handleNutriChange('potasio', e.target.value)}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Magnesio (mg)</label>
                  <input
                    type="number"
                    value={formData.nutri.magnesio || 0}
                    onChange={(e) => handleNutriChange('magnesio', e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              <h4>Vitaminas</h4>
              <div className="nutri-grid">
                <div className="form-group">
                  <label>Vitamina A (mcg)</label>
                  <input
                    type="number"
                    value={formData.nutri.vitA || 0}
                    onChange={(e) => handleNutriChange('vitA', e.target.value)}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Vitamina C (mg)</label>
                  <input
                    type="number"
                    value={formData.nutri.vitC || 0}
                    onChange={(e) => handleNutriChange('vitC', e.target.value)}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Vitamina D (mcg)</label>
                  <input
                    type="number"
                    value={formData.nutri.vitD || 0}
                    onChange={(e) => handleNutriChange('vitD', e.target.value)}
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label>Vitamina E (mg)</label>
                  <input
                    type="number"
                    value={formData.nutri.vitE || 0}
                    onChange={(e) => handleNutriChange('vitE', e.target.value)}
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>

              <h4>Azúcares</h4>
              <div className="nutri-grid">
                <div className="form-group">
                  <label>Azúcar Total (g)</label>
                  <input
                    type="number"
                    value={formData.nutri.azucar || 0}
                    onChange={(e) => handleNutriChange('azucar', e.target.value)}
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label>Glucosa (g)</label>
                  <input
                    type="number"
                    value={formData.nutri.glucosa || 0}
                    onChange={(e) => handleNutriChange('glucosa', e.target.value)}
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label>Fructosa (g)</label>
                  <input
                    type="number"
                    value={formData.nutri.fructosa || 0}
                    onChange={(e) => handleNutriChange('fructosa', e.target.value)}
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>

              <h4>Grasas Detalladas</h4>
              <div className="nutri-grid">
                <div className="form-group">
                  <label>Saturadas (g)</label>
                  <input
                    type="number"
                    value={formData.nutri.grasSat || 0}
                    onChange={(e) => handleNutriChange('grasSat', e.target.value)}
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label>Monoinsaturadas (g)</label>
                  <input
                    type="number"
                    value={formData.nutri.grasMonoins || 0}
                    onChange={(e) => handleNutriChange('grasMonoins', e.target.value)}
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label>Poliinsaturadas (g)</label>
                  <input
                    type="number"
                    value={formData.nutri.grasPoliins || 0}
                    onChange={(e) => handleNutriChange('grasPoliins', e.target.value)}
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label>Omega-3 (g)</label>
                  <input
                    type="number"
                    value={formData.nutri.omega3 || 0}
                    onChange={(e) => handleNutriChange('omega3', e.target.value)}
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-cancel"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? '⏳ Guardando...' : isEditing ? '💾 Actualizar Receta' : '➕ Crear Receta'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecipeForm;