import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import RecipeImport from './RecipeImport';
import RecipeForm from './RecipeForm';
import RecipeList from './RecipeList';
import './RecipeManagement.css';

const RecipeManagement = () => {
  const [activeTab,     setActiveTab]     = useState('list');
  const [recipes,       setRecipes]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [stats,         setStats]         = useState(null);
  const [editingRecipe, setEditingRecipe] = useState(null);

  useEffect(() => { fetchRecipes(); fetchStats(); }, []);

  const fetchRecipes = async () => {
    try {
      const { data } = await api.get('/recipes?limit=200');
      setRecipes(data.recipes);
    } catch { toast.error('Error cargando recetas'); }
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/recipes/stats/summary');
      setStats(data.stats);
    } catch { console.error('Error cargando estadísticas'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta receta?')) return;
    try {
      await api.delete(`/recipes/${id}`);
      toast.success('Receta eliminada');
      fetchRecipes(); fetchStats();
    } catch { toast.error('Error eliminando receta'); }
  };

  const handleDeleteMultiple = async (ids) => {
    if (!window.confirm(`¿Eliminar ${ids.length} recetas seleccionadas?`)) return;
    try {
      await api.post('/recipes/delete-multiple', { ids });
      toast.success(`${ids.length} recetas eliminadas`);
      fetchRecipes(); fetchStats();
    } catch { toast.error('Error eliminando recetas'); }
  };

  const handleEdit = (recipe) => { setEditingRecipe(recipe); setActiveTab('create'); };
  const handleFormSuccess = () => { fetchRecipes(); fetchStats(); setActiveTab('list'); setEditingRecipe(null); };

  const handleExport = async () => {
    try {
      const { data } = await api.get('/recipes/export/all');
      const blob = new Blob([JSON.stringify(data.recipes, null, 2)], { type: 'application/json' });
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `recetas_${new Date().toISOString().split('T')[0]}.json`; a.click();
      toast.success(`${data.count} recetas exportadas`);
    } catch { toast.error('Error exportando recetas'); }
  };

  if (loading) return <div className="loading">Cargando recetas...</div>;

  return (
    <div className="recipe-management-content">

      {/* Estadísticas */}
      {stats && (
        <div className="recipe-stats">
          <div className="stat-card">
            <span className="stat-label">Total Recetas</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          {stats.byCategory?.map((cat) => (
            <div key={cat._id} className="stat-card">
              <span className="stat-label">{cat._id}</span>
              <span className="stat-value">{cat.count}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="recipe-tabs">
        <button className={activeTab === 'list' ? 'active' : ''} onClick={() => setActiveTab('list')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:'5px'}}>
            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
          Lista
        </button>
        <button className={activeTab === 'import' ? 'active' : ''} onClick={() => setActiveTab('import')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:'5px'}}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Importar
        </button>
        <button className={activeTab === 'create' ? 'active' : ''} onClick={() => { setEditingRecipe(null); setActiveTab('create'); }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:'5px'}}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          Crear
        </button>
        <button onClick={handleExport} className="btn-export">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:'5px'}}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Exportar
        </button>
      </div>

      {/* Contenido */}
      <div className="recipe-content">
        {activeTab === 'list'   && <RecipeList recipes={recipes} onDelete={handleDelete} onEdit={handleEdit} onDeleteMultiple={handleDeleteMultiple} />}
        {activeTab === 'import' && <RecipeImport onSuccess={() => { fetchRecipes(); fetchStats(); setActiveTab('list'); }} />}
        {activeTab === 'create' && <RecipeForm recipe={editingRecipe} onSuccess={handleFormSuccess} onCancel={() => { setEditingRecipe(null); setActiveTab('list'); }} />}
      </div>
    </div>
  );
};

export default RecipeManagement;
