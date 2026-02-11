import React, { useState } from 'react';

// 🔒 TODO: Conectar con backend para obtener historial real del usuario
const VistaHistorial = ({ recetas }) => {
  const [periodo, setPeriodo] = useState('hoy');

  // 📝 Simulación temporal - reemplazar con datos del backend
  const historialRecetas = recetas.slice(0, 3);

  return (
    <div className="vista-historial">
      <h1>Mi Historial</h1>
      <div className="periodo-btns">
        <button className={periodo === 'hoy' ? 'activo' : ''} onClick={() => setPeriodo('hoy')}>
          Hoy
        </button>
        <button className={periodo === 'semana' ? 'activo' : ''} onClick={() => setPeriodo('semana')}>
          Esta Semana
        </button>
        <button className={periodo === 'mes' ? 'activo' : ''} onClick={() => setPeriodo('mes')}>
          Este Mes
        </button>
      </div>
      <div className="historial-grid">
        {historialRecetas.map(receta => (
          <div key={receta.id} className="historial-item">
            <img src={receta.img} alt={receta.nombre} />
            <div className="historial-info">
              <h3>{receta.nombre}</h3>
              <p className="historial-fecha">
                {new Date().toLocaleDateString()}
              </p>
              <p>{receta.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 📝 Nota para integración futura */}
      {historialRecetas.length === 0 && (
        <div className="vacio">
          <p>Aún no has visto ninguna receta.</p>
        </div>
      )}
    </div>
  );
};

export default VistaHistorial;