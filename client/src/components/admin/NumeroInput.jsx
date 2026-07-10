import { memo, useCallback } from 'react';

const NumeroInput = memo(({ id, value, onChange, min, max, step, name, placeholder }) => {
  const s = parseFloat(step) || 1;
  const safeValue = value ?? '';

  const increment = useCallback(() => {
    const v = parseFloat(safeValue) || (min ?? 0);
    if (max !== undefined && v >= max) return;
    onChange({ target: { name, value: String(parseFloat((v + s).toFixed(4))) } });
  }, [safeValue, min, max, s, name, onChange]);

  const decrement = useCallback(() => {
    const v = parseFloat(safeValue) || (min ?? 0);
    if (min !== undefined && v <= min) return;
    onChange({ target: { name, value: String(parseFloat((v - s).toFixed(4))) } });
  }, [safeValue, min, s, name, onChange]);

  return (
    <div className="numero-wrapper">
      <input
        id={id}
        type="number"
        name={name}
        value={safeValue}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        style={{ width: '100%', paddingRight: '2.2rem' }}
      />
      <div className="numero-flechas">
        <button type="button" onClick={increment} aria-label="Incrementar valor">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>
        </button>
        <button type="button" onClick={decrement} aria-label="Disminuir valor">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </div>
    </div>
  );
});
NumeroInput.displayName = 'NumeroInput';

export default NumeroInput;
