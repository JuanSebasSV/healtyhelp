import React from 'react';
import TarjetaReceta from '../recipe/TarjetaReceta';
import './VistaFavoritos.css';

// 🔒 TODO: Guardar favoritos en el backend asociados al usuario
const VistaFavoritos = ({ recetas, toggleFav, favoritos }) => {
  const recetasFav = recetas.filter(r => favoritos.includes(r.id));

  return (
    <div className="vista-favoritos">
      <h1>Mis Recetas Favoritas</h1>
      {recetasFav.length === 0 ? (
        <div className="vacio">
          <div className="vacio-icono">♥</div>
          <p>Aún no tienes recetas favoritas. ¡Explora y guarda tus favoritas!</p>
        </div>
      ) : (
        <div className="grid">
          {recetasFav.map(receta => (
            <TarjetaReceta
              key={receta.id}
              receta={receta}
              toggleFav={toggleFav}
              esFav={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VistaFavoritos;