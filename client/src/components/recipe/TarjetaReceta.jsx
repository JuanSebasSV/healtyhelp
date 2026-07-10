import React, { useState, useCallback, useMemo, memo } from "react";
import DetalleReceta from "./DetalleReceta";
import ModalNutricionDetallada from "./ModalNutricionDetallada";
import { optimizeCloudinary } from "../../utils/cloudinary";
import "./TarjetaReceta.css";

const ESTRELLAS = [1, 2, 3, 4, 5];

const IconoCheck = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="17"
    height="17"
  >
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
));

const IconoPDF = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    width="17"
    height="17"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
));

const IconoCorazon = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
));

const IconoImagenRota = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2.5" />
    <circle cx="8.5" cy="9" r="1.5" />
    <path d="m21 15-5-5L5 21" />
  </svg>
));

const TarjetaReceta = memo(
  ({
    receta,
    toggleFav,
    esFav,
    seleccionada,
    onSeleccionar,
    resenaIdDestacada,
    respuestaIdDestacada,
    autoAbrir,
    pendienteKey,
    onPendienteResuelta,
  }) => {
    const [prevAutoAbrir, setPrevAutoAbrir] = useState(autoAbrir);
    const [vista, setVista] = useState(autoAbrir ? "detalle" : null);
    const [imgError, setImgError] = useState(false);
    if (autoAbrir !== prevAutoAbrir) {
      setPrevAutoAbrir(autoAbrir);
      if (autoAbrir) setVista("detalle");
    }

    const prom = receta.puntosProm || 0;
    const total = receta.totalResenas || 0;

    const imagenValida = !!receta?.img && !imgError;

    const promRedondeado = useMemo(() => Math.round(prom), [prom]);

    const abrirDetalle = useCallback(() => setVista("detalle"), []);
    const cerrarVista = useCallback(() => {
      setVista(null);
      onPendienteResuelta?.();
    }, [onPendienteResuelta]);
    const abrirNutricion = useCallback(() => setVista("nutricion"), []);
    const volverDetalle = useCallback(() => setVista("detalle"), []);

    const handleFav = useCallback(
      (e) => {
        e.stopPropagation();
        toggleFav(receta._id);
      },
      [toggleFav, receta._id],
    );

    const handleSeleccionar = useCallback(
      (e) => {
        e.stopPropagation();
        onSeleccionar(receta._id);
      },
      [onSeleccionar, receta._id],
    );

    return (
      <>
        <div
          className={`tarjetaReceta${seleccionada ? " tarjeta-seleccionada" : ""}`}
          role="button"
          tabIndex={0}
          onClick={abrirDetalle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              abrirDetalle();
            }
          }}
          aria-label={`Ver detalles de ${receta?.nombre || 'receta'}`}
          style={{ scrollMarginTop: "80px" }}
        >
          <div className="tarjetaImg">
            {imagenValida && (
              <img
                src={optimizeCloudinary(receta.img, 'q_auto,f_auto,w_640')}
                alt={receta.nombre}
                width="640"
                height="400"
                loading="lazy"
                decoding="async"
                onError={() => setImgError(true)}
              />
            )}

            {!imagenValida && (
              <div className="tarjetaImg-fallback" role="img" aria-label="Imagen no disponible">
                <div className="tarjetaImg-fallback__icono">
                  <IconoImagenRota />
                </div>
                <p className="tarjetaImg-fallback__titulo">Imagen no disponible</p>
                <span className="tarjetaImg-fallback__subtitulo">Vuelve más tarde</span>
              </div>
            )}

            <button type="button"
              className={`btnFav${esFav ? " activo" : ""}`}
              onClick={handleFav}
              aria-label={esFav ? "Quitar de favoritos" : "Agregar a favoritos"}
            >
              <IconoCorazon />
            </button>

              <button type="button"
                className={`btnSeleccionar${seleccionada ? " activo" : ""}`}
                onClick={handleSeleccionar}
                title={seleccionada ? "Quitar del PDF" : "Agregar al PDF"}
                aria-label={seleccionada ? "Quitar del PDF" : "Agregar al PDF"}
              >
                {seleccionada ? <IconoCheck /> : <IconoPDF />}
              </button>
            </div>

          <div className="tarjetaInfo">
            <h3>{receta.nombre}</h3>
            <p>{receta.desc}</p>
            <div className="tarjetaPuntuacion">
              <div className="estrellas-mini">
                {ESTRELLAS.map((n) => (
                  <span
                    key={n}
                    className={`estrella-ico ${n <= promRedondeado ? "llena" : "vacia"}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="tarjeta-prom-txt">
                {prom > 0 ? `${prom} (${total})` : "Sin reseñas"}
              </span>

              {receta.tiempoMinutos > 0 && (
                <span className="tarjeta-tiempo">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {receta.tiempoMinutos < 60
                    ? `${receta.tiempoMinutos} min`
                    : `${Math.floor(receta.tiempoMinutos / 60)}h${receta.tiempoMinutos % 60 > 0 ? ` ${receta.tiempoMinutos % 60}min` : ""}`}
                </span>
              )}
            </div>
          </div>
        </div>

        {vista === "detalle" && (
          <DetalleReceta
            key={pendienteKey ?? receta._id}
            receta={receta}
            cerrar={cerrarVista}
            abrirNutricion={abrirNutricion}
            resenaIdDestacada={resenaIdDestacada}
            respuestaIdDestacada={respuestaIdDestacada}
            toggleFav={toggleFav}
            esFav={esFav}
            seleccionada={seleccionada}
            onSeleccionar={onSeleccionar}
          />
        )}

        {vista === "nutricion" && (
          <ModalNutricionDetallada
            nutri={receta.nutri}
            cerrar={cerrarVista}
            volver={volverDetalle}
          />
        )}
      </>
    );
  },
);

TarjetaReceta.displayName = "TarjetaReceta";

export default TarjetaReceta;
