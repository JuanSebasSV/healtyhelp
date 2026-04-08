import React, { useState } from 'react';
import DetalleReceta from './DetalleReceta';
import ModalNutricionDetallada from './ModalNutricionDetallada';
import './TarjetaReceta.css';

// ── Helper: formatea el costo según moneda ────────────────────────────────────
const formatearCosto = (costo, moneda = 'COP') => {
  if (!costo || costo <= 0) return null;
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: moneda,
      minimumFractionDigits: moneda === 'COP' ? 0 : 2,
      maximumFractionDigits: moneda === 'COP' ? 0 : 2,
    }).format(costo);
  } catch {
    // Fallback si la moneda no es reconocida
    return `${moneda} ${costo.toFixed(2)}`;
  }
};

const TarjetaReceta = ({ receta, toggleFav, esFav }) => {
  const [vista, setVista] = useState(null);

  const prom  = receta.puntosProm   || 0;
  const total = receta.totalResenas || 0;

  const costoPorcion = receta.costoPorcion || 0;
  const moneda       = receta.moneda       || 'COP';
  const costoFormato = formatearCosto(costoPorcion, moneda);

  return (
    <>
      <div className="tarjetaReceta" onClick={() => setVista('detalle')}>
        <div className="tarjetaImg">
          <img src={receta.img} alt={receta.nombre} />
          <button
            className={`btnFav ${esFav ? 'activo' : ''}`}
            onClick={e => { e.stopPropagation(); toggleFav(receta._id); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* Badge de costo sobre la imagen — solo si tiene costo */}
          {costoFormato && (
            <div className="tarjeta-costo-badge">
              <span className="tarjeta-costo-icono">🍽️</span>
              <span className="tarjeta-costo-valor">{costoFormato}</span>
              <span className="tarjeta-costo-label">/porción</span>
            </div>
          )}
        </div>

        <div className="tarjetaInfo">
          <h3>{receta.nombre}</h3>
          <p>{receta.desc}</p>

          <div className="tarjetaPuntuacion">
            <div className="estrellas-mini">
              {[1, 2, 3, 4, 5].map(n => (
                <span
                  key={n}
                  className={`estrella-ico ${n <= Math.round(prom) ? 'llena' : 'vacia'}`}
                >★</span>
              ))}
            </div>
            <span className="tarjeta-prom-txt">
              {prom > 0 ? `${prom} (${total})` : 'Sin reseñas'}
            </span>
          </div>
        </div>
      </div>

      {vista === 'detalle' && (
        <DetalleReceta
          receta={receta}
          cerrar={() => setVista(null)}
          abrirNutricion={() => setVista('nutricion')}
        />
      )}

      {vista === 'nutricion' && (
        <ModalNutricionDetallada
          nutri={receta.nutri}
          cerrar={() => setVista(null)}
          volver={() => setVista('detalle')}
        />
      )}
    </>
  );
};

export default TarjetaReceta;