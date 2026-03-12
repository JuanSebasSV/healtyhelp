import React from 'react';
import './NutricionGrafico.css';

const NutricionGrafico = ({ nutri, abrirNutricion }) => {
  const totalMacros = (nutri.gras || 0) + (nutri.carb || 0) + (nutri.prot || 0);
  const porcGras = totalMacros > 0 ? Math.round((nutri.gras / totalMacros) * 100) : 0;
  const porcCarb = totalMacros > 0 ? Math.round((nutri.carb / totalMacros) * 100) : 0;
  const porcProt = totalMacros > 0 ? Math.round((nutri.prot / totalMacros) * 100) : 0;

  const anguloGras = (porcGras / 100) * 360;
  const anguloCarb = (porcCarb / 100) * 360;

  const polarACartesiano = (cx, cy, r, angleDeg) => {
    const rad = (angleDeg - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const crearArco = (start, end) => {
    if (end - start >= 360) end = 359.99;
    const s = polarACartesiano(100, 100, 80, end);
    const e = polarACartesiano(100, 100, 80, start);
    const large = end - start > 180 ? '1' : '0';
    return `M ${s.x} ${s.y} A 80 80 0 ${large} 0 ${e.x} ${e.y} L 100 100 Z`;
  };

  return (
    <div className="nutriPanel">
      <h3>Nutrición</h3>

      <svg viewBox="0 0 200 200" className="nutriChart">
        <path d={crearArco(0, anguloGras)}                        fill="#06b6d4" stroke="none" />
        <path d={crearArco(anguloGras, anguloGras + anguloCarb)}  fill="#eab308" stroke="none" />
        <path d={crearArco(anguloGras + anguloCarb, 360)}         fill="#a855f7" stroke="none" />
        <circle cx="100" cy="100" r="48" fill="rgba(15, 35, 20, 0.7)" />
        <text x="100" y="96"  textAnchor="middle" fontSize="20" fontWeight="800" fill="rgba(255,255,255,0.9)">{nutri.cal || 0}</text>
        <text x="100" y="112" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.45)">kcal</text>
      </svg>

      <div className="nutriLeyenda">
        <div className="nutriLeyendaItem">
          <span className="nutriColor" style={{ backgroundColor: '#06b6d4' }}></span>
          <span>Grasas {porcGras}%</span>
        </div>
        <div className="nutriLeyendaItem">
          <span className="nutriColor" style={{ backgroundColor: '#eab308' }}></span>
          <span>Carbohidratos {porcCarb}%</span>
        </div>
        <div className="nutriLeyendaItem">
          <span className="nutriColor" style={{ backgroundColor: '#a855f7' }}></span>
          <span>Proteínas {porcProt}%</span>
        </div>
      </div>

      <div className="nutriTablaContainer">
        <div className="nutriSeccion">
          <span className="nutriSeccionTitulo">Nutrientes</span>
          <div className="nutriFila nutriFilaDestacada">
            <span>Calorías</span>
            <strong>{nutri.cal || 0}</strong>
          </div>
        </div>
        <div className="nutriSeccion">
          <span className="nutriSeccionTitulo">Macronutrientes</span>
          <div className="nutriFila"><span>Carbohidratos</span><strong>{nutri.carb || 0} g</strong></div>
          <div className="nutriFila"><span>Grasas</span><strong>{nutri.gras || 0} g</strong></div>
          <div className="nutriFila"><span>Proteínas</span><strong>{nutri.prot || 0} g</strong></div>
        </div>
        <div className="nutriSeccion">
          <span className="nutriSeccionTitulo">Otros</span>
          <div className="nutriFila"><span>Carbohidratos netos</span><strong>{nutri.carbNetos || 0} g</strong></div>
          <div className="nutriFila"><span>Fibra</span><strong>{nutri.fiber || 0} g</strong></div>
          <div className="nutriFila"><span>Sodio</span><strong>{nutri.sodio || 0} mg</strong></div>
          <div className="nutriFila"><span>Colesterol</span><strong>{nutri.colesterol || 0} mg</strong></div>
        </div>
        <div className="nutriSeccion">
          <span className="nutriSeccionTitulo">Minerales principales</span>
          <div className="nutriFila"><span>Calcio</span><strong>{nutri.calcio || 0} mg</strong></div>
          <div className="nutriFila"><span>Hierro</span><strong>{nutri.hierro || 0} mg</strong></div>
          <div className="nutriFila"><span>Potasio</span><strong>{nutri.potasio || 0} mg</strong></div>
          <div className="nutriFila"><span>Vitamina D</span><strong>{nutri.vitD || 0} µg</strong></div>
        </div>
      </div>

      <button className="btnNutriDetalle" onClick={e => { e.stopPropagation(); abrirNutricion(); }}>
        Información Nutricional Detallada
      </button>
    </div>
  );
};

export default NutricionGrafico;