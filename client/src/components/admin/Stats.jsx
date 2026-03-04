import './Stats.css';

const Stats = ({ stats }) => {
  if (!stats) return null;

  const verifiedPercentage = stats.totalUsers > 0 
    ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100) 
    : 0;

  const adminPercentage = stats.totalUsers > 0
    ? Math.round((stats.admins / stats.totalUsers) * 100)
    : 0;

  return (
    <div className="stats-container">
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Usuarios</h3>
            <p className="stat-number">{stats.totalUsers}</p>
            <span className="stat-label">Registrados en la plataforma</span>
          </div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-icon">🛡️</div>
          <div className="stat-content">
            <h3>Administradores</h3>
            <p className="stat-number">{stats.admins}</p>
            <span className="stat-label">{adminPercentage}% del total</span>
          </div>
        </div>
        
        <div className="stat-card info">
          <div className="stat-icon">😊</div>
          <div className="stat-content">
            <h3>Usuarios Regulares</h3>
            <p className="stat-number">{stats.regularUsers}</p>
            <span className="stat-label">{100 - adminPercentage}% del total</span>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Verificados</h3>
            <p className="stat-number">{stats.verifiedUsers || 0}</p>
            <span className="stat-label">{verifiedPercentage}% verificados</span>
          </div>
        </div>
      </div>

      <div className="verification-progress">
        <div className="progress-header">
          <span>Usuarios Verificados</span>
          <span>{verifiedPercentage}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${verifiedPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Stats;