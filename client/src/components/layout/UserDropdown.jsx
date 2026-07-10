import { memo } from 'react';
import IcoCerrarSesion from './IcoCerrarSesion';
import ToggleSwitch from './ToggleSwitch';

const UserDropdown = memo(({
  dropdownAbierto,
  autoLogout,
  autoLogoutMinutes,
  toggleLoading,
  onCerrarSesion,
  onToggleAutoLogout,
}) => (
  <>
    <button type="button" className="btn-secundario al-btn-trigger" onClick={onCerrarSesion}>
      Cerrar Sesión
    </button>
    {dropdownAbierto && (
      <div className="al-dropdown">
        <button type="button" className="al-dropdown__logout-btn" onClick={onCerrarSesion}>
          <IcoCerrarSesion />
          Cerrar Sesión
        </button>
        <div className="al-dropdown__divider" />
        <div className="al-dropdown__row">
          <div className="al-dropdown__label">
            <span className="al-dropdown__label-title">Cierre automático</span>
            <span className="al-dropdown__label-sub">
              {autoLogout ? `Activo · ${autoLogoutMinutes ?? 15} min sin actividad` : "Inactivo · cierre manual"}
            </span>
          </div>
          <ToggleSwitch enabled={autoLogout} onChange={onToggleAutoLogout} loading={toggleLoading} />
        </div>
      </div>
    )}
  </>
));
UserDropdown.displayName = 'UserDropdown';

export default UserDropdown;
