import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import UserList from './UserList';
import Stats from './Stats';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 🔒 El backend valida que sea admin
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users')
      ]);

      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
    } catch (error) {
      toast.error('Error cargando datos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('Usuario eliminado');
      fetchData(); // Recargar datos
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error eliminando usuario');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success('Rol actualizado');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error cambiando rol');
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="admin-dashboard">
      <h1>Panel de Administración</h1>
      
      <Stats stats={stats} />
      
      <UserList 
        users={users}
        onDelete={handleDeleteUser}
        onChangeRole={handleChangeRole}
      />
    </div>
  );
};

export default Dashboard;