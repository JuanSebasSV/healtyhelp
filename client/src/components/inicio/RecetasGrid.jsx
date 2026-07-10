import { memo } from 'react';
import TarjetaReceta from '../recipe/TarjetaReceta';

const RecetasGrid = memo(({
  recetasFiltradas,
  cargandoRecetas,
  toggleFav,
  favoritosSet,
  seleccionadasSet,
  toggleSeleccion,
  pendienteId,
  recetaPendiente,
  onRecetaPendienteResuelta,
}) => (
  <section className="recetasGrid">
    <div className="recetasGrid-header">
      <h2>Explorar Recetas</h2>
    </div>

    {cargandoRecetas ? (
      <div className="recetasCargando">
        <div className="spinner-recetas" />
        <p>Cargando recetas...</p>
      </div>
    ) : (
      <div className="grid">
        {recetasFiltradas.map(receta => {
          const esPendiente = !!pendienteId && (
            receta._id === pendienteId ||
            receta._id?.toString() === pendienteId?.toString()
          );
          return (
            <TarjetaReceta
              key={esPendiente ? `${receta._id}-${recetaPendiente?._key ?? 0}` : receta._id}
              receta={receta}
              toggleFav={toggleFav}
              esFav={favoritosSet.has(receta._id)}
              seleccionada={seleccionadasSet.has(receta._id)}
              onSeleccionar={toggleSeleccion}
              autoAbrir={esPendiente}
              resenaIdDestacada={esPendiente ? recetaPendiente?.resenaId : undefined}
              respuestaIdDestacada={esPendiente ? recetaPendiente?.respuestaId : undefined}
              pendienteKey={esPendiente ? recetaPendiente?._key : undefined}
              onPendienteResuelta={esPendiente ? onRecetaPendienteResuelta : undefined}
            />
          );
        })}
      </div>
    )}

    {!cargandoRecetas && recetasFiltradas.length === 0 && (
      <p className="sinResultados">No hay recetas disponibles con estos filtros.</p>
    )}
  </section>
));
RecetasGrid.displayName = 'RecetasGrid';

export default RecetasGrid;
