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

  const handleSelectAll = (e) => {
    setSelectedRecipes(e.target.checked ? filteredRecipes.map(r => r._id) : []);
  };

  const handleSelectOne = (id) => {
    setSelectedRecipes(prev =>
      prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedRecipes.length === 0) return;
    if (onDeleteMultiple) {
      onDeleteMultiple(selectedRecipes);
      setSelectedRecipes([]);
    }
  };

  if (recipes.length === 0) {
    return (
      <div className="recipes-empty">
        <h3>📭 No hay recetas</h3>
        <p>Crea tu primera receta o importa desde un archivo JSON</p>
      </div>
    );
  }

  return (
    <div className="recipe-list">
      <div className="list-controls">
        <input
          type="text"
          placeholder="🔍 Buscar receta..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="filter-select"
        >
          <option value="all">Todas las categorías</option>
          <option value="desayuno">Desayuno</option>
          <option value="almuerzo">Almuerzo</option>
          <option value="cena">Cena</option>
          <option value="postres-snacks">Postres & Snacks</option>
        </select>

        {selectedRecipes.length > 0 && (
          <button className="btn-bulk-delete" onClick={handleBulkDelete}>
            🗑️ Eliminar {selectedRecipes.length} seleccionadas
          </button>
        )}
      </div>

      <div className="table-container">
        <table className="recipes-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    selectedRecipes.length === filteredRecipes.length &&
                    filteredRecipes.length > 0
                  }
                />
              </th>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Condiciones</th>
              <th>⭐ Puntos</th>
              <th>Calorías</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecipes.map(recipe => (
              <tr key={recipe._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRecipes.includes(recipe._id)}
                    onChange={() => handleSelectOne(recipe._id)}
                  />
                </td>
                <td>
                  {recipe.img ? (
                    <img
                      src={recipe.img}
                      alt={recipe.nombre}
                      className="recipe-thumbnail"
                    />
                  ) : (
                    <div className="recipe-thumbnail-placeholder">🍽️</div>
                  )}
                </td>
                <td>
                  <div className="recipe-name">
                    <strong>{recipe.nombre}</strong>
                    <span className="recipe-desc">
                      {recipe.desc?.substring(0, 60)}{recipe.desc?.length > 60 ? '...' : ''}
                    </span>
                  </div>
                </td>
                <td>
                  <span className={`badge cat-${recipe.cat}`}>
                    {recipe.cat}
                  </span>
                </td>
                <td>
                  <span className="health-count">
                    {recipe.salud?.length || 0} condiciones
                  </span>
                </td>
                {/* puntosProm es el campo correcto del modelo, no puntos */}
                <td>
                  {recipe.puntosProm > 0
                    ? `${recipe.puntosProm} (${recipe.totalResenas})`
                    : '—'}
                </td>
                <td>{recipe.nutri?.cal || 0} kcal</td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => onEdit(recipe)}
                      className="btn-edit"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDelete(recipe._id)}
                      className="btn-delete"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredRecipes.length === 0 && (
        <div className="no-results">
          <p>No se encontraron recetas con esos filtros</p>
        </div>
      )}
    </div>
  );
};

export default RecipeList;