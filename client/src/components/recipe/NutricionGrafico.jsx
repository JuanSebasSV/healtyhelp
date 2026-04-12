import React, { useMemo, memo, useCallback } from 'react';
import './NutricionGrafico.css';

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

const FilaNutri = memo(({ label, valor, unidad }) => (
  <div className="nutriFila">
    <span>{label}</span>
    <strong>{valor || 0} {unidad}</strong>
  </div>
));
FilaNutri.displayName = 'FilaNutri';

const FilaDestacada = memo(({ valor }) => (
  <div className="nutriFila nutriFilaDestacada">
    <span>Calorías</span>
    <strong>{valor || 0}</strong>
  </div>
));
FilaDestacada.displayName = 'FilaDestacada';

const NutricionGrafico = memo(({ nutri, abrirNutricion }) => {
  const { porcGras, porcCarb, porcProt, anguloGras, anguloCarb } = useMemo(() => {
    const totalMacros = (nutri.gras || 0) + (nutri.carb || 0) + (nutri.prot || 0);
    const pG = totalMacros > 0 ? Math.round((nutri.gras / totalMacros) * 100) : 0;
    const pC = totalMacros > 0 ? Math.round((nutri.carb / totalMacros) * 100) : 0;
    const pP = totalMacros > 0 ? Math.round((nutri.prot / totalMacros) * 100) : 0;
    return {
      porcGras: pG,
      porcCarb: pC,
      porcProt: pP,
      anguloGras: (pG / 100) * 360,
      anguloCarb: (pC / 100) * 360,
    };
  }, [nutri.gras, nutri.carb, nutri.prot]);

  const arcos = useMemo(() => ({
    gras: crearArco(0, anguloGras),
    carb: crearArco(anguloGras, anguloGras + anguloCarb),
    prot: crearArco(anguloGras + anguloCarb, 360),
  }), [anguloGras, anguloCarb]);

  const handleNutricion = useCallback((e) => {
    e.stopPropagation();
    abrirNutricion();
  }, [abrirNutricion]);

  return (
    <div className="nutriPanel">
      <h3>Nutrición</h3>

      <svg viewBox="0 0 200 200" className="nutriChart" aria-hidden="true">
        <path d={arcos.gras} fill="#06b6d4" stroke="none" />
        <path d={arcos.carb} fill="#eab308" stroke="none" />
        <path d={arcos.prot} fill="#a855f7" stroke="none" />
        <circle cx="100" cy="100" r="48" fill="rgba(15, 35, 20, 0.7)" />
        <text x="100" y="96"  textAnchor="middle" fontSize="20" fontWeight="800" fill="rgba(255,255,255,0.9)">{nutri.cal || 0}</text>
        <text x="100" y="112" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.45)">kcal</text>
      </svg>

      <div className="nutriLeyenda">
        <div className="nutriLeyendaItem">
          <span className="nutriColor" style={{ backgroundColor: '#06b6d4' }} />
          <span>Grasas {porcGras}%</span>
        </div>
        <div className="nutriLeyendaItem">
          <span className="nutriColor" style={{ backgroundColor: '#eab308' }} />
          <span>Carbohidratos {porcCarb}%</span>
        </div>
        <div className="nutriLeyendaItem">
          <span className="nutriColor" style={{ backgroundColor: '#a855f7' }} />
          <span>Proteínas {porcProt}%</span>
        </div>
      </div>

      <div className="nutriTablaContainer">
        <div className="nutriSeccion">
          <span className="nutriSeccionTitulo">Nutrientes</span>
          <FilaDestacada valor={nutri.cal} />
        </div>
        <div className="nutriSeccion">
          <span className="nutriSeccionTitulo">Macronutrientes</span>
          <FilaNutri label="Carbohidratos" valor={nutri.carb} unidad="g" />
          <FilaNutri label="Grasas"        valor={nutri.gras} unidad="g" />
          <FilaNutri label="Proteínas"     valor={nutri.prot} unidad="g" />
        </div>
        <div className="nutriSeccion">
          <span className="nutriSeccionTitulo">Otros</span>
          <FilaNutri label="Carbohidratos netos" valor={nutri.carbNetos}   unidad="g"  />
          <FilaNutri label="Fibra"               valor={nutri.fiber}       unidad="g"  />
          <FilaNutri label="Sodio"               valor={nutri.sodio}       unidad="mg" />
          <FilaNutri label="Colesterol"          valor={nutri.colesterol}  unidad="mg" />
        </div>
        <div className="nutriSeccion">
          <span className="nutriSeccionTitulo">Minerales principales</span>
          <FilaNutri label="Calcio"     valor={nutri.calcio}   unidad="mg" />
          <FilaNutri label="Hierro"     valor={nutri.hierro}   unidad="mg" />
          <FilaNutri label="Potasio"    valor={nutri.potasio}  unidad="mg" />
          <FilaNutri label="Vitamina D" valor={nutri.vitD}     unidad="µg" />
        </div>
      </div>

      <button className="btnNutriDetalle" onClick={handleNutricion}>
        Información Nutricional Detallada
      </button>
    </div>
  );
});

NutricionGrafico.displayName = 'NutricionGrafico';

export default NutricionGrafico;