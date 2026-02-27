import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import api from '../../api/axios';
import './UserProfile.css';

const UserProfile = () => {
  const { user, checkAuth, logout } = useAuth();
  const navigate = useNavigate();
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGuardar = async () => {
    if (form.password && form.password !== form.confirmPassword) {
      setMensaje({ tipo: 'error', texto: 'Las contraseñas no coinciden' });
      return;
    }

    setGuardando(true);
    try {
      const payload = { name: form.name };
      if (form.password) payload.password = form.password;

      await api.put('/auth/profile', payload);
      await checkAuth();
      setEditando(false);
      setForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
      setMensaje({ tipo: 'exito', texto: '¡Perfil actualizado correctamente!' });
      setTimeout(() => setMensaje(null), 3000);
    } catch (error) {
      setMensaje({ tipo: 'error', texto: error.response?.data?.error || 'Error al actualizar' });
    } finally {
      setGuardando(false);
    }
  };

  const handleCerrarSesion = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })
    : 'Fecha desconocida';

  return (
    <div className="perfil-pagina">
      {/* Partículas decorativas */}
      <div className="perfil-particulas">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`particula particula-${i + 1}`} />
        ))}
      </div>

      <div className="perfil-contenedor">

        {/* Columna izquierda — Tarjeta de identidad */}
        <div className="perfil-sidebar">
          <div className="perfil-identidad">
            {/* Avatar */}
            <div className="avatar-wrapper">
              <div className="avatar-anillo" />
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="avatar-img" />
              ) : (
                <div className="avatar-iniciales">
                  <span>{getInitials(user?.name)}</span>
                </div>
              )}
              <div className="avatar-badge">
                {user?.role === 'admin' ? '🛡️' : '🌿'}
              </div>
            </div>

            <h2 className="perfil-nombre">{user?.name}</h2>
            <p className="perfil-email-display">{user?.email}</p>

            {user?.role === 'admin' && (
              <div className="perfil-rol-badge">
                <span>Administrador</span>
              </div>
            )}

            <div className="perfil-stats">
              <div className="stat-item">
                <span className="stat-icono">📅</span>
                <div>
                  <p className="stat-label">Miembro desde</p>
                  <p className="stat-valor">{joinDate}</p>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-icono">✅</span>
                <div>
                  <p className="stat-label">Cuenta</p>
                  <p className="stat-valor">{user?.isVerified ? 'Verificada' : 'Sin verificar'}</p>
                </div>
              </div>
              {user?.googleId && (
                <div className="stat-item">
                  <span className="stat-icono">🔗</span>
                  <div>
                    <p className="stat-label">Vinculada con</p>
                    <p className="stat-valor">Google</p>
                  </div>
                </div>
              )}
            </div>

            <button className="btn-cerrar-sesion" onClick={handleCerrarSesion}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Cerrar sesión
            </button>
          </div>

          {/* Decoración vegetal */}
          <div className="sidebar-deco">
            <svg viewBox="0 0 200 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 280 C100 280 100 100 100 80" stroke="rgba(79,119,45,0.4)" strokeWidth="2"/>
              <path d="M100 200 C70 180 40 160 60 130 C80 100 100 140 100 140" fill="rgba(79,119,45,0.25)" stroke="rgba(79,119,45,0.4)" strokeWidth="1.5"/>
              <path d="M100 170 C130 150 160 130 140 100 C120 70 100 110 100 110" fill="rgba(79,119,45,0.2)" stroke="rgba(79,119,45,0.35)" strokeWidth="1.5"/>
              <path d="M100 240 C75 225 55 200 70 175 C85 150 100 180 100 180" fill="rgba(247,127,0,0.15)" stroke="rgba(247,127,0,0.3)" strokeWidth="1.5"/>
            </svg>
          </div>
        </div>

        {/* Columna derecha — Formulario / Info */}
        <div className="perfil-contenido">

          {/* Header */}
          <div className="perfil-header">
            <div>
              <h1 className="perfil-titulo">
                <span className="titulo-linea-verde" />
                Mi Perfil
              </h1>
              <p className="perfil-subtitulo">Gestiona tu información personal y preferencias</p>
            </div>
            {!editando ? (
              <button className="btn-editar" onClick={() => setEditando(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Editar perfil
              </button>
            ) : (
              <div className="btn-group">
                <button className="btn-cancelar" onClick={() => { setEditando(false); setMensaje(null); }}>
                  Cancelar
                </button>
                <button className="btn-guardar" onClick={handleGuardar} disabled={guardando}>
                  {guardando ? (
                    <span className="spinner" />
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            )}
          </div>

          {/* Mensaje de feedback */}
          {mensaje && (
            <div className={`perfil-mensaje perfil-mensaje--${mensaje.tipo}`}>
              <span>{mensaje.tipo === 'exito' ? '✅' : '⚠️'}</span>
              {mensaje.texto}
            </div>
          )}

          {/* Sección datos personales */}
          <div className="perfil-seccion">
            <div className="seccion-titulo">
              <div className="seccion-icono">🌱</div>
              <h3>Datos personales</h3>
            </div>

            <div className="campos-grid">
              <div className="campo-grupo">
                <label className="campo-label">Nombre completo</label>
                {editando ? (
                  <input
                    className="campo-input"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                  />
                ) : (
                  <div className="campo-valor">{user?.name || '—'}</div>
                )}
              </div>

              <div className="campo-grupo">
                <label className="campo-label">Correo electrónico</label>
                <div className="campo-valor campo-valor--bloqueado">
                  {user?.email}
                  <span className="campo-lock">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                </div>
                <p className="campo-hint">El email no se puede modificar</p>
              </div>
            </div>
          </div>

          {/* Sección contraseña — solo si no es Google */}
          {!user?.googleId && (
            <div className="perfil-seccion">
              <div className="seccion-titulo">
                <div className="seccion-icono">🔒</div>
                <h3>Seguridad</h3>
              </div>

              {editando ? (
                <div className="campos-grid">
                  <div className="campo-grupo">
                    <label className="campo-label">Nueva contraseña</label>
                    <input
                      className="campo-input"
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Dejar vacío para no cambiar"
                    />
                  </div>
                  <div className="campo-grupo">
                    <label className="campo-label">Confirmar contraseña</label>
                    <input
                      className="campo-input"
                      type="password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repetir nueva contraseña"
                    />
                  </div>
                </div>
              ) : (
                <div className="campo-grupo">
                  <label className="campo-label">Contraseña</label>
                  <div className="campo-valor">••••••••••</div>
                </div>
              )}
            </div>
          )}

          {/* Sección cuenta Google */}
          {user?.googleId && (
            <div className="perfil-seccion perfil-seccion--google">
              <div className="google-vinculo">
                <div className="google-logo">
                  <svg viewBox="0 0 24 24" width="28" height="28">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <div>
                  <p className="google-titulo">Cuenta vinculada con Google</p>
                  <p className="google-desc">Tu sesión se gestiona de forma segura a través de Google OAuth</p>
                </div>
                <div className="google-check">✓</div>
              </div>
            </div>
          )}

          {/* Decoración inferior */}
          <div className="perfil-deco-bottom">
            <div className="deco-linea" />
            <span className="deco-hoja">🌿</span>
            <div className="deco-linea" />
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserProfile;
