import './UserList.css';

const UserList = ({ users, onDelete, onChangeRole }) => {
  if (!users || users.length === 0) {
    return (
      <div className="user-list-empty">
        <p>📭 No se encontraron usuarios</p>
      </div>
    );
  }

  return (
    <div className="user-list-container">
      <div className="user-list-header">
        <h2>👥 Gestión de Usuarios ({users.length})</h2>
      </div>
      
      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Fecha Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className={user.role === 'admin' ? 'admin-row' : ''}>
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
                        🔗 Google
                      </span>
                    )}
                  </div>
                </td>
                
                <td>
                  <span className="user-email">{user.email}</span>
                </td>
                
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => onChangeRole(user._id, e.target.value)}
                    className={`role-select role-${user.role}`}
                  >
                    <option value="user">👤 Usuario</option>
                    <option value="admin">🛡️ Admin</option>
                  </select>
                </td>
                
                <td>
                  <div className="status-badges">
                    {user.isVerified ? (
                      <span className="badge verified">✓ Verificado</span>
                    ) : (
                      <span className="badge unverified">⏳ Sin verificar</span>
                    )}
                  </div>
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
                    <button
                      onClick={() => onDelete(user._id)}
                      className="btn-delete"
                      title="Eliminar usuario"
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
    </div>
  );
};

export default UserList;