import './UserList.css';
import { useAuth } from '../../hooks/useAuth';

const UserList = ({ users, onDelete, onChangeRole }) => {
  const { user: currentUser } = useAuth();

  if (!users || users.length === 0) {
    return (
      <div className="user-list-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{opacity: 0.3}}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <line x1="23" y1="11" x2="17" y2="11"/>
        </svg>
        <p>No se encontraron usuarios</p>
      </div>
    );
  }

  const isSuperAdmin = currentUser?.isSuperAdmin === true;

  const canModify = (targetUser) => {
    // SUPER ADMIN puede modificar a CUALQUIERA excepto a sí mismo
    if (isSuperAdmin) {
      return targetUser._id !== currentUser?.id;
    }
    
    // Admin normal NO puede modificar:
    if (targetUser.isSuperAdmin) return false;  // Super Admin
    if (targetUser.role === 'admin') return false;  // Otros admins
    if (targetUser._id === currentUser?.id) return false;  // A sí mismo
    
    return true;
  };

  return (
    <div className="user-list-container">
      <div className="user-list-header">
        <h2>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign: 'middle', marginRight: '6px'}}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          Gestión de Usuarios ({users.length})
        </h2>
      </div>
      
      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Fecha Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const canEdit = canModify(user);
              
              return (
                <tr 
                  key={user._id} 
                  className={
                    user.isSuperAdmin ? 'super-admin-row' : 
                    user.role === 'admin' ? 'admin-row' : ''
                  }
                >
                  <td>
                    <div className="user-avatar">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} />
                      ) : (
                        <div className="avatar-placeholder">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td>
                    <div className="user-name-cell">
                      <span className="user-name">{user.name}</span>
                      {user.googleId && (
                        <span className="google-badge" title="Cuenta de Google">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign: 'middle', marginRight: '2px'}}>
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                          </svg>
                          Google
                        </span>
                      )}
                    </div>
                  </td>
                  
                  <td>
                    <span className="user-email">{user.email}</span>
                  </td>
                  
                  <td>
                    {canEdit ? (
                      <select
                        value={user.role}
                        onChange={(e) => onChangeRole(user._id, e.target.value)}
                        className={`role-select role-${user.role}`}
                      >
                        <option value="user">
                          Usuario
                        </option>
                        <option value="admin">
                          Administrador
                        </option>
                      </select>
                    ) : (
                      <div className="role-badge-readonly">
                        {user.isSuperAdmin ? (
                          <span className="badge super-admin">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign: 'middle', marginRight: '3px'}}>
                              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                            </svg>
                            Super Admin
                          </span>
                        ) : user.role === 'admin' ? (
                          <span className="badge admin">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign: 'middle', marginRight: '3px'}}>
                              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            Administrador
                          </span>
                        ) : (
                          <span className="badge user">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign: 'middle', marginRight: '3px'}}>
                              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                              <circle cx="12" cy="7" r="4"/>
                            </svg>
                            Usuario
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  
                  <td>
                    <span className="date-cell">
                      {new Date(user.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </td>
                  
                  <td>
                    <div className="action-buttons">
                      {canEdit ? (
                        <button
                          onClick={() => onDelete(user._id)}
                          className="btn-delete"
                          title="Eliminar usuario"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                          </svg>
                        </button>
                      ) : (
                        <span className="protected-badge" title="Usuario protegido">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;