import { useEffect, useRef, useCallback, memo } from 'react';
import './PanelNotificaciones.css';

const IcoReply = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 10 4 15 9 20"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/>
  </svg>
));
IcoReply.displayName = 'IcoReply';

const IcoMessage = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
));
IcoMessage.displayName = 'IcoMessage';

const IcoCheck = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
));
IcoCheck.displayName = 'IcoCheck';

const IcoBell = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
));
IcoBell.displayName = 'IcoBell';

const IcoReceta = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9Z"/>
    <path d="M7 21h10"/><path d="M12 11v10"/>
  </svg>
));
IcoReceta.displayName = 'IcoReceta';

const IcoEmpty = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
));
IcoEmpty.displayName = 'IcoEmpty';

const IcoClose = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
));
IcoClose.displayName = 'IcoClose';

const formatRelativa = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const min  = Math.floor(diff / 60000);
  const hrs  = Math.floor(min / 60);
  const days = Math.floor(hrs / 24);
  if (min < 1)  return 'Ahora mismo';
  if (min < 60) return `Hace ${min} min`;
  if (hrs < 24) return `Hace ${hrs} h`;
  if (days < 7) return `Hace ${days} día${days !== 1 ? 's' : ''}`;
  return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

const decodeCache = new Map();
const decodificar = (str) => {
  if (!str) return '';
  if (decodeCache.has(str)) return decodeCache.get(str);
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  const result = txt.value;
  decodeCache.set(str, result);
  return result;
};

const PanelNotificaciones = ({
  notificaciones,
  noLeidas,
  cargando,
  onLeerTodas,
  onLeerUna,
  onEliminar,
  onCerrar,
  onNavegar,
  esMobil = false,
}) => {
  const panelRef          = useRef(null);
  const onCerrarRef       = useRef(onCerrar);
  const onLeerUnaRef      = useRef(onLeerUna);
  const notificacionesRef = useRef(notificaciones);

  useEffect(() => { onCerrarRef.current      = onCerrar;       }, [onCerrar]);
  useEffect(() => { onLeerUnaRef.current     = onLeerUna;      }, [onLeerUna]);
  useEffect(() => { notificacionesRef.current = notificaciones; }, [notificaciones]);

  useEffect(() => {
    if (panelRef.current) panelRef.current.scrollTop = 0;
  }, []);

  useEffect(() => {
    if (!window.matchMedia('(max-width: 768px)').matches) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.type === 'keydown') {
        if (e.key === 'Escape') onCerrarRef.current();
        return;
      }
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onCerrarRef.current();
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown',   handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown',   handler);
    };
  }, []);

  useEffect(() => {
    if (cargando) return;
    const noLeidasVisibles = notificacionesRef.current.filter(n => !n.leida);
    if (noLeidasVisibles.length === 0) return;
    const t = setTimeout(() => {
      noLeidasVisibles.forEach(n => onLeerUnaRef.current(n._id));
    }, 1200);
    return () => clearTimeout(t);
  }, [cargando]);

  const handleClickItem = useCallback((n) => {
    if (!n.leida) onLeerUnaRef.current(n._id);
    if ((n.type === 'reply' || n.type === 'new_recipe') && n.recetaId) {
      onCerrarRef.current();
      const params = new URLSearchParams({ receta: n.recetaId });
      if (n.resenaId)    params.set('resena',    n.resenaId);
      if (n.respuestaId) params.set('respuesta', n.respuestaId);
      const url = `/?${params.toString()}`;
      if (onNavegar) { onNavegar(url); } else { window.location.href = url; }
    }
  }, [onNavegar]);

  return (
    <>
      <div className="pn-overlay" onClick={onCerrar} aria-hidden="true" />
      <div className="pn-panel" ref={panelRef} role="dialog" aria-label="Notificaciones">

        <div className="pn-header">
          <div className="pn-header-izq">
            <IcoBell />
            <span className="pn-titulo">Notificaciones</span>
            {noLeidas > 0 && <span className="pn-badge-header">{noLeidas}</span>}
          </div>
          <div className="pn-header-der">
            {noLeidas > 0 && (
              <button className="pn-btn-leer-todas" onClick={onLeerTodas} title="Marcar todas como leídas">
                <IcoCheck /> Leer todas
              </button>
            )}
            {esMobil && (
              <button className="pn-btn-cerrar-modal" onClick={onCerrar} aria-label="Cerrar notificaciones">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
        </div>

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
              <span>Aquí aparecerán las respuestas a tus comentarios y mensajes del equipo</span>
            </div>
          ) : (
            notificaciones.map(n => (
              <div
                key={n._id}
                className={`pn-item ${!n.leida ? 'no-leida' : 'leida'} pn-tipo-${n.type} ${(n.type === 'reply' || n.type === 'new_recipe') && n.recetaId ? 'pn-clickable' : ''}`}
                onClick={() => handleClickItem(n)}
              >
                {!n.leida && <span className="pn-dot" aria-hidden="true" />}

                <button
                  className="pn-btn-eliminar"
                  onClick={e => { e.stopPropagation(); onEliminar(n._id); }}
                  aria-label="Eliminar notificación"
                  title="Eliminar"
                >
                  <IcoClose />
                </button>

                <div className={`pn-icono pn-icono--${n.type}`}>
                  {n.type === 'reply'      ? <IcoReply />  :
                   n.type === 'new_recipe' ? <IcoReceta /> :
                                             <IcoMessage />}
                </div>

                <div className="pn-contenido" style={{ paddingRight: '1.2rem' }}>
                  {n.type === 'reply' ? (
                    <>
                      <p className="pn-texto">
                        <strong>{n.fromUserName}</strong> respondió{' '}
                        {n.parentUserName && n.parentUserName !== n.toUserName
                          ? <>a <em>@{n.parentUserName}</em> en</>
                          : <>a tu comentario en</>
                        }{' '}
                        <em>{n.recetaNombre || 'una receta'}</em>
                      </p>
                      {n.respuestaTexto && (
                        <p className="pn-preview">"{decodificar(n.respuestaTexto)}"</p>
                      )}
                    </>
                  ) : n.type === 'new_recipe' ? (
                    <>
                      <p className="pn-texto"><strong>Nueva receta disponible</strong></p>
                      <p className="pn-preview">
                        <em>{n.recetaNombre}</em>
                        {n.recetaCat && ` · ${n.recetaCat}`}
                        {n.recetaSalud?.length > 0 && ` · ${n.recetaSalud.join(', ')}`}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="pn-texto">
                        Mensaje de <strong>{n.adminName || 'Administrador'}</strong>
                        {n.asunto && <> — <em>{n.asunto}</em></>}
                      </p>
                      {n.mensaje && (
                        <p className="pn-preview">
                          {decodificar(n.mensaje).slice(0, 120)}{n.mensaje.length > 120 ? '…' : ''}
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
    </>
  );
};

export default PanelNotificaciones;