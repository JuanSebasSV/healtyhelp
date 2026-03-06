import { useState } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import './RecipeImport.css';

const RecipeImport = ({ onSuccess }) => {
  const [jsonFile, setJsonFile] = useState(null);
  const [mode, setMode] = useState('add');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const processFile = (file) => {
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target.result);
          
          if (!Array.isArray(json)) {
            toast.error('❌ El archivo debe contener un array de recetas');
            return;
          }

          setJsonFile(json);
          setPreview(json.slice(0, 3)); // Mostrar primeras 3
          toast.success(`✅ Archivo cargado: ${json.length} recetas`);
        } catch (error) {
          toast.error('❌ Archivo JSON inválido');
        }
      };
      reader.readAsText(file);
    } else {
      toast.error('❌ Solo se aceptan archivos .json');
    }
  };

  const handleImport = async () => {
    if (!jsonFile) {
      toast.error('❌ Primero carga un archivo JSON');
      return;
    }

    if (mode === 'replace') {
      const confirm = window.confirm(
        `⚠️ ¿ELIMINAR todas las recetas existentes y reemplazarlas con ${jsonFile.length} nuevas?`
      );
      if (!confirm) return;
    }

    setLoading(true);

    try {
      const { data } = await api.post('/recipes/import', {
        recipes: jsonFile,
        mode
      });

      toast.success(`✅ ${data.message}`);
      setJsonFile(null);
      setPreview(null);
      onSuccess();
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error importando';
      toast.error(`❌ ${errorMsg}`);
      
      if (error.response?.data?.details) {
        console.error('Detalles:', error.response.data.details);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recipe-import">
      <h2>📤 Importar Recetas desde JSON</h2>

      <div className="import-instructions">
        <h3>📝 Formato del archivo JSON:</h3>
        <pre>{`[
  {
    "nombre": "Nombre de la receta",
    "desc": "Descripción breve",
    "img": "URL de la imagen",
    "cat": "desayuno | almuerzo | cena | postres-snacks",
    "salud": ["diabetes", "vegano", ...],
    "puntos": 4.5,
    "ingredientes": ["Ingrediente 1", "Ingrediente 2"],
    "pasos": ["Paso 1", "Paso 2"],
    "nutri": { "cal": 320, "prot": 12, ... }
  }
]`}</pre>
      </div>

      <div className="import-options">
        <label className={mode === 'add' ? 'active' : ''}>
          <input
            type="radio"
            value="add"
            checked={mode === 'add'}
            onChange={(e) => setMode(e.target.value)}
          />
          <span>➕ Agregar nuevas (mantener existentes)</span>
        </label>

        <label className={mode === 'replace' ? 'active' : ''}>
          <input
            type="radio"
            value="replace"
            checked={mode === 'replace'}
            onChange={(e) => setMode(e.target.value)}
          />
          <span>🔄 Reemplazar todas (⚠️ elimina existentes)</span>
        </label>
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
          accept=".json"
          onChange={handleFileChange}
          disabled={loading}
          id="file-input"
          style={{ display: 'none' }}
        />
        <label htmlFor="file-input" className="file-label">
          📁 Arrastra aquí tu archivo JSON o haz click para seleccionar
        </label>
      </div>

      {preview && (
        <div className="preview-section">
          <h3>👀 Vista Previa (primeras 3 recetas):</h3>
          {preview.map((recipe, index) => (
            <div key={index} className="preview-card">
              <h4>{recipe.nombre}</h4>
              <p>{recipe.desc?.substring(0, 100)}...</p>
              <div className="preview-meta">
                <span className="badge">{recipe.cat}</span>
                <span className="badge">{recipe.salud?.length || 0} condiciones</span>
                <span className="badge">⭐ {recipe.puntos || 0}</span>
              </div>
            </div>
          ))}
          {jsonFile.length > 3 && (
            <p className="preview-more">
              ... y {jsonFile.length - 3} recetas más
            </p>
          )}
        </div>
      )}

      <button
        onClick={handleImport}
        disabled={!jsonFile || loading}
        className="btn-import"
      >
        {loading ? '⏳ Importando...' : `📤 Importar ${jsonFile?.length || 0} Recetas`}
      </button>
    </div>
  );
};

export default RecipeImport;