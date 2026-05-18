import { useState, useEffect, useRef, useCallback, memo } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import api from "../../api/axios";
import "./Navbar.css";
import PanelNotificaciones from "../notificaciones/PanelNotificaciones";

const NOTIF_INTERVAL = 60_000;

const IcoCampana = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
));
IcoCampana.displayName = "IcoCampana";

const IcoLogo = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M7 21h10" />
    <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z" />
    <path d="M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.37 3.37 2.4 2.4 0 0 1-1.1 3.7 2.51 2.51 0 0 1 .03 1.1" />
  </svg>
));
IcoLogo.displayName = "IcoLogo";

const IcoSol = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" /><path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" /><path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
  </svg>
));
IcoSol.displayName = "IcoSol";

const IcoLuna = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
));
IcoLuna.displayName = "IcoLuna";

const IcoLock = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
));
IcoLock.displayName = "IcoLock";

const IcoCerrarSesion = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
));
IcoCerrarSesion.displayName = "IcoCerrarSesion";

const ToggleSwitch = memo(({ enabled, onChange, loading = false }) => (
  <div
    className={`al-toggle${enabled ? " al-toggle--on" : ""}${loading ? " al-toggle--loading" : ""}`}
    onClick={(e) => { e.stopPropagation(); e.preventDefault(); if (!loading) onChange(e); }}
    onPointerDown={(e) => e.stopPropagation()}
    onTouchStart={(e) => e.stopPropagation()}
    role="switch"
    aria-checked={enabled}
    aria-label="Cierre automático de sesión"
  >
    <span className="al-toggle__thumb" />
  </div>
));
ToggleSwitch.displayName = "ToggleSwitch";

const BtnCampana = memo(({ noLeidas, onClick, extraClass = "" }) => (
  <button
    className={`nav-notif-btn${extraClass ? ` ${extraClass}` : ""}`}
    onClick={onClick}
    aria-label={`Notificaciones${noLeidas > 0 ? ` (${noLeidas} sin leer)` : ""}`}
    title="Notificaciones"
  >
    <IcoCampana />
    {noLeidas > 0 && (
      <span className="nav-notif-badge" aria-hidden="true">
        {noLeidas > 9 ? "9+" : noLeidas}
      </span>
    )}
  </button>
));
BtnCampana.displayName = "BtnCampana";

const Navbar = ({ modoOscuro, toggleModoOscuro, imgPendientes = 0, onAbrirReceta }) => {
  const { user, logout, isAdmin, updateAutoLogout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [menuAbierto,        setMenuAbierto]        = useState(false);
  const [panelAbierto,       setPanelAbierto]       = useState(false);
  const [notificaciones,     setNotificaciones]     = useState([]);
  const [noLeidas,           setNoLeidas]           = useState(0);
  const [cargandoNotifs,     setCargandoNotifs]     = useState(false);
  const [dropdownAbierto,    setDropdownAbierto]    = useState(false);
  const [modalCerrarAbierto, setModalCerrarAbierto] = useState(false);
  const [autoLogout,         setAutoLogout]         = useState(false);
  const [toggleLoading,      setToggleLoading]      = useState(false);
  const [esTactil,           setEsTactil]           = useState(false);

  const dropdownTimerRef = useRef(null);
  const dropdownRef      = useRef(null);
  const notifIntervalRef = useRef(null);

  useEffect(() => {
    setAutoLogout(user?.autoLogoutEnabled ?? false);
  }, [user?.autoLogoutEnabled]);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    setEsTactil(mq.matches);
    const handler = (e) => setEsTactil(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const fetchNotificaciones = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get("/notifications");
      setNotificaciones(data.notificaciones || []);
      setNoLeidas(data.noLeidas || 0);
    } catch {}
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let activo = true;
    const poll = () => { if (activo) fetchNotificaciones(); };
    poll();
    notifIntervalRef.current = setInterval(poll, NOTIF_INTERVAL);
    return () => { activo = false; clearInterval(notifIntervalRef.current); };
  }, [user, fetchNotificaciones]);

  const handleAbrirPanel = useCallback(() => {
    setPanelAbierto((v) => {
      const nuevoEstado = !v;
      if (nuevoEstado) {
        setCargandoNotifs(true);
        fetchNotificaciones().finally(() => setCargandoNotifs(false));
      }
      return nuevoEstado;
    });
  }, [fetchNotificaciones]);

  const handleCerrarPanel = useCallback(() => setPanelAbierto(false), []);

  const handleLeerTodas = useCallback(async () => {
    try {
      await api.put("/notifications/leer-todas");
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
      setNoLeidas(0);
    } catch {}
  }, []);

  const handleEliminarNotif = useCallback(async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotificaciones((prev) => {
        const eraNoLeida = prev.find((n) => n._id === id && !n.leida);
        if (eraNoLeida) setNoLeidas((c) => Math.max(0, c - 1));
        return prev.filter((n) => n._id !== id);
      });
    } catch {}
  }, []);

  const handleLeerUna = useCallback(async (id) => {
    setNotificaciones((prev) => {
      const notif = prev.find((n) => n._id === id);
      if (!notif || notif.leida) return prev;
      setNoLeidas((c) => Math.max(0, c - 1));
      return prev.map((n) => (n._id === id ? { ...n, leida: true } : n));
    });
    try { await api.put(`/notifications/${id}/leer`); } catch {}
  }, []);

  const handleNavigate = useCallback((ruta) => {
    navigate(ruta);
    setMenuAbierto(false);
  }, [navigate]);

  const _procesarUrlNotif = useCallback((url) => {
    const recetaMatch   = url.match(/[?&]receta=([^&]+)/);
    const resenaMatch   = url.match(/[?&]resena=([^&]+)/);
    const respuestaMatch = url.match(/[?&]respuesta=([^&]+)/);
    if (recetaMatch && onAbrirReceta) {
      onAbrirReceta(recetaMatch[1], resenaMatch?.[1] || null, respuestaMatch?.[1] || null);
    } else {
      navigate(url);
    }
  }, [navigate, onAbrirReceta]);

  const handleNavNotif = useCallback((url) => {
    setPanelAbierto(false);
    _procesarUrlNotif(url);
  }, [_procesarUrlNotif]);

  const handleNavNotifMovil = useCallback((url) => {
    setPanelAbierto(false);
    setMenuAbierto(false);
    _procesarUrlNotif(url);
  }, [_procesarUrlNotif]);

  const handleToggleAutoLogout = useCallback(async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (toggleLoading) return;
    const nuevoValor = !autoLogout;
    setAutoLogout(nuevoValor);
    setToggleLoading(true);
    const result = await updateAutoLogout(nuevoValor);
    if (!result?.success) setAutoLogout(!nuevoValor);
    setToggleLoading(false);
  }, [autoLogout, toggleLoading, updateAutoLogout]);

  const handleMouseEnterDropdown = useCallback(() => {
    clearTimeout(dropdownTimerRef.current);
    setDropdownAbierto(true);
  }, []);

  const handleMouseLeaveDropdown = useCallback(() => {
    dropdownTimerRef.current = setTimeout(() => setDropdownAbierto(false), 300);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownAbierto(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const ejecutarCerrarSesion = useCallback(() => {
    logout();
    setMenuAbierto(false);
    setDropdownAbierto(false);
    setModalCerrarAbierto(false);
    navigate("/");
  }, [logout, navigate]);

  const handleCerrarSesionDesktop = useCallback(() => ejecutarCerrarSesion(), [ejecutarCerrarSesion]);
  const handleCerrarSesionMobile  = useCallback(() => setModalCerrarAbierto(true), []);
  const handleToggleMenu          = useCallback(() => setMenuAbierto((v) => !v), []);
  const isActive                  = useCallback((path) => location.pathname === path, [location.pathname]);

  return (
    <>
      <nav className="nav">
        <div className="navContenedor">
          <div className="navLogo" onClick={() => handleNavigate("/")}>
            <div className="logoIcono"><IcoLogo /></div>
            <span className="logoTexto">Healthy Help</span>
          </div>

          {user && (
            <div className="nav-notif-wrap nav-notif-wrap--desktop">
              <BtnCampana noLeidas={noLeidas} onClick={handleAbrirPanel} />
              {panelAbierto && (
                <PanelNotificaciones
                  notificaciones={notificaciones}
                  noLeidas={noLeidas}
                  cargando={cargandoNotifs}
                  onLeerTodas={handleLeerTodas}
                  onLeerUna={handleLeerUna}
                  onEliminar={handleEliminarNotif}
                  onCerrar={handleCerrarPanel}
                  onNavegar={handleNavNotif}
                />
              )}
            </div>
          )}

          <button
            className={`navHamburguesa ${menuAbierto ? "abierto" : ""}`}
            onClick={handleToggleMenu}
            aria-label="Menú"
          >
            <span /><span /><span />
          </button>

          <ul className={`navMenu ${menuAbierto ? "activo" : ""}`}>
            <li onClick={() => handleNavigate("/")} className={isActive("/") ? "activo" : ""}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Inicio
            </li>

            {user && (
              <>
                <li onClick={() => handleNavigate("/seguimiento")} className={isActive("/seguimiento") ? "activo" : ""}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                  Seguimiento
                </li>
                <li onClick={() => handleNavigate("/favoritos")} className={isActive("/favoritos") ? "activo" : ""}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  Favoritos
                </li>
              </>
            )}

            <li onClick={() => handleNavigate("/contacto")} className={isActive("/contacto") ? "activo" : ""}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Contáctanos
            </li>

            {user && isAdmin && isAdmin() && (
              <li onClick={() => handleNavigate("/admin")} className={`nav-admin-btn ${isActive("/admin") ? "activo" : ""}`}>
                <IcoLock />
                Admin Panel
                {imgPendientes > 0 && (
                  <span className="nav-badge-pendientes" title={`${imgPendientes} imagen${imgPendientes !== 1 ? "es" : ""} por aprobar`}>
                    {imgPendientes > 99 ? "99+" : imgPendientes}
                  </span>
                )}
              </li>
            )}

            <li className="navMenu-tema">
              <button className="btnTema" onClick={toggleModoOscuro}
                title={modoOscuro ? "Modo Claro" : "Modo Oscuro"}
                aria-label={modoOscuro ? "Activar modo claro" : "Activar modo oscuro"}>
                {modoOscuro ? <IcoSol /> : <IcoLuna />}
              </button>
              {user && (
                <BtnCampana noLeidas={noLeidas} onClick={handleAbrirPanel} extraClass="nav-notif-btn--movil" />
              )}
            </li>

            {panelAbierto && esTactil && (
              <div className="pn-modal-movil" onClick={handleCerrarPanel}>
                <div className="pn-modal-movil__contenido" onClick={(e) => e.stopPropagation()}>
                  <PanelNotificaciones
                    notificaciones={notificaciones}
                    noLeidas={noLeidas}
                    cargando={cargandoNotifs}
                    onLeerTodas={handleLeerTodas}
                    onLeerUna={handleLeerUna}
                    onEliminar={handleEliminarNotif}
                    onCerrar={handleCerrarPanel}
                    onNavegar={handleNavNotifMovil}
                    esMobil={true}
                  />
                </div>
              </div>
            )}

            {user ? (
              <>
                <li className="navUsuario" onClick={() => handleNavigate("/perfil")}>
                  <div className="nav-avatar-mini">
                    {user.avatar && !user.avatar.includes("googleusercontent.com") ? (
                      <img src={user.avatar} alt={user.name} className="nav-avatar-img"
                        referrerPolicy="no-referrer" crossOrigin="anonymous"
                        onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                      />
                    ) : null}
                    <div className="nav-avatar-iniciales"
                      style={{ display: user.avatar && !user.avatar.includes("googleusercontent.com") ? "none" : "flex" }}>
                      {user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                  </div>
                  <span className="nav-nombre">{user.name?.split(" ")[0]}</span>
                </li>
                <li className="navMenu-centrado" onClick={(e) => e.stopPropagation()}>
                  {!esTactil ? (
                    <div className="al-dropdown-wrap" ref={dropdownRef}
                      onMouseEnter={handleMouseEnterDropdown}
                      onMouseLeave={handleMouseLeaveDropdown}
                      onClick={(e) => e.stopPropagation()}>
                      <button className="btn-secundario al-btn-trigger" onClick={handleCerrarSesionDesktop}>
                        Cerrar Sesión
                      </button>
                      {dropdownAbierto && (
                        <div className="al-dropdown">
                          <button className="al-dropdown__logout-btn" onClick={handleCerrarSesionDesktop}>
                            <IcoCerrarSesion />
                            Cerrar Sesión
                          </button>
                          <div className="al-dropdown__divider" />
                          <div className="al-dropdown__row">
                            <div className="al-dropdown__label">
                              <span className="al-dropdown__label-title">Cierre automático</span>
                              <span className="al-dropdown__label-sub">
                                {autoLogout ? `Activo · ${user?.autoLogoutMinutes ?? 15} min sin actividad` : "Inactivo · cierre manual"}
                              </span>
                            </div>
                            <ToggleSwitch enabled={autoLogout} onChange={handleToggleAutoLogout} loading={toggleLoading} />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button className="btn-secundario" onClick={handleCerrarSesionMobile}>
                      Cerrar Sesión
                    </button>
                  )}
                </li>
              </>
            ) : (
              <li className="navMenu-centrado">
                <button className="btn-primario" onClick={() => handleNavigate("/login")}>
                  Inicio de sesión
                </button>
              </li>
            )}
          </ul>
        </div>
      </nav>

      {modalCerrarAbierto && createPortal(
        <div className="al-modal-overlay"
          onClick={() => setModalCerrarAbierto(false)}
          onTouchStart={(e) => { if (e.target === e.currentTarget) setModalCerrarAbierto(false); }}>
          <div className="al-modal"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}>
            <div className="al-modal__header">
              <div className="al-modal__icon"><IcoCerrarSesion /></div>
              <h3 className="al-modal__title">¿Cerrar sesión?</h3>
            </div>
            <div className="al-modal__toggle-row">
              <div className="al-modal__toggle-label">
                <span className="al-modal__toggle-title">Cierre automático de sesión</span>
                <span className="al-modal__toggle-sub">
                  {autoLogout ? `Activo · ${user?.autoLogoutMinutes ?? 15} min sin actividad` : "Inactivo · cierre manual"}
                </span>
              </div>
              <ToggleSwitch enabled={autoLogout} onChange={handleToggleAutoLogout} loading={toggleLoading} />
            </div>
            <div className="al-modal__actions">
              <button className="al-modal__btn-cancelar" onClick={() => setModalCerrarAbierto(false)}>
                Cancelar
              </button>
              <button className="al-modal__btn-confirmar" onClick={ejecutarCerrarSesion}>
                Sí, cerrar sesión
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};

export default memo(Navbar);