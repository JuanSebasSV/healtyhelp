import './Stats.css';

const Stats = ({ stats }) => {
  if (!stats) return null;

  const adminPercentage = stats.totalUsers > 0
    ? Math.round((stats.admins / stats.totalUsers) * 100)
    : 0;

  const superAdminPercentage = stats.totalUsers > 0
    ? Math.round((stats.superAdmins / stats.totalUsers) * 100)
    : 0;

  return (
    <div className="stats-container">
      <div className="stats-grid">

        {/* Total usuarios */}
        <div className="stat-card primary">
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Total Usuarios</h3>
            <p className="stat-number">{stats.totalUsers}</p>
            <span className="stat-label">Registrados en la plataforma</span>
          </div>
        </div>

        {/* Super Admin */}
        <div className="stat-card super-admin">
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Super Administrador</h3>
            <p className="stat-number">{stats.superAdmins}</p>
            <span className="stat-label">Control total del sistema</span>
          </div>
        </div>

        {/* Administradores */}
        <div className="stat-card success">
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="8" r="4"/>
              <path d="M6 20v-2a6 6 0 0 1 12 0v2"/>
              <path d="M19 11l1.5 1.5L23 10"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Administradores</h3>
            <p className="stat-number">{stats.admins}</p>
            <span className="stat-label">{adminPercentage}% del total</span>
          </div>
        </div>

        {/* Usuarios regulares */}
        <div className="stat-card info">
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Usuarios Regulares</h3>
            <p className="stat-number">{stats.regularUsers}</p>
            <span className="stat-label">{100 - adminPercentage - superAdminPercentage}% del total</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Stats;