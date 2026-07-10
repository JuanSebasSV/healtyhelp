import { useState, useEffect, useCallback, memo, useRef } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { IcoInfo, IcoSalud, IcoIng, IcoPasos, IcoNutri, IcoX, IcoPlus, IcoSave, IcoEdit2 } from './RecipeFormIcons';
import NumeroInput from './NumeroInput';
import InfoBasicaSection from './InfoBasicaSection';
import './RecipeForm.css';

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
  { label: 'Calorías',                field: 'cal',        step: '1'   },
  { label: 'Proteínas (g)',           field: 'prot',       step: '0.1' },
  { label: 'Carbohidratos (g)',       field: 'carb',       step: '0.1' },
  { label: 'Carbohidratos netos (g)', field: 'carbsNetos', step: '0.1' },
  { label: 'Grasas (g)',              field: 'gras',       step: '0.1' },
  { label: 'Fibra (g)',               field: 'fiber',      step: '0.1' },
  { label: 'Sodio (mg)',              field: 'sodio',      step: '1'   },
  { label: 'Colesterol (mg)',         field: 'colesterol', step: '1'   },
];

const NUTRI_MINERALES = [
  { l: 'Calcio (mg)',    f: 'calcio',    s: '1'   },
  { l: 'Hierro (mg)',    f: 'hierro',    s: '0.1' },
  { l: 'Potasio (mg)',   f: 'potasio',   s: '1'   },
  { l: 'Magnesio (mg)',  f: 'magnesio',  s: '1'   },
  { l: 'Cobre (mg)',     f: 'cobre',     s: '0.1' },
  { l: 'Flúor (µg)',     f: 'fluor',     s: '1'   },
  { l: 'Fósforo (mg)',   f: 'fosforo',   s: '1'   },
  { l: 'Manganeso (mg)', f: 'manganeso', s: '0.1' },
  { l: 'Selenio (µg)',   f: 'selenio',   s: '1'   },
  { l: 'Zinc (mg)',      f: 'zinc',      s: '0.1' },
];

const NUTRI_VITAMINAS = [
  { l: 'Vitamina A (µg)',            f: 'vitA',       s: '1'   },
  { l: 'Vitamina A (IU)',            f: 'vitAui',     s: '1'   },
  { l: 'Vitamina B6 (mg)',           f: 'vitB6',      s: '0.1' },
  { l: 'Vitamina B12 (µg)',          f: 'vitB12',     s: '0.1' },
  { l: 'Vitamina C (mg)',            f: 'vitC',       s: '1'   },
  { l: 'Vitamina D2 (µg)',           f: 'vitD2',      s: '0.1' },
  { l: 'Vitamina D3 (µg)',           f: 'vitD3',      s: '0.1' },
  { l: 'Vitamina D (IU)',            f: 'vitDui',     s: '1'   },
  { l: 'Vitamina E (mg)',            f: 'vitE',       s: '0.1' },
  { l: 'Vitamina K (µg)',            f: 'vitK',       s: '0.1' },
  { l: 'Folato / Vit. B9 (µg)',      f: 'folato',     s: '1'   },
  { l: 'Niacina / Vit. B3 (mg)',     f: 'niacina',    s: '0.1' },
  { l: 'Riboflavina / Vit. B2 (mg)', f: 'riboflavina',s: '0.1' },
  { l: 'Tiamina / Vit. B1 (mg)',     f: 'tiamina',    s: '0.1' },
  { l: 'Ác. pantoténico / B5 (mg)',  f: 'acidoPant',  s: '0.1' },
];

const NUTRI_OTROS_MICRO = [
  { l: 'Alfa caroteno (µg)', f: 'alfaCaroteno' },
  { l: 'Beta caroteno (µg)', f: 'betaCaroteno' },
  { l: 'Licopeno (µg)',      f: 'licopeno'     },
  { l: 'Retinol (µg)',       f: 'retinol'      },
  { l: 'Colina (mg)',        f: 'colina'       },
  { l: 'Cafeína (mg)',       f: 'cafeina'      },
  { l: 'Teobromina (mg)',    f: 'teobromina'   },
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
  { l: 'Omega 3 total (g)',             f: 'omega3' },
  { l: 'Omega 6 total (g)',             f: 'omega6' },
  { l: 'Ác. alfa-linolénico ALA (g)',   f: 'ala'    },
  { l: 'Ác. docosahexaenoico DHA (g)',  f: 'dha'    },
  { l: 'Ác. eicosapentaenoico EPA (g)', f: 'epa'    },
  { l: 'Ác. docosapentaenoico DPA (g)', f: 'dpa'    },
];

const NUTRI_AMINOACIDOS = [
  { l: 'Alanina (g)',        f: 'alanina'      },
  { l: 'Arginina (g)',       f: 'arginina'     },
  { l: 'Ác. aspártico (g)',  f: 'acidoAsp'     },
  { l: 'Cistina (g)',        f: 'cistina'      },
  { l: 'Ác. glutámico (g)',  f: 'acidoGlu'     },
  { l: 'Glicina (g)',        f: 'glicina'      },
  { l: 'Histidina (g)',      f: 'histidina'    },
  { l: 'Hidroxiprolina (g)', f: 'hidroxiprol'  },
  { l: 'Isoleucina (g)',     f: 'isoleucina'   },
  { l: 'Leucina (g)',        f: 'leucina'      },
  { l: 'Lisina (g)',         f: 'lisina'       },
  { l: 'Metionina (g)',      f: 'metionina'    },
  { l: 'Fenilalanina (g)',   f: 'fenilalanina' },
  { l: 'Prolina (g)',        f: 'prolina'      },
  { l: 'Serina (g)',         f: 'serina'       },
  { l: 'Treonina (g)',       f: 'treonina'     },
  { l: 'Triptófano (g)',     f: 'triptofano'   },
  { l: 'Tirosina (g)',       f: 'tirosina'     },
  { l: 'Valina (g)',         f: 'valina'       },
];

const DRAFT_KEY = 'recipe_form_draft:v1';

const NUTRI_VACIA = {
  cal: 0, prot: 0, carb: 0, carbsNetos: 0, gras: 0, fiber: 0, sodio: 0, colesterol: 0,
  calcio: 0, hierro: 0, potasio: 0, magnesio: 0, cobre: 0, fluor: 0,
  fosforo: 0, manganeso: 0, selenio: 0, zinc: 0,
  vitA: 0, vitAui: 0, vitB6: 0, vitB12: 0, vitC: 0,
  vitD2: 0, vitD3: 0, vitDui: 0, vitE: 0, vitK: 0,
  folato: 0, niacina: 0, riboflavina: 0, tiamina: 0, acidoPant: 0,
  alfaCaroteno: 0, betaCaroteno: 0, licopeno: 0, retinol: 0,
  colina: 0, cafeina: 0, teobromina: 0,
  azucar: 0, sacarosa: 0, glucosa: 0, fructosa: 0,
  lactosa: 0, maltosa: 0, galactosa: 0, almidon: 0,
  grasSat: 0, grasMonoins: 0, grasPoliins: 0, grasTrans: 0,
  omega3: 0, omega6: 0, ala: 0, dha: 0, epa: 0, dpa: 0,
  alanina: 0, arginina: 0, acidoAsp: 0, cistina: 0, acidoGlu: 0,
  glicina: 0, histidina: 0, hidroxiprol: 0, isoleucina: 0, leucina: 0,
  lisina: 0, metionina: 0, fenilalanina: 0, prolina: 0, serina: 0,
  treonina: 0, triptofano: 0, tirosina: 0, valina: 0,
};

const FORM_INICIAL = {
  nombre: '', desc: '', img: '', cat: 'almuerzo',
  salud: [], puntos: 0, ingredientes: [''], pasos: [''],
  tiempoMinutos: 0,
  nutri: { ...NUTRI_VACIA },
};

const NutriField = memo(({ label, field, value, step, onChange }) => {
  const handleChange = useCallback(e => onChange(field, e.target.value), [field, onChange]);
  return (
    <div className="form-group">
      <label htmlFor={`nutri-${field}`}>{label}</label>
      <NumeroInput id={`nutri-${field}`} value={value ?? 0} onChange={handleChange} min={0} step={step} />
    </div>
  );
});
NutriField.displayName = 'NutriField';

const SaludCheckbox = memo(({ condicion, checked, onToggle }) => {
  const handleChange = useCallback(() => onToggle(condicion), [condicion, onToggle]);
  return (
    <label className="salud-checkbox">
      <input type="checkbox" checked={checked} onChange={handleChange} />
      <span>{condicion.replace(/-/g, ' ')}</span>
    </label>
  );
});
SaludCheckbox.displayName = 'SaludCheckbox';

const IngredienteRow = memo(({ value, index, totalCount, onChange, onRemove }) => {
  const handleChange = useCallback(e => onChange(index, e.target.value), [index, onChange]);
  const handleRemove = useCallback(() => onRemove(index), [index, onRemove]);
  return (
    <div className="dynamic-input">
      <input
        type="text"
        value={value ?? ''}
        onChange={handleChange}
        placeholder={`Ingrediente ${index + 1}`}
      />
      {totalCount > 1 && (
        <button type="button" onClick={handleRemove} className="btn-remove">
          <IcoX />
        </button>
      )}
    </div>
  );
});
IngredienteRow.displayName = 'IngredienteRow';

const PasoRow = memo(({ value, index, totalCount, onChange, onRemove }) => {
  const handleChange = useCallback(e => onChange(index, e.target.value), [index, onChange]);
  const handleRemove = useCallback(() => onRemove(index), [index, onRemove]);
  return (
    <div className="dynamic-input">
      <span className="paso-number">{index + 1}.</span>
      <textarea
        value={value ?? ''}
        onChange={handleChange}
        placeholder={`Paso ${index + 1}`}
        rows="2"
      />
      {totalCount > 1 && (
        <button type="button" onClick={handleRemove} className="btn-remove">
          <IcoX />
        </button>
      )}
    </div>
  );
});
PasoRow.displayName = 'PasoRow';

const RecipeForm = ({ recipe, onSuccess, onCancel }) => {
  const isEditing = !!recipe;
  const draftTimerRef = useRef(null);

  const [formData, setFormData] = useState(() => {
    if (!recipe) {
      try {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) { console.error('Error leyendo borrador:', e); }
    }
    if (recipe) {
      return {
        ...recipe,
        puntos:        recipe.puntos        ?? 0,
        tiempoMinutos: recipe.tiempoMinutos ?? 0,
        ingredientes:  recipe.ingredientes?.length ? recipe.ingredientes : [''],
        pasos:         recipe.pasos?.length        ? recipe.pasos        : [''],
        nutri: { ...NUTRI_VACIA, ...(recipe.nutri || {}) },
      };
    }
    return { ...FORM_INICIAL, nutri: { ...NUTRI_VACIA } };
  });

  const [loading,           setLoading]           = useState(false);
  const [showAdvancedNutri, setShowAdvancedNutri] = useState(false);

  useEffect(() => {
    if (isEditing) return;
    clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    }, 500);
    return () => clearTimeout(draftTimerRef.current);
  }, [formData, isEditing]);

  const handleChange = useCallback(
    e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value })),
    []
  );

  const handleNutriChange = useCallback(
    (field, value) =>
      setFormData(prev => ({ ...prev, nutri: { ...prev.nutri, [field]: parseFloat(value) || 0 } })),
    []
  );

  const handleSaludToggle = useCallback(
    c => setFormData(prev => ({
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
  const removeIngrediente = useCallback(i => setFormData(p => ({ ...p, ingredientes: p.ingredientes.filter((_, x) => x !== i) })), []);
  const addPaso           = useCallback(() => setFormData(p => ({ ...p, pasos: [...p.pasos, ''] })), []);
  const removePaso        = useCallback(i => setFormData(p => ({ ...p, pasos: p.pasos.filter((_, x) => x !== i) })), []);
  const toggleAdvanced    = useCallback(() => setShowAdvancedNutri(v => !v), []);

  const handleSubmit = useCallback(async e => {
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
        clearTimeout(draftTimerRef.current);
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

        <InfoBasicaSection
          formData={formData}
          handleChange={handleChange}
          categorias={CATEGORIAS}
        />

        <div className="form-section">
          <h3><IcoSalud />Condiciones de Salud</h3>
          <div className="salud-grid">
            {CONDICIONES_SALUD.map(condicion => (
              <SaludCheckbox
                key={condicion}
                condicion={condicion}
                checked={formData.salud?.includes(condicion) ?? false}
                onToggle={handleSaludToggle}
              />
            ))}
          </div>
        </div>

        <div className="form-section">
          <h3><IcoIng />Ingredientes</h3>
          {formData.ingredientes.map((ing, i) => (
            <IngredienteRow
              key={ing || `__empty-ing-${i}`}
              value={ing}
              index={i}
              totalCount={formData.ingredientes.length}
              onChange={handleIngChange}
              onRemove={removeIngrediente}
            />
          ))}
          <button type="button" onClick={addIngrediente} className="btn-add">
            <IcoPlus />Agregar Ingrediente
          </button>
        </div>

        <div className="form-section">
          <h3><IcoPasos />Pasos de Preparación</h3>
          {formData.pasos.map((paso, i) => (
            <PasoRow
              key={paso || `__empty-paso-${i}`}
              value={paso}
              index={i}
              totalCount={formData.pasos.length}
              onChange={handlePasoChange}
              onRemove={removePaso}
            />
          ))}
          <button type="button" onClick={addPaso} className="btn-add">
            <IcoPlus />Agregar Paso
          </button>
        </div>

        <div className="form-section">
          <h3><IcoNutri />Información Nutricional Básica</h3>
          <div className="nutri-grid">
            {NUTRI_BASICA.map(({ label, field, step }) => (
              <NutriField
                key={field}
                label={label}
                field={field}
                value={formData.nutri[field]}
                step={step}
                onChange={handleNutriChange}
              />
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
                  <NutriField key={f} label={l} field={f} value={formData.nutri[f]} step={s} onChange={handleNutriChange} />
                ))}
              </div>

              <h4>Vitaminas</h4>
              <div className="nutri-grid">
                {NUTRI_VITAMINAS.map(({ l, f, s }) => (
                  <NutriField key={f} label={l} field={f} value={formData.nutri[f]} step={s} onChange={handleNutriChange} />
                ))}
              </div>

              <h4>Carotenoides y Otros Compuestos</h4>
              <div className="nutri-grid">
                {NUTRI_OTROS_MICRO.map(({ l, f }) => (
                  <NutriField key={f} label={l} field={f} value={formData.nutri[f]} step={0.1} onChange={handleNutriChange} />
                ))}
              </div>

              <h4>Azúcares</h4>
              <div className="nutri-grid">
                {NUTRI_AZUCARES.map(({ l, f }) => (
                  <NutriField key={f} label={l} field={f} value={formData.nutri[f]} step={0.1} onChange={handleNutriChange} />
                ))}
              </div>

              <h4>Grasas Detalladas</h4>
              <div className="nutri-grid">
                {NUTRI_GRASAS.map(({ l, f }) => (
                  <NutriField key={f} label={l} field={f} value={formData.nutri[f]} step={0.1} onChange={handleNutriChange} />
                ))}
              </div>

              <h4>Ácidos Grasos</h4>
              <div className="nutri-grid">
                {NUTRI_ACIDOS_GRASOS.map(({ l, f }) => (
                  <NutriField key={f} label={l} field={f} value={formData.nutri[f]} step={0.01} onChange={handleNutriChange} />
                ))}
              </div>

              <h4>Aminoácidos</h4>
              <div className="nutri-grid">
                {NUTRI_AMINOACIDOS.map(({ l, f }) => (
                  <NutriField key={f} label={l} field={f} value={formData.nutri[f]} step={0.01} onChange={handleNutriChange} />
                ))}
              </div>
            </div>
          )}
        </div>

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