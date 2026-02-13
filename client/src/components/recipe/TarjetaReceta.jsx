import React, { useState } from 'react';
import DetalleReceta from './DetalleReceta';
import './TarjetaReceta.css';

const TarjetaReceta = ({ receta, toggleFav, esFav }) => {
  const [verDetalle, setVerDetalle] = useState(false);

  return (
    <>
      <div className="tarjetaReceta" onClick={() => setVerDetalle(true)}>
        <div className="tarjetaImg">
          <img src={receta.img} alt={receta.nombre} />
          <button
            className={`btnFav ${esFav ? 'activo' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleFav(receta.id);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
        <div className="tarjetaInfo">
          <h3>{receta.nombre}</h3>
          <p>{receta.desc}</p>
          <div className="tarjetaPuntuacion">
            ⭐ {receta.puntos}/5
          </div>
        </div>
      </div>

      {verDetalle && (
        <DetalleReceta receta={receta} cerrar={() => setVerDetalle(false)} />
      )}
    </>
  );
};

export default TarjetaReceta;
