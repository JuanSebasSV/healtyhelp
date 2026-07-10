import { memo } from 'react';
import BtnCampana from './BtnCampana';
import PanelNotificaciones from '../notificaciones/PanelNotificaciones';

const NotifButton = memo(({
  panelAbierto,
  notificaciones,
  noLeidas,
  cargandoNotifs,
  onAbrirPanel,
  onLeerTodas,
  onLeerUna,
  onEliminar,
  onCerrarPanel,
  onNavegar,
}) => (
  <div className="nav-notif-wrap nav-notif-wrap--desktop" data-modal="true">
    <BtnCampana noLeidas={noLeidas} onClick={onAbrirPanel} />
    {panelAbierto && (
      <PanelNotificaciones
        notificaciones={notificaciones}
        noLeidas={noLeidas}
        cargando={cargandoNotifs}
        onLeerTodas={onLeerTodas}
        onLeerUna={onLeerUna}
        onEliminar={onEliminar}
        onCerrar={onCerrarPanel}
        onNavegar={onNavegar}
      />
    )}
  </div>
));
NotifButton.displayName = 'NotifButton';

export default NotifButton;
