import { memo } from 'react';

const ProfileSidebar = memo(({
  avatarSrc,
  initials,
  setVerFoto,
  subiendoAvatar,
  handleAvatarClick,
  fileInputRef,
  handleAvatarChange,
  user,
  handleEliminarAvatar,
  joinDate,
  handleCerrarSesion,
}) => (
  <div className="perfil-sidebar">
    <div className="perfil-identidad">
      <div
        className={`avatar-wrapper ${avatarSrc ? "avatar-wrapper--clickable" : ""}`}
        role={avatarSrc ? "button" : undefined}
        tabIndex={avatarSrc ? 0 : undefined}
        onClick={() => avatarSrc && setVerFoto(true)}
        onKeyDown={(e) => {
          if (!avatarSrc) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setVerFoto(true);
          }
        }}
        aria-label={avatarSrc ? "Ver foto de perfil" : undefined}
        title={avatarSrc ? "Ver foto de perfil" : ""}
      >
        <div className="avatar-anillo" />
        {avatarSrc && !avatarSrc.includes("googleusercontent.com") ? (
          <img
            src={avatarSrc}
            alt={user?.name}
            className="avatar-img"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className="avatar-iniciales"
          style={{
            display:
              avatarSrc && !avatarSrc.includes("googleusercontent.com")
                ? "none"
                : "flex",
          }}
        >
          <span>{initials}</span>
        </div>
      </div>

      <button
        type="button"
        className="avatar-cambiar"
        onClick={handleAvatarClick}
        aria-label="Cambiar foto de perfil"
        title="Cambiar foto de perfil"
        disabled={subiendoAvatar}
      >
        {subiendoAvatar ? (
          <span className="spinner" />
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
            <circle cx="12" cy="13" r="3" />
          </svg>
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={handleAvatarChange}
      />

      {user?.avatar && (
        <button
          type="button"
          className="btn-quitar-avatar"
          onClick={handleEliminarAvatar}
          disabled={subiendoAvatar}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
          </svg>
          Quitar foto
        </button>
      )}

      <h2 className="perfil-nombre">{user?.name}</h2>
      <p className="perfil-email-display">{user?.email}</p>

      {user?.role === "admin" && (
        <div className="perfil-rol-badge">
          <span>Administrador</span>
        </div>
      )}

      <div className="perfil-seccion">
        <div className="perfil-stats">
          <div className="stat-item">
            <span className="stat-icono">📅</span>
            <div>
              <p className="stat-label">Miembro desde</p>
              <p className="stat-valor">{joinDate}</p>
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
      </div>

      <button type="button" className="btn-cerrar-sesion" onClick={handleCerrarSesion}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 0-2 2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Cerrar sesión
      </button>
    </div>

    <div className="sidebar-deco">
      <svg viewBox="0 0 200 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 280 C100 280 100 100 100 80" stroke="rgba(79,119,45,0.4)" strokeWidth="2" />
        <path d="M100 200 C70 180 40 160 60 130 C80 100 100 140 100 140" fill="rgba(79,119,45,0.25)" stroke="rgba(79,119,45,0.4)" strokeWidth="1.5" />
        <path d="M100 170 C130 150 160 130 140 100 C120 70 100 110 100 110" fill="rgba(79,119,45,0.2)" stroke="rgba(79,119,45,0.35)" strokeWidth="1.5" />
        <path d="M100 240 C75 225 55 200 70 175 C85 150 100 180 100 180" fill="rgba(247,127,0,0.15)" stroke="rgba(247,127,0,0.3)" strokeWidth="1.5" />
      </svg>
    </div>
  </div>
));
ProfileSidebar.displayName = 'ProfileSidebar';

export default ProfileSidebar;
