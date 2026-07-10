const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "1px" }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
InfoIcon.displayName = 'InfoIcon';

const AvisoInline = ({ titulo, mensaje, variante = "naranja" }) => (
  <div className={`aviso-inline aviso-inline--${variante}`}>
    <InfoIcon />
    <span>
      <strong>{titulo}</strong> {mensaje}
    </span>
  </div>
);
AvisoInline.displayName = 'AvisoInline';

const FieldHint = ({ show, items }) => {
  if (!show || !items || items.length === 0) return null;
  if (items.every((i) => i.ok)) return null;
  return (
    <ul className="field-hints">
      {items.map((item) => (
        <li key={item.label} className={item.ok ? "hint-ok" : "hint-pending"}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
            {item.ok ? (
              <polyline points="20 6 9 17 4 12" />
            ) : (
              <circle cx="12" cy="12" r="9" />
            )}
          </svg>
          {item.label}
        </li>
      ))}
    </ul>
  );
};
FieldHint.displayName = 'FieldHint';

export { InfoIcon, AvisoInline, FieldHint };
