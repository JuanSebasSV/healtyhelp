import React, { useState } from 'react';
import DetalleReceta from './DetalleReceta';
import './TarjetaReceta.css';

const TarjetaReceta = ({ receta, toggleFav, esFav }) => {
  const [verDetalle, setVerDetalle] = useState(false);

  const prom  = receta.puntosProm   || 0;
  const total = receta.totalResenas || 0;

  return (
    <>
      <article className="tarjetaReceta" onClick={() => setVerDetalle(true)}>

        {/* ── Bloque imagen ── */}
        <div className="tarjetaImg">
          <img src={receta.img} alt={receta.nombre} loading="lazy" />
          <button
            className={`btnFav ${esFav ? 'activo' : ''}`}
            onClick={e => { e.stopPropagation(); toggleFav(receta._id); }}
            aria-label={esFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        {/* ── Bloque info ── */}
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

      </article>

      {verDetalle && (
        <DetalleReceta receta={receta} cerrar={() => setVerDetalle(false)} />
      )}
    </>
  );
};

export default TarjetaReceta;