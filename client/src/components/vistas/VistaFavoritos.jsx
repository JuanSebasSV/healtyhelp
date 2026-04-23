import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/axios";
import TarjetaReceta from "../recipe/TarjetaReceta";
import DetalleReceta from "../recipe/DetalleReceta";
import ModalNutricionDetallada from "../recipe/ModalNutricionDetallada";
import "./VistaFavoritos.css";
import { generarPDFRecetas } from "../../utils/generarPDF";

const VistaFavoritos = ({ recetas, favoritos, toggleFav }) => {
  const navigate = useNavigate();
  const [recetaSelec, setRecetaSelec] = useState(null);
  const [vistaModal, setVistaModal] = useState(null); // 'detalle' | 'nutricion'

  const [seleccionadas, setSeleccionadas] = useState([]);
  const [generandoPDF, setGenerandoPDF] = useState(false);

  const toggleSeleccion = (id) =>
    setSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );

  const handlePDF = async () => {
    if (!seleccionadas.length) return;
    setGenerandoPDF(true);
    try {
      await generarPDFRecetas(
        recetas.filter((r) => seleccionadas.includes(r._id)),
      );
      setSeleccionadas([]);
    } finally {
      setGenerandoPDF(false);
    }
  };

  const recetasFavoritas = recetas.filter((r) => favoritos.includes(r._id));

  const abrirDetalle = (receta) => {
    setRecetaSelec(receta);
    setVistaModal("detalle");
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <p>Aún no tienes recetas favoritas.</p>
          <p style={{ fontSize: "0.95rem", marginTop: "0.5rem", opacity: 0.7 }}>
            Explora las recetas y guarda las que más te gusten.
          </p>
          <button className="btn-explorar" onClick={() => navigate("/")}>
            Explorar recetas
          </button>
        </div>
      ) : (
        <div className="grid">
          {recetasFavoritas.map((receta) => (
            <TarjetaReceta
              key={receta._id}
              receta={receta}
              toggleFav={toggleFav}
              esFav={favoritos.includes(receta._id)}
              seleccionada={seleccionadas.includes(receta._id)}
              onSeleccionar={toggleSeleccion}
            />
          ))}
        </div>
      )}

      {vistaModal === "detalle" && recetaSelec && (
        <DetalleReceta
          receta={recetaSelec}
          cerrar={cerrarModal}
          abrirNutricion={() => setVistaModal("nutricion")}
          toggleFav={toggleFav}
          esFav={favoritos.includes(recetaSelec._id)}
          seleccionada={seleccionadas.includes(recetaSelec._id)}
          onSeleccionar={toggleSeleccion}
        />
      )}
      {vistaModal === "nutricion" && recetaSelec && (
        <ModalNutricionDetallada
          nutri={recetaSelec.nutri}
          cerrar={cerrarModal}
          volver={() => setVistaModal("detalle")}
        />
      )}

      {seleccionadas.length > 0 && (
        <button
          className="btn-pdf-flotante"
          onClick={handlePDF}
          disabled={generandoPDF}
        >
          {generandoPDF ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ animation: "spin 1s linear infinite" }}
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Generando...
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
              Descargar PDF ({seleccionadas.length})
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default VistaFavoritos;
