import { memo } from "react";
import IcoCampana from "./IcoCampana";

const BtnCampana = memo(({ noLeidas, onClick, extraClass = "" }) => (
  <button type="button"
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

export default BtnCampana;
