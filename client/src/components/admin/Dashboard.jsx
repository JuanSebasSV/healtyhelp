import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import UserList from './UserList';
import Stats from './Stats';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // 🛡️ SEGURIDAD: Verificar que sea admin
  useEffect(() => {
    if (!isAdmin()) {
      toast.error('Acceso denegado - Requiere permisos de administrador');
      navigate('/');
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users')
      ]);

      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Acceso denegado');
        navigate('/');
      } else {
        toast.error('Error cargando datos del panel');
      }
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('⚠️ ¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('✅ Usuario eliminado correctamente');
      
      await logAdminAction('delete_user', userId);
      
      fetchData();
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error eliminando usuario';
      toast.error(`❌ ${errorMsg}`);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success(`✅ Rol actualizado a ${newRole}`);
      
      await logAdminAction('change_role', userId, { newRole });
      
      fetchData();
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error cambiando rol';
      toast.error(`❌ ${errorMsg}`);
    }
  };

  const logAdminAction = async (action, targetUserId, metadata = {}) => {
    try {
      await api.post('/admin/logs', {
        action,
        targetUserId,
        metadata,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  };

  // 🔍 Filtrar usuarios
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // 📄 Paginación
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // 📥 Exportar usuarios a CSV
  const exportToCSV = () => {
    const headers = ['ID', 'Nombre', 'Email', 'Rol', 'Verificado', 'Fecha Registro'];
    const csvData = filteredUsers.map(u => [
      u._id,
      u.name,
      u.email,
      u.role,
      u.isVerified ? 'Sí' : 'No',
      new Date(u.createdAt).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('✅ Datos exportados correctamente');
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Cargando panel de administración...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1>🛡️ Panel de Administración</h1>
          <p className="admin-subtitle">Bienvenido, {user?.name}</p>
        </div>
        <button onClick={() => navigate('/')} className="btn-back">
          ← Volver al inicio
        </button>
      </div>
      
      <Stats stats={stats} />
      
      <div className="admin-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-box">
          <select 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">Todos los roles</option>
            <option value="admin">Solo Admins</option>
            <option value="user">Solo Usuarios</option>
          </select>
        </div>

        <button onClick={exportToCSV} className="btn-export">
          📥 Exportar CSV
        </button>
      </div>
      
      <UserList 
        users={currentUsers}
        onDelete={handleDeleteUser}
        onChangeRole={handleChangeRole}
      />

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ← Anterior
          </button>
          
          <span className="page-info">
            Página {currentPage} de {totalPages}
          </span>
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Siguiente →
          </button>
        </div>
      )}

      <div className="admin-footer">
        <p>
          Mostrando {currentUsers.length} de {filteredUsers.length} usuarios
          {searchTerm && ` (filtrados de ${users.length} totales)`}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;