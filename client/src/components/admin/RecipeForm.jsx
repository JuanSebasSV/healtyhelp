import { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import './RecipeForm.css';

const IcoInfo    = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:'7px',flexShrink:0}}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IcoSalud   = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:'7px',flexShrink:0}}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>;
const IcoIng     = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:'7px',flexShrink:0}}><path d="M2 22c1.25-.987 2.27-1.975 3.9-2.2a5.56 5.56 0 0 1 3.8 1.5 4 4 0 0 0 6.187-2.353 3.5 3.5 0 0 0 3.69-5.116A3.5 3.5 0 0 0 20.95 8 3.5 3.5 0 1 0 16 3.05a3.5 3.5 0 0 0-5.831 1.373 3.5 3.5 0 0 0-5.116 3.69 4 4 0 0 0-2.348 6.155C3.499 15.42 4.409 16.712 4.2 18.1 3.926 19.743 3.014 20.732 2 22"/></svg>;
const IcoPasos   = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:'7px',flexShrink:0}}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
const IcoNutri   = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:'7px',flexShrink:0}}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcoX       = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoPlus    = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{verticalAlign:'middle',marginRight:'5px'}}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoSave    = () => <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:'6px'}}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IcoEdit2   = () => <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:'6px'}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;


const NumeroInput = ({ value, onChange, min, max, step, name, placeholder }) => {
  const s = parseFloat(step) || 1;
  const increment = () => {
    const v = parseFloat(value) ?? (min ?? 0);
    if (max !== undefined && v >= max) return;
    onChange({ target: { name, value: String(parseFloat((v + s).toFixed(4))) } });
  };
  const decrement = () => {
    const v = parseFloat(value) ?? (min ?? 0);
    if (min !== undefined && v <= min) return;
    onChange({ target: { name, value: String(parseFloat((v - s).toFixed(4))) } });
  };
  return (
    <div className="numero-wrapper">
      <input type="number" name={name} value={value} onChange={onChange}
        placeholder={placeholder} min={min} max={max} step={step}
        style={{width:'100%', paddingRight:'2.2rem'}}
      />
      <div className="numero-flechas">
        <button type="button" onClick={increment}><svg viewBox="0 0 24 24" fill="none"><polyline points="18 15 12 9 6 15"/></svg></button>
        <button type="button" onClick={decrement}><svg viewBox="0 0 24 24" fill="none"><polyline points="6 9 12 15 18 9"/></svg></button>
      </div>
    </div>
  );
};

const RecipeForm = ({ recipe, onSuccess, onCancel }) => {
  const isEditing = !!recipe;

  const [formData, setFormData] = useState({
    nombre: '', desc: '', img: '', cat: 'almuerzo',
    salud: [], puntos: 0, ingredientes: [''], pasos: [''],
    tiempoMinutos: 0,  
    nutri: { cal: 0, prot: 0, carb: 0, gras: 0, fiber: 0, sodio: 0 }
  });

  const [loading, setLoading] = useState(false);
  const [showAdvancedNutri, setShowAdvancedNutri] = useState(false);
  const DRAFT_KEY = 'recipe_form_draft';

  // Recuperar borrador solo al crear (no al editar)
  useEffect(() => {
    if (!isEditing) {
      try {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) setFormData(JSON.parse(saved));
      } catch {}
    }
  }, [isEditing]);

  // Guardar borrador mientras escribe (solo al crear)
  useEffect(() => {
    if (!isEditing) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    }
  }, [formData, isEditing]);

  const categorias = [
    { id: 'desayuno', nombre: 'Desayuno' },
    { id: 'almuerzo', nombre: 'Almuerzo' },
    { id: 'cena', nombre: 'Cena' },
    { id: 'postres-snacks', nombre: 'Postres & Snacks' }
  ];

  const condicionesSalud = [
    'diabetes','hipertension','celiaco','intolerancia-lactosa',
    'vegano','vegetariano','bajo-sodio','bajo-carbohidratos',
    'keto','paleo','sin-frutos-secos','sin-mariscos',
    'bajo-grasa','sin-azucar','colesterol-alto','enfermedad-renal',
    'gastritis','sindrome-intestino'
  ];

  useEffect(() => {
    if (recipe) {
      setFormData({
        ...recipe,
        ingredientes: recipe.ingredientes || [''],
        pasos: recipe.pasos || [''],
        nutri: recipe.nutri || { cal:0, prot:0, carb:0, gras:0, fiber:0, sodio:0 }
      });
    }
  }, [recipe]);

  const handleChange       = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleNutriChange  = (field, value) => setFormData(prev => ({ ...prev, nutri: { ...prev.nutri, [field]: parseFloat(value) || 0 } }));
  const handleSaludToggle  = (c) => setFormData(prev => ({ ...prev, salud: prev.salud?.includes(c) ? prev.salud.filter(s => s !== c) : [...(prev.salud||[]), c] }));
  const handleIngChange    = (i, v) => { const a = [...formData.ingredientes]; a[i] = v; setFormData(p => ({ ...p, ingredientes: a })); };
  const handlePasoChange   = (i, v) => { const a = [...formData.pasos]; a[i] = v; setFormData(p => ({ ...p, pasos: a })); };
  const addIngrediente     = () => setFormData(p => ({ ...p, ingredientes: [...p.ingredientes, ''] }));
  const removeIngrediente  = (i) => setFormData(p => ({ ...p, ingredientes: p.ingredientes.filter((_,x) => x !== i) }));
  const addPaso            = () => setFormData(p => ({ ...p, pasos: [...p.pasos, ''] }));
  const removePaso         = (i) => setFormData(p => ({ ...p, pasos: p.pasos.filter((_,x) => x !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.desc || !formData.cat) { toast.error('Completa los campos obligatorios'); return; }
    const cleanData = { ...formData, ingredientes: formData.ingredientes.filter(i => i.trim()), pasos: formData.pasos.filter(p => p.trim()) };
    setLoading(true);
    try {
      if (isEditing) { await api.put(`/recipes/${recipe._id}`, cleanData); toast.success('Receta actualizada'); }
      else           { await api.post('/recipes', cleanData); localStorage.removeItem(DRAFT_KEY); toast.success('Receta creada'); }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error guardando receta');
    } finally { setLoading(false); }
  };

  return (
    <div className="recipe-form">
      <h2>
        {isEditing ? <><IcoEdit2 />Editar Receta</> : <><IcoPlus />Crear Nueva Receta</>}
      </h2>

      <form onSubmit={handleSubmit}>

        {/* Información Básica */}
        <div className="form-section">
          <h3><IcoInfo />Información Básica</h3>
          <div className="form-group">
            <label>Nombre de la Receta *</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej: Ensalada Mediterránea" required />
          </div>
          <div className="form-group">
            <label>Descripción *</label>
            <textarea name="desc" value={formData.desc} onChange={handleChange} placeholder="Describe brevemente la receta..." rows="3" required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>URL de Imagen *</label>
              <input type="url" name="img" value={formData.img} onChange={handleChange} placeholder="https://..." />
            </div>
            <div className="form-group">
              <label>Categoría *</label>
              <select name="cat" value={formData.cat} onChange={handleChange} required>
                {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
              </select>
            </div>
            <div className="form-group">
            <label>Tiempo (minutos)</label>
            <NumeroInput name="tiempoMinutos" value={formData.tiempoMinutos} onChange={handleChange} min={0} max={999} step={5} placeholder="Ej: 30" />
          </div>
            <div className="form-group">
              <label>Puntuación (0-5)</label>
              <NumeroInput name="puntos" value={formData.puntos} onChange={handleChange} min={0} max={5} step={0.1} />
            </div>
          </div>
        </div>

        {/* Condiciones de Salud */}
        <div className="form-section">
          <h3><IcoSalud />Condiciones de Salud</h3>
          <div className="salud-grid">
            {condicionesSalud.map(condicion => (
              <label key={condicion} className="salud-checkbox">
                <input type="checkbox" checked={formData.salud?.includes(condicion)} onChange={() => handleSaludToggle(condicion)} />
                <span>{condicion.replace(/-/g, ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Ingredientes */}
        <div className="form-section">
          <h3><IcoIng />Ingredientes</h3>
          {formData.ingredientes.map((ing, i) => (
            <div key={i} className="dynamic-input">
              <input type="text" value={ing} onChange={(e) => handleIngChange(i, e.target.value)} placeholder={`Ingrediente ${i + 1}`} />
              {formData.ingredientes.length > 1 && (
                <button type="button" onClick={() => removeIngrediente(i)} className="btn-remove"><IcoX /></button>
              )}
            </div>
          ))}
          <button type="button" onClick={addIngrediente} className="btn-add"><IcoPlus />Agregar Ingrediente</button>
        </div>

        {/* Pasos */}
        <div className="form-section">
          <h3><IcoPasos />Pasos de Preparación</h3>
          {formData.pasos.map((paso, i) => (
            <div key={i} className="dynamic-input">
              <span className="paso-number">{i + 1}.</span>
              <textarea value={paso} onChange={(e) => handlePasoChange(i, e.target.value)} placeholder={`Paso ${i + 1}`} rows="2" />
              {formData.pasos.length > 1 && (
                <button type="button" onClick={() => removePaso(i)} className="btn-remove"><IcoX /></button>
              )}
            </div>
          ))}
          <button type="button" onClick={addPaso} className="btn-add"><IcoPlus />Agregar Paso</button>
        </div>

        {/* Nutrición básica */}
        <div className="form-section">
          <h3><IcoNutri />Información Nutricional Básica</h3>
          <div className="nutri-grid">
            {[
              {label:'Calorías',        field:'cal',   step:'1'},
              {label:'Proteínas (g)',   field:'prot',  step:'0.1'},
              {label:'Carbohidratos (g)',field:'carb', step:'0.1'},
              {label:'Grasas (g)',      field:'gras',  step:'0.1'},
              {label:'Fibra (g)',       field:'fiber', step:'0.1'},
              {label:'Sodio (mg)',      field:'sodio', step:'1'},
            ].map(({label, field, step}) => (
              <div className="form-group" key={field}>
                <label>{label}</label>
                <NumeroInput value={formData.nutri[field] || 0} onChange={(e) => handleNutriChange(field, e.target.value)} min={0} step={step} />
              </div>
            ))}
          </div>

          <button type="button" onClick={() => setShowAdvancedNutri(!showAdvancedNutri)} className="btn-toggle-advanced">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{verticalAlign:'middle',marginRight:'6px',transform: showAdvancedNutri ? 'rotate(90deg)' : 'none',transition:'transform 0.2s'}}>
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            Información Nutricional Avanzada
          </button>

          {showAdvancedNutri && (
            <div className="advanced-nutri">
              <p className="nutri-note">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:'5px'}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Deja en 0 los valores que no conozcas. Puedes agregarlos después.
              </p>

              <h4>Minerales</h4>
              <div className="nutri-grid">
                {[{l:'Calcio (mg)',f:'calcio',s:'1'},{l:'Hierro (mg)',f:'hierro',s:'0.1'},{l:'Potasio (mg)',f:'potasio',s:'1'},{l:'Magnesio (mg)',f:'magnesio',s:'1'}].map(({l,f,s}) => (
                  <div className="form-group" key={f}><label>{l}</label><NumeroInput value={formData.nutri[f]||0} onChange={(e)=>handleNutriChange(f,e.target.value)} min={0} step={s}/></div>
                ))}
              </div>

              <h4>Vitaminas</h4>
              <div className="nutri-grid">
                {[{l:'Vitamina A (mcg)',f:'vitA',s:'1'},{l:'Vitamina C (mg)',f:'vitC',s:'1'},{l:'Vitamina D (mcg)',f:'vitD',s:'0.1'},{l:'Vitamina E (mg)',f:'vitE',s:'0.1'}].map(({l,f,s}) => (
                  <div className="form-group" key={f}><label>{l}</label><NumeroInput value={formData.nutri[f]||0} onChange={(e)=>handleNutriChange(f,e.target.value)} min={0} step={s}/></div>
                ))}
              </div>

              <h4>Azúcares</h4>
              <div className="nutri-grid">
                {[{l:'Azúcar Total (g)',f:'azucar'},{l:'Glucosa (g)',f:'glucosa'},{l:'Fructosa (g)',f:'fructosa'}].map(({l,f}) => (
                  <div className="form-group" key={f}><label>{l}</label><NumeroInput value={formData.nutri[f]||0} onChange={(e)=>handleNutriChange(f,e.target.value)} min={0} step={0.1}/></div>
                ))}
              </div>

              <h4>Grasas Detalladas</h4>
              <div className="nutri-grid">
                {[{l:'Saturadas (g)',f:'grasSat'},{l:'Monoinsaturadas (g)',f:'grasMonoins'},{l:'Poliinsaturadas (g)',f:'grasPoliins'},{l:'Omega-3 (g)',f:'omega3'}].map(({l,f}) => (
                  <div className="form-group" key={f}><label>{l}</label><NumeroInput value={formData.nutri[f]||0} onChange={(e)=>handleNutriChange(f,e.target.value)} min={0} step={0.1}/></div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancel" disabled={loading}>Cancelar</button>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? (
              <><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:'6px',animation:'spin 1s linear infinite'}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Guardando...</>
            ) : isEditing ? (
              <><IcoSave />Actualizar Receta</>
            ) : (
              <><IcoPlus />Crear Receta</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecipeForm;