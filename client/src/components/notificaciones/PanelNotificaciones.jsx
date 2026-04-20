// components/notificaciones/PanelNotificaciones.jsx
import React, { useEffect, useRef } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import "./PanelNotificaciones.css";

console.log("PanelNotificaciones CARGADO");

/* ── Íconos ── */
const IcoReply = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 10 4 15 9 20" />
    <path d="M20 4v7a4 4 0 0 1-4 4H4" />
  </svg>
);

const IcoMessage = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const IcoCheck = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IcoBell = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const IcoReceta = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9Z" />
    <path d="M7 21h10" />
    <path d="M12 11v10" />
  </svg>
);

const IcoEmpty = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="36"
    height="36"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ opacity: 0.3 }}
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

/* ── Formatea fecha relativa ── */
const formatRelativa = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const min = Math.floor(diff / 60000);
  const hrs = Math.floor(min / 60);
  const days = Math.floor(hrs / 24);
  if (min < 1) return "Ahora mismo";
  if (min < 60) return `Hace ${min} min`;
  if (hrs < 24) return `Hace ${hrs} h`;
  if (days < 7) return `Hace ${days} día${days !== 1 ? "s" : ""}`;
  return new Date(date).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
};

/* ── Componente ── */
const PanelNotificaciones = ({
  notificaciones,
  noLeidas,
  cargando,
  onLeerTodas,
  onLeerUna,
  onEliminar,
  onCerrar,
  onNavegar, // callback para navegar sin cerrar el Router context
  esMobil = false,
}) => {
  const panelRef = useRef(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClick = (e) => {
      const dentroDelPanel =
        panelRef.current && panelRef.current.contains(e.target);
      console.log("mousedown - dentro del panel:", dentroDelPanel, e.target);
      if (!dentroDelPanel) {
        onCerrar();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onCerrar]);

  // Cerrar con Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onCerrar();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onCerrar]);

  // Decodifica entidades HTML (&gt; → >, &amp; → &, etc.)
  const decodificar = (str) => {
    if (!str) return "";
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
  };

  const handleClickItem = (n) => {
    console.log("click notif:", n.type, n.recetaId, n);
    if (!n.leida) onLeerUna(n._id);
    if (n.type === "reply" && n.recetaId) {
      onCerrar();
      const url = n.resenaId
        ? `/?receta=${n.recetaId}&resena=${n.resenaId}`
        : `/?receta=${n.recetaId}`;
      onNavegar?.(url);
    }
    if (n.type === "new_recipe" && n.recetaId) {
      console.log(
        "entrando a new_recipe, llamando onNavegar con:",
        `/?receta=${n.recetaId}`,
      );
      onCerrar();
      onNavegar?.(`/?receta=${n.recetaId}`);
    }
  };

  return (
    <div
      className="pn-panel"
      ref={panelRef}
      role="dialog"
      aria-label="Notificaciones"
    >
      {/* Header */}
      <div className="pn-header">
        <div className="pn-header-izq">
          <IcoBell />
          <span className="pn-titulo">Notificaciones</span>
          {noLeidas > 0 && <span className="pn-badge-header">{noLeidas}</span>}
        </div>
        <div className="pn-header-der">
          {noLeidas > 0 && (
            <button
              className="pn-btn-leer-todas"
              onClick={onLeerTodas}
              title="Marcar todas como leídas"
            >
              <IcoCheck /> Leer todas
            </button>
          )}
          {esMobil && (
            <button
              className="pn-btn-cerrar-modal"
              onClick={onCerrar}
              aria-label="Cerrar notificaciones"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Cuerpo */}
      <div className="pn-lista">
        {cargando ? (
          <div className="pn-estado">
            <div className="pn-spinner" />
            Cargando...
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="pn-vacio">
            <IcoEmpty />
            <p>Sin notificaciones</p>
            <span>
              Aquí aparecerán las respuestas a tus comentarios y mensajes del
              equipo
            </span>
          </div>
        ) : (
          notificaciones.map((n) => (
            <div
              key={n._id}
              className={`pn-item ${!n.leida ? "no-leida" : ""} pn-tipo-${n.type} ${(n.type === "reply" || n.type === "new_recipe") && n.recetaId ? "pn-clickable" : ""}`}
              onClick={() => handleClickItem(n)}
            >
              {/* Indicador de no leída */}
              {!n.leida && <span className="pn-dot" aria-hidden="true" />}

              {/* Botón eliminar */}
              <button
                className="pn-btn-eliminar"
                onClick={(e) => {
                  e.stopPropagation();
                  onEliminar(n._id);
                }}
                aria-label="Eliminar notificación"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* Ícono de tipo */}
              <div className={`pn-icono pn-icono--${n.type}`}>
                {n.type === "reply" ? (
                  <IcoReply />
                ) : n.type === "new_recipe" ? (
                  <IcoReceta />
                ) : (
                  <IcoMessage />
                )}
              </div>

              {/* Contenido */}
              <div className="pn-contenido" style={{ paddingRight: "1.2rem" }}>
                {n.type === "reply" ? (
                  <>
                    <p className="pn-texto">
                      <strong>{n.fromUserName}</strong> respondió a tu
                      comentario en <em>{n.recetaNombre || "una receta"}</em>
                    </p>
                    {n.respuestaTexto && (
                      <p className="pn-preview">
                        "{decodificar(n.respuestaTexto)}"
                      </p>
                    )}
                  </>
                ) : n.type === "new_recipe" ? (
                  <>
                    <p className="pn-texto">
                      <strong>Nueva receta disponible</strong>
                    </p>
                    <p className="pn-preview">
                      <em>{n.recetaNombre}</em>
                      {n.recetaCat && ` · ${n.recetaCat}`}
                      {n.recetaSalud?.length > 0 &&
                        ` · ${n.recetaSalud.join(", ")}`}
                    </p>
                  </>
                ) : n.type === "new_recipe" ? (
                  <>
                    <p className="pn-texto">
                      <strong>Nueva receta disponible</strong>
                    </p>
                    <p className="pn-preview">
                      <em>{n.recetaNombre}</em>
                      {n.recetaCat && ` · ${n.recetaCat}`}
                      {n.recetaSalud?.length > 0 &&
                        ` · ${n.recetaSalud.join(", ")}`}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="pn-texto">
                      Mensaje de{" "}
                      <strong>{n.adminName || "Administrador"}</strong>
                      {n.asunto && (
                        <>
                          {" "}
                          — <em>{n.asunto}</em>
                        </>
                      )}
                    </p>
                    {n.mensaje && (
                      <p className="pn-preview">
                        {decodificar(n.mensaje).slice(0, 120)}
                        {n.mensaje.length > 120 ? "…" : ""}
                      </p>
                    )}
                  </>
                )}
                <span className="pn-fecha">{formatRelativa(n.createdAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PanelNotificaciones;
