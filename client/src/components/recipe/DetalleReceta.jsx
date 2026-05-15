import React, { useEffect, useState, memo } from "react";
import NutricionGrafico from "./NutricionGrafico";
import BtnConsumo from "./BtnConsumo";
import useAuth from "../../hooks/useAuth";
import SeccionResenas from "./SeccionResenas";
import "./DetalleReceta.css";
import { generarPDFRecetas } from "../../utils/generarPDF";

const IconoCerrar = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
));
IconoCerrar.displayName = "IconoCerrar";

const DetalleReceta = memo(
  ({
    receta,
    cerrar,
    abrirNutricion,
    resenaIdDestacada,
    respuestaIdDestacada,
    toggleFav,
    esFav,
    seleccionada,
    onSeleccionar,
  }) => {
    const { user, isAuthenticated } = useAuth();

    const [generandoPDF, setGenerandoPDF] = useState(false);
    const [modalListo,   setModalListo]   = useState(false);

    useEffect(() => {
      const t = setTimeout(() => setModalListo(true), 100);
      return () => clearTimeout(t);
    }, []);

    const handlePDF = async (e) => {
      e.stopPropagation();
      setGenerandoPDF(true);
      try {
        await generarPDFRecetas([receta]);
      } finally {
        setGenerandoPDF(false);
      }
    };

    useEffect(() => {
      const scrollY = window.scrollY;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
      return () => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        window.scrollTo(0, scrollY);
      };
    }, []);

    return (
      <div className="modal-overlay" onClick={cerrar}>
        <div
          className="modalContenedorReceta"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="btn-cerrar-modal"
            onClick={cerrar}
            aria-label="Cerrar"
          >
            <IconoCerrar />
          </button>

          <div className="modalCol modalIzq">
            <div className="modalImg-wrap">
              <img
                src={receta.img}
                alt={receta.nombre}
                className="modalImg"
                loading="lazy"
                decoding="async"
              />

              {toggleFav && (
                <button
                  className={`btnFav${esFav ? " activo" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFav(receta._id);
                  }}
                  aria-label={esFav ? "Quitar de favoritos" : "Agregar a favoritos"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              )}

              <button
                className="btnSeleccionar btn-pdf-directo"
                onClick={handlePDF}
                disabled={generandoPDF}
                title="Descargar esta receta en PDF"
                aria-label="Descargar PDF"
              >
                {generandoPDF ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    width="14"
                    height="14"
                    style={{ animation: "spin 1s linear infinite" }}
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    width="14"
                    height="14"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                )}
              </button>
            </div>

            <h2>{receta.nombre}</h2>

            {receta.tiempoMinutos > 0 && (
              <div className="detalle-tiempo">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
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
                Tiempo de preparación:&nbsp;
                <strong>
                  {receta.tiempoMinutos < 60
                    ? `${receta.tiempoMinutos} min`
                    : `${Math.floor(receta.tiempoMinutos / 60)}h${receta.tiempoMinutos % 60 > 0 ? ` ${receta.tiempoMinutos % 60}min` : ""}`}
                </strong>
              </div>
            )}

            <p className="modalDesc">{receta.desc}</p>

            <div className="modalSeccion">
              <h3>Ingredientes</h3>
              <ul>
                {receta.ingredientes.map((ing, i) => (
                  <li key={i}>{ing}</li>
                ))}
              </ul>
            </div>

            <div className="modalSeccion">
              <h3>Preparación</h3>
              <ol>
                {receta.pasos.map((paso, i) => (
                  <li key={i}>{paso}</li>
                ))}
              </ol>
            </div>

            <BtnConsumo recetaId={receta._id} />

            <div className="modalSeccion resenas-seccion">
              <SeccionResenas
                receta={receta}
                user={user}
                isAuthenticated={isAuthenticated}
                resenaIdDestacada={resenaIdDestacada}
                respuestaIdDestacada={respuestaIdDestacada}
                modalListo={modalListo}
              />
            </div>
          </div>

          <div className="modalCol modalDer">
            <NutricionGrafico
              nutri={receta.nutri}
              abrirNutricion={abrirNutricion}
            />
          </div>
        </div>
      </div>
    );
  },
);

DetalleReceta.displayName = "DetalleReceta";

export default DetalleReceta;