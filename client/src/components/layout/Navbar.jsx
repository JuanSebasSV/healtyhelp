// Navbar.jsx
import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";
import useModalLayerHint from "../../hooks/useModalLayerHint";
import { useNotificaciones } from "../../hooks/useNotificaciones";
import "./Navbar.css";
import PanelNotificaciones from "../notificaciones/PanelNotificaciones";
import IcoCampana from "./IcoCampana";
import IcoLogo from "./IcoLogo";
import IcoSol from "./IcoSol";
import IcoLuna from "./IcoLuna";
import IcoLock from "./IcoLock";
import IcoCerrarSesion from "./IcoCerrarSesion";
import ToggleSwitch from "./ToggleSwitch";
import BtnCampana from "./BtnCampana";
import NavLink from "./NavLink";
import UserDropdown from "./UserDropdown";
import ModalCerrarSesion from "./ModalCerrarSesion";
import UserAvatar from "./UserAvatar";
import MobileNotifPanel from "./MobileNotifPanel";
import NotifButton from "./NotifButton";

const NOTIF_INTERVAL = 60_000;

const Navbar = ({ modoOscuro, toggleModoOscuro, imgPendientes = 0, onAbrirReceta }) => {
  const { user, logout, isAdmin, updateAutoLogout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [menuAbierto,        setMenuAbierto]        = useState(false);
  const [dropdownAbierto,    setDropdownAbierto]    = useState(false);
  const [modalCerrarAbierto, setModalCerrarAbierto] = useState(false);
  const [autoLogout,         setAutoLogout]         = useState(false);

  const {
    notificaciones, noLeidas, panelAbierto, setPanelAbierto, cargandoNotifs,
    handleAbrirPanel, handleCerrarPanel,
    handleLeerTodas, handleLeerUna, handleEliminarNotif,
  } = useNotificaciones(user, NOTIF_INTERVAL);

  useBodyScrollLock(panelAbierto);
  useModalLayerHint(panelAbierto || modalCerrarAbierto);
  const [toggleLoading,      setToggleLoading]      = useState(false);
  const [esTactil,           setEsTactil]           = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  );

  const dropdownTimerRef = useRef(null);
  const dropdownRef      = useRef(null);

  const [prevAutoLogout, setPrevAutoLogout] = useState(user?.autoLogoutEnabled);
  if (user?.autoLogoutEnabled !== prevAutoLogout) {
    setPrevAutoLogout(user?.autoLogoutEnabled);
    setAutoLogout(user?.autoLogoutEnabled ?? false);
  }

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const handler = (e) => setEsTactil(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
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
  }, [_procesarUrlNotif, setPanelAbierto]);

  const handleNavNotifMovil = useCallback((url) => {
    setPanelAbierto(false);
    setMenuAbierto(false);
    _procesarUrlNotif(url);
  }, [_procesarUrlNotif, setPanelAbierto]);

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

  const ejecutarCerrarSesion = useCallback(async () => {
    setMenuAbierto(false);
    setDropdownAbierto(false);
    await logout();
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
          <Link
            to="/"
            className="navLogo"
            onClick={() => handleNavigate("/")}
          >
            <div className="logoIcono"><IcoLogo /></div>
            <span className="logoTexto">Healthy Help</span>
          </Link>

          {user && (
            <NotifButton
              panelAbierto={panelAbierto}
              notificaciones={notificaciones}
              noLeidas={noLeidas}
              cargandoNotifs={cargandoNotifs}
              onAbrirPanel={handleAbrirPanel}
              onLeerTodas={handleLeerTodas}
              onLeerUna={handleLeerUna}
              onEliminar={handleEliminarNotif}
              onCerrarPanel={handleCerrarPanel}
              onNavegar={handleNavNotif}
            />
          )}

          <button type="button"
            className={`navHamburguesa ${menuAbierto ? "abierto" : ""}`}
            onClick={handleToggleMenu}
            aria-label="Menú"
          >
            <span /><span /><span />
          </button>

          <ul className={`navMenu ${menuAbierto ? "activo" : ""}`}>
            <NavLink to="/" isActive={isActive("/")} onNavigate={handleNavigate}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Inicio
            </NavLink>

            {user && (
              <>
                <NavLink to="/seguimiento" isActive={isActive("/seguimiento")} onNavigate={handleNavigate}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                  Seguimiento
                </NavLink>
                <NavLink to="/favoritos" isActive={isActive("/favoritos")} onNavigate={handleNavigate}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  Favoritos
                </NavLink>
              </>
            )}

            <NavLink to="/contacto" isActive={isActive("/contacto")} onNavigate={handleNavigate}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Contáctanos
            </NavLink>

            {user && isAdmin && isAdmin() && (
              <NavLink to="/admin" isActive={isActive("/admin")} onNavigate={handleNavigate} badge={imgPendientes}>
                <IcoLock />
                Admin Panel
              </NavLink>
            )}

            <li className="navMenu-tema">
              <button type="button" className="btnTema" onClick={toggleModoOscuro}
                title={modoOscuro ? "Modo Claro" : "Modo Oscuro"}
                aria-label={modoOscuro ? "Activar modo claro" : "Activar modo oscuro"}>
                {modoOscuro ? <IcoSol /> : <IcoLuna />}
              </button>
              {user && (
                <BtnCampana noLeidas={noLeidas} onClick={handleAbrirPanel} extraClass="nav-notif-btn--movil" />
              )}
            </li>

            {panelAbierto && esTactil && (
              <MobileNotifPanel
                notificaciones={notificaciones}
                noLeidas={noLeidas}
                cargandoNotifs={cargandoNotifs}
                onLeerTodas={handleLeerTodas}
                onLeerUna={handleLeerUna}
                onEliminar={handleEliminarNotif}
                onCerrar={handleCerrarPanel}
                onNavegar={handleNavNotifMovil}
              />
            )}

            {user ? (
              <>
                <li className="navUsuario">
                  <UserAvatar user={user} onNavigate={handleNavigate} />
                </li>
                <li className="navMenu-centrado" onClick={(e) => e.stopPropagation()}>
                  {!esTactil ? (
                    <div className="al-dropdown-wrap" ref={dropdownRef}
                      onMouseEnter={handleMouseEnterDropdown}
                      onMouseLeave={handleMouseLeaveDropdown}
                      onClick={(e) => e.stopPropagation()}>
                      <UserDropdown
                        dropdownAbierto={dropdownAbierto}
                        autoLogout={autoLogout}
                        autoLogoutMinutes={user?.autoLogoutMinutes}
                        toggleLoading={toggleLoading}
                        onCerrarSesion={handleCerrarSesionDesktop}
                        onToggleAutoLogout={handleToggleAutoLogout}
                      />
                    </div>
                  ) : (
                    <button type="button" className="btn-secundario" onClick={handleCerrarSesionMobile}>
                      Cerrar Sesión
                    </button>
                  )}
                </li>
              </>
            ) : (
              <li className="navMenu-centrado">
                <button type="button" className="btn-primario" onClick={() => handleNavigate("/login")}>
                  Inicio de sesión
                </button>
              </li>
            )}
          </ul>
        </div>
      </nav>

      {modalCerrarAbierto && (
        <ModalCerrarSesion
          autoLogout={autoLogout}
          autoLogoutMinutes={user?.autoLogoutMinutes}
          toggleLoading={toggleLoading}
          onClose={() => setModalCerrarAbierto(false)}
          onConfirm={ejecutarCerrarSesion}
          onToggleAutoLogout={handleToggleAutoLogout}
        />
      )}
    </>
  );
};

export default memo(Navbar);