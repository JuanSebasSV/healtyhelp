import { useState, useMemo, useCallback, useEffect, memo } from 'react';
import { optimizeCloudinary } from '../../utils/cloudinary';
import './RecipeList.css';

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 768px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = e => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isDesktop;
};

const IcoEdit = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
));
IcoEdit.displayName = 'IcoEdit';

const IcoTrash = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
));
IcoTrash.displayName = 'IcoTrash';

const IcoEmpty = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.3, marginBottom: '1rem' }}>
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/>
    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3v7"/>
  </svg>
));
IcoEmpty.displayName = 'IcoEmpty';

const IcoNoImg = memo(({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.4 }}>
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/>
    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3v7"/>
  </svg>
));
IcoNoImg.displayName = 'IcoNoImg';

const RecipeCard = memo(({ recipe, isSelected, onSelect, onEdit, onDelete }) => {
  const handleSelect = useCallback(() => onSelect(recipe._id), [recipe._id, onSelect]);
  const handleEdit   = useCallback(() => onEdit(recipe),       [recipe, onEdit]);
  const handleDelete = useCallback(() => onDelete(recipe._id), [recipe._id, onDelete]);

  return (
    <div className="rcard">
      <div className="rcard-top">
        {recipe.img
          ? <img src={optimizeCloudinary(recipe.img, 'q_auto,f_auto,w_400')} alt={recipe.nombre} className="rcard-img" width="160" height="120" loading="lazy" decoding="async" />
          : <div className="rcard-img-placeholder"><IcoNoImg size={20} /></div>
        }
        <div>
          <div className="rcard-nombre">{recipe.nombre}</div>
          <div className="rcard-desc">
            {recipe.desc?.substring(0, 70)}{recipe.desc?.length > 70 ? '…' : ''}
          </div>
        </div>
      </div>

      <div className="rcard-mid">
        <span className={`badge cat-${recipe.cat}`}>{recipe.cat}</span>
        <span className="health-count">{recipe.salud?.length || 0} cond.</span>
        <span className="health-count">{recipe.nutri?.cal || 0} kcal</span>
        {recipe.puntosProm > 0 && <span className="health-count">⭐ {recipe.puntosProm}</span>}
      </div>

      <div className="rcard-bottom">
        <div className="rcard-check-wrap">
          <input type="checkbox" checked={isSelected} onChange={handleSelect} />
          <span>Seleccionar</span>
        </div>
        <div className="rcard-actions">
          <button onClick={handleEdit} className="btn-edit" title="Editar"><IcoEdit /></button>
          <button onClick={handleDelete} className="btn-delete" title="Eliminar"><IcoTrash /></button>
        </div>
      </div>
    </div>
  );
});
RecipeCard.displayName = 'RecipeCard';

const RecipeRow = memo(({ recipe, isSelected, onSelect, onEdit, onDelete }) => {
  const handleSelect = useCallback(() => onSelect(recipe._id), [recipe._id, onSelect]);
  const handleEdit   = useCallback(() => onEdit(recipe),       [recipe, onEdit]);
  const handleDelete = useCallback(() => onDelete(recipe._id), [recipe._id, onDelete]);

  return (
    <tr>
      <td><input type="checkbox" checked={isSelected} onChange={handleSelect} /></td>
      <td>
        {recipe.img
          ? <img src={optimizeCloudinary(recipe.img, 'q_auto,f_auto,w_160')} alt={recipe.nombre} className="recipe-thumbnail" width="80" height="60" loading="lazy" decoding="async" />
          : <div className="recipe-thumbnail-placeholder"><IcoNoImg size={22} /></div>
        }
      </td>
      <td>
        <div className="recipe-name">
          <strong>{recipe.nombre}</strong>
          <span className="recipe-desc">{recipe.desc?.substring(0, 60)}{recipe.desc?.length > 60 ? '...' : ''}</span>
        </div>
      </td>
      <td><span className={`badge cat-${recipe.cat}`}>{recipe.cat}</span></td>
      <td><span className="health-count">{recipe.salud?.length || 0} condiciones</span></td>
      <td>{recipe.puntosProm > 0 ? `${recipe.puntosProm} (${recipe.totalResenas})` : '—'}</td>
      <td>{recipe.nutri?.cal || 0} kcal</td>
      <td>
        <div className="action-buttons">
          <button onClick={handleEdit} className="btn-edit" title="Editar"><IcoEdit /></button>
          <button onClick={handleDelete} className="btn-delete" title="Eliminar"><IcoTrash /></button>
        </div>
      </td>
    </tr>
  );
});
RecipeRow.displayName = 'RecipeRow';

const RecipeList = ({ recipes, onDelete, onEdit, onDeleteMultiple }) => {
  const isDesktop = useIsDesktop();

  const [searchTerm,       setSearchTerm]       = useState('');
  const [filterCat,        setFilterCat]        = useState('all');
  const [selectedRecipes,  setSelectedRecipes]  = useState(new Set());

  const filteredRecipes = useMemo(() => recipes.filter(recipe => {
    const matchesSearch = recipe.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat    = filterCat === 'all' || recipe.cat === filterCat;
    return matchesSearch && matchesCat;
  }), [recipes, searchTerm, filterCat]);

  const handleSelectAll = useCallback(e => {
    setSelectedRecipes(e.target.checked ? new Set(filteredRecipes.map(r => r._id)) : new Set());
  }, [filteredRecipes]);

  const handleSelectOne = useCallback(id => {
    setSelectedRecipes(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleBulkDelete = useCallback(() => {
    if (!selectedRecipes.size) return;
    onDeleteMultiple?.([...selectedRecipes]);
    setSelectedRecipes(new Set());
  }, [selectedRecipes, onDeleteMultiple]);

  const handleSearchChange = useCallback(e => setSearchTerm(e.target.value), []);
  const handleCatChange    = useCallback(e => setFilterCat(e.target.value),  []);

  const allSelected = selectedRecipes.size === filteredRecipes.length && filteredRecipes.length > 0;

  if (recipes.length === 0) {
    return (
      <div className="recipes-empty">
        <IcoEmpty />
        <h3>No hay recetas</h3>
        <p>Crea tu primera receta o importa desde un archivo JSON</p>
      </div>
    );
  }

  return (
    <div className="recipe-list">
      <div className="list-controls">
        <div className="search-box-list">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar receta..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>

        <select value={filterCat} onChange={handleCatChange} className="filter-select">
          <option value="all">Todas las categorías</option>
          <option value="desayuno">Desayuno</option>
          <option value="almuerzo">Almuerzo</option>
          <option value="cena">Cena</option>
          <option value="postres-snacks">Postres & Snacks</option>
        </select>

        {selectedRecipes.size > 0 && (
          <button className="btn-bulk-delete" onClick={handleBulkDelete}>
            <IcoTrash />
            Eliminar {selectedRecipes.size} seleccionadas
          </button>
        )}
      </div>

      {!isDesktop && (
        <div className="recipe-cards-movil">
          {filteredRecipes.map(recipe => (
            <RecipeCard
              key={recipe._id}
              recipe={recipe}
              isSelected={selectedRecipes.has(recipe._id)}
              onSelect={handleSelectOne}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
          {filteredRecipes.length === 0 && (
            <div className="no-results"><p>No se encontraron recetas con esos filtros</p></div>
          )}
        </div>
      )}

      {isDesktop && (
        <div className="table-container">
          <table className="recipes-table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" onChange={handleSelectAll} checked={allSelected} />
                </th>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Condiciones</th>
                <th>Puntuación</th>
                <th>Calorías</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecipes.map(recipe => (
                <RecipeRow
                  key={recipe._id}
                  recipe={recipe}
                  isSelected={selectedRecipes.has(recipe._id)}
                  onSelect={handleSelectOne}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </tbody>
          </table>
          {filteredRecipes.length === 0 && (
            <div className="no-results"><p>No se encontraron recetas con esos filtros</p></div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecipeList;