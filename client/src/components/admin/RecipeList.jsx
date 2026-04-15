import { useState } from 'react';
import './RecipeList.css';

const RecipeList = ({ recipes, onDelete, onEdit, onDeleteMultiple }) => {
  const [searchTerm,      setSearchTerm]      = useState('');
  const [filterCat,       setFilterCat]       = useState('all');
  const [selectedRecipes, setSelectedRecipes] = useState([]);

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat    = filterCat === 'all' || recipe.cat === filterCat;
    return matchesSearch && matchesCat;
  });

  const handleSelectAll = (e) => setSelectedRecipes(e.target.checked ? filteredRecipes.map(r => r._id) : []);
  const handleSelectOne = (id) => setSelectedRecipes(prev => prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]);
  const handleBulkDelete = () => { if (!selectedRecipes.length) return; onDeleteMultiple?.(selectedRecipes); setSelectedRecipes([]); };

  if (recipes.length === 0) {
    return (
      <div className="recipes-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{opacity:0.3,marginBottom:'1rem'}}>
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/>
          <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3v7"/>
        </svg>
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
          <input type="text" placeholder="Buscar receta..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
        </div>

        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="filter-select">
          <option value="all">Todas las categorías</option>
          <option value="desayuno">Desayuno</option>
          <option value="almuerzo">Almuerzo</option>
          <option value="cena">Cena</option>
          <option value="postres-snacks">Postres & Snacks</option>
        </select>

        {selectedRecipes.length > 0 && (
          <button className="btn-bulk-delete" onClick={handleBulkDelete}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:'5px'}}>
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Eliminar {selectedRecipes.length} seleccionadas
          </button>
        )}
      </div>

      {/* ── Tarjetas móvil ── */}
      <div className="recipe-cards-movil">
        {filteredRecipes.map(recipe => (
          <div key={recipe._id} className="rcard">
            <div className="rcard-top">
              {recipe.img
                ? <img src={recipe.img} alt={recipe.nombre} className="rcard-img" />
                : <div className="rcard-img-placeholder">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="1.5" style={{opacity:0.4}}>
                      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/>
                      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3v7"/>
                    </svg>
                  </div>
              }
              <div>
                <div className="rcard-nombre">{recipe.nombre}</div>
                <div className="rcard-desc">{recipe.desc?.substring(0, 70)}{recipe.desc?.length > 70 ? '…' : ''}</div>
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
                <input
                  type="checkbox"
                  checked={selectedRecipes.includes(recipe._id)}
                  onChange={() => handleSelectOne(recipe._id)}
                />
                <span>Seleccionar</span>
              </div>
              <div className="rcard-actions">
                <button onClick={() => onEdit(recipe)} className="btn-edit" title="Editar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button onClick={() => onDelete(recipe._id)} className="btn-delete" title="Eliminar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredRecipes.length === 0 && (
          <div className="no-results"><p>No se encontraron recetas con esos filtros</p></div>
        )}
      </div>

      {/* ── Tabla desktop ── */}
      <div className="table-container">
        <table className="recipes-table">
          <thead>
            <tr>
              <th><input type="checkbox" onChange={handleSelectAll} checked={selectedRecipes.length === filteredRecipes.length && filteredRecipes.length > 0} /></th>
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
              <tr key={recipe._id}>
                <td><input type="checkbox" checked={selectedRecipes.includes(recipe._id)} onChange={() => handleSelectOne(recipe._id)} /></td>
                <td>
                  {recipe.img
                    ? <img src={recipe.img} alt={recipe.nombre} className="recipe-thumbnail" />
                    : <div className="recipe-thumbnail-placeholder">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{opacity:0.4}}>
                          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/>
                          <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3v7"/>
                        </svg>
                      </div>
                  }
                </td>
                <td>
                  <div className="recipe-name">
                    <strong>{recipe.nombre}</strong>
                    <span className="recipe-desc">{recipe.desc?.substring(0,60)}{recipe.desc?.length > 60 ? '...' : ''}</span>
                  </div>
                </td>
                <td><span className={`badge cat-${recipe.cat}`}>{recipe.cat}</span></td>
                <td><span className="health-count">{recipe.salud?.length || 0} condiciones</span></td>
                <td>{recipe.puntosProm > 0 ? `${recipe.puntosProm} (${recipe.totalResenas})` : '—'}</td>
                <td>{recipe.nutri?.cal || 0} kcal</td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => onEdit(recipe)} className="btn-edit" title="Editar">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button onClick={() => onDelete(recipe._id)} className="btn-delete" title="Eliminar">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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