import { memo } from 'react';
import { createPortal } from 'react-dom';
import IcoCerrarSesion from './IcoCerrarSesion';
import ToggleSwitch from './ToggleSwitch';

const ModalCerrarSesion = memo(({
  autoLogout,
  autoLogoutMinutes,
  toggleLoading,
  onClose,
  onConfirm,
  onToggleAutoLogout,
}) => createPortal(
  <div className="al-modal-overlay" data-modal="true"
    role="button" tabIndex={0}
    onClick={onClose}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClose(); }}}
    onTouchStart={(e) => { if (e.target === e.currentTarget) onClose(); }}>
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
            {autoLogout ? `Activo · ${autoLogoutMinutes ?? 15} min sin actividad` : "Inactivo · cierre manual"}
          </span>
        </div>
        <ToggleSwitch enabled={autoLogout} onChange={onToggleAutoLogout} loading={toggleLoading} />
      </div>
      <div className="al-modal__actions">
        <button type="button" className="al-modal__btn-cancelar" onClick={onClose}>
          Cancelar
        </button>
        <button type="button" className="al-modal__btn-confirmar" onClick={onConfirm}>
          Sí, cerrar sesión
        </button>
      </div>
    </div>
  </div>,
  document.body,
));
ModalCerrarSesion.displayName = 'ModalCerrarSesion';

export default ModalCerrarSesion;
