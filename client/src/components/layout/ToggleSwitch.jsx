import { memo } from "react";

const ToggleSwitch = memo(({ enabled, onChange, loading = false }) => (
  <div
    className={`al-toggle${enabled ? " al-toggle--on" : ""}${loading ? " al-toggle-loading" : ""}`}
    role="switch"
    tabIndex={loading ? -1 : 0}
    aria-checked={enabled}
    aria-disabled={loading}
    aria-label="Cierre automático de sesión"
    onClick={(e) => { e.stopPropagation(); e.preventDefault(); if (!loading) onChange(e); }}
    onKeyDown={(e) => {
      if (loading) return;
      if (e.key === "Enter" || e.key === " ") {
        e.stopPropagation();
        e.preventDefault();
        onChange(e);
      }
    }}
    onPointerDown={(e) => e.stopPropagation()}
    onTouchStart={(e) => e.stopPropagation()}
  >
    <span className="al-toggle__thumb" />
  </div>
));
ToggleSwitch.displayName = "ToggleSwitch";

export default ToggleSwitch;
