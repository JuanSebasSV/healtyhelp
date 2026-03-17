import { useState } from 'react';
import './ResumenNutricional.css';

const SECCIONES = [
  {
    titulo: 'Macronutrientes',
    campos: [
      { key: 'cal',      label: 'Calorías',          unidad: 'kcal', destaca: true },
      { key: 'carb',     label: 'Carbohidratos',      unidad: 'g' },
      { key: 'gras',     label: 'Grasas',             unidad: 'g' },
      { key: 'prot',     label: 'Proteínas',          unidad: 'g' },
      { key: 'carbNetos',label: 'Carb. netos',        unidad: 'g' },
      { key: 'fiber',    label: 'Fibra',              unidad: 'g' },
    ],
  },
  {
    titulo: 'Minerales principales',
    campos: [
      { key: 'sodio',     label: 'Sodio',     unidad: 'mg' },
      { key: 'colesterol',label: 'Colesterol',unidad: 'mg' },
      { key: 'calcio',    label: 'Calcio',    unidad: 'mg' },
      { key: 'hierro',    label: 'Hierro',    unidad: 'mg' },
      { key: 'potasio',   label: 'Potasio',   unidad: 'mg' },
      { key: 'magnesio',  label: 'Magnesio',  unidad: 'mg' },
      { key: 'fosforo',   label: 'Fósforo',   unidad: 'mg' },
      { key: 'zinc',      label: 'Zinc',      unidad: 'mg' },
    ],
  },
  {
    titulo: 'Vitaminas',
    campos: [
      { key: 'vitA',      label: 'Vitamina A',   unidad: 'µg' },
      { key: 'vitB6',     label: 'Vitamina B6',  unidad: 'mg' },
      { key: 'vitB12',    label: 'Vitamina B12', unidad: 'µg' },
      { key: 'vitC',      label: 'Vitamina C',   unidad: 'mg' },
      { key: 'vitD',      label: 'Vitamina D',   unidad: 'µg' },
      { key: 'vitE',      label: 'Vitamina E',   unidad: 'mg' },
      { key: 'vitK',      label: 'Vitamina K',   unidad: 'µg' },
      { key: 'folato',    label: 'Folato (B9)',   unidad: 'µg' },
      { key: 'niacina',   label: 'Niacina (B3)', unidad: 'mg' },
      { key: 'tiamina',   label: 'Tiamina (B1)', unidad: 'mg' },
      { key: 'riboflavina',label:'Riboflavina(B2)',unidad: 'mg' },
    ],
  },
  {
    titulo: 'Grasas detalladas',
    campos: [
      { key: 'grasSat',    label: 'Saturadas',      unidad: 'g' },
      { key: 'grasMonoins',label: 'Monoinsaturadas',unidad: 'g' },
      { key: 'grasPoliins',label: 'Poliinsaturadas',unidad: 'g' },
      { key: 'grasTrans',  label: 'Trans',          unidad: 'g' },
      { key: 'omega3',     label: 'Omega 3',        unidad: 'g' },
      { key: 'omega6',     label: 'Omega 6',        unidad: 'g' },
    ],
  },
  {
    titulo: 'Azúcares',
    campos: [
      { key: 'azucar',   label: 'Azúcar total', unidad: 'g' },
      { key: 'glucosa',  label: 'Glucosa',      unidad: 'g' },
      { key: 'fructosa', label: 'Fructosa',     unidad: 'g' },
      { key: 'lactosa',  label: 'Lactosa',      unidad: 'g' },
      { key: 'sacarosa', label: 'Sacarosa',     unidad: 'g' },
    ],
  },
];

const PERIODO_LABEL = { dia: 'hoy', semana: 'esta semana', mes: 'este mes' };

const ResumenNutricional = ({ nutri, periodo, totalConsumos }) => {
  const [seccionAbierta, setSeccionAbierta] = useState('Macronutrientes');

  if (totalConsumos === 0) {
    return (
      <div className="resumen-nutri-panel resumen-vacio">
        <div className="resumen-vacio-icono">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="20" x2="12" y2="10"/>
            <line x1="18" y1="20" x2="18" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="16"/>
          </svg>
        </div>
        <p>Selecciona un período con registros para ver los aportes nutricionales.</p>
      </div>
    );
  }

  const totalMacros = (nutri.gras || 0) + (nutri.carb || 0) + (nutri.prot || 0);
  const porcGras = totalMacros > 0 ? Math.round((nutri.gras / totalMacros) * 100) : 0;
  const porcCarb = totalMacros > 0 ? Math.round((nutri.carb / totalMacros) * 100) : 0;
  const porcProt = totalMacros > 0 ? Math.round((nutri.prot / totalMacros) * 100) : 0;

  const anguloGras = (porcGras / 100) * 360;
  const anguloCarb = (porcCarb / 100) * 360;

  const polar = (cx, cy, r, deg) => {
    const rad = (deg - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };
  const arco = (start, end) => {
    if (end - start >= 360) end = 359.99;
    const s = polar(100, 100, 80, end);
    const e = polar(100, 100, 80, start);
    return `M ${s.x} ${s.y} A 80 80 0 ${end - start > 180 ? 1 : 0} 0 ${e.x} ${e.y} L 100 100 Z`;
  };

  return (
    <div className="resumen-nutri-panel">
      <h3 className="resumen-titulo">
        Aportes nutricionales
        <span className="resumen-periodo-badge">{PERIODO_LABEL[periodo]}</span>
      </h3>
      <p className="resumen-subtitulo">{totalConsumos} comida{totalConsumos !== 1 ? 's' : ''} registrada{totalConsumos !== 1 ? 's' : ''}</p>

      {/* Gráfica dona */}
      <svg viewBox="0 0 200 200" className="resumen-chart">
        <path d={arco(0, anguloGras)}                       fill="#06b6d4" />
        <path d={arco(anguloGras, anguloGras + anguloCarb)} fill="#eab308" />
        <path d={arco(anguloGras + anguloCarb, 360)}        fill="#a855f7" />
        <circle cx="100" cy="100" r="48" fill="rgba(15,35,20,0.75)" />
        <text x="100" y="95"  textAnchor="middle" fontSize="28" fontWeight="800" fill="rgba(255,255,255,0.95)">{nutri.cal || 0}</text>
        <text x="100" y="115" textAnchor="middle" fontSize="12" fill="rgba(255,255,255,0.55)">kcal totales</text>
      </svg>

      <div className="resumen-leyenda">
        <span><i style={{ background: '#06b6d4' }}></i> Grasas {porcGras}%</span>
        <span><i style={{ background: '#eab308' }}></i> Carbs {porcCarb}%</span>
        <span><i style={{ background: '#a855f7' }}></i> Prot. {porcProt}%</span>
      </div>

      {/* Acordeón de secciones */}
      <div className="resumen-acordeon">
        {SECCIONES.map(sec => (
          <div key={sec.titulo} className="resumen-sec">
            <button
              className={`resumen-sec-header ${seccionAbierta === sec.titulo ? 'abierto' : ''}`}
              onClick={() => setSeccionAbierta(seccionAbierta === sec.titulo ? null : sec.titulo)}
            >
              {sec.titulo}
              <span>{seccionAbierta === sec.titulo ? '▲' : '▼'}</span>
            </button>
            {seccionAbierta === sec.titulo && (
              <div className="resumen-sec-body">
                {sec.campos.map(({ key, label, unidad, destaca }) => (
                  <div key={key} className={`resumen-fila ${destaca ? 'destaca' : ''}`}>
                    <span>{label}</span>
                    <strong>{nutri[key] ?? 0} {unidad}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResumenNutricional;