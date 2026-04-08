import { useState } from 'react';
import './RecipeList.css';

const IcoEdit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IcoDelete = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const IcoSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IcoTrashMulti = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2"
    style={{ marginRight: '6px', flexShrink: 0 }}>
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
  </svg>
);
const IcoImage = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.5"
    style={{ color: 'rgba(255,255,255,0.2)' }}>
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

const BADGE_CLASS = {
  desayuno: 'cat-desayuno',
  almuerzo: 'cat-almuerzo',
  cena: 'cat-cena',
  'postres-snacks': 'cat-postres-snacks',
};
const BADGE_LABEL = {
  desayuno: 'Desayuno',
  almuerzo: 'Almuerzo',
  cena: 'Cena',
  'postres-snacks': 'Postres & Snacks',
};
const formatCosto = (valor, moneda = 'COP') => {
  if (!valor || valor === 0) return null;
  return valor.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' ' + moneda;
};

const RecipeList = ({ recipes, onDelete, onEdit, onDeleteMultiple }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [selectedRecipes, setSelectedRecipes] = useState([]);

  if (!recipes) return <p style={{ padding: '20px', color: 'rgba(255,255,255,0.6)' }}>Cargando recetas...</p>;

  if (recipes.length === 0) return (
    <div className="recipes-empty">
      <h3>No hay recetas</h3>
      <p>Crea tu primera receta o importa desde un archivo JSON</p>
    </div>
  );

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          recipe.desc?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = filterCat === 'all' || recipe.cat === filterCat;
    return matchesSearch && matchesCat;
  });

  const handleSelectAll = (e) =>
    setSelectedRecipes(e.target.checked ? filteredRecipes.map(r => r._id) : []);
  const handleSelectOne = (id) =>
    setSelectedRecipes(prev => prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]);
  const handleBulkDelete = () => {
    if (!selectedRecipes.length) return;
    onDeleteMultiple?.(selectedRecipes);
    setSelectedRecipes([]);
  };

  return (
    <div className="recipe-list">
      <div className="list-controls">
        <div className="search-box-list">
          <IcoSearch />
          <input type="text" placeholder="Buscar receta..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
        </div>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="filter-select">
          <option value="all">Todas las categorías</option>
          <option value="desayuno">Desayuno</option>
          <option value="almuerzo">Almuerzo</option>
          <option value="cena">Cena</option>
          <option value="postres-snacks">Postres &amp; Snacks</option>
        </select>
        {selectedRecipes.length > 0 && (
          <button className="btn-bulk-delete" onClick={handleBulkDelete}>
            <IcoTrashMulti />
            Eliminar {selectedRecipes.length} seleccionada{selectedRecipes.length !== 1 ? 's' : ''}
          </button>
        )}
      </div>

      <div className="table-container">
        <table className="recipes-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input type="checkbox" onChange={handleSelectAll}
                  checked={selectedRecipes.length === filteredRecipes.length && filteredRecipes.length > 0} />
              </th>
              <th style={{ width: '64px' }}>IMAGEN</th>
              <th>NOMBRE</th>
              <th>CATEGORÍA</th>
              <th>CONDICIONES</th>
              <th>PUNTUACIÓN</th>
              <th>CALORÍAS</th>
              <th>COSTO/PORCIÓN</th>
              <th style={{ width: '90px' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecipes.map(recipe => {
              const costoPorcion = formatCosto(recipe.costoPorcion, recipe.moneda);
              return (
                <tr key={recipe._id}>
                  <td>
                    <input type="checkbox" checked={selectedRecipes.includes(recipe._id)}
                      onChange={() => handleSelectOne(recipe._id)} />
                  </td>
                  <td>
                    {recipe.img
                      ? <img src={recipe.img} alt={recipe.nombre} className="recipe-thumbnail"
                          onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                      : null}
                    <div className="recipe-thumbnail-placeholder"
                      style={{ display: recipe.img ? 'none' : 'flex' }}>
                      <IcoImage />
                    </div>
                  </td>
                  <td>
                    <div className="recipe-name">
                      <strong>{recipe.nombre}</strong>
                      {recipe.desc && (
                        <span className="recipe-desc">
                          {recipe.desc.length > 70 ? recipe.desc.slice(0, 70) + '…' : recipe.desc}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${BADGE_CLASS[recipe.cat] || ''}`}>
                      {BADGE_LABEL[recipe.cat] || recipe.cat}
                    </span>
                  </td>
                  <td>
                    <span className="health-count">
                      {recipe.salud?.length > 0
                        ? `${recipe.salud.length} condición${recipe.salud.length !== 1 ? 'es' : ''}`
                        : '—'}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem' }}>
                      {recipe.puntosProm > 0 ? `★ ${recipe.puntosProm}` : '—'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)' }}>
                      {recipe.nutri?.cal > 0 ? `${recipe.nutri.cal} kcal` : '—'}
                    </span>
                  </td>
                  <td>
                    {costoPorcion
                      ? <span className="costo-badge">{costoPorcion}</span>
                      : <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.85rem' }}>—</span>}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-edit" onClick={() => onEdit(recipe)} title="Editar">
                        <IcoEdit />
                      </button>
                      <button className="btn-delete" onClick={() => onDelete(recipe._id)} title="Eliminar">
                        <IcoDelete />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredRecipes.length === 0 && (
        <div className="no-results"><p>No se encontraron recetas con esos filtros</p></div>
      )}
    </div>
  );
};

export default RecipeList;