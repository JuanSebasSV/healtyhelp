const Stats = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <h3>Total Usuarios</h3>
        <p className="stat-number">{stats.totalUsers}</p>
      </div>
      
      <div className="stat-card">
        <h3>Administradores</h3>
        <p className="stat-number">{stats.admins}</p>
      </div>
      
      <div className="stat-card">
        <h3>Usuarios Regulares</h3>
        <p className="stat-number">{stats.regularUsers}</p>
      </div>
    </div>
  );
};

export default Stats;