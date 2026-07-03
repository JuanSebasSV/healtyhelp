import { useState, useEffect, useCallback, useRef, memo } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { optimizeCloudinary } from '../../utils/cloudinary';
import './ImagenesAprobacion.css';

const ESTADOS = {
  pendiente: { label: 'Pendientes', color: 'naranja' },
  aprobada:  { label: 'Aprobadas',  color: 'verde'   },
  rechazada: { label: 'Rechazadas', color: 'rojo'    },
};

const formatFecha = (f) =>
  new Date(f).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const mapItem = (img) => ({
  _id:             `${img.recipeId}_${img.resenaId}_${img.imagenIndex ?? 0}`,
  recipeId:        img.recipeId,
  resenaId:        img.resenaId,
  imagenIndex:     img.imagenIndex ?? 0,
  userId:          img.userId,
  url:             img.imagenUrl,
  estado:          img.imagenEstado,
  userName:        img.userName,
  recetaNombre:    img.recipeNombre,
  comentarioTexto: img.texto,
  creadoEn:        img.createdAt,
});

const ModalBaneoImagen = memo(({ imagen, onClose, onBan }) => {
  const [motivo,   setMotivo]   = useState('');
  const [tipo,     setTipo]     = useState('dias');
  const [dias,     setDias]     = useState(7);
  const [enviando, setEnviando] = useState(false);

  const handleConfirm = async () => {
    setEnviando(true);
    try {
      await onBan(imagen.userId, motivo, tipo === 'permanente' ? null : parseInt(dias));
      onClose();
    } catch {
      setEnviando(false);
    }
  };

  return (
    <div className="ban-modal-overlay" onClick={onClose}>
      <div className="ban-modal" onClick={e => e.stopPropagation()}>
        <div className="ban-modal-header">
          <h3>🔨 Banear usuario</h3>
          <button className="ban-modal-cerrar" onClick={onClose}>✕</button>
        </div>

        <p className="ban-modal-usuario">
          Usuario: <strong>{imagen.userName}</strong>
          {imagen.recetaNombre && <><br />Receta: <em>{imagen.recetaNombre}</em></>}
        </p>

        {imagen.comentarioTexto && (
          <p className="ban-modal-contexto">Comentario: "{imagen.comentarioTexto}"</p>
        )}

        <div className="ban-modal-campo">
          <label>Motivo <span className="ban-opcional">(opcional)</span></label>
          <textarea
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            placeholder="Ej: Imagen inapropiada, spam..."
            rows={3}
            maxLength={300}
          />
        </div>

        <div className="ban-modal-campo">
          <label>Duración</label>
          <div className="ban-tipo-btns">
            <button className={`ban-tipo-btn ${tipo === 'dias' ? 'activo' : ''}`} onClick={() => setTipo('dias')}>Temporal</button>
            <button className={`ban-tipo-btn ban-tipo-btn--rojo ${tipo === 'permanente' ? 'activo' : ''}`} onClick={() => setTipo('permanente')}>Permanente</button>
          </div>
        </div>

        {tipo === 'dias' && (
          <div className="ban-modal-campo">
            <label>Días de baneo</label>
            <div className="ban-dias-btns">
              {[1, 3, 7, 14, 30, 90].map(d => (
                <button key={d} className={`ban-dias-btn ${dias === d ? 'activo' : ''}`} onClick={() => setDias(d)}>{d}d</button>
              ))}
            </div>
            <input
              type="number" min={1} max={365} value={dias}
              onChange={e => setDias(Math.max(1, parseInt(e.target.value) || 1))}
              className="ban-dias-input"
            />
          </div>
        )}

        {tipo === 'permanente' && (
          <p className="ban-aviso-permanente">
            ⚠️ El usuario no podrá iniciar sesión hasta que un admin lo desbanee manualmente.
          </p>
        )}

        <div className="ban-modal-acciones">
          <button className="ban-btn-cancelar" onClick={onClose} disabled={enviando}>Cancelar</button>
          <button className="ban-btn-confirmar" onClick={handleConfirm} disabled={enviando}>
            {enviando ? '⏳ Baneando...' : tipo === 'permanente' ? '🔨 Banear permanentemente' : `🔨 Banear por ${dias} día${dias !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
});
ModalBaneoImagen.displayName = 'ModalBaneoImagen';

const ImageCard = memo(({
  img, modoSeleccion, estaSeleccionado, isProcesando,
  onToggleSeleccion, onAprobar, onRechazar, onEliminar,
  onVerImagen, onBanear,
}) => (
  <div
    className={`ia-card ia-card--${ESTADOS[img.estado]?.color || 'naranja'} ${estaSeleccionado ? 'ia-card--seleccionada' : ''}`}
    onClick={modoSeleccion ? () => onToggleSeleccion(img._id) : undefined}
    style={modoSeleccion ? { cursor: 'pointer' } : undefined}
  >
    {modoSeleccion && (
      <div className="ia-card-check-wrap" onClick={e => e.stopPropagation()}>
        <input type="checkbox" className="ia-card-check" checked={estaSeleccionado} onChange={() => onToggleSeleccion(img._id)} />
      </div>
    )}

    <div
      className="ia-card-img-wrap"
      onClick={e => {
        if (modoSeleccion) { e.stopPropagation(); onToggleSeleccion(img._id); return; }
        img.url && onVerImagen(img);
      }}
      title={img.url ? 'Ver imagen completa' : 'Imagen eliminada de Cloudinary'}
      style={{ cursor: img.url ? 'pointer' : 'default' }}
    >
      {img.url ? (
        <>
          <img src={optimizeCloudinary(img.url, 'q_auto,f_auto,w_400')} alt="Imagen de reseña" className="ia-card-img" width="220" height="160" loading="lazy" decoding="async" />
          {!modoSeleccion && (
            <div className="ia-card-img-overlay">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
              Ver imagen
            </div>
          )}
        </>
      ) : (
        <div className="ia-card-img-eliminada">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="3"/>
            <line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/>
          </svg>
          <span>Imagen eliminada</span>
        </div>
      )}
    </div>

    <div className="ia-card-info">
      <div className="ia-card-meta">
        <span className="ia-card-usuario">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          {img.userName}
        </span>
        <span className="ia-card-fecha">{formatFecha(img.creadoEn)}</span>
      </div>

      {img.recetaNombre && (
        <p className="ia-card-receta">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/>
          </svg>
          {img.recetaNombre}
        </p>
      )}

      {img.comentarioTexto
        ? <p className="ia-card-comentario">"{img.comentarioTexto}"</p>
        : <p className="ia-card-comentario ia-card-comentario--vacio"><em>Sin comentario</em></p>
      }

      <span className={`ia-estado-badge ia-estado-badge--${ESTADOS[img.estado]?.color || 'naranja'}`}>
        {img.estado === 'pendiente' && '⏳ Pendiente'}
        {img.estado === 'aprobada'  && '✅ Aprobada'}
        {img.estado === 'rechazada' && '❌ Rechazada'}
      </span>
    </div>

    {!modoSeleccion && (
      <>
        {img.estado === 'pendiente' && (
          <div className="ia-card-acciones">
            <button className="ia-btn-aprobar" onClick={() => onAprobar(img)} disabled={isProcesando}>
              {isProcesando ? '⏳' : (
                <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Aprobar</>
              )}
            </button>
            <button className="ia-btn-rechazar" onClick={() => onRechazar(img)} disabled={isProcesando}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              Rechazar
            </button>
          </div>
        )}

        {img.estado === 'aprobada' && (
          <div className="ia-card-acciones">
            <button className="ia-btn-revertir" onClick={() => onRechazar(img)} disabled={isProcesando}>↩ Revocar aprobación</button>
            <button className="ia-btn-eliminar" onClick={() => onEliminar(img)} disabled={isProcesando} title="Eliminar del historial">🗑️ Eliminar</button>
          </div>
        )}

        {img.estado === 'rechazada' && (
          <div className="ia-card-acciones">
            <button className="ia-btn-revertir" onClick={() => onAprobar(img)} disabled={isProcesando} title="Restaurar y aprobar esta imagen">↩ Aprobar de todas formas</button>
            <button className="ia-btn-banear" onClick={() => onBanear(img)} disabled={isProcesando} title="Banear al usuario que subió esta imagen">🔨 Banear usuario</button>
            <button className="ia-btn-eliminar" onClick={() => onEliminar(img)} disabled={isProcesando} title="Eliminar del historial">🗑️ Eliminar</button>
          </div>
        )}
      </>
    )}
  </div>
));
ImageCard.displayName = 'ImageCard';

const ImagenesAprobacion = ({ onCambio }) => {
  const cacheRef    = useRef({ pendiente: null, aprobada: null, rechazada: null });
  const cargandoRef = useRef(false);
  const filtroRef   = useRef('pendiente');
  const onCambioRef = useRef(onCambio);

  useEffect(() => { onCambioRef.current = onCambio; }, [onCambio]);

  const [imagenes,         setImagenes]         = useState([]);
  const [cargando,         setCargando]         = useState(true);
  const [filtro,           setFiltro]           = useState('pendiente');
  const [totalPorEstado,   setTotalPorEstado]   = useState({ pendiente: 0, aprobada: 0, rechazada: 0 });
  const [procesando,       setProcesando]       = useState(null);
  const [procesandoMasivo, setProcesandoMasivo] = useState(false);
  const [imagenModal,      setImagenModal]      = useState(null);
  const [modalBaneo,       setModalBaneo]       = useState(null);
  const [seleccionados,    setSeleccionados]    = useState(new Set());
  const [modoSeleccion,    setModoSeleccion]    = useState(false);

  useEffect(() => { filtroRef.current = filtro; }, [filtro]);

  const cargarTodo = useCallback(async () => {
    if (cargandoRef.current) return;
    cargandoRef.current = true;
    setCargando(true);
    try {
      const [pendRes, aprobRes, rechRes] = await Promise.all([
        api.get('/admin/imagenes-resenas?estado=pendiente&limit=100'),
        api.get('/admin/imagenes-resenas?estado=aprobada&limit=100'),
        api.get('/admin/imagenes-resenas?estado=rechazada&limit=100'),
      ]);

      const pendItems  = (pendRes.data.items  ?? []).map(mapItem);
      const aprobItems = (aprobRes.data.items ?? []).map(mapItem);
      const rechItems  = (rechRes.data.items  ?? []).map(mapItem);

      cacheRef.current = { pendiente: pendItems, aprobada: aprobItems, rechazada: rechItems };

      setTotalPorEstado({
        pendiente: pendRes.data.pagination?.total  > pendItems.length  ? pendRes.data.pagination.total  : pendItems.length,
        aprobada:  aprobRes.data.pagination?.total > aprobItems.length ? aprobRes.data.pagination.total : aprobItems.length,
        rechazada: rechRes.data.pagination?.total  > rechItems.length  ? rechRes.data.pagination.total  : rechItems.length,
      });
      setImagenes(cacheRef.current[filtroRef.current] ?? []);
    } catch (error) {
      toast.error('Error cargando imágenes');
      console.error(error);
    } finally {
      setCargando(false);
      cargandoRef.current = false;
    }
  }, []);

  useEffect(() => {
    cargarTodo();
    return () => { cargandoRef.current = false; };
  }, [cargarTodo]);

  useEffect(() => {
    const curr = filtroRef.current;
    if (cacheRef.current[curr] !== null) {
      setImagenes(cacheRef.current[curr]);
    } else {
      cargarTodo();
    }
    setSeleccionados(new Set());
    setModoSeleccion(false);
  }, [filtro, cargarTodo]);

  const toggleSeleccion = useCallback((id) => {
    setSeleccionados(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleTodos = useCallback(() => {
    setSeleccionados(prev =>
      prev.size === imagenes.length
        ? new Set()
        : new Set(imagenes.map(i => i._id))
    );
  }, [imagenes]);

  const salirModoSeleccion = useCallback(() => {
    setModoSeleccion(false);
    setSeleccionados(new Set());
  }, []);

  const aplicarCambioLocal = useCallback((img, accion) => {
    const curr = filtroRef.current;
    const estadoDestino = accion === 'aprobar' ? 'aprobada' : 'rechazada';

    if (accion === 'eliminar') {
      if (cacheRef.current[curr]) {
        cacheRef.current[curr] = cacheRef.current[curr].filter(i => i._id !== img._id);
      }
      setImagenes(prev => prev.filter(i => i._id !== img._id));
      setTotalPorEstado(prev => ({ ...prev, [curr]: Math.max(0, prev[curr] - 1) }));
    } else {
      const updated = { ...img, estado: estadoDestino };
      if (cacheRef.current[curr]) {
        cacheRef.current[curr] = cacheRef.current[curr].filter(i => i._id !== img._id);
      }
      if (cacheRef.current[estadoDestino]) {
        cacheRef.current[estadoDestino] = [updated, ...cacheRef.current[estadoDestino]];
      } else {
        cacheRef.current[estadoDestino] = null;
      }
      setImagenes(prev => prev.filter(i => i._id !== img._id));
      setTotalPorEstado(prev => ({
        ...prev,
        [curr]:          Math.max(0, prev[curr] - 1),
        [estadoDestino]: prev[estadoDestino] + 1,
      }));
    }
    onCambioRef.current?.();
  }, []);

  const handleAprobar = useCallback(async (img) => {
    setProcesando(img._id);
    try {
      await api.put(`/admin/imagenes-resenas/${img.recipeId}/${img.resenaId}/aprobar?imagenIndex=${img.imagenIndex ?? 0}`);
      toast.success('✅ Imagen aprobada');
      aplicarCambioLocal(img, 'aprobar');
    } catch (e) {
      toast.error(`❌ ${e.response?.data?.error || 'Error al aprobar'}`);
    } finally {
      setProcesando(null);
    }
  }, [aplicarCambioLocal]);

  const handleRechazar = useCallback(async (img) => {
    if (!window.confirm('¿Rechazar esta imagen? Se eliminará de Cloudinary.')) return;
    setProcesando(img._id);
    try {
      await api.put(`/admin/imagenes-resenas/${img.recipeId}/${img.resenaId}/rechazar?imagenIndex=${img.imagenIndex ?? 0}`);
      toast.success('Imagen rechazada');
      aplicarCambioLocal(img, 'rechazar');
    } catch (e) {
      toast.error(`❌ ${e.response?.data?.error || 'Error al rechazar'}`);
    } finally {
      setProcesando(null);
    }
  }, [aplicarCambioLocal]);

  const handleEliminar = useCallback(async (img) => {
    if (!window.confirm('¿Eliminar este registro del historial? Se borrará la imagen de Cloudinary si aún existe.')) return;
    setProcesando(img._id);
    try {
      await api.delete(`/admin/imagenes-resenas/${img.recipeId}/${img.resenaId}?imagenIndex=${img.imagenIndex ?? 0}`);
      toast.success('🗑️ Registro eliminado del historial');
      aplicarCambioLocal(img, 'eliminar');
    } catch (e) {
      toast.error(`❌ ${e.response?.data?.error || 'Error al eliminar'}`);
    } finally {
      setProcesando(null);
    }
  }, [aplicarCambioLocal]);

  const handleMasivo = useCallback(async (accion) => {
    if (seleccionados.size === 0) return;
    const esAprobar = accion === 'aprobar';
    const verbo = esAprobar ? 'aprobar' : 'rechazar';
    const n = seleccionados.size;

    if (!window.confirm(
      `¿${esAprobar ? 'Aprobar' : 'Rechazar'} ${n} imagen${n !== 1 ? 'es' : ''} seleccionada${n !== 1 ? 's' : ''}?${
        !esAprobar ? '\nLas imágenes rechazadas se eliminarán de Cloudinary.' : ''
      }`
    )) return;

    setProcesandoMasivo(true);
    const ids = [...seleccionados];
    let ok = 0, fail = 0;

    await Promise.allSettled(
      ids.map(async (id) => {
        const img = imagenes.find(i => i._id === id);
        if (!img) return;
        try {
          await api.put(`/admin/imagenes-resenas/${img.recipeId}/${img.resenaId}/${verbo}?imagenIndex=${img.imagenIndex ?? 0}`);
          ok++;
        } catch {
          fail++;
        }
      })
    );

    if (ok > 0)   toast.success(`✅ ${ok} imagen${ok !== 1 ? 'es' : ''} ${esAprobar ? 'aprobada' : 'rechazada'}${ok !== 1 ? 's' : ''}`);
    if (fail > 0) toast.error(`❌ ${fail} imagen${fail !== 1 ? 'es' : ''} no se pudieron procesar`);

    cacheRef.current = { pendiente: null, aprobada: null, rechazada: null };
    setSeleccionados(new Set());
    setModoSeleccion(false);
    await cargarTodo();
    onCambioRef.current?.();
    setProcesandoMasivo(false);
  }, [seleccionados, imagenes, cargarTodo]);

  const handleMasivoEliminar = useCallback(async () => {
    if (seleccionados.size === 0) return;
    const n = seleccionados.size;
    if (!window.confirm(
      `¿Eliminar ${n} registro${n !== 1 ? 's' : ''} del historial?\nLas imágenes se borrarán de Cloudinary si aún existen.`
    )) return;

    setProcesandoMasivo(true);
    const items = [...seleccionados].map(id => {
      const img = imagenes.find(i => i._id === id);
      return img ? { recipeId: img.recipeId, resenaId: img.resenaId, imagenIndex: img.imagenIndex ?? 0 } : null;
    }).filter(Boolean);

    try {
      const { data } = await api.delete('/admin/imagenes-resenas/masivo', { data: { items } });
      if (data.ok > 0)   toast.success(`🗑️ ${data.ok} registro${data.ok !== 1 ? 's' : ''} eliminado${data.ok !== 1 ? 's' : ''}`);
      if (data.fail > 0) toast.error(`❌ ${data.fail} no se pudieron eliminar`);
    } catch (e) {
      toast.error(`❌ ${e.response?.data?.error || 'Error en eliminación masiva'}`);
    }

    cacheRef.current = { pendiente: null, aprobada: null, rechazada: null };
    setSeleccionados(new Set());
    setModoSeleccion(false);
    await cargarTodo();
    onCambioRef.current?.();
    setProcesandoMasivo(false);
  }, [seleccionados, imagenes, cargarTodo]);

  const handleBan = useCallback(async (userId, motivo, dias) => {
    try {
      const { data } = await api.put(`/admin/users/${userId}/ban`, { motivo, dias });
      toast.success(data.message || 'Usuario baneado');
    } catch (e) {
      toast.error(`❌ ${e.response?.data?.error || 'Error al banear'}`);
      throw e;
    }
  }, []);

  const todosSeleccionados = imagenes.length > 0 && seleccionados.size === imagenes.length;
  const algunoSeleccionado = seleccionados.size > 0;

  return (
    <div className="ia-contenedor">

      <div className="ia-cabecera">
        <div className="ia-titulo-wrap">
          <h2 className="ia-titulo">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            Aprobación de imágenes
          </h2>
          <p className="ia-subtitulo">Modera las imágenes subidas por usuarios en sus reseñas</p>
        </div>

        <div className="ia-contadores">
          <div className="ia-contador ia-contador--naranja">
            <span className="ia-contador-num">{totalPorEstado.pendiente}</span>
            <span className="ia-contador-label">Pendientes</span>
          </div>
          <div className="ia-contador ia-contador--verde">
            <span className="ia-contador-num">{totalPorEstado.aprobada}</span>
            <span className="ia-contador-label">Aprobadas</span>
          </div>
          <div className="ia-contador ia-contador--rojo">
            <span className="ia-contador-num">{totalPorEstado.rechazada}</span>
            <span className="ia-contador-label">Rechazadas</span>
          </div>
        </div>
      </div>

      <div className="ia-filtros-wrap">
        <div className="ia-filtros">
          {Object.entries(ESTADOS).map(([key, { label }]) => (
            <button
              key={key}
              className={`ia-filtro-btn ia-filtro-btn--${ESTADOS[key].color} ${filtro === key ? 'activo' : ''}`}
              onClick={() => setFiltro(key)}
            >
              {label}
              {totalPorEstado[key] > 0 && <span className="ia-badge">{totalPorEstado[key]}</span>}
            </button>
          ))}
        </div>

        {!cargando && imagenes.length > 0 && (
          <button
            className={`ia-btn-modo-seleccion ${modoSeleccion ? 'activo' : ''}`}
            onClick={() => modoSeleccion ? salirModoSeleccion() : setModoSeleccion(true)}
          >
            {modoSeleccion ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                Cancelar selección
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
                Selección múltiple
              </>
            )}
          </button>
        )}
      </div>

      {modoSeleccion && (
        <div className="ia-barra-masiva">
          <div className="ia-barra-masiva-izq">
            <label className="ia-check-todos">
              <input type="checkbox" checked={todosSeleccionados} onChange={toggleTodos} />
              <span>
                {todosSeleccionados
                  ? `Todos (${imagenes.length})`
                  : algunoSeleccionado
                    ? `${seleccionados.size} seleccionada${seleccionados.size !== 1 ? 's' : ''}`
                    : 'Seleccionar todo'}
              </span>
            </label>
          </div>

          <div className="ia-barra-masiva-der">
            {filtro === 'pendiente' && (
              <>
                <button className="ia-btn-masivo ia-btn-masivo--aprobar" onClick={() => handleMasivo('aprobar')} disabled={!algunoSeleccionado || procesandoMasivo}>
                  {procesandoMasivo ? '⏳ Procesando...' : (
                    <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Aprobar {algunoSeleccionado ? `(${seleccionados.size})` : ''}</>
                  )}
                </button>
                <button className="ia-btn-masivo ia-btn-masivo--rechazar" onClick={() => handleMasivo('rechazar')} disabled={!algunoSeleccionado || procesandoMasivo}>
                  {procesandoMasivo ? '⏳' : (
                    <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>Rechazar {algunoSeleccionado ? `(${seleccionados.size})` : ''}</>
                  )}
                </button>
              </>
            )}

            {filtro === 'aprobada' && (
              <>
                <button className="ia-btn-masivo ia-btn-masivo--rechazar" onClick={() => handleMasivo('rechazar')} disabled={!algunoSeleccionado || procesandoMasivo}>
                  {procesandoMasivo ? '⏳ Procesando...' : `↩ Revocar (${seleccionados.size})`}
                </button>
                <button className="ia-btn-masivo ia-btn-masivo--eliminar" onClick={handleMasivoEliminar} disabled={!algunoSeleccionado || procesandoMasivo}>
                  {procesandoMasivo ? '⏳' : (<><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>Eliminar historial {algunoSeleccionado ? `(${seleccionados.size})` : ''}</>)}
                </button>
              </>
            )}

            {filtro === 'rechazada' && (
              <>
                <button className="ia-btn-masivo ia-btn-masivo--aprobar" onClick={() => handleMasivo('aprobar')} disabled={!algunoSeleccionado || procesandoMasivo}>
                  {procesandoMasivo ? '⏳ Procesando...' : `↩ Aprobar (${seleccionados.size})`}
                </button>
                <button className="ia-btn-masivo ia-btn-masivo--eliminar" onClick={handleMasivoEliminar} disabled={!algunoSeleccionado || procesandoMasivo}>
                  {procesandoMasivo ? '⏳' : (<><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>Eliminar historial {algunoSeleccionado ? `(${seleccionados.size})` : ''}</>)}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {cargando ? (
        <div className="ia-loading">
          <div className="ia-spinner" />
          <p>Cargando imágenes...</p>
        </div>
      ) : imagenes.length === 0 ? (
        <div className="ia-vacio">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <p>No hay imágenes {ESTADOS[filtro].label.toLowerCase()} en este momento</p>
        </div>
      ) : (
        <div className="ia-grid">
          {imagenes.map(img => (
            <ImageCard
              key={img._id}
              img={img}
              modoSeleccion={modoSeleccion}
              estaSeleccionado={seleccionados.has(img._id)}
              isProcesando={procesando === img._id}
              onToggleSeleccion={toggleSeleccion}
              onAprobar={handleAprobar}
              onRechazar={handleRechazar}
              onEliminar={handleEliminar}
              onVerImagen={setImagenModal}
              onBanear={setModalBaneo}
            />
          ))}
        </div>
      )}

      {imagenModal && (
        <div className="ia-modal-overlay" onClick={() => setImagenModal(null)}>
          <div className="ia-modal-contenido" onClick={e => e.stopPropagation()}>
            <button className="ia-modal-cerrar" onClick={() => setImagenModal(null)}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
            <img src={optimizeCloudinary(imagenModal.url, 'q_auto,f_auto,w_1200')} alt="Vista completa" className="ia-modal-img" width="1200" height="800" decoding="async" />
            <div className="ia-modal-info">
              <span className="ia-card-usuario">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                {imagenModal.userName}
              </span>
              {imagenModal.recetaNombre && <span className="ia-card-receta"> — {imagenModal.recetaNombre}</span>}
              {imagenModal.comentarioTexto && <p className="ia-modal-comentario">"{imagenModal.comentarioTexto}"</p>}
            </div>
            {imagenModal.estado === 'pendiente' && (
              <div className="ia-modal-acciones">
                <button className="ia-btn-aprobar" onClick={() => { handleAprobar(imagenModal); setImagenModal(null); }} disabled={procesando === imagenModal._id}>✅ Aprobar imagen</button>
                <button className="ia-btn-rechazar" onClick={() => { handleRechazar(imagenModal); setImagenModal(null); }} disabled={procesando === imagenModal._id}>❌ Rechazar imagen</button>
              </div>
            )}
          </div>
        </div>
      )}

      {modalBaneo && (
        <ModalBaneoImagen
          imagen={modalBaneo}
          onClose={() => setModalBaneo(null)}
          onBan={handleBan}
        />
      )}
    </div>
  );
};

export default ImagenesAprobacion;