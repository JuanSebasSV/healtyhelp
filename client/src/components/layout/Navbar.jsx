import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Navbar.css';

const Navbar = ({ modoOscuro, toggleModoOscuro }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleNavigate = (ruta) => {
    navigate(ruta);
    setMenuAbierto(false);
  };

  const handleCerrarSesion = () => {
    logout();
    setMenuAbierto(false);
    navigate('/');
  };

  // Determinar ruta actual para marcar item activo
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
        
        <button 
          className="navHamburguesa" 
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
            Inicio
          </li>
          
          {user && (
            <>
              <li 
                onClick={() => handleNavigate('/historial')}
                className={isActive('/historial') ? 'activo' : ''}
              >
                Historial
              </li>
              <li 
                onClick={() => handleNavigate('/favoritos')}
                className={isActive('/favoritos') ? 'activo' : ''}
              >
                Favoritos
              </li>
            </>
          )}
          
          <li 
            onClick={() => handleNavigate('/contacto')}
            className={isActive('/contacto') ? 'activo' : ''}
          >
            Contáctanos
          </li>

          {/* Mostrar panel admin solo si es admin */}
          {user && isAdmin && isAdmin() && (
            <li 
              onClick={() => handleNavigate('/admin')}
              className={`nav-admin-btn ${isActive('/admin') ? 'activo' : ''}`}
            >
              🛡️ Admin Panel
            </li>
          )}

          <li>
            <button 
              className="btnTema" 
              onClick={toggleModoOscuro} 
              title={modoOscuro ? 'Modo Claro' : 'Modo Oscuro'}
              aria-label={modoOscuro ? 'Activar modo claro' : 'Activar modo oscuro'}
            >
              {modoOscuro ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="m17.66 17.66 1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" />
                  <path d="m19.07 4.93-1.41 1.41" />
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
                style={{ cursor: 'pointer' }}
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
                  <div className="nav-avatar-iniciales" style={{ display: user.avatar ? 'none' : 'flex' }}>
                    {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  {user.role === 'admin' && <span className="nav-admin-dot" />}
                </div>
                <span className="nav-nombre">{user.name?.split(' ')[0]}</span>
              </li>
              <li>
                <button className="btn-secundario" onClick={handleCerrarSesion}>
                  Cerrar Sesión
                </button>
              </li>
            </>
          ) : (
            <li>
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