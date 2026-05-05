import React, { useEffect, memo } from 'react';
import NutricionGrafico from './NutricionGrafico';
import BtnConsumo from './BtnConsumo';
import useAuth from '../../hooks/useAuth';
import SeccionResenas from './SeccionResenas';
import './DetalleReceta.css';

const IconoCerrar = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
));
IconoCerrar.displayName = 'IconoCerrar';

const DetalleReceta = memo(({ receta, cerrar, abrirNutricion, resenaIdDestacada, respuestaIdDestacada }) => {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.cssText = `position:fixed;top:-${scrollY}px;left:0;right:0;overflow-y:scroll`;
    return () => {
      document.body.style.cssText = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  return (
    <div className="modal-overlay" onClick={cerrar}>
      <div className="modalContenedorReceta" onClick={e => e.stopPropagation()}>

        <button className="btn-cerrar-modal" onClick={cerrar} aria-label="Cerrar">
          <IconoCerrar />
        </button>

        <div className="modalCol modalIzq">
          <img src={receta.img} alt={receta.nombre} className="modalImg" loading="lazy" decoding="async" />
          <h2>{receta.nombre}</h2>

          {/* Tiempo debajo del título */}
 
          {receta.tiempoMinutos > 0 && (
            <div className="detalle-tiempo">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              Tiempo de preparación:&nbsp;
              <strong>
                {receta.tiempoMinutos < 60
                  ? `${receta.tiempoMinutos} min`
                  : `${Math.floor(receta.tiempoMinutos / 60)}h${receta.tiempoMinutos % 60 > 0 ? ` ${receta.tiempoMinutos % 60}min` : ''}`}
              </strong>
            </div>
          )}


          <p className="modalDesc">{receta.desc}</p>

          <div className="modalSeccion">
            <h3>Ingredientes</h3>
            <ul>{receta.ingredientes.map((ing, i) => <li key={i}>{ing}</li>)}</ul>
          </div>

          <div className="modalSeccion">
            <h3>Preparación</h3>
            <ol>{receta.pasos.map((paso, i) => <li key={i}>{paso}</li>)}</ol>
          </div>

          <BtnConsumo recetaId={receta._id} />

          <div className="modalSeccion resenas-seccion">
            <SeccionResenas
              receta={receta}
              user={user}
              isAuthenticated={isAuthenticated}
              resenaIdDestacada={resenaIdDestacada}
              respuestaIdDestacada={respuestaIdDestacada}
            />
          </div>
        </div>

        <div className="modalCol modalDer">
          <NutricionGrafico nutri={receta.nutri} abrirNutricion={abrirNutricion} />
        </div>

      </div>
    </div>
  );
});

DetalleReceta.displayName = 'DetalleReceta';

export default DetalleReceta;