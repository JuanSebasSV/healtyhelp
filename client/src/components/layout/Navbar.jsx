import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const Navbar = ({ onNavigate, vistaActual, modoOscuro, toggleModoOscuro }) => {
  const { user, logout, isAdmin } = useAuth(); // 🔒 Usar hook seguro
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleNavigate = (vista) => {
    onNavigate(vista);
    setMenuAbierto(false);
  };

  const handleCerrarSesion = () => {
    logout(); // 🔒 Logout seguro que limpia token
    setMenuAbierto(false);
    onNavigate('inicio');
  };

  return (
    <nav className="nav">
      <div className="nav-contenedor">
        <div className="nav-logo" onClick={() => handleNavigate('inicio')}>
          <div className="logo-icono">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 21h10" />
              <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z" />
              <path d="M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.37 3.37 2.4 2.4 0 0 1-1.1 3.7 2.51 2.51 0 0 1 .03 1.1" />
            </svg>
          </div>
          <span className="logo-texto">Healthy Help</span>
        </div>
        
        <button 
          className="nav-hamburguesa" 
          onClick={() => setMenuAbierto(!menuAbierto)}
          aria-label="Menú"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`nav-menu ${menuAbierto ? 'activo' : ''}`}>
          <li 
            onClick={() => handleNavigate('inicio')}
            className={vistaActual === 'inicio' ? 'activo' : ''}
          >
            Inicio
          </li>
          <li 
            onClick={() => handleNavigate('historial')}
            className={vistaActual === 'historial' ? 'activo' : ''}
          >
            Historial
          </li>
          <li 
            onClick={() => handleNavigate('favoritos')}
            className={vistaActual === 'favoritos' ? 'activo' : ''}
          >
            Favoritos
          </li>
          <li 
            onClick={() => handleNavigate('contacto')}
            className={vistaActual === 'contacto' ? 'activo' : ''}
          >
            Contáctanos
          </li>

          {/* 🔒 Mostrar panel admin solo si es admin */}
          {user && isAdmin() && (
            <li 
              onClick={() => handleNavigate('admin')}
              className={vistaActual === 'admin' ? 'activo' : ''}
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '4px',
                padding: '0.5rem 1rem'
              }}
            >
              🛡️ Admin Panel
            </li>
          )}

          <li>
            <button 
              className="btn-tema" 
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
              <li className="nav-usuario">
                <span className="usuario-nombre">
                  👤 {user.name}
                </span>
                {user.role === 'admin' && (
                  <span style={{ 
                    marginLeft: '0.5rem', 
                    fontSize: '0.75rem', 
                    background: '#667eea', 
                    color: 'white',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '12px'
                  }}>
                    ADMIN
                  </span>
                )}
              </li>
              <li>
                <button className="btn-secundario" onClick={handleCerrarSesion}>
                  Cerrar Sesión
                </button>
              </li>
            </>
          ) : (
            <li>
              <button className="btn-primario" onClick={() => handleNavigate('login')}>
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