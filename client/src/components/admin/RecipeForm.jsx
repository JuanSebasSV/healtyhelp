import { useState, useEffect, useCallback, memo } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import './RecipeForm.css';

//  Iconos
const IcoInfo  = memo(() => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:'7px',flexShrink:0}}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>);
IcoInfo.displayName = 'IcoInfo';
const IcoSalud = memo(() => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:'7px',flexShrink:0}}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>);
IcoSalud.displayName = 'IcoSalud';
const IcoIng   = memo(() => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:'7px',flexShrink:0}}><path d="M2 22c1.25-.987 2.27-1.975 3.9-2.2a5.56 5.56 0 0 1 3.8 1.5 4 4 0 0 0 6.187-2.353 3.5 3.5 0 0 0 3.69-5.116A3.5 3.5 0 0 0 20.95 8 3.5 3.5 0 1 0 16 3.05a3.5 3.5 0 0 0-5.831 1.373 3.5 3.5 0 0 0-5.116 3.69 4 4 0 0 0-2.348 6.155C3.499 15.42 4.409 16.712 4.2 18.1 3.926 19.743 3.014 20.732 2 22"/></svg>);
IcoIng.displayName = 'IcoIng';
const IcoPasos = memo(() => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:'7px',flexShrink:0}}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>);
IcoPasos.displayName = 'IcoPasos';
const IcoNutri = memo(() => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:'7px',flexShrink:0}}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>);
IcoNutri.displayName = 'IcoNutri';
const IcoX     = memo(() => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
IcoX.displayName = 'IcoX';
const IcoPlus  = memo(() => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{verticalAlign:'middle',marginRight:'5px'}}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
IcoPlus.displayName = 'IcoPlus';
const IcoSave  = memo(() => <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:'6px'}}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>);
IcoSave.displayName = 'IcoSave';
const IcoEdit2 = memo(() => <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:'6px'}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);
IcoEdit2.displayName = 'IcoEdit2';

//Datos estáticos fuera del componente (no se recrean en cada render)
const CATEGORIAS = [
  { id: 'desayuno',       nombre: 'Desayuno' },
  { id: 'almuerzo',       nombre: 'Almuerzo' },
  { id: 'cena',           nombre: 'Cena' },
  { id: 'postres-snacks', nombre: 'Postres & Snacks' },
];

const CONDICIONES_SALUD = [
  'diabetes','hipertension','celiaco','intolerancia-lactosa',
  'vegano','vegetariano','bajo-sodio','bajo-carbohidratos',
  'keto','paleo','sin-frutos-secos','sin-mariscos',
  'bajo-grasa','sin-azucar','colesterol-alto','enfermedad-renal',
  'gastritis','sindrome-intestino',
];

const NUTRI_BASICA = [
  { label: 'Calorías',             field: 'cal',        step: '1'   },
  { label: 'Proteínas (g)',        field: 'prot',       step: '0.1' },
  { label: 'Carbohidratos (g)',    field: 'carb',       step: '0.1' },
  { label: 'Carbohidratos netos (g)', field: 'carbsNetos', step: '0.1' },
  { label: 'Grasas (g)',           field: 'gras',       step: '0.1' },
  { label: 'Fibra (g)',            field: 'fiber',      step: '0.1' },
  { label: 'Sodio (mg)',           field: 'sodio',      step: '1'   },
  { label: 'Colesterol (mg)',      field: 'colesterol', step: '1'   },
];

const NUTRI_MINERALES = [
  { l: 'Calcio (mg)',    f: 'calcio',   s: '1'   },
  { l: 'Hierro (mg)',    f: 'hierro',   s: '0.1' },
  { l: 'Potasio (mg)',   f: 'potasio',  s: '1'   },
  { l: 'Magnesio (mg)',  f: 'magnesio', s: '1'   },
  { l: 'Cobre (mg)',     f: 'cobre',    s: '0.1' },
  { l: 'Flúor (µg)',     f: 'fluor',    s: '1'   },
  { l: 'Fósforo (mg)',   f: 'fosforo',  s: '1'   },
  { l: 'Manganeso (mg)', f: 'manganeso',s: '0.1' },
  { l: 'Selenio (µg)',   f: 'selenio',  s: '1'   },
  { l: 'Zinc (mg)',      f: 'zinc',     s: '0.1' },
];

const NUTRI_VITAMINAS = [
  { l: 'Vitamina A (µg)',              f: 'vitA',      s: '1'   },
  { l: 'Vitamina A (IU)',              f: 'vitAui',    s: '1'   },
  { l: 'Vitamina B6 (mg)',             f: 'vitB6',     s: '0.1' },
  { l: 'Vitamina B12 (µg)',            f: 'vitB12',    s: '0.1' },
  { l: 'Vitamina C (mg)',              f: 'vitC',      s: '1'   },
  { l: 'Vitamina D2 (µg)',             f: 'vitD2',     s: '0.1' },
  { l: 'Vitamina D3 (µg)',             f: 'vitD3',     s: '0.1' },
  { l: 'Vitamina D (IU)',              f: 'vitDui',    s: '1'   },
  { l: 'Vitamina E (mg)',              f: 'vitE',      s: '0.1' },
  { l: 'Vitamina K (µg)',              f: 'vitK',      s: '0.1' },
  { l: 'Folato / Vit. B9 (µg)',        f: 'folato',    s: '1'   },
  { l: 'Niacina / Vit. B3 (mg)',       f: 'niacina',   s: '0.1' },
  { l: 'Riboflavina / Vit. B2 (mg)',   f: 'riboflavina',s:'0.1' },
  { l: 'Tiamina / Vit. B1 (mg)',       f: 'tiamina',   s: '0.1' },
  { l: 'Ác. pantoténico / B5 (mg)',    f: 'acidoPant', s: '0.1' },
];

const NUTRI_OTROS_MICRO = [
  { l: 'Alfa caroteno (µg)',  f: 'alfaCaroteno', s: '1'   },
  { l: 'Beta caroteno (µg)',  f: 'betaCaroteno', s: '1'   },
  { l: 'Licopeno (µg)',       f: 'licopeno',     s: '1'   },
  { l: 'Retinol (µg)',        f: 'retinol',      s: '1'   },
  { l: 'Colina (mg)',         f: 'colina',       s: '1'   },
  { l: 'Cafeína (mg)',        f: 'cafeina',      s: '1'   },
  { l: 'Teobromina (mg)',     f: 'teobromina',   s: '1'   },
];

const NUTRI_AZUCARES = [
  { l: 'Azúcar total (g)', f: 'azucar'   },
  { l: 'Sacarosa (g)',     f: 'sacarosa' },
  { l: 'Glucosa (g)',      f: 'glucosa'  },
  { l: 'Fructosa (g)',     f: 'fructosa' },
  { l: 'Lactosa (g)',      f: 'lactosa'  },
  { l: 'Maltosa (g)',      f: 'maltosa'  },
  { l: 'Galactosa (g)',    f: 'galactosa'},
  { l: 'Almidón (g)',      f: 'almidon'  },
];

const NUTRI_GRASAS = [
  { l: 'Saturadas (g)',       f: 'grasSat'     },
  { l: 'Monoinsaturadas (g)', f: 'grasMonoins' },
  { l: 'Poliinsaturadas (g)', f: 'grasPoliins' },
  { l: 'Trans (g)',           f: 'grasTrans'   },
];

const NUTRI_ACIDOS_GRASOS = [
  { l: 'Omega 3 total (g)',              f: 'omega3' },
  { l: 'Omega 6 total (g)',              f: 'omega6' },
  { l: 'Ác. alfa-linolénico ALA (g)',    f: 'ala'    },
  { l: 'Ác. docosahexaenoico DHA (g)',   f: 'dha'    },
  { l: 'Ác. eicosapentaenoico EPA (g)',  f: 'epa'    },
  { l: 'Ác. docosapentaenoico DPA (g)',  f: 'dpa'    },
];

const NUTRI_AMINOACIDOS = [
  { l: 'Alanina (g)',         f: 'alanina'      },
  { l: 'Arginina (g)',        f: 'arginina'     },
  { l: 'Ác. aspártico (g)',   f: 'acidoAsp'     },
  { l: 'Cistina (g)',         f: 'cistina'      },
  { l: 'Ác. glutámico (g)',   f: 'acidoGlu'     },
  { l: 'Glicina (g)',         f: 'glicina'      },
  { l: 'Histidina (g)',       f: 'histidina'    },
  { l: 'Hidroxiprolina (g)',  f: 'hidroxiprol'  },
  { l: 'Isoleucina (g)',      f: 'isoleucina'   },
  { l: 'Leucina (g)',         f: 'leucina'      },
  { l: 'Lisina (g)',          f: 'lisina'       },
  { l: 'Metionina (g)',       f: 'metionina'    },
  { l: 'Fenilalanina (g)',    f: 'fenilalanina' },
  { l: 'Prolina (g)',         f: 'prolina'      },
  { l: 'Serina (g)',          f: 'serina'       },
  { l: 'Treonina (g)',        f: 'treonina'     },
  { l: 'Triptófano (g)',      f: 'triptofano'   },
  { l: 'Tirosina (g)',        f: 'tirosina'     },
  { l: 'Valina (g)',          f: 'valina'       },
];

const DRAFT_KEY = 'recipe_form_draft';

const NUTRI_VACIA = {
  // Básicos
  cal: 0, prot: 0, carb: 0, carbsNetos: 0, gras: 0, fiber: 0, sodio: 0, colesterol: 0,
  // Minerales
  calcio: 0, hierro: 0, potasio: 0, magnesio: 0, cobre: 0, fluor: 0,
  fosforo: 0, manganeso: 0, selenio: 0, zinc: 0,
  // Vitaminas
  vitA: 0, vitAui: 0, vitB6: 0, vitB12: 0, vitC: 0,
  vitD2: 0, vitD3: 0, vitDui: 0, vitE: 0, vitK: 0,
  folato: 0, niacina: 0, riboflavina: 0, tiamina: 0, acidoPant: 0,
  // Otros micronutrientes
  alfaCaroteno: 0, betaCaroteno: 0, licopeno: 0, retinol: 0,
  colina: 0, cafeina: 0, teobromina: 0,
  // Azúcares
  azucar: 0, sacarosa: 0, glucosa: 0, fructosa: 0,
  lactosa: 0, maltosa: 0, galactosa: 0, almidon: 0,
  // Grasas
  grasSat: 0, grasMonoins: 0, grasPoliins: 0, grasTrans: 0,
  // Ácidos grasos
  omega3: 0, omega6: 0, ala: 0, dha: 0, epa: 0, dpa: 0,
  // Aminoácidos
  alanina: 0, arginina: 0, acidoAsp: 0, cistina: 0, acidoGlu: 0,
  glicina: 0, histidina: 0, hidroxiprol: 0, isoleucina: 0, leucina: 0,
  lisina: 0, metionina: 0, fenilalanina: 0, prolina: 0, serina: 0,
  treonina: 0, triptofano: 0, tirosina: 0, valina: 0,
};

//tiempoMinutos
const FORM_INICIAL = {
  nombre: '', desc: '', img: '', cat: 'almuerzo',
  salud: [], puntos: 0, ingredientes: [''], pasos: [''],
  tiempoMinutos: 0,
  nutri: { ...NUTRI_VACIA },
};

const NumeroInput = memo(({ value, onChange, min, max, step, name, placeholder }) => {
  const s = parseFloat(step) || 1;

  const safeValue = value ?? '';

  const increment = useCallback(() => {
    const v = parseFloat(safeValue) || (min ?? 0);
    if (max !== undefined && v >= max) return;
    onChange({ target: { name, value: String(parseFloat((v + s).toFixed(4))) } });
  }, [safeValue, min, max, s, name, onChange]);

  const decrement = useCallback(() => {
    const v = parseFloat(safeValue) || (min ?? 0);
    if (min !== undefined && v <= min) return;
    onChange({ target: { name, value: String(parseFloat((v - s).toFixed(4))) } });
  }, [safeValue, min, s, name, onChange]);

  return (
    <div className="numero-wrapper">
      <input
        type="number"
        name={name}
        value={safeValue}           // ← siempre definido
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        style={{ width: '100%', paddingRight: '2.2rem' }}
      />
      <div className="numero-flechas">
        <button type="button" onClick={increment}>
          <svg viewBox="0 0 24 24" fill="none"><polyline points="18 15 12 9 6 15"/></svg>
        </button>
        <button type="button" onClick={decrement}>
          <svg viewBox="0 0 24 24" fill="none"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </div>
    </div>
  );
});
NumeroInput.displayName = 'NumeroInput';

//RecipeForm
const RecipeForm = ({ recipe, onSuccess, onCancel }) => {
  const isEditing = !!recipe;

  const [formData, setFormData] = useState(() => {
    if (!recipe) {
      try {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return { ...FORM_INICIAL, nutri: { ...NUTRI_VACIA } };
  });

  const [loading,           setLoading]           = useState(false);
  const [showAdvancedNutri, setShowAdvancedNutri] = useState(false);
 

  // Cargar datos de la receta al editar
  useEffect(() => {
    if (!recipe) return;
    setFormData({
      ...recipe,
      puntos:        recipe.puntos        ?? 0,
      tiempoMinutos: recipe.tiempoMinutos ?? 0,
      ingredientes:  recipe.ingredientes?.length ? recipe.ingredientes : [''],
      pasos:         recipe.pasos?.length        ? recipe.pasos        : [''],
      nutri: { ...NUTRI_VACIA, ...(recipe.nutri || {}) },
    });
  }, [recipe]);

  // Guardar borrador solo al crear
  useEffect(() => {
    if (isEditing) return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
  }, [formData, isEditing]);
  const handleChange = useCallback(
    (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value })),
    []
  );

  const handleNutriChange = useCallback(
    (field, value) =>
      setFormData(prev => ({ ...prev, nutri: { ...prev.nutri, [field]: parseFloat(value) || 0 } })),
    []
  );

  const handleSaludToggle = useCallback(
    (c) => setFormData(prev => ({
      ...prev,
      salud: prev.salud?.includes(c)
        ? prev.salud.filter(s => s !== c)
        : [...(prev.salud || []), c],
    })),
    []
  );

  const handleIngChange = useCallback((i, v) => {
    setFormData(prev => {
      const a = [...prev.ingredientes];
      a[i] = v;
      return { ...prev, ingredientes: a };
    });
  }, []);

  const handlePasoChange = useCallback((i, v) => {
    setFormData(prev => {
      const a = [...prev.pasos];
      a[i] = v;
      return { ...prev, pasos: a };
    });
  }, []);

  const addIngrediente    = useCallback(() => setFormData(p => ({ ...p, ingredientes: [...p.ingredientes, ''] })), []);
  const removeIngrediente = useCallback((i) => setFormData(p => ({ ...p, ingredientes: p.ingredientes.filter((_, x) => x !== i) })), []);
  const addPaso           = useCallback(() => setFormData(p => ({ ...p, pasos: [...p.pasos, ''] })), []);
  const removePaso        = useCallback((i) => setFormData(p => ({ ...p, pasos: p.pasos.filter((_, x) => x !== i) })), []);
  const toggleAdvanced    = useCallback(() => setShowAdvancedNutri(v => !v), []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.desc || !formData.cat) {
      toast.error('Completa los campos obligatorios');
      return;
    }
    const cleanData = {
      ...formData,
      ingredientes: formData.ingredientes.filter(i => i.trim()),
      pasos:        formData.pasos.filter(p => p.trim()),
    };
    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/recipes/${recipe._id}`, cleanData);
        toast.success('Receta actualizada');
      } else {
        await api.post('/recipes', cleanData);
        localStorage.removeItem(DRAFT_KEY);
        toast.success('Receta creada');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error guardando receta');
    } finally {
      setLoading(false);
    }
  }, [formData, isEditing, recipe, onSuccess]);

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
            <input
              type="text" name="nombre"
              value={formData.nombre ?? ''}
              onChange={handleChange}
              placeholder="Ej: Ensalada Mediterránea"
              required
            />
          </div>
          <div className="form-group">
            <label>Descripción *</label>
            <textarea
              name="desc"
              value={formData.desc ?? ''}
              onChange={handleChange}
              placeholder="Describe brevemente la receta..."
              rows="3"
              required
            />
          </div>
          <div className="form-group">
            <label>URL de Imagen</label>
            <input
              type="url" name="img"
              value={formData.img ?? ''}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Categoría *</label>
              <select name="cat" value={formData.cat ?? 'almuerzo'} onChange={handleChange} required>
                {CATEGORIAS.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
            </div>
            {/*ampo Tiempo de preparación */}
            <div className="form-group">
              <label>Tiempo (minutos)</label>
              <NumeroInput
                name="tiempoMinutos"
                value={formData.tiempoMinutos ?? 0}
                onChange={handleChange}
                min={0} max={999} step={5}
                placeholder="Ej: 30"
              />
            </div>
          
              <div className="form-group">
                <label>Puntuación (0-5)</label>
                <NumeroInput
                  name="puntos"
                  value={formData.puntos ?? 0}
                  onChange={handleChange}
                  min={0} max={5} step={0.1}
                />
              </div>
          </div>
        </div>

        {/* Condiciones de Salud */}
        <div className="form-section">
          <h3><IcoSalud />Condiciones de Salud</h3>
          <div className="salud-grid">
            {CONDICIONES_SALUD.map(condicion => (
              <label key={condicion} className="salud-checkbox">
                <input
                  type="checkbox"
                  checked={formData.salud?.includes(condicion) ?? false}
                  onChange={() => handleSaludToggle(condicion)}
                />
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
              <input
                type="text"
                value={ing ?? ''}
                onChange={(e) => handleIngChange(i, e.target.value)}
                placeholder={`Ingrediente ${i + 1}`}
              />
              {formData.ingredientes.length > 1 && (
                <button type="button" onClick={() => removeIngrediente(i)} className="btn-remove">
                  <IcoX />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addIngrediente} className="btn-add">
            <IcoPlus />Agregar Ingrediente
          </button>
        </div>

        {/* Pasos */}
        <div className="form-section">
          <h3><IcoPasos />Pasos de Preparación</h3>
          {formData.pasos.map((paso, i) => (
            <div key={i} className="dynamic-input">
              <span className="paso-number">{i + 1}.</span>
              <textarea
                value={paso ?? ''}
                onChange={(e) => handlePasoChange(i, e.target.value)}
                placeholder={`Paso ${i + 1}`}
                rows="2"
              />
              {formData.pasos.length > 1 && (
                <button type="button" onClick={() => removePaso(i)} className="btn-remove">
                  <IcoX />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addPaso} className="btn-add">
            <IcoPlus />Agregar Paso
          </button>
        </div>

        {/* Nutrición básica */}
        <div className="form-section">
          <h3><IcoNutri />Información Nutricional Básica</h3>
          <div className="nutri-grid">
            {NUTRI_BASICA.map(({ label, field, step }) => (
              <div className="form-group" key={field}>
                <label>{label}</label>
                <NumeroInput
                  value={formData.nutri[field] ?? 0}
                  onChange={(e) => handleNutriChange(field, e.target.value)}
                  min={0}
                  step={step}
                />
              </div>
            ))}
          </div>

          <button type="button" onClick={toggleAdvanced} className="btn-toggle-advanced">
            <svg
              xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5"
              style={{
                verticalAlign: 'middle', marginRight: '6px',
                transform: showAdvancedNutri ? 'rotate(90deg)' : 'none',
                transition: 'transform 0.2s',
              }}
            >
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            Información Nutricional Avanzada
          </button>

          {showAdvancedNutri && (
            <div className="advanced-nutri">
              <p className="nutri-note">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:'5px'}}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Deja en 0 los valores que no conozcas. Puedes agregarlos después.
              </p>

              <h4>Minerales</h4>
              <div className="nutri-grid">
                {NUTRI_MINERALES.map(({ l, f, s }) => (
                  <div className="form-group" key={f}>
                    <label>{l}</label>
                    <NumeroInput value={formData.nutri[f] ?? 0} onChange={(e) => handleNutriChange(f, e.target.value)} min={0} step={s} />
                  </div>
                ))}
              </div>

              <h4>Vitaminas</h4>
              <div className="nutri-grid">
                {NUTRI_VITAMINAS.map(({ l, f, s }) => (
                  <div className="form-group" key={f}>
                    <label>{l}</label>
                    <NumeroInput value={formData.nutri[f] ?? 0} onChange={(e) => handleNutriChange(f, e.target.value)} min={0} step={s} />
                  </div>
                ))}
              </div>

              <h4>Carotenoides y Otros Compuestos</h4>
              <div className="nutri-grid">
                {NUTRI_OTROS_MICRO.map(({ l, f }) => (
                  <div className="form-group" key={f}>
                    <label>{l}</label>
                    <NumeroInput value={formData.nutri[f] ?? 0} onChange={(e) => handleNutriChange(f, e.target.value)} min={0} step={0.1} />
                  </div>
                ))}
              </div>

              <h4>Azúcares</h4>
              <div className="nutri-grid">
                {NUTRI_AZUCARES.map(({ l, f }) => (
                  <div className="form-group" key={f}>
                    <label>{l}</label>
                    <NumeroInput value={formData.nutri[f] ?? 0} onChange={(e) => handleNutriChange(f, e.target.value)} min={0} step={0.1} />
                  </div>
                ))}
              </div>

              <h4>Grasas Detalladas</h4>
              <div className="nutri-grid">
                {NUTRI_GRASAS.map(({ l, f }) => (
                  <div className="form-group" key={f}>
                    <label>{l}</label>
                    <NumeroInput value={formData.nutri[f] ?? 0} onChange={(e) => handleNutriChange(f, e.target.value)} min={0} step={0.1} />
                  </div>
                ))}
              </div>

              <h4>Ácidos Grasos</h4>
              <div className="nutri-grid">
                {NUTRI_ACIDOS_GRASOS.map(({ l, f }) => (
                  <div className="form-group" key={f}>
                    <label>{l}</label>
                    <NumeroInput value={formData.nutri[f] ?? 0} onChange={(e) => handleNutriChange(f, e.target.value)} min={0} step={0.01} />
                  </div>
                ))}
              </div>

              <h4>Aminoácidos</h4>
              <div className="nutri-grid">
                {NUTRI_AMINOACIDOS.map(({ l, f }) => (
                  <div className="form-group" key={f}>
                    <label>{l}</label>
                    <NumeroInput value={formData.nutri[f] ?? 0} onChange={(e) => handleNutriChange(f, e.target.value)} min={0} step={0.01} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancel" disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:'6px',animation:'spin 1s linear infinite'}}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Guardando...
              </>
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