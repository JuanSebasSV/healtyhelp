const NumeroInput = ({
  id, name, value, onChange, placeholder, min, max, step,
}) => {
  const s = parseFloat(step) || 1;
  const increment = () => {
    const v = parseFloat(value) || (min ?? 0);
    if (max !== undefined && v >= max) return;
    onChange({ target: { name, value: String(parseFloat((v + s).toFixed(4))) } });
  };
  const decrement = () => {
    const v = parseFloat(value) || (min ?? 0);
    if (min !== undefined && v <= min) return;
    onChange({ target: { name, value: String(parseFloat((v - s).toFixed(4))) } });
  };
  return (
    <div className="numero-wrapper">
      <input id={id} className="campo-input" type="number" name={name}
        value={value} onChange={onChange} placeholder={placeholder}
        min={min} max={max} step={step} />
      <div className="numero-flechas">
        <button type="button" onClick={increment} aria-label="Incrementar valor">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><polyline points="18 15 12 9 6 15" /></svg>
        </button>
        <button type="button" onClick={decrement} aria-label="Disminuir valor">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
        </button>
      </div>
    </div>
  );
};
NumeroInput.displayName = 'NumeroInput';

export default NumeroInput;
