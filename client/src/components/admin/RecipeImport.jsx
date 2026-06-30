import { useState, useEffect, useCallback, useRef, memo } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import './RecipeImport.css';

const STORAGE_KEY = 'healtyhelp_import_draft';

const NUTRI_SECCIONES = [
  {
    titulo: '🔥 Macros principales',
    campos: [
      { key: 'cal',        label: 'Calorías',        unidad: 'kcal' },
      { key: 'carb',       label: 'Carbohidratos',   unidad: 'g'    },
      { key: 'gras',       label: 'Grasas',          unidad: 'g'    },
      { key: 'prot',       label: 'Proteínas',       unidad: 'g'    },
      { key: 'fiber',      label: 'Fibra',           unidad: 'g'    },
      { key: 'carbNetos',  label: 'Carbs netos',     unidad: 'g'    },
      { key: 'sodio',      label: 'Sodio',           unidad: 'mg'   },
      { key: 'colesterol', label: 'Colesterol',      unidad: 'mg'   },
    ],
  },
  {
    titulo: '🧂 Minerales',
    campos: [
      { key: 'calcio',   label: 'Calcio',   unidad: 'mg' },
      { key: 'hierro',   label: 'Hierro',   unidad: 'mg' },
      { key: 'potasio',  label: 'Potasio',  unidad: 'mg' },
      { key: 'magnesio', label: 'Magnesio', unidad: 'mg' },
      { key: 'fosforo',  label: 'Fósforo',  unidad: 'mg' },
      { key: 'zinc',     label: 'Zinc',     unidad: 'mg' },
    ],
  },
  {
    titulo: '💊 Vitaminas',
    campos: [
      { key: 'vitA',   label: 'Vitamina A',   unidad: 'µg' },
      { key: 'vitC',   label: 'Vitamina C',   unidad: 'mg' },
      { key: 'vitD',   label: 'Vitamina D',   unidad: 'µg' },
      { key: 'vitE',   label: 'Vitamina E',   unidad: 'mg' },
      { key: 'vitK',   label: 'Vitamina K',   unidad: 'µg' },
      { key: 'vitB12', label: 'Vitamina B12', unidad: 'µg' },
      { key: 'vitB6',  label: 'Vitamina B6',  unidad: 'mg' },
      { key: 'folato', label: 'Folato B9',    unidad: 'µg' },
    ],
  },
  {
    titulo: '🧈 Grasas detalladas',
    campos: [
      { key: 'grasSat',     label: 'Saturadas',       unidad: 'g' },
      { key: 'grasMonoins', label: 'Monoinsaturadas', unidad: 'g' },
      { key: 'grasPoliins', label: 'Poliinsaturadas', unidad: 'g' },
      { key: 'grasTrans',   label: 'Trans',           unidad: 'g' },
      { key: 'omega3',      label: 'Omega-3',         unidad: 'g' },
      { key: 'omega6',      label: 'Omega-6',         unidad: 'g' },
    ],
  },
];

const NutriEditorModal = memo(({ receta, onGuardar, onCerrar }) => {
  const [nutri,          setNutri]   = useState({ ...(receta.nutri || {}) });
  const [seccionAbierta, setSeccion] = useState(0);

  const handleChange = useCallback((key, val) => {
    setNutri(prev => ({ ...prev, [key]: parseFloat(val) || 0 }));
  }, []);

  return (
    <div className="nutri-editor-overlay" onClick={onCerrar}>
      <div className="nutri-editor-modal" onClick={e => e.stopPropagation()}>
        <div className="nutri-editor-header">
          <div>
            <h3>✏️ Editor Nutricional</h3>
            <p className="nutri-editor-receta-nombre">{receta.nombre}</p>
          </div>
          <button className="nutri-editor-cerrar" onClick={onCerrar}>✕</button>
        </div>

        <div className="nutri-editor-body">
          {NUTRI_SECCIONES.map((sec, si) => (
            <div key={si}>
              <button
                className={`nutri-seccion-titulo ${seccionAbierta === si ? 'abierta' : ''}`}
                onClick={() => setSeccion(seccionAbierta === si ? -1 : si)}
              >
                {sec.titulo}
                <span className="nutri-seccion-arrow">{seccionAbierta === si ? '▲' : '▼'}</span>
              </button>
              {seccionAbierta === si && (
                <div className="nutri-campos-grid">
                  {sec.campos.map(c => (
                    <div key={c.key} className="nutri-campo">
                      <label>{c.label}</label>
                      <div className="nutri-campo-input-wrap">
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={nutri[c.key] ?? 0}
                          onChange={e => handleChange(c.key, e.target.value)}
                        />
                        <span className="nutri-unidad">{c.unidad}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="nutri-editor-footer">
          <button className="btn-cancelar-nutri" onClick={onCerrar}>Cancelar</button>
          <button className="btn-guardar-nutri" onClick={() => onGuardar(nutri)}>
            💾 Guardar nutrición
          </button>
        </div>
      </div>
    </div>
  );
});
NutriEditorModal.displayName = 'NutriEditorModal';

const ReviewCard = memo(({ receta, index, onChange }) => {
  const [editandoNutri, setEditandoNutri] = useState(false);
  const nutri        = receta.nutri || {};
  const saludVisible = (receta.salud || []).slice(0, 3);
  const saludExtra   = (receta.salud || []).length - 3;

  const handleNombre = useCallback(e => onChange(index, 'nombre', e.target.value), [index, onChange]);
  const handleDesc   = useCallback(e => onChange(index, 'desc',   e.target.value), [index, onChange]);
  const handleImg    = useCallback(e => onChange(index, 'img',    e.target.value), [index, onChange]);

  const handleGuardarNutri = useCallback(nuevoNutri => {
    onChange(index, 'nutri', nuevoNutri);
    setEditandoNutri(false);
  }, [index, onChange]);

  return (
    <>
      <div className="review-card">
        <div className="review-img-wrap">
          {receta.img
            ? <img src={receta.img} alt={receta.nombre} onError={e => { e.target.style.display = 'none'; }} />
            : <div className="review-img-placeholder">🍽️</div>
          }
        </div>

        <div className="review-card-body">
          <input
            className="review-field-nombre"
            value={receta.nombre || ''}
            onChange={handleNombre}
            placeholder="Nombre de la receta"
          />

          <textarea
            className="review-field-desc"
            value={receta.desc || ''}
            onChange={handleDesc}
            rows={2}
            placeholder="Descripción..."
          />

          <div className="review-meta">
            <span className={`badge cat-${receta.cat}`}>{receta.cat}</span>
            {saludVisible.map(s => (
              <span key={s} className="badge-salud">{s.replace(/-/g, ' ')}</span>
            ))}
            {saludExtra > 0 && <span className="badge-mas">+{saludExtra}</span>}
          </div>

          <div className="review-nutri-resumen">
            <span>🔥 {nutri.cal || 0} kcal</span>
            <span>🥩 {nutri.prot || 0}g prot</span>
            <span>🍞 {nutri.carb || 0}g carb</span>
            <span>🧈 {nutri.gras || 0}g gras</span>
            <button className="btn-editar-nutri" onClick={() => setEditandoNutri(true)}>
              ✏️ Editar
            </button>
          </div>

          <div className="review-img-field">
            <input
              className="image-url-input"
              value={receta.img || ''}
              onChange={handleImg}
              placeholder="https://... URL de la imagen (opcional)"
            />
            <span className={`image-status ${receta.img ? 'ok' : 'empty'}`}>
              {receta.img ? '✅ Imagen asignada' : '⚠️ Sin imagen'}
            </span>
          </div>
        </div>
      </div>

      {editandoNutri && (
        <NutriEditorModal
          receta={receta}
          onGuardar={handleGuardarNutri}
          onCerrar={() => setEditandoNutri(false)}
        />
      )}
    </>
  );
});
ReviewCard.displayName = 'ReviewCard';

const RecipeImport = ({ onSuccess }) => {
  const [recetas,    setRecetas]    = useState(null);
  const [mode,       setMode]       = useState('add');
  const [loading,    setLoading]    = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [hasDraft,   setHasDraft]   = useState(false);
  const [paso,       setPaso]       = useState('upload');

  const draftTimerRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (Array.isArray(draft.recipes) && draft.recipes.length > 0) {
          setRecetas(draft.recipes);
          setMode(draft.mode || 'add');
          setHasDraft(true);
          setPaso('review');
          toast.info(`📂 Borrador recuperado: ${draft.recipes.length} recetas pendientes`, { autoClose: 5000 });
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!recetas || recetas.length === 0) return;
    clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ recipes: recetas, mode }));
      } catch (e) { console.error('Error guardando borrador:', e); }
    }, 500);
    return () => clearTimeout(draftTimerRef.current);
  }, [recetas, mode]);

  const handleDrag = useCallback(e => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const processFile = useCallback(file => {
    if (!file) return;
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      toast.error('❌ Solo se aceptan archivos .json');
      return;
    }
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const json = JSON.parse(event.target.result);
        if (!Array.isArray(json)) {
          toast.error('❌ El archivo debe contener un array de recetas');
          return;
        }
        setRecetas(json);
        setHasDraft(false);
        setPaso('review');
        toast.success(`✅ ${json.length} recetas cargadas — revisa y edita antes de importar`);
      } catch {
        toast.error('❌ Archivo JSON inválido o mal formado');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(e => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    processFile(e.dataTransfer.files[0]);
  }, [processFile]);

  const handleFileChange = useCallback(e => processFile(e.target.files[0]), [processFile]);

  const handleChange = useCallback((index, field, value) => {
    setRecetas(prev => {
      const copia = [...prev];
      copia[index] = { ...copia[index], [field]: value };
      return copia;
    });
  }, []);

  const clearDraft = useCallback(() => {
    clearTimeout(draftTimerRef.current);
    localStorage.removeItem(STORAGE_KEY);
    setRecetas(null);
    setHasDraft(false);
    setPaso('upload');
    toast.info('🗑️ Borrador descartado');
  }, []);

  const handleImport = useCallback(async () => {
    if (!recetas || recetas.length === 0) return;

    if (mode === 'replace') {
      const ok = window.confirm(
        `⚠️ ¿ELIMINAR todas las recetas existentes y reemplazarlas con ${recetas.length} nuevas?\n\nEsta acción no se puede deshacer.`
      );
      if (!ok) return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/recipes/import', { recipes: recetas, mode });

      if (!data.success || !data.result?.created) {
        throw new Error(data.error || 'El servidor no confirmó la importación');
      }

      clearTimeout(draftTimerRef.current);
      localStorage.removeItem(STORAGE_KEY);
      toast.success(`✅ ${data.result.created} recetas importadas correctamente a la base de datos`);
      setRecetas(null);
      setHasDraft(false);
      setPaso('upload');
      onSuccess();
    } catch (error) {
      const msg = error.response?.data?.error || error.message || 'Error importando';
      toast.error(`❌ ${msg}`);
      toast.warn('💾 Tu progreso sigue guardado localmente. Puedes reintentar.', { autoClose: 7000 });
    } finally {
      setLoading(false);
    }
  }, [recetas, mode, onSuccess]);

  if (paso === 'upload') {
    return (
      <div className="recipe-import">
        <h2>📤 Importar Recetas desde JSON</h2>

        <div className="import-options">
          <label className={mode === 'add' ? 'active' : ''}>
            <input type="radio" value="add" checked={mode === 'add'} onChange={() => setMode('add')} />
            <span>➕ Agregar nuevas (mantener existentes)</span>
          </label>
          <label className={mode === 'replace' ? 'active' : ''}>
            <input type="radio" value="replace" checked={mode === 'replace'} onChange={() => setMode('replace')} />
            <span>🔄 Reemplazar todas (⚠️ elimina existentes)</span>
          </label>
        </div>

        <div className="import-instructions">
          <h3>📝 Formato del archivo JSON:</h3>
          <pre>{`[
  {
    "nombre": "Nombre de la receta",
    "desc": "Descripción breve",
    "img": "URL de la imagen (opcional)",
    "cat": "desayuno | almuerzo | cena | postres-snacks",
    "salud": ["diabetes", "vegano"],
    "ingredientes": ["Ingrediente 1", "Ingrediente 2"],
    "pasos": ["Paso 1", "Paso 2"],
    "nutri": { "cal": 320, "prot": 12, "carb": 40, "gras": 8 }
  }
]`}</pre>
        </div>

        <div
          className={`file-dropzone ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            id="file-input"
            style={{ display: 'none' }}
          />
          <label htmlFor="file-input" className="file-label">
            <span className="dropzone-icon">📁</span>
            <span>Arrastra tu archivo JSON aquí o haz click para seleccionar</span>
            <span className="dropzone-sub">Solo archivos .json</span>
          </label>
        </div>
      </div>
    );
  }

  const sinImagen = recetas.filter(r => !r.img).length;

  return (
    <div className="recipe-import">
      <h2>📤 Importar Recetas desde JSON</h2>

      {hasDraft && (
        <div className="draft-banner">
          <div className="draft-banner-info">
            <span className="draft-icon">💾</span>
            <div>
              <strong>Borrador guardado automáticamente</strong>
              <span className="draft-meta">{recetas.length} recetas pendientes de importar</span>
            </div>
          </div>
          <div className="draft-banner-actions">
            <button className="btn-draft-descartar" onClick={clearDraft}>🗑️ Descartar</button>
          </div>
        </div>
      )}

      <div className="review-header">
        <button className="btn-back-step" onClick={() => setPaso('upload')}>← Cargar otro archivo</button>
        <div className="review-header-info">
          <span className="review-count">{recetas.length} receta{recetas.length !== 1 ? 's' : ''} para importar</span>
          {sinImagen > 0 && <span className="sin-imagen-badge">⚠️ {sinImagen} sin imagen</span>}
          <span className="draft-auto-badge">💾 Guardado automático activo</span>
        </div>
      </div>

      <div className="review-grid">
        {recetas.map((receta, i) => (
          <ReviewCard
            key={i}
            receta={receta}
            index={i}
            onChange={handleChange}
          />
        ))}
      </div>

      <button onClick={handleImport} disabled={loading} className="btn-import">
        {loading
          ? '⏳ Importando...'
          : `📤 Importar ${recetas.length} Receta${recetas.length !== 1 ? 's' : ''} a la BD`}
      </button>
    </div>
  );
};

export default RecipeImport;