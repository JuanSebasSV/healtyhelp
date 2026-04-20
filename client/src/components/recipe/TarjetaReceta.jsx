import React, { useState, useCallback, useMemo, memo } from 'react';
import DetalleReceta from './DetalleReceta';
import ModalNutricionDetallada from './ModalNutricionDetallada';
import './TarjetaReceta.css';

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
    return `${moneda} ${costo.toFixed(2)}`;
  }
};

const ESTRELLAS = [1, 2, 3, 4, 5];

const IconoCheck = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
));

const IconoPDF = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
));

const IconoCorazon = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
));

const TarjetaReceta = memo(({ receta, toggleFav, esFav, seleccionada, onSeleccionar }) => {
  const [vista, setVista] = useState(null);

  const prom  = receta.puntosProm   || 0;
  const total = receta.totalResenas || 0;

  const costoFormato = useMemo(
    () => formatearCosto(receta.costoPorcion, receta.moneda || 'COP'),
    [receta.costoPorcion, receta.moneda]
  );

  const promRedondeado = useMemo(() => Math.round(prom), [prom]);

  const abrirDetalle    = useCallback(() => setVista('detalle'), []);
  const cerrarVista     = useCallback(() => setVista(null), []);
  const abrirNutricion  = useCallback(() => setVista('nutricion'), []);
  const volverDetalle   = useCallback(() => setVista('detalle'), []);

  const handleFav = useCallback((e) => {
    e.stopPropagation();
    toggleFav(receta._id);
  }, [toggleFav, receta._id]);

  const handleSeleccionar = useCallback((e) => {
    e.stopPropagation();
    onSeleccionar(receta._id);
  }, [onSeleccionar, receta._id]);

  return (
    <>
      <div
        className={`tarjetaReceta${seleccionada ? ' tarjeta-seleccionada' : ''}`}
        onClick={abrirDetalle}
      >
        <div className="tarjetaImg">
          <img src={receta.img} alt={receta.nombre} loading="lazy" decoding="async" />

          <button
            className={`btnFav${esFav ? ' activo' : ''}`}
            onClick={handleFav}
            aria-label={esFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <IconoCorazon />
          </button>

          <button
            className={`btnSeleccionar${seleccionada ? ' activo' : ''}`}
            onClick={handleSeleccionar}
            title={seleccionada ? 'Quitar del PDF' : 'Agregar al PDF'}
            aria-label={seleccionada ? 'Quitar del PDF' : 'Agregar al PDF'}
          >
            {seleccionada ? <IconoCheck /> : <IconoPDF />}
          </button>

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
              {ESTRELLAS.map(n => (
                <span key={n} className={`estrella-ico ${n <= promRedondeado ? 'llena' : 'vacia'}`}>★</span>
              ))}
            </div>
            <span className="tarjeta-prom-txt">
              {prom > 0 ? `${prom} (${total})` : 'Sin reseñas'}
            </span>

            {/* NUEVA FUNCIONALIDAD: badge de tiempo de preparación */}
            {receta.tiempoMinutos > 0 && (
              <span className="tarjeta-tiempo">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                {receta.tiempoMinutos < 60
                  ? `${receta.tiempoMinutos} min`
                  : `${Math.floor(receta.tiempoMinutos / 60)}h${receta.tiempoMinutos % 60 > 0 ? ` ${receta.tiempoMinutos % 60}min` : ''}`}
              </span>
            )}
          </div>
        </div>
      </div>

      {vista === 'detalle' && (
        <DetalleReceta
          receta={receta}
          cerrar={cerrarVista}
          abrirNutricion={abrirNutricion}
        />
      )}

      {vista === 'nutricion' && (
        <ModalNutricionDetallada
          nutri={receta.nutri}
          cerrar={cerrarVista}
          volver={volverDetalle}
        />
      )}
    </>
  );
});

TarjetaReceta.displayName = 'TarjetaReceta';

export default TarjetaReceta;