// Seccionresenas.jsx
import React, { useState, useEffect, useReducer, useCallback, useRef, useMemo, memo } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { useConfirm } from "../ui/ConfirmContext";
import "./SeccionResenas.css";

const EMPTY_IMAGENES = [];
const EMPTY_RESPUESTAS = [];

//Componente de icono genérico
const Icon = memo(
  ({ d, size = 16, viewBox = "0 0 24 24", className = "", style = {} }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {d}
    </svg>
  ),
);
Icon.displayName = "Icon";

const D_EDITAR = (
  <>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </>
);

const IcoEditar = memo(({ size }) => (
  <Icon size={size} d={D_EDITAR} />
));
IcoEditar.displayName = "IcoEditar";
const D_BORRAR = (
  <>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </>
);

const IcoBorrar = memo(({ size }) => (
  <Icon size={size} d={D_BORRAR} />
));
IcoBorrar.displayName = "IcoBorrar";
const D_GUARDAR = (
  <>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </>
);

const IcoGuardar = memo(({ size }) => (
  <Icon size={size} d={D_GUARDAR} />
));
IcoGuardar.displayName = "IcoGuardar";
const D_PUBLICAR = (
  <>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </>
);

const IcoPublicar = memo(({ size }) => (
  <Icon size={size} d={D_PUBLICAR} />
));
IcoPublicar.displayName = "IcoPublicar";
const D_LOCK = (
  <>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </>
);

const IcoLock = memo(({ size }) => (
  <Icon size={size} d={D_LOCK} />
));
IcoLock.displayName = "IcoLock";
const D_THUMBUP = <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zm-7 11H4.72A2 2 0 0 1 3 18.28V13a2 2 0 0 1 2-2h2v9z" />;

const IcoThumbUp = memo(({ size }) => (
  <Icon size={size} d={D_THUMBUP} />
));
IcoThumbUp.displayName = "IcoThumbUp";
const D_THUMBDOWN = <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17V2z" />;

const IcoThumbDown = memo(({ size }) => (
  <Icon size={size} d={D_THUMBDOWN} />
));
IcoThumbDown.displayName = "IcoThumbDown";
const D_CLOCK = (
  <>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </>
);

const IcoClock = memo(({ size, style }) => (
  <Icon size={size} style={style} d={D_CLOCK} />
));
IcoClock.displayName = "IcoClock";
const D_CHEVRONDOWN = (<polyline points="6 9 12 15 18 9" />);

const IcoChevronDown = memo(({ size, style }) => (
  <Icon size={size} style={style} d={D_CHEVRONDOWN} />
));
IcoChevronDown.displayName = "IcoChevronDown";
const D_CHEVRONUP = (<polyline points="18 15 12 9 6 15" />);

const IcoChevronUp = memo(({ size }) => (
  <Icon size={size} d={D_CHEVRONUP} />
));
IcoChevronUp.displayName = "IcoChevronUp";
const D_CORNERDOWNLEFT = (
  <>
    <polyline points="9 10 4 15 9 20" />
    <path d="M20 4v7a4 4 0 0 1-4 4H4" />
  </>
);

const IcoCornerDownLeft = memo(({ size }) => (
  <Icon size={size} d={D_CORNERDOWNLEFT} />
));
IcoCornerDownLeft.displayName = "IcoCornerDownLeft";
const D_IMAGE = (
  <>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </>
);

const IcoImage = memo(({ size, className }) => (
  <Icon size={size} className={className} d={D_IMAGE} />
));
IcoImage.displayName = "IcoImage";
const D_INFO = (
  <>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </>
);

const IcoInfo = memo(({ size }) => (
  <Icon size={size} d={D_INFO} />
));
IcoInfo.displayName = "IcoInfo";
const D_X = <path d="M18 6L6 18M6 6l12 12" />;

const IcoX = memo(({ size }) => (
  <Icon size={size} d={D_X} />
));
IcoX.displayName = "IcoX";
const D_IMAGEPLUS = (
  <>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
    <line x1="14" y1="8" x2="14" y2="14" strokeWidth="2" />
    <line x1="11" y1="11" x2="17" y2="11" strokeWidth="2" />
  </>
);

const IcoImagePlus = memo(({ size, className }) => (
  <Icon size={size} className={className} d={D_IMAGEPLUS} />
));
IcoImagePlus.displayName = "IcoImagePlus";
const D_LOADER = (
  <>
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </>
);

const IcoLoader = memo(({ size, className }) => (
  <Icon size={size} className={className} d={D_LOADER} />
));
IcoLoader.displayName = "IcoLoader";
const STYLE_ICO_EN_REVISION = { marginRight: "5px", verticalAlign: "middle" };
const STYLE_CHEVRON_LEFT  = { transform: "rotate(90deg)" };
const STYLE_CHEVRON_RIGHT = { transform: "rotate(-90deg)" };

const D_EMPTYREVIEWS = (
  <>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <line x1="9" y1="10" x2="15" y2="10" />
  </>
);

const IcoEmptyReviews = memo(({ size }) => (
  <Icon size={size} d={D_EMPTYREVIEWS} />
));
IcoEmptyReviews.displayName = "IcoEmptyReviews";

//Helpers
const formatFecha = (f) =>
  new Date(f).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const ESTRELLAS = [1, 2, 3, 4, 5];

// Iniciales de avatar
const getIniciales = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

//Estrellas
const Estrellas = memo(({ valor, onChange, readonly = false }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className={`sr-estrellas${readonly ? " readonly" : ""}`} role={readonly ? undefined : "radiogroup"} aria-label="Calificación">
      {ESTRELLAS.map((n) => (
        <span
          key={n}
          role={readonly ? undefined : "radio"}
          tabIndex={readonly ? -1 : 0}
          aria-checked={!readonly && n <= valor}
          aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
          className={`sr-estrella ${n <= (hover || valor) ? "llena" : "vacia"}`}
          onClick={() => !readonly && onChange?.(n)}
          onKeyDown={(e) => {
            if (readonly) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onChange?.(n);
            }
          }}
          onMouseEnter={() => !readonly && setHover(n)}
          onMouseLeave={() => !readonly && setHover(0)}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </span>
      ))}
    </div>
  );
});
Estrellas.displayName = "Estrellas";

//ImagenResena
const ImagenesResena = memo(({ imagenes = [], esPropia }) => {
  const visibles = imagenes.filter(img => {
    if (!img?.estado || img.estado === "rechazada") return false;
    if (img.estado === "pendiente" && !esPropia) return false;
    return true;
  });

  if (visibles.length === 0) return null;

  return (
    <div className="sr-imagenes-wrap">
      {visibles.map((img, i) =>
        img.estado === "aprobada" ? (
          <div key={img.url || img.publicId || `aprobada-${i}`} className="sr-imagen-wrap">
            <img
              src={img.url}
              alt={`Imagen ${i + 1} del comentario`}
              className="sr-imagen"
              loading="lazy"
            />
          </div>
        ) : (
          <div key={img.url || img.publicId || `pendiente-${i}`} className="sr-imagen-pendiente">
            <IcoImage size={28} className="sr-imagen-pendiente-icono" />
            <span className="sr-imagen-pendiente-titulo">
                                <IcoClock size={13} style={STYLE_ICO_EN_REVISION} />
              En revisión
            </span>
            <span className="sr-imagen-pendiente-sub">
              Tu imagen está pendiente de aprobación
            </span>
          </div>
        )
      )}
    </div>
  );
});
ImagenesResena.displayName = "ImagenesResena";

//SelectorImagen
const SelectorImagenes = memo(({ imagenes, onChange, onRemove }) => {
  const inputRef = useRef(null);
  const MAX = 5;

  const handleFiles = useCallback(
    (e) => {
      const nuevas = Array.from(e.target.files);
      const validas = nuevas.filter((f) => {
        if (!f.type.startsWith("image/")) { toast.error(`${f.name}: solo se permiten imágenes`); return false; }
        if (f.size > 5 * 1024 * 1024)    { toast.error(`${f.name}: máximo 5 MB`);               return false; }
        return true;
      });
      if (imagenes.length + validas.length > MAX) {
        toast.error(`Puedes adjuntar máximo ${MAX} imágenes`);
        return;
      }
      onChange([...imagenes, ...validas]);
      e.target.value = "";
    },
    [imagenes, onChange],
  );

  const handleClick = useCallback(() => inputRef.current?.click(), []);

  return (
    <div className="sr-selector-imagen">
      <div className="sr-previews-grid">
        {imagenes.map((img, i) => {
          const url = URL.createObjectURL(img);
          return (
            <div key={url} className="sr-preview-wrap">
              <img src={url} alt={`Vista previa ${i + 1}`} className="sr-preview-img" loading="lazy" decoding="async" />
              <button
                type="button"
                className="sr-btn-quitar-img"
                onClick={() => onRemove(i)}
                title="Quitar imagen"
              >
                <IcoX size={10} />
              </button>
            </div>
          );
        })}
        {imagenes.length < MAX && (
          <button
            type="button"
            className="sr-btn-adjuntar"
            onClick={handleClick}
            title="Adjuntar imagen (requiere aprobación)"
          >
            <IcoImagePlus size={14} />
            {imagenes.length === 0 ? "Adjuntar imagen" : "Agregar más"}
          </button>
        )}
      </div>
      {imagenes.length > 0 && (
        <span className="sr-preview-aviso">
          <IcoInfo size={12} />
          {imagenes.length}/{MAX} — Requieren aprobación (≈3 días)
        </span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        style={{ display: "none" }}
        onChange={handleFiles}
      />
    </div>
  );
});
SelectorImagenes.displayName = "SelectorImagenes";

const MencionChip = memo(({ nombre, texto }) => {
  if (!nombre) return null;
  const preview = texto
    ? texto.slice(0, 60) + (texto.length > 60 ? "…" : "")
    : null;
  return (
    <div className="sr-mencion-chip">
      <span className="sr-mencion-chip__autor">@{nombre}</span>
      {preview && <span className="sr-mencion-chip__preview">{preview}</span>}
    </div>
  );
});
MencionChip.displayName = "MencionChip";

const RespuestaItem = memo(
  ({
    rp,
    depth,
    recetaId,
    resenaId,
    user,
    isAuthenticated,
    onEliminar,
    onNuevaRespuesta,
    respuestaIdDestacada,
    modalListo = false,
  }) => {
    const [respondiendo, setRespondiendo] = useState(false);
    const [texto, setTexto] = useState("");
    const [enviando, setEnviando] = useState(false);
    const itemRef = useRef(null);

    useEffect(() => {
      if (
        !idIgual(rp._id, respuestaIdDestacada) ||
        !modalListo ||
        !itemRef.current
      )
        return;
      const el = itemRef.current;
      let raf;
      const t = setTimeout(() => {
        raf = requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("sr-resp-item--flash");
          setTimeout(() => el.classList.remove("sr-resp-item--flash"), 2800);
        });
      }, 300);
      return () => {
        clearTimeout(t);
        if (raf) cancelAnimationFrame(raf);
      };
    }, [rp._id, respuestaIdDestacada, modalListo]);

    const esPropia =
      user &&
      (rp.userId?.toString() === user._id?.toString() ||
        rp.userId?.toString() === user.id?.toString());
    const esAdmin = user?.role === "admin";

    const visualDepth = Math.min(depth, 3);

    const handleEnviar = useCallback(async () => {
      if (!texto.trim()) return;
      setEnviando(true);
      try {
        const { data } = await api.post(
          `/recipes/${recetaId}/resenas/${resenaId}/respuestas`,
          {
            texto: texto.trim(),
            parentRespuestaId: rp._id,
            parentUserName: rp.userName,
            parentTexto: rp.texto,
          },
        );
        onNuevaRespuesta(data.respuesta);
        setTexto("");
        setRespondiendo(false);
        toast.success("Respuesta publicada");
      } catch (e) {
        toast.error(e.response?.data?.error || "Error al responder");
      } finally {
        setEnviando(false);
      }
    }, [
      texto,
      recetaId,
      resenaId,
      rp._id,
      rp.userName,
      rp.texto,
      onNuevaRespuesta,
    ]);

    return (
      <div
        ref={itemRef}
        className={`sr-resp-item sr-resp-item--depth-${visualDepth}${idIgual(rp._id, respuestaIdDestacada) ? " sr-resp-item--destacada" : ""}`}
      >
        {/* Línea vertical de hilo */}
        {depth > 0 && <div className="sr-resp-hilo" />}

        <div className="sr-resp-avatar" aria-hidden="true">
          {getIniciales(rp.userName)}
        </div>

        <div className="sr-resp-cuerpo">
          <div className="sr-resp-meta">
            <span className="sr-resp-nombre">{rp.userName}</span>
            <span className="sr-resp-fecha">{formatFecha(rp.createdAt)}</span>
            {isAuthenticated && (esPropia || esAdmin) && (
              <button
                type="button"
                className="sr-btn-borrar-resp"
                onClick={() => onEliminar(rp._id)}
                title="Eliminar respuesta"
              >
                <IcoBorrar size={13} />
              </button>
            )}
          </div>

          {/* Chip de mención: a quién respondía */}
          {rp.parentUserName && (
            <MencionChip nombre={rp.parentUserName} texto={rp.parentTexto} />
          )}

          <p className="sr-resp-texto">{rp.texto}</p>

          {isAuthenticated && (
            <button
              type="button"
              className="sr-btn-responder sr-btn-responder--inline"
              onClick={() => setRespondiendo((v) => !v)}
            >
              <IcoCornerDownLeft size={12} />
              {respondiendo ? "Cancelar" : "Responder"}
            </button>
          )}

          {respondiendo && (
            <div className="sr-resp-form sr-resp-form--inline">
              <div
                className="sr-resp-avatar sr-resp-avatar--yo"
                aria-hidden="true"
              >
                {getIniciales(user?.name)}
              </div>
              <div className="sr-resp-input-wrap">
                {/* Contexto visual del mensaje que se responde */}
                <div className="sr-resp-citando">
                  <span className="sr-resp-citando__label">Respondiendo a</span>
                  <strong className="sr-resp-citando__nombre">
                    {" "}
                    @{rp.userName}
                  </strong>
                </div>
                <textarea
                  className="sr-resp-textarea"
                  placeholder={`Responder a ${rp.userName}…`}
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  rows={2}
                  maxLength={500}
                  lang="es"
                  spellCheck="true"
                  autoFocus
                />
                <div className="sr-resp-actions">
                  <span className="sr-resp-contador">{texto.length}/500</span>
                  <button
                    type="button"
                    className="sr-btn-cancelar-resp"
                    onClick={() => {
                      setTexto("");
                      setRespondiendo(false);
                    }}
                    disabled={enviando}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="sr-btn-enviar-resp"
                    onClick={handleEnviar}
                    disabled={enviando || !texto.trim()}
                  >
                    {enviando ? (
                      <>
                        <IcoLoader size={13} className="sr-spin" /> Enviando
                      </>
                    ) : (
                      <>
                        <IcoCornerDownLeft size={13} /> Publicar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);
RespuestaItem.displayName = "RespuestaItem";

const SeccionRespuestas = memo(
  ({
    recetaId,
    resenaId,
    respuestas: respInit,
    user,
    isAuthenticated,
    respuestaIdDestacada,
    modalListo = false,
  }) => {
    const [respuestas, setRespuestas] = useState(respInit || []);
    const [texto, setTexto] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [expandido, setExpandido] = useState(
      () =>
        !!(
          respuestaIdDestacada &&
          (respInit || []).some((r) => idIgual(r._id, respuestaIdDestacada))
        ),
    );
    const [respondiendo, setRespondiendo] = useState(false);

    const handleEnviarPrincipal = useCallback(async () => {
      if (!texto.trim()) return;
      setEnviando(true);
      try {
        const { data } = await api.post(
          `/recipes/${recetaId}/resenas/${resenaId}/respuestas`,
          { texto: texto.trim() },
        );
        setRespuestas((prev) => [...prev, data.respuesta]);
        setTexto("");
        setRespondiendo(false);
        setExpandido(true);
        toast.success("Respuesta publicada");
      } catch (e) {
        toast.error(e.response?.data?.error || "Error al responder");
      } finally {
        setEnviando(false);
      }
    }, [texto, recetaId, resenaId]);

    const handleNuevaRespuesta = useCallback((nueva) => {
      setRespuestas((prev) => [...prev, nueva]);
      setExpandido(true);
    }, []);

    const handleEliminar = useCallback(
      async (respId) => {
        if (!await confirm({ title: 'Eliminar respuesta', message: '¿Eliminar esta respuesta?', confirmText: 'Eliminar' })) return;
        try {
          await api.delete(
            `/recipes/${recetaId}/resenas/${resenaId}/respuestas/${respId}`,
          );
          setRespuestas((prev) => prev.filter((r) => r._id !== respId));
          toast.success("Respuesta eliminada");
        } catch (e) {
          toast.error(e.response?.data?.error || "Error al borrar");
        }
      },
      [recetaId, resenaId],
    );

    const depthMap = {};
    respuestas.forEach((r) => {
      if (!r.parentRespuestaId) {
        depthMap[r._id] = 0;
      } else {
        depthMap[r._id] = Math.min((depthMap[r.parentRespuestaId] ?? 0) + 1, 3);
      }
    });

    return (
      <div className="sr-resp-seccion">
        <div className="sr-resp-acciones-fila">
          {respuestas.length > 0 && (
            <button
              type="button"
              className="sr-btn-toggle-resp"
              onClick={() => setExpandido((v) => !v)}
            >
              {expandido ? (
                <>
                  <IcoChevronUp size={13} /> Ocultar respuestas
                </>
              ) : (
                <>
                  <IcoChevronDown size={13} /> {respuestas.length} respuesta
                  {respuestas.length !== 1 ? "s" : ""}
                </>
              )}
            </button>
          )}
          {isAuthenticated && (
            <button
              type="button"
              className="sr-btn-responder"
              onClick={() => setRespondiendo((v) => !v)}
            >
              <IcoCornerDownLeft size={13} /> Responder
            </button>
          )}
        </div>

        {expandido && respuestas.length > 0 && (
          <div className="sr-resp-lista">
            {respuestas.map((rp) => (
              <RespuestaItem
                key={rp._id}
                rp={rp}
                depth={depthMap[rp._id] ?? 0}
                recetaId={recetaId}
                resenaId={resenaId}
                user={user}
                isAuthenticated={isAuthenticated}
                onEliminar={handleEliminar}
                onNuevaRespuesta={handleNuevaRespuesta}
                respuestaIdDestacada={respuestaIdDestacada}
                modalListo={modalListo}
              />
            ))}
          </div>
        )}

        {/* Formulario de respuesta principal (a la reseña, no a otra respuesta) */}
        {respondiendo && (
          <div className="sr-resp-form">
            <div
              className="sr-resp-avatar sr-resp-avatar--yo"
              aria-hidden="true"
            >
              {getIniciales(user?.name)}
            </div>
            <div className="sr-resp-input-wrap">
              <textarea
                className="sr-resp-textarea"
                placeholder="Escribe una respuesta…"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                rows={2}
                maxLength={500}
                lang="es"
                spellCheck="true"
                autoFocus
              />
              <div className="sr-resp-actions">
                <span className="sr-resp-contador">{texto.length}/500</span>
                <button
                  type="button"
                  className="sr-btn-cancelar-resp"
                  onClick={() => {
                    setTexto("");
                    setRespondiendo(false);
                  }}
                  disabled={enviando}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="sr-btn-enviar-resp"
                  onClick={handleEnviarPrincipal}
                  disabled={enviando || !texto.trim()}
                >
                  {enviando ? (
                    <>
                      <IcoLoader size={13} className="sr-spin" /> Enviando
                    </>
                  ) : (
                    <>
                      <IcoCornerDownLeft size={13} /> Publicar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);
SeccionRespuestas.displayName = "SeccionRespuestas";

const esDelUsuario = (r, user) =>
  user &&
  (r.userId?.toString() === user._id?.toString() ||
    r.userId?.toString() === user.id?.toString());

//SeccionResenas
const idIgual = (a, b) => a && b && String(a) === String(b);

const ResenaItem = memo(({
  resena,
  user,
  resenaIdDestacada,
  resenaDestacadaRef,
  recetaId,
  isAuthenticated,
  modalListo,
  respuestaIdDestacada,
  onBorrarResena,
  onVotar,
}) => {
  const esPropia     = esDelUsuario(resena, user);
  const esAdmin      = user?.role === "admin";
  const esDestacada  = idIgual(resena._id, resenaIdDestacada);

  return (
    <div
      ref={esDestacada ? resenaDestacadaRef : null}
      className={`sr-item${esPropia ? " propia" : ""}${esDestacada ? " sr-item--destacada" : ""}`}
    >
      <div className="sr-item-header">
        <div className="sr-avatar" aria-hidden="true">
          {getIniciales(resena.userName)}
        </div>
        <div className="sr-item-meta">
          <span className="sr-nombre">{resena.userName}</span>
          <span className="sr-fecha">{formatFecha(resena.createdAt)}</span>
        </div>
        <Estrellas valor={resena.estrellas} readonly />
        {isAuthenticated && (esPropia || esAdmin) && (
          <button
            type="button"
            className="sr-btn-borrar-lista"
            onClick={() => onBorrarResena(resena._id)}
            title="Eliminar reseña"
          >
            <IcoBorrar size={15} />
          </button>
        )}
      </div>
      {resena.texto && <p className="sr-texto">{resena.texto}</p>}
      <ImagenesResena
        imagenes={resena.imagenes || EMPTY_IMAGENES}
        esPropia={!!esPropia}
      />
      <div className="sr-votos">
        <span className="sr-votos-label">¿Te resultó útil?</span>
        <button
          type="button"
          className={`sr-btn-voto sr-like${resena.miVoto === "like" ? " activo" : ""}`}
          onClick={() => onVotar(resena._id, "like")}
          title="Es útil"
        >
          <IcoThumbUp size={13} /> <span>{resena.likes}</span>
        </button>
        <button
          type="button"
          className={`sr-btn-voto sr-dislike${resena.miVoto === "dislike" ? " activo" : ""}`}
          onClick={() => onVotar(resena._id, "dislike")}
          title="No es útil"
        >
          <IcoThumbDown size={13} /> <span>{resena.dislikes}</span>
        </button>
      </div>
      <SeccionRespuestas
        recetaId={recetaId}
        resenaId={resena._id}
        respuestas={resena.respuestas || EMPTY_RESPUESTAS}
        user={user}
        isAuthenticated={isAuthenticated}
        respuestaIdDestacada={
          (resena.respuestas || []).some((rp) => idIgual(rp._id, respuestaIdDestacada))
            ? respuestaIdDestacada
            : undefined
        }
        modalListo={modalListo}
      />
    </div>
  );
});
ResenaItem.displayName = "ResenaItem";

const initialList = (receta) => ({
  resenas: [],
  puntosProm: receta.puntosProm || 0,
  totalResenas: receta.totalResenas || 0,
  totalPags: 1,
  pagina: 1,
  orden: "reciente",
  refresco: 0,
});

function listReducer(state, action) {
  switch (action.type) {
    case "SET_PAGINA":
      return { ...state, pagina: typeof action.val_or_fn === "function" ? action.val_or_fn(state.pagina) : action.val_or_fn };
    case "INC_PAGINA":
      return { ...state, pagina: state.pagina + 1 };
    case "DEC_PAGINA":
      return { ...state, pagina: Math.max(1, state.pagina - 1) };
    case "SET_ORDEN":
      return { ...state, orden: action.val, pagina: 1 };
    case "INC_REFRESCO":
      return { ...state, refresco: state.refresco + 1 };
    case "LOAD_LIST":
      return {
        ...state,
        resenas: action.data.resenas,
        puntosProm: action.data.puntosProm,
        totalResenas: action.data.totalResenas,
        totalPags: action.data.totalPags,
      };
    case "APPLY_VOTE":
      return {
        ...state,
        resenas: state.resenas.map((r) =>
          r._id === action.resenaId
            ? { ...r, likes: action.likes, dislikes: action.dislikes, miVoto: action.miVoto }
            : r
        ),
      };
    default:
      return state;
  }
}

const initialForm = {
  miResena: null,
  editando: false,
  formEstrellas: 5,
  formTexto: "",
  formImagenes: [],
};

function formReducer(state, action) {
  switch (action.type) {
    case "SET_MI_RESENA":
      return { ...state, miResena: typeof action.val_or_fn === "function" ? action.val_or_fn(state.miResena) : action.val_or_fn };
    case "SET_EDITANDO":
      return { ...state, editando: action.val };
    case "OPEN_EDIT":
      return { ...state, editando: true };
    case "SET_ESTRELLAS":
      return { ...state, formEstrellas: typeof action.val_or_fn === "function" ? action.val_or_fn(state.formEstrellas) : action.val_or_fn };
    case "SET_FORM_TEXTO":
      return { ...state, formTexto: typeof action.val_or_fn === "function" ? action.val_or_fn(state.formTexto) : action.val_or_fn };
    case "SET_FORM_IMAGENES":
      return { ...state, formImagenes: typeof action.val_or_fn === "function" ? action.val_or_fn(state.formImagenes) : action.val_or_fn };
    case "REMOVE_IMAGE_AT":
      return { ...state, formImagenes: state.formImagenes.filter((_, idx) => idx !== action.idx) };
    case "RESET_FORM":
      return { ...state, miResena: null, editando: false, formEstrellas: 5, formTexto: "", formImagenes: [] };
    default:
      return state;
  }
}

const SeccionResenas = ({
  receta,
  user,
  isAuthenticated,
  resenaIdDestacada,
  respuestaIdDestacada,
  modalListo = false,
}) => {
  const confirm = useConfirm();
  const [listState, dispatchList] = useReducer(listReducer, initialList(receta));
  const resenas = listState.resenas;
  const puntosProm = listState.puntosProm;
  const totalResenas = listState.totalResenas;
  const totalPags = listState.totalPags;
  const pagina = listState.pagina;
  const orden = listState.orden;
  const refresco = listState.refresco;
  const setPagina = (val_or_fn) => dispatchList({ type: "SET_PAGINA", val_or_fn });
  const incPagina = () => dispatchList({ type: "INC_PAGINA" });
  const decPagina = () => dispatchList({ type: "DEC_PAGINA" });
  const setOrden = (val) => dispatchList({ type: "SET_ORDEN", val });
  const incRefresco = () => dispatchList({ type: "INC_REFRESCO" });

  const [cargandoRes, setCargandoRes] = useState(true);
  const hayTarget = !!(respuestaIdDestacada || resenaIdDestacada);
  const [buscandoActivo, setBuscandoActivo] = useState(false);

  const [formState, dispatchForm] = useReducer(formReducer, initialForm);
  const miResena = formState.miResena;
  const editando = formState.editando;
  const formEstrellas = formState.formEstrellas;
  const formTexto = formState.formTexto;
  const formImagenes = formState.formImagenes;
  const [enviando, setEnviando] = useState(false);
  const setMiResena = (val_or_fn) => dispatchForm({ type: "SET_MI_RESENA", val_or_fn });
  const setEditando = (val) => dispatchForm({ type: val ? "OPEN_EDIT" : "SET_EDITANDO", val });
  const setFormEstrellas = (val_or_fn) => dispatchForm({ type: "SET_ESTRELLAS", val_or_fn });
  const setFormTexto = (val_or_fn) => dispatchForm({ type: "SET_FORM_TEXTO", val_or_fn });
  const setFormImagenes = (val_or_fn) => dispatchForm({ type: "SET_FORM_IMAGENES", val_or_fn });
  const handleQuitarImagenForm = useCallback(
    (i) => dispatchForm({ type: "REMOVE_IMAGE_AT", idx: i }),
    [],
  );

  const resenaDestacadaRef = useRef(null);

  const imagenesValidas = useMemo(
    () => (miResena?.imagenes || EMPTY_IMAGENES).reduce((acc, img) => {
      if (img.estado !== "rechazada") acc.push(img);
      return acc;
    }, []),
    [miResena?.imagenes],
  );

  useEffect(() => {
    if (!respuestaIdDestacada && !resenaIdDestacada) {
      return;
    }
    let cancelled = false;
    const buscar = async () => {
      setBuscandoActivo(true);
      try {
        const { data: d1 } = await api.get(
          `/recipes/${receta._id}/resenas?page=1&limit=5&orden=${orden}`,
        );
        if (cancelled) return;
        const totalPaginas = d1.pagination.pages;

        const revisar = (resenas) => {
          for (const r of resenas) {
            if (resenaIdDestacada && idIgual(r._id, resenaIdDestacada))
              return true;
            if (
              respuestaIdDestacada &&
              (r.respuestas || []).some((rp) =>
                idIgual(rp._id, respuestaIdDestacada),
              )
            )
              return true;
          }
          return false;
        };

        if (revisar(d1.resenas)) {
          if (!cancelled) setPagina(1);
          return;
        }

        if (totalPaginas >= 2) {
          const restantes = await Promise.all(
            Array.from({ length: totalPaginas - 1 }, (_, i) =>
              api
                .get(`/recipes/${receta._id}/resenas?page=${i + 2}&limit=5&orden=${orden}`)
                .then((r) => ({ page: i + 2, resenas: r.data.resenas, revisar }))
            )
          );
          if (cancelled) return;
          const match = restantes.find((r) => r.revisar(r.resenas));
          if (match && !cancelled) setPagina(match.page);
        }
        if (!cancelled) setPagina(1);
      } catch (e) {
        console.error('Error en paginación:', e);
      } finally {
        if (!cancelled) setBuscandoActivo(false);
      }
    };
    buscar();
    return () => {
      cancelled = true;
    };
  }, [receta._id, respuestaIdDestacada, resenaIdDestacada, refresco, orden]);

  useEffect(() => {
    if (
      !resenaIdDestacada ||
      cargandoRes ||
      buscandoActivo ||
      !modalListo ||
      !resenaDestacadaRef.current
    )
      return;
    const t = setTimeout(() => {
      resenaDestacadaRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      resenaDestacadaRef.current?.classList.add("sr-item--flash");
      setTimeout(
        () => resenaDestacadaRef.current?.classList.remove("sr-item--flash"),
        2800,
      );
    }, 300);
    return () => clearTimeout(t);
  }, [resenaIdDestacada, cargandoRes, buscandoActivo, modalListo]);

  // Carga principal
  useEffect(() => {
    let cancelled = false;
    setCargandoRes(true);

    const fetchData = async () => {
      try {
        const { data } = await api.get(
          `/recipes/${receta._id}/resenas?page=${pagina}&limit=5&orden=${orden}`,
        );
        if (cancelled) return;

        dispatchList({
          type: "LOAD_LIST",
          data: {
            resenas: data.resenas,
            puntosProm: data.puntosProm,
            totalResenas: data.totalResenas,
            totalPags: data.pagination.pages,
          },
        });

        if (user) {
          const mia = data.resenas.find((r) => esDelUsuario(r, user));

          const fusionarImagenes = (resenaServidor, resenaLocal) => {
            if (resenaServidor.imagenes && resenaServidor.imagenes.length > 0)
              return resenaServidor;
            const pendientesLocales = (resenaLocal?.imagenes || []).filter(
              (img) => img.estado === "pendiente"
            );
            if (pendientesLocales.length > 0) {
              return { ...resenaServidor, imagenes: pendientesLocales };
            }
            return resenaServidor;
          };

          if (mia) {
            setMiResena((prev) => fusionarImagenes(mia, prev));
            setFormEstrellas(mia.estrellas);
            setFormTexto(mia.texto || "");
          } else if (pagina === 1) {
            const totalPaginas = data.pagination.pages;
            if (totalPaginas >= 2) {
              const restantes = await Promise.all(
                Array.from({ length: totalPaginas - 1 }, (_, i) =>
                  api
                    .get(`/recipes/${receta._id}/resenas?page=${i + 2}&limit=5&orden=${orden}`)
                    .then((r) => ({
                      page: i + 2,
                      resenas: r.data.resenas,
                    }))
                )
              );
              if (cancelled) return;
              const match = restantes
                .map((r) => ({ page: r.page, mia: r.resenas.find((x) => esDelUsuario(x, user)) }))
                .find((x) => x.mia);
              if (match?.mia && !cancelled) {
                setMiResena((prev) => fusionarImagenes(match.mia, prev));
                setFormEstrellas(match.mia.estrellas);
                setFormTexto(match.mia.texto || "");
              } else if (!cancelled) {
                setMiResena(null);
                setFormEstrellas(5);
                setFormTexto("");
              }
            } else if (!cancelled) {
              setMiResena(null);
              setFormEstrellas(5);
              setFormTexto("");
            }
          }
        }
      } catch (e) {
        console.error('Error cargando reseñas:', e);
        if (!cancelled) toast.error("Error cargando reseñas");
      } finally {
        if (!cancelled) setCargandoRes(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [receta._id, pagina, orden, refresco, user]);

  const cambiarOrden = useCallback((nuevoOrden) => {
    setOrden(nuevoOrden);
  }, []);

  const handleSubmitResena = useCallback(async () => {
    if (!formEstrellas) {
      toast.error("Selecciona una puntuación");
      return;
    }
    if (formImagenes.length > 0 && !formTexto.trim()) {
      toast.error("Escribe un comentario para acompañar la imagen");
      return;
    }

    setEnviando(true);
    try {
      let data;
      if (formImagenes.length > 0 && !miResena) {
        const fd = new FormData();
        fd.append("estrellas", formEstrellas);
        fd.append("texto", formTexto.trim());
        formImagenes.forEach((img) => fd.append("imagenes", img));
        ({ data } = await api.post(`/recipes/${receta._id}/resenas`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        }));
      } else if (miResena) {
        ({ data } = await api.put(`/recipes/${receta._id}/resenas`, {
          estrellas: formEstrellas,
          texto: formTexto.trim(),
        }));
      } else {
        ({ data } = await api.post(`/recipes/${receta._id}/resenas`, {
          estrellas: formEstrellas,
          texto: formTexto.trim(),
        }));
      }

      toast.success(miResena ? "Reseña actualizada" : "Reseña publicada");
      dispatchList({ type: "SET_PUNTOS_PROM", val: data.puntosProm });
      dispatchList({ type: "SET_TOTAL_RESENAS", val: data.totalResenas });
      setMiResena(data.resena);
      setFormEstrellas(data.resena.estrellas);
      setFormTexto(data.resena.texto || "");
      setFormImagenes([]);
      setEditando(false);
      setPagina(1);
      incRefresco();
    } catch (error) {
      toast.error(error.response?.data?.error || "Error al publicar la reseña");
    } finally {
      setEnviando(false);
    }
  }, [formEstrellas, formImagenes, formTexto, miResena, receta._id]);

  const handleBorrarResena = useCallback(
    async (resenaId) => {
      if (!await confirm({ title: 'Eliminar reseña', message: '¿Eliminar esta reseña? No se puede deshacer.', confirmText: 'Eliminar' }))
        return;
      try {
        await api.delete(`/recipes/${receta._id}/resenas/${resenaId}`);
        toast.success("Reseña eliminada");
        setMiResena(null);
        setFormEstrellas(5);
        setFormTexto("");
        setFormImagenes([]);
        setEditando(false);
        setPagina(1);
        incRefresco();
      } catch (e) {
        toast.error(e.response?.data?.error || "Error al borrar");
      }
    },
    [receta._id, confirm],
  );

  const handleVotar = useCallback(
    async (resenaId, tipo) => {
      if (!isAuthenticated) {
        toast.info("Inicia sesión para votar");
        return;
      }
      try {
        const { data } = await api.post(
          `/recipes/${receta._id}/resenas/${resenaId}/voto`,
          { tipo },
        );
        dispatchList({
          type: "APPLY_VOTE",
          resenaId,
          likes: data.likes,
          dislikes: data.dislikes,
          miVoto: data.miVoto,
        });
      } catch (e) {
        toast.error(e.response?.data?.error || "Error al votar");
      }
    },
    [isAuthenticated, receta._id],
  );

  const handleFormTexto = useCallback((e) => setFormTexto(e.target.value), []);
  const handleCancelarEdicion = useCallback(() => {
    setEditando(false);
    setFormEstrellas(miResena.estrellas);
    setFormTexto(miResena.texto || "");
    setFormImagenes([]);
  }, [miResena]);
  const _handleQuitarImagen = useCallback(() => setFormImagenes([]), []);
  void _handleQuitarImagen;

  const promRedondeado = Math.round(puntosProm);

  return (
    <div className="sr-seccion">
      <style>{`
        @keyframes sr-flash {
          0%   { background-color: transparent; }
          12%  { background-color: rgba(74,222,128,0.25); box-shadow: 0 0 0 2px rgba(74,222,128,0.4); border-radius: 8px; }
          65%  { background-color: rgba(74,222,128,0.10); box-shadow: 0 0 0 2px rgba(74,222,128,0.15); border-radius: 8px; }
          100% { background-color: transparent; box-shadow: none; }
        }
        .sr-resp-item--flash { animation: sr-flash 2.8s ease-out forwards; }
        .sr-item--flash { animation: sr-flash 2.8s ease-out forwards; }
      `}</style>

      {hayTarget && buscandoActivo && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 0",
            opacity: 0.6,
            fontSize: "0.82rem",
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              border: "2px solid currentColor",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
            }}
          />
          Buscando comentario…
        </div>
      )}

      <div className="sr-resumen">
        <span className="sr-prom-numero">
          {puntosProm > 0 ? puntosProm : "—"}
        </span>
        <div className="sr-prom-detalle">
          <Estrellas valor={promRedondeado} readonly />
          <span className="sr-total-txt">
            {totalResenas > 0
              ? `${totalResenas} reseña${totalResenas !== 1 ? "s" : ""}`
              : "Sin reseñas aún"}
          </span>
        </div>
      </div>

      {isAuthenticated && (
        <div className="sr-form">
          {miResena && !editando ? (
            <div className="sr-mi-resena-card">
              <div className="sr-mi-resena-header">
                <span className="sr-mi-resena-label">Tu reseña</span>
                <div className="sr-mi-resena-acciones">
                  <button
                    type="button"
                    className="sr-btn-editar"
                    onClick={() => setEditando(true)}
                  >
                    <IcoEditar size={13} /> Editar
                  </button>
                  <button
                    type="button"
                    className="sr-btn-borrar"
                    onClick={() => handleBorrarResena(miResena._id)}
                  >
                    <IcoBorrar size={13} /> Eliminar
                  </button>
                </div>
              </div>
              <Estrellas valor={miResena.estrellas} readonly />
              {miResena.texto && (
                <p className="sr-mi-resena-texto">"{miResena.texto}"</p>
              )}
              <ImagenesResena imagenes={miResena.imagenes || EMPTY_IMAGENES} esPropia />
              <SeccionRespuestas
                recetaId={receta._id}
                resenaId={miResena._id}
                respuestas={miResena.respuestas || EMPTY_RESPUESTAS}
                user={user}
                isAuthenticated={isAuthenticated}
                respuestaIdDestacada={
                  (miResena.respuestas || []).some((rp) =>
                    idIgual(rp._id, respuestaIdDestacada),
                  )
                    ? respuestaIdDestacada
                    : undefined
                }
                modalListo={modalListo}
              />
            </div>
          ) : (
            <>
              <h4 className="sr-form-titulo">
                {miResena ? "Editar tu reseña" : "¿Qué te pareció esta receta?"}
              </h4>
              <Estrellas valor={formEstrellas} onChange={setFormEstrellas} />
              <textarea
                className="sr-textarea"
                placeholder={
                  formImagenes.length > 0
                    ? "Escribe un comentario (obligatorio con imagen)..."
                    : "Escribe un comentario (opcional)..."
                }
                value={formTexto}
                onChange={handleFormTexto}
                maxLength={500}
                rows={3}
                lang="es"
                spellCheck="true"
              />

              {!miResena && (
                <SelectorImagenes
                  imagenes={formImagenes}
                  onChange={setFormImagenes}
                  onRemove={handleQuitarImagenForm}
                />
              )}

              {imagenesValidas.length > 0 && (
                <div className="sr-edit-imagen-wrap">
                  <div className="sr-previews-grid">
                    {imagenesValidas.map((img, idx) => (
                        <div key={img.url || img.publicId || `edit-${idx}`} className="sr-edit-imagen-inner">
                          {img.estado === "aprobada" ? (
                            <img
                              src={img.url}
                              alt={`Imagen ${idx + 1}`}
                              className="sr-imagen sr-edit-img"
                              loading="lazy"
                            />
                          ) : (
                            <div className="sr-imagen-pendiente sr-edit-pendiente">
                              <IcoImage size={28} className="sr-imagen-pendiente-icono" />
                              <span className="sr-imagen-pendiente-titulo">
              <IcoClock size={13} style={STYLE_ICO_EN_REVISION} />
                                En revisión
                              </span>
                              <span className="sr-imagen-pendiente-sub">
                                Pendiente de aprobación
                              </span>
                            </div>
                          )}
                          <button
                            type="button"
                            className="sr-edit-quitar-btn"
                            title="Quitar imagen"
                            onClick={async () => {
                              if (!await confirm({ title: 'Quitar imagen', message: '¿Quitar esta imagen de la reseña?', confirmText: 'Quitar' })) return;
                              try {
                                await api.delete(`/recipes/${receta._id}/resenas/imagen`, { data: { idx } });
                                setMiResena((prev) => ({
                                  ...prev,
                                  imagenes: (prev.imagenes || []).filter((_, i) => i !== idx),
                                }));
                                toast.success("Imagen eliminada");
                              } catch (e) {
                                toast.error(e.response?.data?.error || "Error al quitar imagen");
                              }
                            }}
                          >
                            <IcoX size={11} />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="sr-form-actions">
                {miResena && (
                  <button
                    type="button"
                    className="sr-btn-cancelar"
                    onClick={handleCancelarEdicion}
                    disabled={enviando}
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="button"
                  className="sr-btn-enviar"
                  onClick={handleSubmitResena}
                  disabled={
                    enviando ||
                    !formEstrellas ||
                    (formImagenes.length > 0 && !formTexto.trim())
                  }
                >
                  {enviando ? (
                    <>
                      <IcoLoader size={14} className="sr-spin" /> Guardando
                    </>
                  ) : miResena ? (
                    <>
                      <IcoGuardar size={14} /> Guardar cambios
                    </>
                  ) : (
                    <>
                      <IcoPublicar size={14} /> Publicar reseña
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {!isAuthenticated && (
        <p className="sr-login-aviso">
          <IcoLock size={14} /> Inicia sesión para dejar una reseña
        </p>
      )}

      <div className="sr-filtro">
        <span className="sr-filtro-label">Ordenar por:</span>
        <div className="sr-filtro-btns">
          <button
            type="button"
            className={`sr-btn-orden${orden === "reciente" ? " activo" : ""}`}
            onClick={() => cambiarOrden("reciente")}
          >
            <IcoClock size={13} /> Más recientes
          </button>
          <button
            type="button"
            className={`sr-btn-orden${orden === "relevancia" ? " activo" : ""}`}
            onClick={() => cambiarOrden("relevancia")}
          >
            <IcoThumbUp size={13} /> Más relevantes
          </button>
        </div>
      </div>

      <div className="sr-lista">
        {cargandoRes ? (
          <p className="sr-estado">
            <IcoLoader size={16} className="sr-spin" /> Cargando reseñas
          </p>
        ) : resenas.length === 0 ? (
          <p className="sr-estado sr-vacio">
            <IcoEmptyReviews size={18} /> Sé el primero en dejar una reseña
          </p>
        ) : (
          resenas.reduce((acc, r) => {
            if (miResena && !editando && esDelUsuario(r, user)) return acc;
            acc.push(
              <ResenaItem
                key={r._id}
                resena={r}
                user={user}
                resenaIdDestacada={resenaIdDestacada}
                resenaDestacadaRef={resenaDestacadaRef}
                recetaId={receta._id}
                isAuthenticated={isAuthenticated}
                modalListo={modalListo}
                respuestaIdDestacada={respuestaIdDestacada}
                onBorrarResena={handleBorrarResena}
                onVotar={handleVotar}
              />
            );
            return acc;
          }, [])
        )}
      </div>

      {totalPags > 1 && (
        <div className="sr-paginacion">
          <button
            type="button"
            disabled={pagina === 1}
            onClick={() => decPagina()}
          >
            <IcoChevronDown size={14} style={STYLE_CHEVRON_LEFT} />{" "}
            Anterior
          </button>
          <span>
            {pagina} / {totalPags}
          </span>
          <button
            type="button"
            disabled={pagina === totalPags}
            onClick={() => incPagina()}
          >
            Siguiente{" "}
            <IcoChevronDown size={14} style={STYLE_CHEVRON_RIGHT} />
          </button>
        </div>
      )}
    </div>
  );
};

export default SeccionResenas;
