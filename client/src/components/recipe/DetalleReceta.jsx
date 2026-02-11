import React, { useEffect, useState } from 'react';
import NutricionGrafico from './NutricionGrafico';

const DetalleReceta = ({ receta, cerrar }) => {
  const [verNutriDetalle, setVerNutriDetalle] = useState(false);
  
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="modal-overlay" onClick={cerrar}>
      <div className="modal-contenedor-receta" onClick={(e) => e.stopPropagation()}>
        {!verNutriDetalle && <button className="modal-cerrar" onClick={cerrar}>✕</button>}

        <div className="modal-col modal-izq">
          <img src={receta.img} alt={receta.nombre} className="modal-img" />
          <h2>{receta.nombre}</h2>
          <p className="modal-desc">{receta.desc}</p>

          <div className="modal-seccion">
            <h3>Ingredientes</h3>
            <ul>
              {receta.ingredientes.map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
          </div>

          <div className="modal-seccion">
            <h3>Preparación</h3>
            <ol>
              {receta.pasos.map((paso, i) => (
                <li key={i}>{paso}</li>
              ))}
            </ol>
          </div>

          <div className="modal-seccion">
            <h3>Puntuación: ⭐ {receta.puntos}/5</h3>
            <div className="comentarios">
              {receta.comentarios.map((com, i) => (
                <div key={i} className="comentario">
                  <strong>{com.usuario}</strong>
                  <p>{com.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-col modal-der">
          <NutricionGrafico nutri={receta.nutri} onModalChange={setVerNutriDetalle} />
        </div>
      </div>
    </div>
  );
};

export default DetalleReceta;