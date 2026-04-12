import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import './SeccionResenas.css';

const Icon = memo(({ d, size = 16, viewBox = '0 0 24 24', className = '', style = {} }) => (
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
));
Icon.displayName = 'Icon';

const IcoEditar = memo(({ size }) => (
  <Icon size={size} d={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>}/>
));
IcoEditar.displayName = 'IcoEditar';

const IcoBorrar = memo(({ size }) => (
  <Icon size={size} d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></>}/>
));
IcoBorrar.displayName = 'IcoBorrar';

const IcoGuardar = memo(({ size }) => (
  <Icon size={size} d={<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>}/>
));
IcoGuardar.displayName = 'IcoGuardar';

const IcoPublicar = memo(({ size }) => (
  <Icon size={size} d={<><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>}/>
));
IcoPublicar.displayName = 'IcoPublicar';

const IcoLock = memo(({ size }) => (
  <Icon size={size} d={<><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>}/>
));
IcoLock.displayName = 'IcoLock';

const IcoThumbUp = memo(({ size }) => (
  <Icon size={size} d={<path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zm-7 11H4.72A2 2 0 0 1 3 18.28V13a2 2 0 0 1 2-2h2v9z"/>}/>
));
IcoThumbUp.displayName = 'IcoThumbUp';

const IcoThumbDown = memo(({ size }) => (
  <Icon size={size} d={<path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17V2z"/>}/>
));
IcoThumbDown.displayName = 'IcoThumbDown';

const IcoClock = memo(({ size }) => (
  <Icon size={size} d={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>}/>
));
IcoClock.displayName = 'IcoClock';

const IcoChevronDown = memo(({ size }) => (
  <Icon size={size} d={<polyline points="6 9 12 15 18 9"/>}/>
));
IcoChevronDown.displayName = 'IcoChevronDown';

const IcoChevronUp = memo(({ size }) => (
  <Icon size={size} d={<polyline points="18 15 12 9 6 15"/>}/>
));
IcoChevronUp.displayName = 'IcoChevronUp';

const IcoCornerDownLeft = memo(({ size }) => (
  <Icon size={size} d={<><polyline points="9 10 4 15 9 20"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/></>}/>
));
IcoCornerDownLeft.displayName = 'IcoCornerDownLeft';

const IcoImage = memo(({ size, className }) => (
  <Icon size={size} className={className} d={<><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>}/>
));
IcoImage.displayName = 'IcoImage';

const IcoInfo = memo(({ size }) => (
  <Icon size={size} d={<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>}/>
));
IcoInfo.displayName = 'IcoInfo';

const IcoX = memo(({ size }) => (
  <Icon size={size} d={<path d="M18 6L6 18M6 6l12 12"/>}/>
));
IcoX.displayName = 'IcoX';

const IcoImagePlus = memo(({ size, className }) => (
  <Icon size={size} className={className} d={<><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/><line x1="14" y1="8" x2="14" y2="14" strokeWidth="2"/><line x1="11" y1="11" x2="17" y2="11" strokeWidth="2"/></>}/>
));
IcoImagePlus.displayName = 'IcoImagePlus';

const IcoLoader = memo(({ size }) => (
  <Icon size={size} d={<><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></>}/>
));
IcoLoader.displayName = 'IcoLoader';

const IcoEmptyReviews = memo(({ size }) => (
  <Icon size={size} d={<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/></>}/>
));
IcoEmptyReviews.displayName = 'IcoEmptyReviews';

const formatFecha = (f) =>
  new Date(f).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

const ESTRELLAS = [1, 2, 3, 4, 5];

const Estrellas = memo(({ valor, onChange, readonly = false }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className={`sr-estrellas${readonly ? ' readonly' : ''}`}>
      {ESTRELLAS.map(n => (
        <span
          key={n}
          className={`sr-estrella ${n <= (hover || valor) ? 'llena' : 'vacia'}`}
          onClick={() => !readonly && onChange?.(n)}
          onMouseEnter={() => !readonly && setHover(n)}
          onMouseLeave={() => !readonly && setHover(0)}
        >★</span>
      ))}
    </div>
  );
});
Estrellas.displayName = 'Estrellas';

const ImagenResena = memo(({ imagen, esPropia }) => {
  if (!imagen || !imagen.estado) return null;
  if (imagen.estado === 'rechazada') return null;

  const aprobada  = imagen.estado === 'aprobada';
  const pendiente = imagen.estado === 'pendiente';

  if (pendiente && !esPropia) return null;

  if (aprobada) {
    return (
      <div className="sr-imagen-wrap">
        <img src={imagen.url} alt="Imagen del comentario" className="sr-imagen" loading="lazy" />
      </div>
    );
  }

  return (
    <div className="sr-imagen-pendiente">
      <IcoImage size={28} className="sr-imagen-pendiente-icono" />
      <span className="sr-imagen-pendiente-titulo">
        <IcoClock size={13} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
        En revisión
      </span>
      <span className="sr-imagen-pendiente-sub">Tu imagen fue recibida y está pendiente de aprobación</span>
    </div>
  );
});
ImagenResena.displayName = 'ImagenResena';

const SelectorImagen = memo(({ imagen, onChange, onRemove }) => {
  const inputRef = useRef(null);

  const handleFile = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Solo se permiten imágenes'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('La imagen no puede superar 5 MB'); return; }
    onChange(file);
  }, [onChange]);

  const handleClick = useCallback(() => inputRef.current?.click(), []);

  return (
    <div className="sr-selector-imagen">
      {!imagen ? (
        <button type="button" className="sr-btn-adjuntar" onClick={handleClick} title="Adjuntar imagen (requiere aprobación)">
          <IcoImagePlus size={14} />
          Adjuntar imagen
        </button>
      ) : (
        <div className="sr-preview-wrap">
          <img src={URL.createObjectURL(imagen)} alt="Vista previa" className="sr-preview-img" />
          <button type="button" className="sr-btn-quitar-img" onClick={onRemove} title="Quitar imagen">
            <IcoX size={10} />
          </button>
          <span className="sr-preview-aviso">
            <IcoInfo size={12} />
            Requiere aprobación (≈3 días)
          </span>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  );
});
SelectorImagen.displayName = 'SelectorImagen';

const SeccionRespuestas = memo(({ recetaId, resenaId, respuestas: respInit, user, isAuthenticated }) => {
  const [respuestas,   setRespuestas]   = useState(respInit || []);
  const [texto,        setTexto]        = useState('');
  const [enviando,     setEnviando]     = useState(false);
  const [expandido,    setExpandido]    = useState(false);
  const [respondiendo, setRespondiendo] = useState(false);

  const handleEnviar = useCallback(async () => {
    if (!texto.trim()) return;
    setEnviando(true);
    try {
      const { data } = await api.post(`/recipes/${recetaId}/resenas/${resenaId}/respuestas`, { texto });
      setRespuestas(prev => [...prev, data.respuesta]);
      setTexto('');
      setRespondiendo(false);
      setExpandido(true);
      toast.success('Respuesta publicada');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Error al responder');
    } finally {
      setEnviando(false);
    }
  }, [texto, recetaId, resenaId]);

  const handleBorrar = useCallback(async (respId) => {
    if (!window.confirm('¿Eliminar esta respuesta?')) return;
    try {
      await api.delete(`/recipes/${recetaId}/resenas/${resenaId}/respuestas/${respId}`);
      setRespuestas(prev => prev.filter(r => r._id !== respId));
      toast.success('Respuesta eliminada');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Error al borrar');
    }
  }, [recetaId, resenaId]);

  const toggleExpandido   = useCallback(() => setExpandido(v => !v), []);
  const iniciarRespuesta  = useCallback(() => setRespondiendo(true), []);
  const cancelarRespuesta = useCallback(() => { setTexto(''); setRespondiendo(false); }, []);
  const handleTexto       = useCallback((e) => setTexto(e.target.value), []);

  return (
    <div className="sr-resp-seccion">
      <div className="sr-resp-acciones-fila">
        {respuestas.length > 0 && (
          <button className="sr-btn-toggle-resp" onClick={toggleExpandido}>
            {expandido
              ? <><IcoChevronUp size={13} /> Ocultar respuestas</>
              : <><IcoChevronDown size={13} /> {respuestas.length} respuesta{respuestas.length !== 1 ? 's' : ''}</>
            }
          </button>
        )}
        {isAuthenticated && (
          <button className="sr-btn-responder" onClick={iniciarRespuesta}>
            <IcoCornerDownLeft size={13} /> Responder
          </button>
        )}
      </div>

      {expandido && respuestas.length > 0 && (
        <div className="sr-resp-lista">
          {respuestas.map(rp => (
            <div key={rp._id} className="sr-resp-item">
              <div className="sr-resp-avatar">{rp.userName.charAt(0).toUpperCase()}</div>
              <div className="sr-resp-cuerpo">
                <div className="sr-resp-meta">
                  <span className="sr-resp-nombre">{rp.userName}</span>
                  <span className="sr-resp-fecha">{formatFecha(rp.createdAt)}</span>
                  {isAuthenticated && user &&
                    (rp.userId?.toString() === user._id?.toString() ||
                     rp.userId?.toString() === user.id?.toString() ||
                     user.role === 'admin') && (
                      <button className="sr-btn-borrar-resp" onClick={() => handleBorrar(rp._id)} title="Eliminar respuesta">
                        <IcoBorrar size={13} />
                      </button>
                    )}
                </div>
                <p className="sr-resp-texto">{rp.texto}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {respondiendo && (
        <div className="sr-resp-form">
          <div className="sr-resp-avatar sr-resp-avatar--yo">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="sr-resp-input-wrap">
            <textarea
              className="sr-resp-textarea"
              placeholder="Escribe una respuesta..."
              value={texto}
              onChange={handleTexto}
              rows={2}
              maxLength={500}
              lang="es"
              spellCheck="true"
              autoFocus
            />
            <div className="sr-resp-actions">
              <button className="sr-btn-cancelar-resp" onClick={cancelarRespuesta} disabled={enviando}>Cancelar</button>
              <button className="sr-btn-enviar-resp" onClick={handleEnviar} disabled={enviando || !texto.trim()}>
                {enviando
                  ? <><IcoLoader size={13} className="sr-spin" /> Enviando</>
                  : <><IcoCornerDownLeft size={13} /> Publicar</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
SeccionRespuestas.displayName = 'SeccionRespuestas';

const SeccionResenas = ({ receta, user, isAuthenticated, resenaIdDestacada }) => {
  const [resenas,       setResenas]       = useState([]);
  const [puntosProm,    setPuntosProm]    = useState(receta.puntosProm   || 0);
  const [totalResenas,  setTotalResenas]  = useState(receta.totalResenas || 0);
  const [cargandoRes,   setCargandoRes]   = useState(true);
  const [pagina,        setPagina]        = useState(1);
  const [totalPags,     setTotalPags]     = useState(1);
  const [orden,         setOrden]         = useState('reciente');

  const [miResena,      setMiResena]      = useState(null);
  const [editando,      setEditando]      = useState(false);
  const [formEstrellas, setFormEstrellas] = useState(5);
  const [formTexto,     setFormTexto]     = useState('');
  const [formImagen,    setFormImagen]    = useState(null);
  const [enviando,      setEnviando]      = useState(false);

  const resenaDestacadaRef = useRef(null);

  useEffect(() => {
    if (!resenaIdDestacada || cargandoRes || !resenaDestacadaRef.current) return;
    const t = setTimeout(() => {
      resenaDestacadaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 400);
    return () => clearTimeout(t);
  }, [resenaIdDestacada, cargandoRes]);

  const cargarResenas = useCallback(async (pag = 1, ord = orden) => {
    setCargandoRes(true);
    try {
      const { data } = await api.get(`/recipes/${receta._id}/resenas?page=${pag}&limit=5&orden=${ord}`);
      setResenas(data.resenas);
      setPuntosProm(data.puntosProm);
      setTotalResenas(data.totalResenas);
      setTotalPags(data.pagination.pages);

      if (user) {
        const mia = data.resenas.find(
          r => r.userId?.toString() === user._id?.toString() ||
               r.userId?.toString() === user.id?.toString()
        );

        const fusionarImagen = (resenaServidor, resenaLocal) => {
          if (resenaServidor.imagen) return resenaServidor;
          if (resenaLocal?.imagen?.estado === 'pendiente') {
            return { ...resenaServidor, imagen: resenaLocal.imagen };
          }
          return resenaServidor;
        };

        if (mia) {
          setMiResena(prev => fusionarImagen(mia, prev));
          setFormEstrellas(mia.estrellas);
          setFormTexto(mia.texto || '');
        } else if (pag === 1) {
          const totalPaginas = data.pagination.pages;
          let encontrada = false;
          for (let p = 2; p <= totalPaginas && !encontrada; p++) {
            const { data: d2 } = await api.get(`/recipes/${receta._id}/resenas?page=${p}&limit=5&orden=${ord}`);
            const mia2 = d2.resenas.find(
              r => r.userId?.toString() === user._id?.toString() ||
                   r.userId?.toString() === user.id?.toString()
            );
            if (mia2) {
              encontrada = true;
              setMiResena(prev => fusionarImagen(mia2, prev));
              setFormEstrellas(mia2.estrellas);
              setFormTexto(mia2.texto || '');
            }
          }
          if (!encontrada) {
            setMiResena(null);
            setFormEstrellas(5);
            setFormTexto('');
          }
        }
      }
    } catch {
      toast.error('Error cargando reseñas');
    } finally {
      setCargandoRes(false);
    }
  }, [receta._id, user, orden]);

  useEffect(() => { cargarResenas(1, orden); }, [orden]);

  const cambiarOrden = useCallback((nuevoOrden) => {
    setOrden(nuevoOrden);
    setPagina(1);
  }, []);

  const handleSubmitResena = useCallback(async () => {
    if (!formEstrellas) { toast.error('Selecciona una puntuación'); return; }
    if (formImagen && !formTexto.trim()) { toast.error('Escribe un comentario para acompañar la imagen'); return; }

    setEnviando(true);
    try {
      let data;
      if (formImagen && !miResena) {
        const fd = new FormData();
        fd.append('estrellas', formEstrellas);
        fd.append('texto', formTexto.trim());
        fd.append('imagen', formImagen);
        ({ data } = await api.post(`/recipes/${receta._id}/resenas`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }));
      } else if (miResena) {
        ({ data } = await api.put(`/recipes/${receta._id}/resenas`, { estrellas: formEstrellas, texto: formTexto.trim() }));
      } else {
        ({ data } = await api.post(`/recipes/${receta._id}/resenas`, { estrellas: formEstrellas, texto: formTexto.trim() }));
      }
      toast.success(miResena ? 'Reseña actualizada' : 'Reseña publicada');
      setPuntosProm(data.puntosProm);
      setTotalResenas(data.totalResenas);
      setMiResena(data.resena);
      setFormEstrellas(data.resena.estrellas);
      setFormTexto(data.resena.texto || '');
      setFormImagen(null);
      setEditando(false);
      cargarResenas(pagina, orden);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al publicar la reseña');
    } finally {
      setEnviando(false);
    }
  }, [formEstrellas, formImagen, formTexto, miResena, receta._id, pagina, orden, cargarResenas]);

  const handleBorrarResena = useCallback(async (resenaId) => {
    if (!window.confirm('¿Eliminar esta reseña? No se puede deshacer.')) return;
    try {
      await api.delete(`/recipes/${receta._id}/resenas/${resenaId}`);
      toast.success('Reseña eliminada');
      setMiResena(null);
      setFormEstrellas(5);
      setFormTexto('');
      setFormImagen(null);
      setEditando(false);
      cargarResenas(1, orden);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Error al borrar');
    }
  }, [receta._id, orden, cargarResenas]);

  const handleVotar = useCallback(async (resenaId, tipo) => {
    if (!isAuthenticated) { toast.info('Inicia sesión para votar'); return; }
    try {
      const { data } = await api.post(`/recipes/${receta._id}/resenas/${resenaId}/voto`, { tipo });
      setResenas(prev => prev.map(r =>
        r._id === resenaId
          ? { ...r, likes: data.likes, dislikes: data.dislikes, miVoto: data.miVoto }
          : r
      ));
    } catch (e) {
      toast.error(e.response?.data?.error || 'Error al votar');
    }
  }, [isAuthenticated, receta._id]);

  const handleFormTexto = useCallback((e) => setFormTexto(e.target.value), []);
  const handleCancelarEdicion = useCallback(() => {
    setEditando(false);
    setFormEstrellas(miResena.estrellas);
    setFormTexto(miResena.texto || '');
    setFormImagen(null);
  }, [miResena]);
  const handleQuitarImagen = useCallback(() => setFormImagen(null), []);

  const promRedondeado = Math.round(puntosProm);

  return (
    <div className="sr-seccion">

      <div className="sr-resumen">
        <span className="sr-prom-numero">{puntosProm > 0 ? puntosProm : '—'}</span>
        <div className="sr-prom-detalle">
          <Estrellas valor={promRedondeado} readonly />
          <span className="sr-total-txt">
            {totalResenas > 0 ? `${totalResenas} reseña${totalResenas !== 1 ? 's' : ''}` : 'Sin reseñas aún'}
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
                  <button className="sr-btn-editar" onClick={() => setEditando(true)}>
                    <IcoEditar size={13} /> Editar
                  </button>
                  <button className="sr-btn-borrar" onClick={() => handleBorrarResena(miResena._id)}>
                    <IcoBorrar size={13} /> Eliminar
                  </button>
                </div>
              </div>
              <Estrellas valor={miResena.estrellas} readonly />
              {miResena.texto && <p className="sr-mi-resena-texto">"{miResena.texto}"</p>}
              <ImagenResena imagen={miResena.imagen} esPropia />
              <SeccionRespuestas
                recetaId={receta._id}
                resenaId={miResena._id}
                respuestas={miResena.respuestas || []}
                user={user}
                isAuthenticated={isAuthenticated}
              />
            </div>
          ) : (
            <>
              <h4 className="sr-form-titulo">
                {miResena ? 'Editar tu reseña' : '¿Qué te pareció esta receta?'}
              </h4>
              <Estrellas valor={formEstrellas} onChange={setFormEstrellas} />
              <textarea
                className="sr-textarea"
                placeholder={formImagen ? 'Escribe un comentario (obligatorio con imagen)...' : 'Escribe un comentario (opcional)...'}
                value={formTexto}
                onChange={handleFormTexto}
                maxLength={500}
                rows={3}
                lang="es"
                spellCheck="true"
              />

              {!miResena && (
                <SelectorImagen imagen={formImagen} onChange={setFormImagen} onRemove={handleQuitarImagen} />
              )}

              {miResena && miResena.imagen && miResena.imagen.estado !== 'rechazada' && (
                <div className="sr-edit-imagen-wrap">
                  <div className="sr-edit-imagen-inner">
                    {miResena.imagen.estado === 'aprobada' ? (
                      <img src={miResena.imagen.url} alt="Imagen de la reseña" className="sr-imagen sr-edit-img" loading="lazy" />
                    ) : (
                      <div className="sr-imagen-pendiente sr-edit-pendiente">
                        <IcoImage size={28} className="sr-imagen-pendiente-icono" />
                        <span className="sr-imagen-pendiente-titulo">
                          <IcoClock size={13} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                          En revisión
                        </span>
                        <span className="sr-imagen-pendiente-sub">Tu imagen fue recibida y está pendiente de aprobación</span>
                      </div>
                    )}
                    <button
                      type="button"
                      className="sr-edit-quitar-btn"
                      title="Quitar imagen"
                      onClick={async () => {
                        if (!window.confirm('¿Quitar la imagen de esta reseña?')) return;
                        try {
                          await api.delete(`/recipes/${receta._id}/resenas/imagen`);
                          setMiResena(prev => ({ ...prev, imagen: null }));
                          toast.success('Imagen eliminada');
                        } catch (e) {
                          toast.error(e.response?.data?.error || 'Error al quitar imagen');
                        }
                      }}
                    >
                      <IcoX size={11} />
                    </button>
                  </div>
                  <p className="sr-edit-imagen-aviso">Para subir una nueva imagen crea una nueva reseña</p>
                </div>
              )}

              <div className="sr-form-actions">
                {miResena && (
                  <button className="sr-btn-cancelar" onClick={handleCancelarEdicion} disabled={enviando}>Cancelar</button>
                )}
                <button
                  className="sr-btn-enviar"
                  onClick={handleSubmitResena}
                  disabled={enviando || !formEstrellas || (!!formImagen && !formTexto.trim())}
                >
                  {enviando
                    ? <><IcoLoader size={14} className="sr-spin" /> Guardando</>
                    : miResena
                      ? <><IcoGuardar size={14} /> Guardar cambios</>
                      : <><IcoPublicar size={14} /> Publicar reseña</>
                  }
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
            className={`sr-btn-orden${orden === 'reciente' ? ' activo' : ''}`}
            onClick={() => cambiarOrden('reciente')}
          >
            <IcoClock size={13} /> Más recientes
          </button>
          <button
            className={`sr-btn-orden${orden === 'relevancia' ? ' activo' : ''}`}
            onClick={() => cambiarOrden('relevancia')}
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
          resenas
            .filter(r => {
              if (!miResena || editando) return true;
              const esPropia = user && (
                r.userId?.toString() === user._id?.toString() ||
                r.userId?.toString() === user.id?.toString()
              );
              return !esPropia;
            })
            .map(r => {
              const esPropia = user && (
                r.userId?.toString() === user._id?.toString() ||
                r.userId?.toString() === user.id?.toString()
              );
              const esAdmin = user?.role === 'admin';
              const imagenParaMostrar =
                esPropia && !r.imagen && miResena?.imagen?.estado === 'pendiente'
                  ? miResena.imagen
                  : r.imagen;

              return (
                <div
                  key={r._id}
                  ref={r._id === resenaIdDestacada ? resenaDestacadaRef : null}
                  className={`sr-item${esPropia ? ' propia' : ''}${r._id === resenaIdDestacada ? ' sr-item--destacada' : ''}`}
                >
                  <div className="sr-item-header">
                    <div className="sr-avatar">{r.userName.charAt(0).toUpperCase()}</div>
                    <div className="sr-item-meta">
                      <span className="sr-nombre">{r.userName}</span>
                      <span className="sr-fecha">{formatFecha(r.createdAt)}</span>
                    </div>
                    <Estrellas valor={r.estrellas} readonly />
                    {isAuthenticated && (esPropia || esAdmin) && (
                      <button className="sr-btn-borrar-lista" onClick={() => handleBorrarResena(r._id)} title="Eliminar reseña">
                        <IcoBorrar size={15} />
                      </button>
                    )}
                  </div>

                  {r.texto && <p className="sr-texto">{r.texto}</p>}
                  <ImagenResena imagen={imagenParaMostrar} esPropia={!!esPropia} />

                  <div className="sr-votos">
                    <span className="sr-votos-label">¿Te resultó útil?</span>
                    <button className={`sr-btn-voto sr-like${r.miVoto === 'like' ? ' activo' : ''}`} onClick={() => handleVotar(r._id, 'like')} title="Es útil">
                      <IcoThumbUp size={13} /> <span>{r.likes}</span>
                    </button>
                    <button className={`sr-btn-voto sr-dislike${r.miVoto === 'dislike' ? ' activo' : ''}`} onClick={() => handleVotar(r._id, 'dislike')} title="No es útil">
                      <IcoThumbDown size={13} /> <span>{r.dislikes}</span>
                    </button>
                  </div>

                  <SeccionRespuestas
                    recetaId={receta._id}
                    resenaId={r._id}
                    respuestas={r.respuestas || []}
                    user={user}
                    isAuthenticated={isAuthenticated}
                  />
                </div>
              );
            })
        )}
      </div>

      {totalPags > 1 && (
        <div className="sr-paginacion">
          <button
            disabled={pagina === 1}
            onClick={() => { const p = pagina - 1; setPagina(p); cargarResenas(p, orden); }}
          >
            <IcoChevronDown size={14} style={{ transform: 'rotate(90deg)' }} /> Anterior
          </button>
          <span>{pagina} / {totalPags}</span>
          <button
            disabled={pagina === totalPags}
            onClick={() => { const p = pagina + 1; setPagina(p); cargarResenas(p, orden); }}
          >
            Siguiente <IcoChevronDown size={14} style={{ transform: 'rotate(-90deg)' }} />
          </button>
        </div>
      )}

    </div>
  );
};

export default SeccionResenas;