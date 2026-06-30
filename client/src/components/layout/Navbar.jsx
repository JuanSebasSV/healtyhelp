// Navbar.jsx
import { useState, useEffect, useRef, useCallback, memo } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import api from "../../api/axios";
import { optimizeCloudinary } from "../../utils/cloudinary";
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
  <svg xmlns="http://www.w3.org/2000/svg" width="213" height="230" viewBox="0 0 213 230">
    <g>
      <path d="M 128.66 219.46 C118.73,223.57 115.84,223.82 113.04,220.81 C108.54,215.98 111.29,210.05 119.25,207.44 C127.05,204.88 143.24,196.55 151.84,190.67 C172.92,176.26 189.11,153.90 193.46,133.18 C195.21,124.85 195.43,112.63 193.94,106.00 C190.21,89.40 183.12,79.64 170.13,73.22 C162.95,69.67 162.14,69.50 152.55,69.50 C140.41,69.50 134.57,71.27 126.08,77.52 C120.40,81.70 115.00,88.88 115.00,92.26 C115.00,93.13 113.80,95.27 112.33,97.02 C110.10,99.67 109.18,100.09 106.68,99.59 C102.59,98.77 101.20,97.41 99.87,92.94 C98.31,87.74 91.91,80.26 85.22,75.82 C77.59,70.75 69.16,68.61 59.31,69.24 C48.22,69.94 41.25,72.90 33.44,80.20 C20.22,92.57 15.28,110.92 19.57,131.70 C23.42,150.32 30.19,162.18 46.00,178.02 C55.63,187.67 59.10,190.42 67.34,194.93 C79.75,201.72 84.04,202.33 92.42,198.49 C98.01,195.94 114.43,185.56 125.50,177.60 C128.26,175.60 131.69,174.00 133.17,174.00 C137.95,174.00 141.80,181.61 139.15,185.79 C138.37,187.03 134.33,189.90 120.00,199.44 C110.70,205.63 97.43,212.47 90.80,214.50 C81.40,217.37 72.94,214.86 56.72,204.40 C20.96,181.32 0.98,144.40 5.01,108.86 C7.98,82.75 24.58,62.76 48.46,56.55 C63.72,52.58 82.19,56.23 94.82,65.71 C96.64,67.08 98.39,67.94 98.71,67.62 C99.53,66.80 96.37,58.61 92.33,51.11 C88.08,43.23 81.60,35.17 73.88,28.17 C69.00,23.74 68.00,22.28 68.00,19.57 C68.00,15.49 70.62,13.00 74.94,13.00 C77.65,13.00 79.51,14.25 85.72,20.25 C89.84,24.24 95.25,30.34 97.74,33.81 L 102.26 40.13 L 103.90 35.30 C109.13,19.84 121.82,8.25 137.64,4.47 C145.03,2.71 160.64,2.60 164.00,4.29 C166.06,5.33 166.55,6.39 166.81,10.34 C167.53,21.65 161.53,36.42 152.95,44.45 C150.18,47.04 144.89,50.59 141.20,52.32 C134.83,55.32 133.90,55.48 122.25,55.49 C115.51,55.49 110.00,55.66 110.00,55.86 C110.00,56.76 113.22,68.54 113.56,68.89 C113.77,69.10 115.54,68.07 117.48,66.58 C130.20,56.88 150.51,52.64 165.51,56.54 C192.30,63.52 209.46,87.76 209.38,118.50 C209.30,150.70 190.84,181.95 159.53,202.89 C147.62,210.85 141.42,214.18 128.66,219.46 ZM 117.36 38.95 L 116.75 42.00 L 123.73 42.00 C135.05,42.00 144.44,35.91 149.46,25.32 C153.35,17.09 153.14,16.63 145.72,17.23 C133.02,18.25 119.42,28.67 117.36,38.95 Z" fill="rgb(56,83,38)"/>
      <path d="M 128.66 219.46 C119.28,223.35 116.36,223.74 113.44,221.53 C112.22,220.61 110.34,220.27 108.37,220.62 C106.09,221.03 103.54,220.33 98.92,218.04 C93.39,215.30 91.96,214.99 87.41,215.55 C84.55,215.91 81.69,215.77 78.58,215.03 C82.94,215.97 86.78,215.73 90.80,214.50 C97.43,212.47 110.70,205.63 120.00,199.44 C134.33,189.90 138.37,187.03 139.15,185.79 C141.80,181.61 137.95,174.00 133.17,174.00 C131.69,174.00 128.26,175.60 125.50,177.60 C114.43,185.56 98.01,195.94 92.42,198.49 C84.04,202.33 79.75,201.72 67.34,194.93 C65.19,193.75 63.37,192.70 61.68,191.61 C64.01,192.71 62.34,189.99 56.59,183.97 C39.03,165.58 29.00,143.86 29.00,124.19 C29.00,100.43 43.94,83.48 66.01,82.21 C77.64,81.53 84.58,83.40 95.75,90.19 C98.17,91.66 99.07,91.59 98.92,90.60 C99.32,91.42 99.64,92.20 99.87,92.94 C101.20,97.41 102.59,98.77 106.68,99.59 C109.18,100.09 110.10,99.67 112.33,97.02 C113.80,95.27 115.00,93.13 115.00,92.26 C115.00,90.97 115.79,89.12 117.08,87.10 C115.05,91.15 114.74,95.83 115.64,102.36 C115.99,104.91 116.37,107.00 116.49,107.00 C116.62,107.00 118.32,104.58 120.28,101.63 C124.38,95.46 130.31,90.33 137.50,86.74 C152.48,79.25 175.86,80.94 185.74,90.23 C187.78,92.14 188.84,92.24 188.63,90.83 C190.89,95.14 192.62,100.14 193.94,106.00 C195.43,112.63 195.21,124.85 193.46,133.18 C189.11,153.90 172.92,176.26 151.84,190.67 C143.24,196.55 127.05,204.88 119.25,207.44 C111.29,210.05 108.54,215.98 113.04,220.81 C115.84,223.82 118.73,223.57 128.66,219.46 ZM 117.36 38.95 C116.44,43.56 118.32,42.79 125.47,35.64 C131.33,29.78 139.29,24.91 149.25,21.10 C150.61,20.57 151.75,19.53 151.96,18.67 C151.95,19.89 151.05,21.96 149.46,25.32 C144.44,35.91 135.05,42.00 123.73,42.00 L 116.75 42.00 ZM 32.17 161.98 C27.37,155.15 24.11,148.35 21.75,140.42 C23.69,146.42 26.40,152.46 29.88,158.41 C30.52,159.52 31.30,160.72 32.17,161.98 ZM 21.26 170.09 C8.55,151.36 2.61,130.05 5.01,108.86 C2.63,129.83 8.61,151.28 21.26,170.09 ZM 18.22 113.15 C19.15,100.10 24.33,88.73 33.44,80.20 C24.33,88.73 19.22,100.26 18.22,113.15 ZM 181.40 81.03 C178.86,78.75 175.90,76.52 172.98,74.74 C176.17,76.57 178.96,78.64 181.40,81.03 ZM 163.98 70.50 C161.15,69.62 158.49,69.50 152.55,69.50 C158.57,69.50 161.13,69.57 163.98,70.50 ZM 92.83 82.27 C90.53,79.92 87.85,77.56 85.22,75.82 C87.90,77.60 90.53,79.86 92.83,82.27 Z" fill="rgb(146,202,73)"/>
      <path d="M 0.00 115.00 L 0.00 0.00 L 106.50 0.00 L 213.00 0.00 L 213.00 115.00 L 213.00 230.00 L 106.50 230.00 L 0.00 230.00 L 0.00 115.00 ZM 128.66 219.46 C141.42,214.18 147.62,210.85 159.53,202.89 C190.84,181.95 209.30,150.70 209.38,118.50 C209.46,87.76 192.30,63.52 165.51,56.54 C150.51,52.64 130.20,56.88 117.48,66.58 C115.54,68.07 113.77,69.10 113.56,68.89 C113.22,68.54 110.00,56.76 110.00,55.86 C110.00,55.66 115.51,55.49 122.25,55.49 C133.90,55.48 134.83,55.32 141.20,52.32 C144.89,50.59 150.18,47.04 152.95,44.45 C161.53,36.42 167.53,21.65 166.81,10.34 C166.55,6.39 166.06,5.33 164.00,4.29 C160.64,2.60 145.03,2.71 137.64,4.47 C121.82,8.25 109.13,19.84 103.90,35.30 L 102.26 40.13 L 97.74 33.81 C95.25,30.34 89.84,24.24 85.72,20.25 C79.51,14.25 77.65,13.00 74.94,13.00 C70.62,13.00 68.00,15.49 68.00,19.57 C68.00,22.28 69.00,23.74 73.88,28.17 C81.60,35.17 88.08,43.23 92.33,51.11 C96.37,58.61 99.53,66.80 98.71,67.62 C98.39,67.94 96.64,67.08 94.82,65.71 C82.19,56.23 63.72,52.58 48.46,56.55 C24.58,62.76 7.98,82.75 5.01,108.86 C0.71,146.78 23.12,185.05 63.24,208.29 C73.74,214.37 80.54,216.41 87.41,215.55 C91.96,214.99 93.39,215.30 98.92,218.04 C103.54,220.33 106.09,221.03 108.37,220.62 C110.34,220.27 112.22,220.61 113.44,221.53 C116.36,223.74 119.28,223.35 128.66,219.46 ZM 56.00 187.67 C47.13,180.68 34.86,166.94 29.88,158.41 C12.86,129.29 14.28,98.12 33.44,80.20 C41.25,72.90 48.22,69.94 59.31,69.24 C69.16,68.61 77.59,70.75 85.22,75.82 C94.30,81.85 104.15,95.29 95.75,90.19 C84.58,83.40 77.64,81.53 66.01,82.21 C43.94,83.48 29.00,100.43 29.00,124.19 C29.00,143.86 39.03,165.58 56.59,183.97 C64.97,192.73 64.68,194.51 56.00,187.67 ZM 115.64 102.36 C113.99,90.38 116.40,84.64 126.08,77.52 C134.56,71.28 140.42,69.50 152.50,69.50 C161.67,69.50 163.06,69.77 169.22,72.68 C176.37,76.07 185.20,83.56 187.66,88.31 C189.57,92.00 188.63,92.94 185.74,90.23 C175.86,80.94 152.48,79.25 137.50,86.74 C130.31,90.33 124.38,95.46 120.28,101.63 C118.32,104.58 116.62,107.00 116.49,107.00 C116.37,107.00 115.99,104.91 115.64,102.36 ZM 117.36 38.95 C119.42,28.67 133.02,18.25 145.72,17.23 C151.10,16.80 152.00,16.96 152.00,18.38 C152.00,19.30 150.76,20.52 149.25,21.10 C139.29,24.91 131.33,29.78 125.47,35.64 C118.32,42.79 116.44,43.56 117.36,38.95 Z" fill="rgb(253,254,251)"/>
    </g>
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
  const [esTactil,           setEsTactil]           = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  );

  const dropdownTimerRef = useRef(null);
  const dropdownRef      = useRef(null);
  const notifIntervalRef = useRef(null);

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

  const fetchNotificaciones = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get("/notifications");
      setNotificaciones(data.notificaciones || []);
      setNoLeidas(data.noLeidas || 0);
    } catch (e) { console.error('Error cargando notificaciones:', e); }
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
    } catch (e) { console.error('Error marcando como leídas:', e); }
  }, []);

  const handleEliminarNotif = useCallback(async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotificaciones((prev) => {
        const eraNoLeida = prev.find((n) => n._id === id && !n.leida);
        if (eraNoLeida) setNoLeidas((c) => Math.max(0, c - 1));
        return prev.filter((n) => n._id !== id);
      });
    } catch (e) { console.error('Error eliminando notificación:', e); }
  }, []);

  const handleLeerUna = useCallback(async (id) => {
    setNotificaciones((prev) => {
      const notif = prev.find((n) => n._id === id);
      if (!notif || notif.leida) return prev;
      setNoLeidas((c) => Math.max(0, c - 1));
      return prev.map((n) => (n._id === id ? { ...n, leida: true } : n));
    });
    try { await api.put(`/notifications/${id}/leer`); } catch (e) { console.error('Error marcando leída:', e); }
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

            {panelAbierto && esTactil && createPortal(
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
              </div>,
              document.body,
            )}

            {user ? (
              <>
                <li className="navUsuario" onClick={() => handleNavigate("/perfil")}>
                  <div className="nav-avatar-mini">
                    {user.avatar && !user.avatar.includes("googleusercontent.com") ? (
                      <img src={optimizeCloudinary(user.avatar, 'q_auto,f_auto,w_64')} alt={user.name} className="nav-avatar-img"
                        width="32" height="32" decoding="async"
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