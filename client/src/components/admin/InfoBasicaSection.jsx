import { memo } from 'react';
import { IcoInfo } from './RecipeFormIcons';
import NumeroInput from './NumeroInput';

const InfoBasicaSection = memo(({ formData, handleChange, categorias }) => (
  <div className="form-section">
    <h3><IcoInfo />Información Básica</h3>
    <div className="form-group">
      <label htmlFor="rf-nombre">Nombre de la Receta *</label>
      <input
        id="rf-nombre"
        type="text" name="nombre"
        value={formData.nombre ?? ''}
        onChange={handleChange}
        placeholder="Ej: Ensalada Mediterránea"
        required
      />
    </div>
    <div className="form-group">
      <label htmlFor="rf-desc">Descripción *</label>
      <textarea
        id="rf-desc"
        name="desc"
        value={formData.desc ?? ''}
        onChange={handleChange}
        placeholder="Describe brevemente la receta..."
        rows="3"
        required
      />
    </div>
    <div className="form-group">
      <label htmlFor="rf-img">URL de Imagen</label>
      <input
        id="rf-img"
        type="url" name="img"
        value={formData.img ?? ''}
        onChange={handleChange}
        placeholder="https://..."
      />
    </div>
    <div className="form-row">
      <div className="form-group">
        <label htmlFor="rf-cat">Categoría *</label>
        <select id="rf-cat" name="cat" value={formData.cat ?? 'almuerzo'} onChange={handleChange} required>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="rf-tiempoMinutos">Tiempo (minutos)</label>
        <NumeroInput
          id="rf-tiempoMinutos"
          name="tiempoMinutos"
          value={formData.tiempoMinutos ?? 0}
          onChange={handleChange}
          min={0} max={999} step={5}
          placeholder="Ej: 30"
        />
      </div>
      <div className="form-group">
        <label htmlFor="rf-puntos">Puntuación (0-5)</label>
        <NumeroInput
          id="rf-puntos"
          name="puntos"
          value={formData.puntos ?? 0}
          onChange={handleChange}
          min={0} max={5} step={0.1}
        />
      </div>
    </div>
  </div>
));
InfoBasicaSection.displayName = 'InfoBasicaSection';

export default InfoBasicaSection;
