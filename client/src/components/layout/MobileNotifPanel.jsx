import { memo } from 'react';
import { createPortal } from 'react-dom';
import PanelNotificaciones from '../notificaciones/PanelNotificaciones';

const MobileNotifPanel = memo(({
  notificaciones,
  noLeidas,
  cargandoNotifs,
  onLeerTodas,
  onLeerUna,
  onEliminar,
  onCerrar,
  onNavegar,
}) => createPortal(
  <div className="pn-modal-movil" data-modal="true" role="button" tabIndex={0} onClick={onCerrar} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCerrar(); }}}>
    <div className="pn-modal-movil__contenido" onClick={(e) => e.stopPropagation()}>
      <PanelNotificaciones
        notificaciones={notificaciones}
        noLeidas={noLeidas}
        cargando={cargandoNotifs}
        onLeerTodas={onLeerTodas}
        onLeerUna={onLeerUna}
        onEliminar={onEliminar}
        onCerrar={onCerrar}
        onNavegar={onNavegar}
        esMobil={true}
      />
    </div>
  </div>,
  document.body,
));
MobileNotifPanel.displayName = 'MobileNotifPanel';

export default MobileNotifPanel;
