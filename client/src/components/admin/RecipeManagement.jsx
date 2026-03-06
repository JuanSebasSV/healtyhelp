import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import RecipeImport from './RecipeImport';
import RecipeForm from './RecipeForm';
import RecipeList from './RecipeList';
import './RecipeManagement.css';

const RecipeManagement = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [editingRecipe, setEditingRecipe] = useState(null);

  useEffect(() => {
    fetchRecipes();
    fetchStats();
  }, []);

  const fetchRecipes = async () => {
    try {
      const { data } = await api.get('/recipes');
      setRecipes(data.recipes);
    } catch (error) {
      toast.error('Error cargando recetas');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/recipes/stats/summary');
      setStats(data.stats);
    } catch (error) {
      console.error('Error cargando estadísticas');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta receta?')) return;

    try {
      await api.delete(`/recipes/${id}`);
      toast.success('✅ Receta eliminada');
      fetchRecipes();
      fetchStats();
    } catch (error) {
      toast.error('❌ Error eliminando receta');
    }
  };

  const handleEdit = (recipe) => {
    setEditingRecipe(recipe);
    setActiveTab('create');
  };

  const handleFormSuccess = () => {
    fetchRecipes();
    fetchStats();
    setActiveTab('list');
    setEditingRecipe(null);
  };

  const handleExport = async () => {
    try {
      const { data } = await api.get('/recipes/export/all');
      
      const blob = new Blob([JSON.stringify(data.recipes, null, 2)], {
        type: 'application/json'
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recetas_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      toast.success(`✅ ${data.count} recetas exportadas`);
    } catch (error) {
      toast.error('❌ Error exportando recetas');
    }
  };

  if (loading) {
    return <div className="loading">Cargando recetas...</div>;
  }

  return (
    <div className="recipe-management-content"> {/* ← Cambiado nombre de clase */}
      {/* SIN HEADER - Ya está en tu Dashboard */}

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

      {/* Tabs internos */}
      <div className="recipe-tabs">
        <button
          className={activeTab === 'list' ? 'active' : ''}
          onClick={() => setActiveTab('list')}
        >
          📋 Lista
        </button>
        <button
          className={activeTab === 'import' ? 'active' : ''}
          onClick={() => setActiveTab('import')}
        >
          📤 Importar
        </button>
        <button
          className={activeTab === 'create' ? 'active' : ''}
          onClick={() => {
            setEditingRecipe(null);
            setActiveTab('create');
          }}
        >
          ➕ Crear
        </button>
        <button onClick={handleExport} className="btn-export">
          📥 Exportar
        </button>
      </div>

      {/* Contenido */}
      <div className="recipe-content">
        {activeTab === 'list' && (
          <RecipeList
            recipes={recipes}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        )}

        {activeTab === 'import' && (
          <RecipeImport
            onSuccess={() => {
              fetchRecipes();
              fetchStats();
              setActiveTab('list');
            }}
          />
        )}

        {activeTab === 'create' && (
          <RecipeForm
            recipe={editingRecipe}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setEditingRecipe(null);
              setActiveTab('list');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default RecipeManagement;