import { useState } from 'react';
import './UserList.css';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import { toast } from 'react-toastify';

/* Modal enviar mensaje*/
const ModalMensaje = ({ user: target, onClose }) => {
  const [asunto,   setAsunto]   = useState('');
  const [mensaje,  setMensaje]  = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleEnviar = async () => {
    if (!mensaje.trim()) { toast.error('El mensaje no puede estar vacío'); return; }
    setEnviando(true);
    try {
      await api.post('/notifications/mensaje', {
        userId:  target._id || target.id,
        asunto:  asunto.trim(),
        mensaje: mensaje.trim(),
      });
      toast.success(`Mensaje enviado a ${target.name}`);
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Error al enviar mensaje');
      setEnviando(false);
    }
  };

  return (
    <div className="ban-modal-overlay" onClick={onClose}>
      <div className="ban-modal msg-modal" onClick={e => e.stopPropagation()}>
        <div className="ban-modal-header">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ marginRight: '6px', verticalAlign: 'middle' }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Enviar mensaje
          </h3>
          <button className="ban-modal-cerrar" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <p className="ban-modal-usuario">
          Para: <strong>{target.name}</strong> — {target.email}
        </p>

        <div className="ban-modal-campo">
          <label>Asunto <span className="ban-opcional">(opcional)</span></label>
          <input
            type="text"
            value={asunto}
            onChange={e => setAsunto(e.target.value)}
            placeholder="Ej: Aviso importante"
            maxLength={120}
            className="msg-input"
          />
        </div>

        <div className="ban-modal-campo">
          <label>Mensaje</label>
          <textarea
            value={mensaje}
            onChange={e => setMensaje(e.target.value)}
            placeholder="Escribe tu mensaje al usuario..."
            rows={5}
            maxLength={1000}
          />
          <span className="msg-contador">{mensaje.length}/1000</span>
        </div>

        <div className="ban-modal-acciones">
          <button className="ban-btn-cancelar" onClick={onClose} disabled={enviando}>
            Cancelar
          </button>
          <button
            className="msg-btn-enviar"
            onClick={handleEnviar}
            disabled={enviando || !mensaje.trim()}
          >
            {enviando ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2" className="msg-spin">
                  <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
                  <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
                  <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
                  <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
                </svg>
                Enviando
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                Enviar mensaje
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* Modal de baneo*/
const ModalBaneo = ({ user: target, onClose, onBan }) => {
  const [motivo,   setMotivo]   = useState('');
  const [tipo,     setTipo]     = useState('dias');
  const [dias,     setDias]     = useState(7);
  const [enviando, setEnviando] = useState(false);

  const handleConfirm = async () => {
    setEnviando(true);
    try {
      await onBan(target._id || target.id, motivo, tipo === 'permanente' ? null : parseInt(dias));
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
          <strong>{target.name}</strong> — {target.email}
        </p>

        <div className="ban-modal-campo">
          <label>Motivo <span className="ban-opcional">(opcional)</span></label>
          <textarea
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            placeholder="Ej: Contenido inapropiado, spam..."
            rows={3}
            maxLength={300}
          />
        </div>

        <div className="ban-modal-campo">
          <label>Duración</label>
          <div className="ban-tipo-btns">
            <button
              className={`ban-tipo-btn ${tipo === 'dias' ? 'activo' : ''}`}
              onClick={() => setTipo('dias')}
            >Temporal</button>
            <button
              className={`ban-tipo-btn ban-tipo-btn--rojo ${tipo === 'permanente' ? 'activo' : ''}`}
              onClick={() => setTipo('permanente')}
            >Permanente</button>
          </div>
        </div>

        {tipo === 'dias' && (
          <div className="ban-modal-campo">
            <label>Días de baneo</label>
            <div className="ban-dias-btns">
              {[1, 3, 7, 14, 30, 90].map(d => (
                <button
                  key={d}
                  className={`ban-dias-btn ${dias === d ? 'activo' : ''}`}
                  onClick={() => setDias(d)}
                >{d}d</button>
              ))}
            </div>
            <input
              type="number"
              min={1}
              max={365}
              value={dias}
              onChange={e => setDias(Math.max(1, parseInt(e.target.value) || 1))}
              className="ban-dias-input"
              placeholder="O escribe los días manualmente"
            />
          </div>
        )}

        {tipo === 'permanente' && (
          <p className="ban-aviso-permanente">
            ⚠️ El usuario no podrá iniciar sesión indefinidamente hasta que un administrador lo desbanee manualmente.
          </p>
        )}

        <div className="ban-modal-acciones">
          <button className="ban-btn-cancelar" onClick={onClose} disabled={enviando}>
            Cancelar
          </button>
          <button className="ban-btn-confirmar" onClick={handleConfirm} disabled={enviando}>
            {enviando
              ? '⏳ Baneando...'
              : tipo === 'permanente'
                ? '🔨 Banear permanentemente'
                : `🔨 Banear por ${dias} día${dias !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

/*Componente principal UserList*/
const UserList = ({ users, onDelete, onChangeRole }) => {
  const { user: currentUser } = useAuth();
  const [modalBaneo,    setModalBaneo]    = useState(null);
  const [procesandoBan, setProcesandoBan] = useState(null);
  const [modalMensaje,  setModalMensaje]  = useState(null);

  if (!users || users.length === 0) {
    return (
      <div className="user-list-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2" style={{opacity: 0.3}}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <line x1="23" y1="11" x2="17" y2="11"/>
        </svg>
        <p>No se encontraron usuarios</p>
      </div>
    );
  }

  const currentUserId = currentUser?.id || currentUser?._id;
  const isSuperAdmin  = currentUser?.isSuperAdmin === true;

  const canModify = (targetUser) => {
    const targetId = targetUser._id || targetUser.id;
    if (targetId === currentUserId)       return false;
    if (isSuperAdmin)                     return true;
    if (targetUser.isSuperAdmin)          return false;
    if (targetUser.role === 'admin')      return false;
    return true;
  };

  const canBan = (targetUser) => {
    const targetId = targetUser._id || targetUser.id;
    if (targetId === currentUserId)       return false;
    if (targetUser.isSuperAdmin)          return false;
    if (!isSuperAdmin && targetUser.role === 'admin') return false;
    return true;
  };

  const handleBan = async (userId, motivo, dias) => {
    setProcesandoBan(userId);
    try {
      const { data } = await api.put(`/admin/users/${userId}/ban`, { motivo, dias });
      toast.success(data.message || 'Usuario baneado');
      // Forzar refresco de list
      onChangeRole && onChangeRole(userId, null, '__refresh__');
    } catch (e) {
      toast.error(`❌ ${e.response?.data?.error || 'Error al banear'}`);
      throw e;
    } finally {
      setProcesandoBan(null);
    }
  };

  const handleUnban = async (userId, userName) => {
    if (!window.confirm(`¿Desbanear a ${userName}?`)) return;
    setProcesandoBan(userId);
    try {
      const { data } = await api.put(`/admin/users/${userId}/unban`);
      toast.success(data.message || 'Usuario desbaneado');
      onChangeRole && onChangeRole(userId, null, '__refresh__');
    } catch (e) {
      toast.error(`❌ ${e.response?.data?.error || 'Error al desbanear'}`);
    } finally {
      setProcesandoBan(null);
    }
  };

  const formatBanDate = (date) => {
    if (!date) return 'Permanente';
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  return (
    <div className="user-list-container">
      <div className="user-list-header">
        <h2>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            style={{verticalAlign: 'middle', marginRight: '6px'}}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          Gestión de Usuarios ({users.length})
        </h2>
      </div>

      {/*Tarjetas móvil*/}
      <div className="user-cards-movil">
        {users.map((user) => {
          const targetId      = user._id || user.id;
          const isCurrentUser = targetId === currentUserId;
          const canEdit       = canModify(user);
          const canBanUser    = canBan(user);
          const esBaneado     = user.baneado === true;
          const procesando    = procesandoBan === targetId;

          return (
            <div
              key={targetId}
              className={[
                'user-card-movil',
                esBaneado             ? 'banned-row'      : '',
                user.isSuperAdmin     ? 'super-admin-row' : '',
                user.role === 'admin' ? 'admin-row'       : '',
              ].join(' ')}
            >
              {/* Fila superior: avatar + nombre + email */}
              <div className="ucard-top">
                <div className="user-avatar">
                  {user.avatar
                    ? <img src={user.avatar} alt={user.name} referrerPolicy="no-referrer" />
                    : <div className="avatar-placeholder">{user.name.charAt(0).toUpperCase()}</div>
                  }
                </div>
                <div className="ucard-info">
                  <div className="ucard-name">
                    {user.name}
                    {isCurrentUser && <span className="you-badge"> (Tú)</span>}
                  </div>
                  <div className="ucard-email">{user.email}</div>
                </div>
              </div>

              {/* Fila media: rol + estado baneo */}
              <div className="ucard-mid">
                {canEdit ? (
                  <select
                    value={user.role}
                    onChange={(e) => onChangeRole(user._id, e.target.value)}
                    className={`role-select role-${user.role}`}
                  >
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                  </select>
                ) : (
                  <span className={`badge ${user.isSuperAdmin ? 'super-admin' : user.role === 'admin' ? 'admin' : 'user'}`}>
                    {user.isSuperAdmin ? '⭐ Super Admin' : user.role === 'admin' ? '🛡️ Admin' : '👤 Usuario'}
                  </span>
                )}

                {esBaneado ? (
                  <span className="ban-badge">🔨 Baneado</span>
                ) : (
                  <span className="ban-status-ok">✅ Activo</span>
                )}
              </div>

              {/* Fila inferior: fecha + acciones */}
              <div className="ucard-bottom">
                <span className="ucard-fecha">
                  {new Date(user.createdAt).toLocaleDateString('es-ES', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </span>
                <div className="ucard-actions">
                  {!isCurrentUser && (
                    <button onClick={() => setModalMensaje(user)} className="btn-message" title="Enviar mensaje">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                    </button>
                  )}
                  {canEdit ? (
                    <button onClick={() => onDelete(user._id)} className="btn-delete" title="Eliminar">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  ) : (
                    <span className="protected-badge">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </span>
                  )}
                  {canBanUser && (
                    esBaneado ? (
                      <button className="btn-unban" onClick={() => handleUnban(targetId, user.name)} disabled={procesando}>
                        {procesando ? '⏳' : '✅'}
                      </button>
                    ) : (
                      <button className="btn-ban" onClick={() => setModalBaneo(user)} disabled={procesando}>
                        {procesando ? '⏳' : '🔨'}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/*Tabla desktop*/}
      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Fecha Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const targetId      = user._id || user.id;
              const isCurrentUser = targetId === currentUserId;
              const canEdit       = canModify(user);
              const canBanUser    = canBan(user);
              const esBaneado     = user.baneado === true;
              const procesando    = procesandoBan === targetId;

              return (
                <tr
                  key={user._id}
                  className={
                    esBaneado             ? 'banned-row'      :
                    user.isSuperAdmin     ? 'super-admin-row' :
                    user.role === 'admin' ? 'admin-row'       : ''
                  }
                >
                  {/* Avatar */}
                  <td>
                    <div className="user-avatar">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} referrerPolicy="no-referrer" />
                      ) : (
                        <div className="avatar-placeholder">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Nombre */}
                  <td>
                    <div className="user-name-cell">
                      <span className="user-name">{user.name}</span>
                      {user.googleId && (
                        <span className="google-badge" title="Cuenta de Google">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            style={{verticalAlign: 'middle', marginRight: '2px'}}>
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                          </svg>
                          Google
                        </span>
                      )}
                      {isCurrentUser && <span className="you-badge">(Tú)</span>}
                    </div>
                  </td>

                  {/* Email */}
                  <td>
                    <span className="user-email">{user.email}</span>
                  </td>

                  {/* Rol */}
                  <td>
                    {canEdit ? (
                      <select
                        value={user.role}
                        onChange={(e) => onChangeRole(user._id, e.target.value)}
                        className={`role-select role-${user.role}`}
                      >
                        <option value="user">Usuario</option>
                        <option value="admin">Administrador</option>
                      </select>
                    ) : (
                      <div className="role-badge-readonly">
                        {user.isSuperAdmin ? (
                          <span className="badge super-admin">
                            ⭐ Super Admin {isCurrentUser && '(Tú)'}
                          </span>
                        ) : user.role === 'admin' ? (
                          <span className="badge admin">🛡️ Administrador</span>
                        ) : (
                          <span className="badge user">👤 Usuario</span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Estado baneo */}
                  <td>
                    {esBaneado ? (
                      <div className="ban-status ban-status--activo">
                        <span className="ban-badge">🔨 Baneado</span>
                        <span className="ban-hasta">
                          {user.baneadoHasta ? `Hasta ${formatBanDate(user.baneadoHasta)}` : 'Permanente'}
                        </span>
                        {user.baneadoMotivo && (
                          <span className="ban-motivo" title={user.baneadoMotivo}>
                            "{user.baneadoMotivo.slice(0, 35)}{user.baneadoMotivo.length > 35 ? '…' : ''}"
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="ban-status-ok">✅ Activo</span>
                    )}
                  </td>

                  {/* Fecha registro */}
                  <td>
                    <span className="date-cell">
                      {new Date(user.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td>
                    <div className="action-buttons">

                      {/* Mensaje directo */}
                      {!isCurrentUser && (
                        <button
                          onClick={() => setModalMensaje(user)}
                          className="btn-message"
                          title={`Enviar mensaje a ${user.name}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                          </svg>
                        </button>
                      )}

                      {/* Eliminar */}
                      {canEdit ? (
                        <button
                          onClick={() => onDelete(user._id)}
                          className="btn-delete"
                          title="Eliminar usuario"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                          </svg>
                        </button>
                      ) : (
                        <span
                          className="protected-badge"
                          title={isCurrentUser ? 'No puedes modificarte a ti mismo' : ''}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                        </span>
                      )}

                      {/* Banear / Desbanear */}
                      {canBanUser && (
                        esBaneado ? (
                          <button
                            className="btn-unban"
                            title="Desbanear usuario"
                            onClick={() => handleUnban(targetId, user.name)}
                            disabled={procesando}
                          >
                            {procesando ? '⏳' : '✅ Desbanear'}
                          </button>
                        ) : (
                          <button
                            className="btn-ban"
                            title="Banear usuario"
                            onClick={() => setModalBaneo(user)}
                            disabled={procesando}
                          >
                            {procesando ? '⏳' : '🔨 Banear'}
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal de baneo */}
      {modalBaneo && (
        <ModalBaneo
          user={modalBaneo}
          onClose={() => setModalBaneo(null)}
          onBan={handleBan}
        />
      )}

      {/* Modal de mensaje */}
      {modalMensaje && (
        <ModalMensaje
          user={modalMensaje}
          onClose={() => setModalMensaje(null)}
        />
      )}
    </div>
  );
};

export default UserList;