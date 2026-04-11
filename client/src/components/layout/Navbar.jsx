import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import './Navbar.css';
import PanelNotificaciones from '../notificaciones/PanelNotificaciones';

const Navbar = ({ modoOscuro, toggleModoOscuro }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);

  // ── Badge imágenes pendientes (solo admins) ──
  const [imgPendientes, setImgPendientes] = useState(0);
  const pollingRef = useRef(null);

  // ── Notificaciones ──
  const [panelAbierto,     setPanelAbierto]     = useState(false);
  const [notificaciones,   setNotificaciones]   = useState([]);
  const [noLeidas,         setNoLeidas]         = useState(0);
  const [cargandoNotifs,   setCargandoNotifs]   = useState(false);
  const notifPollingRef = useRef(null);

  useEffect(() => {
    if (!user || !isAdmin?.()) return;

    const fetchPendientes = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        const total = data.stats?.imagenesPendientes ?? 0;

        setImgPendientes(prev => {
          // Si subió el número, mostramos notificación del navegador (si tiene permiso)
          if (total > prev && prev !== 0) {
            if (Notification.permission === 'granted') {
              new Notification('Healthy Help — Panel Admin', {
                body: `${total} imagen${total !== 1 ? 'es' : ''} pendiente${total !== 1 ? 's' : ''} de aprobación`,
                icon: '/favicon.ico',
              });
            }
          }
          return total;
        });
      } catch {
        // silencioso — no interrumpir la navegación
      }
    };

    // Pedir permiso de notificaciones al primer render
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    fetchPendientes();
    pollingRef.current = setInterval(fetchPendientes, 30_000); // cada 30 s

    return () => clearInterval(pollingRef.current);
  }, [user, isAdmin]);

  // ── Cargar y polling de notificaciones (usuarios autenticados) ──
  const fetchNotificaciones = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/notifications');
      setNotificaciones(data.notificaciones || []);
      setNoLeidas(data.noLeidas || 0);
    } catch {
      // silencioso
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchNotificaciones();
    notifPollingRef.current = setInterval(fetchNotificaciones, 30_000);
    return () => clearInterval(notifPollingRef.current);
  }, [user, fetchNotificaciones]);

  const handleAbrirPanel = () => {
    setPanelAbierto(v => !v);
    if (!panelAbierto) {
      setCargandoNotifs(true);
      fetchNotificaciones().finally(() => setCargandoNotifs(false));
    }
  };

  const handleLeerTodas = async () => {
    try {
      await api.put('/notifications/leer-todas');
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
      setNoLeidas(0);
    } catch { /* silencioso */ }
  };

  const handleLeerUna = async (id) => {
    try {
      await api.put(`/notifications/${id}/leer`);
      setNotificaciones(prev =>
        prev.map(n => n._id === id ? { ...n, leida: true } : n)
      );
      setNoLeidas(prev => Math.max(0, prev - 1));
    } catch { /* silencioso */ }
  };

  const handleNavigate = (ruta) => {
    navigate(ruta);
    setMenuAbierto(false);
  };

  const handleCerrarSesion = () => {
    logout();
    setMenuAbierto(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="nav">
      <div className="navContenedor">
        <div className="navLogo" onClick={() => handleNavigate('/')}>
          <div className="logoIcono">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 21h10" />
              <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z" />
              <path d="M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.37 3.37 2.4 2.4 0 0 1-1.1 3.7 2.51 2.51 0 0 1 .03 1.1" />
            </svg>
          </div>
          <span className="logoTexto">Healthy Help</span>
        </div>

        {/* ── Campana de notificaciones (solo usuarios autenticados) ── */}
        {user && (
          <div className="nav-notif-wrap">
            <button
              className="nav-notif-btn"
              onClick={handleAbrirPanel}
              aria-label={`Notificaciones${noLeidas > 0 ? ` (${noLeidas} sin leer)` : ''}`}
              title="Notificaciones"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {noLeidas > 0 && (
                <span className="nav-notif-badge" aria-hidden="true">
                  {noLeidas > 9 ? '9+' : noLeidas}
                </span>
              )}
            </button>

            {panelAbierto && (
              <PanelNotificaciones
                notificaciones={notificaciones}
                noLeidas={noLeidas}
                cargando={cargandoNotifs}
                onLeerTodas={handleLeerTodas}
                onLeerUna={handleLeerUna}
                onCerrar={() => setPanelAbierto(false)}
                onNavegar={(url) => { setPanelAbierto(false); navigate(url); }}
              />
            )}
          </div>
        )}

        <button
          className={`navHamburguesa ${menuAbierto ? 'abierto' : ''}`}
          onClick={() => setMenuAbierto(!menuAbierto)}
          aria-label="Menú"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`navMenu ${menuAbierto ? 'activo' : ''}`}>
          <li
            onClick={() => handleNavigate('/')}
            className={isActive('/') ? 'activo' : ''}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Inicio
          </li>

          {user && (
            <>
              <li
                onClick={() => handleNavigate('/seguimiento')}
                className={isActive('/seguimiento') ? 'activo' : ''}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                Seguimiento
              </li>
              <li
                onClick={() => handleNavigate('/favoritos')}
                className={isActive('/favoritos') ? 'activo' : ''}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                Favoritos
              </li>
            </>
          )}

          <li
            onClick={() => handleNavigate('/contacto')}
            className={isActive('/contacto') ? 'activo' : ''}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Contáctanos
          </li>

          {user && isAdmin && isAdmin() && (
            <li
              onClick={() => handleNavigate('/admin')}
              className={`nav-admin-btn ${isActive('/admin') ? 'activo' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Admin Panel
              {/* Badge imágenes pendientes */}
              {imgPendientes > 0 && (
                <span className="nav-badge-pendientes" title={`${imgPendientes} imagen${imgPendientes !== 1 ? 'es' : ''} por aprobar`}>
                  {imgPendientes > 99 ? '99+' : imgPendientes}
                </span>
              )}
            </li>
          )}

          <li className="navMenu-tema">
            <button
              className="btnTema"
              onClick={toggleModoOscuro}
              title={modoOscuro ? 'Modo Claro' : 'Modo Oscuro'}
              aria-label={modoOscuro ? 'Activar modo claro' : 'Activar modo oscuro'}
            >
              {modoOscuro ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2" /><path d="M12 20v2" />
                  <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
                  <path d="M2 12h2" /><path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              )}
            </button>
          </li>

          {user ? (
            <>
              <li
                className="navUsuario"
                onClick={() => handleNavigate('/perfil')}
              >
                <div className="nav-avatar-mini">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="nav-avatar-img"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="nav-avatar-iniciales">
                    {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  {user.role === 'admin' && <span className="nav-admin-dot" />}
                </div>
                <span className="nav-nombre">{user.name?.split(' ')[0]}</span>
              </li>
              <li className="navMenu-centrado">
                <button className="btn-secundario" onClick={handleCerrarSesion}>
                  Cerrar Sesión
                </button>
              </li>
            </>
          ) : (
            <li className="navMenu-centrado">
              <button className="btn-primario" onClick={() => handleNavigate('/login')}>
                Inicio de sesión
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;