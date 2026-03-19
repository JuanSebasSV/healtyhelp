import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import TarjetaReceta from '../recipe/TarjetaReceta';
import DetalleReceta from '../recipe/DetalleReceta';
import ModalNutricionDetallada from '../recipe/ModalNutricionDetallada';
import './VistaFavoritos.css';

const VistaFavoritos = ({ recetas, favoritos, toggleFavorito }) => {
  const navigate = useNavigate();
  const [recetaSelec, setRecetaSelec]   = useState(null);
  const [vistaModal, setVistaModal]     = useState(null); // 'detalle' | 'nutricion'

  const recetasFavoritas = recetas.filter(r => favoritos.includes(r._id));

  const abrirDetalle = (receta) => {
    setRecetaSelec(receta);
    setVistaModal('detalle');
  };

  const cerrarModal = () => {
    setRecetaSelec(null);
    setVistaModal(null);
  };

  return (
    <div className="vista-favoritos">
      <h1>Mis Favoritos</h1>

      {recetasFavoritas.length === 0 ? (
        <div className="vacio">
          <div className="vacio-icono">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <p>Aún no tienes recetas favoritas.</p>
          <p style={{ fontSize: '0.95rem', marginTop: '0.5rem', opacity: 0.7 }}>
            Explora las recetas y guarda las que más te gusten.
          </p>
          <button
            className="btn-explorar"
            onClick={() => navigate('/')}
          >
            Explorar recetas
          </button>
        </div>
      ) : (
        <div className="grid">
          {recetasFavoritas.map(receta => (
            <TarjetaReceta
              key={receta._id}
              receta={receta}
              esFavorito={favoritos.includes(receta._id)}
              onToggleFavorito={toggleFavorito}
              onVerDetalle={() => abrirDetalle(receta)}
            />
          ))}
        </div>
      )}

      {vistaModal === 'detalle' && recetaSelec && (
        <DetalleReceta
          receta={recetaSelec}
          cerrar={cerrarModal}
          esFavorito={favoritos.includes(recetaSelec._id)}
          onToggleFavorito={toggleFavorito}
          abrirNutricion={() => setVistaModal('nutricion')}
        />
      )}
      {vistaModal === 'nutricion' && recetaSelec && (
        <ModalNutricionDetallada
          nutri={recetaSelec.nutri}
          cerrar={cerrarModal}
          volver={() => setVistaModal('detalle')}
        />
      )}
    </div>
  );
};

export default VistaFavoritos;