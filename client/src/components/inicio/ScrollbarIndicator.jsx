import { memo } from 'react';

const ScrollbarIndicator = memo(({
  trackRef,
  thumbRef,
  isDragging,
  onMouseDown,
  onKeyDown,
}) => (
  <div className="scrollbar-custom-track" ref={trackRef}>
    <div
      ref={thumbRef}
      className={`scrollbar-custom-thumb${isDragging ? ' scrollbar-custom-thumb--dragging' : ''}`}
      role="slider"
      tabIndex={0}
      aria-label="Indicador de scroll de página"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      onMouseDown={onMouseDown}
      onKeyDown={onKeyDown}
    />
  </div>
));
ScrollbarIndicator.displayName = 'ScrollbarIndicator';

export default ScrollbarIndicator;
