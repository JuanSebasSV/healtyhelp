import './FondoAnimado.css';

const FondoAnimado = () => {
  return (
    <div className="fondoAnimado">
      <div className="gradientMesh"></div>
      
      <svg style={{position: 'absolute', width: 0, height: 0}}>
        <defs>
          <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="glow-dark-green" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="glow-orange" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
 
      {/* Línea 1: Arriba (infinita) */}
      {/* <div className="ondaLinea ondaLinea1">
        <svg viewBox="0 0 2400 200" preserveAspectRatio="none">
          <path d="M-1200,100 Q-1050,50 -900,100 T-600,100 T-300,100 T0,100 T300,100 T600,100 T900,100 T1200,100 T1500,100 T1800,100 T2100,100 T2400,100 T2700,100 T3000,100 T3300,100 T3600,100" 
                stroke="rgba(79, 119, 45, 0.8)" 
                strokeWidth="3" 
                fill="none"
                filter="url(#glow-green)" />
        </svg>
      </div> */}
      
      {/* Línea 2: Medio (MUY EXTENDIDA - patrón continuo perfecto) */}
      {/* <div className="ondaLinea ondaLinea2">
        <svg viewBox="0 0 4800 200" preserveAspectRatio="none">
          <path d="M-2400,100 Q-2200,30 -2000,100 T-1600,100 T-1200,100 T-800,100 T-400,100 T0,100 T400,100 T800,100 T1200,100 T1600,100 T2000,100 T2400,100 T2800,100 T3200,100 T3600,100 T4000,100 T4400,100 T4800,100 T5200,100 T5600,100 T6000,100 T6400,100 T6800,100 T7200,100" 
                stroke="rgba(26, 77, 46, 0.6)" 
                strokeWidth="2.5" 
                fill="none"
                filter="url(#glow-dark-green)" />
        </svg>
      </div> */}
      
      {/* Línea 3: Abajo (infinita) */}
      {/* <div className="ondaLinea ondaLinea3">
        <svg viewBox="0 0 2400 200" preserveAspectRatio="none">
          <path d="M-1200,100 Q-1100,70 -1000,100 T-800,100 T-600,100 T-400,100 T-200,100 T0,100 T200,100 T400,100 T600,100 T800,100 T1000,100 T1200,100 T1400,100 T1600,100 T1800,100 T2000,100 T2200,100 T2400,100 T2600,100 T2800,100 T3000,100 T3200,100 T3400,100 T3600,100" 
                stroke="rgba(247, 127, 0, 0.15)" 
                strokeWidth="2" 
                fill="none"
                filter="url(#glow-orange)" />
        </svg>
      </div> */}
      

    </div>
  );
};

export default FondoAnimado;