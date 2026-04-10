// components/recetas/DetalleReceta.jsx
// Componente de detalle de receta.
// La lógica de reseñas/comentarios fue movida a SeccionResenas.jsx

import React, { useEffect } from 'react';
import NutricionGrafico from './NutricionGrafico';
import BtnConsumo from './BtnConsumo';
import useAuth from '../../hooks/useAuth';
import SeccionResenas from './SeccionResenas';
import './DetalleReceta.css';

const DetalleReceta = ({ receta, cerrar, abrirNutricion }) => {
  const { user, isAuthenticated } = useAuth();

  // ── Bloquear scroll del body mientras el modal está abierto ──
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position  = 'fixed';
    document.body.style.top       = `-${scrollY}px`;
    document.body.style.left      = '0';
    document.body.style.right     = '0';
    document.body.style.overflowY = 'scroll';
    return () => {
      document.body.style.position  = '';
      document.body.style.top       = '';
      document.body.style.left      = '';
      document.body.style.right     = '';
      document.body.style.overflowY = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  return (
    <div className="modal-overlay" onClick={cerrar}>
      <div className="modalContenedorReceta" onClick={e => e.stopPropagation()}>

        <button className="btn-cerrar-modal" onClick={cerrar} aria-label="Cerrar">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        {/* ── Columna izquierda ── */}
        <div className="modalCol modalIzq">
          <img src={receta.img} alt={receta.nombre} className="modalImg" />
          <h2>{receta.nombre}</h2>
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

          {/* ══════════ RESEÑAS ══════════ */}
          <div className="modalSeccion resenas-seccion">
            <SeccionResenas
              receta={receta}
              user={user}
              isAuthenticated={isAuthenticated}
            />
          </div>
        </div>

        {/* ── Columna derecha ── */}
        <div className="modalCol modalDer">
          <NutricionGrafico nutri={receta.nutri} abrirNutricion={abrirNutricion} />
        </div>

      </div>
    </div>
  );
};

export default DetalleReceta;
