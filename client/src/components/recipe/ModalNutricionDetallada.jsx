import React from 'react';
import './ModalNutricionDetallada.css';

const ModalNutricionDetallada = ({ nutri, cerrar }) => {
  return (
    <div className="modal-overlay" onClick={cerrar}>
      <button className="modal-cerrar" onClick={cerrar}>✕</button>
      
      <div className="modalNutriDetalle" onClick={(e) => e.stopPropagation()}>
        <h2>Información Nutricional Detallada</h2>

        {/* Macronutrientes */}
        <div className="nutriDetalleSeccion">
          <h3>Macronutrientes</h3>
          <div className="nutriGridDetalle">
            <div className="nutriItemDetalle">
              <span className="nutriNombre">Calorías</span>
              <span className="nutriValor">{nutri.cal}</span>
              <span className="nutriDv">-</span>
            </div>
            <div className="nutriItemDetalle">
              <span className="nutriNombre">Carbohidratos</span>
              <span className="nutriValor">{nutri.carb}g</span>
              <span className="nutriDv">{Math.round((nutri.carb / 275) * 100)}%</span>
            </div>
            <div className="nutriItemDetalle">
              <span className="nutriNombre">Grasas Totales</span>
              <span className="nutriValor">{nutri.gras}g</span>
              <span className="nutriDv">{Math.round((nutri.gras / 78) * 100)}%</span>
            </div>
            <div className="nutriItemDetalle">
              <span className="nutriNombre">Proteínas</span>
              <span className="nutriValor">{nutri.prot}g</span>
              <span className="nutriDv">{Math.round((nutri.prot / 50) * 100)}%</span>
            </div>
            <div className="nutriItemDetalle">
              <span className="nutriNombre">Fibra Dietética</span>
              <span className="nutriValor">{nutri.fiber}g</span>
              <span className="nutriDv">{Math.round((nutri.fiber / 25) * 100)}%</span>
            </div>
            <div className="nutriItemDetalle">
              <span className="nutriNombre">Azúcares</span>
              <span className="nutriValor">{nutri.azucar || 0}g</span>
              <span className="nutriDv">-</span>
            </div>
          </div>
        </div>

        {/* Grasas */}
        <div className="nutriDetalleSeccion">
          <h3>Tipos de Grasas</h3>
          <div className="nutriGridDetalle">
            <div className="nutriItemDetalle">
              <span className="nutriNombre">Grasas Saturadas</span>
              <span className="nutriValor">{nutri.grasSat || 0}g</span>
              <span className="nutriDv">{nutri.grasSat ? Math.round((nutri.grasSat / 20) * 100) : 0}%</span>
            </div>
            <div className="nutriItemDetalle">
              <span className="nutriNombre">Grasas Trans</span>
              <span className="nutriValor">{nutri.grasTrans || 0}g</span>
              <span className="nutriDv">-</span>
            </div>
            <div className="nutriItemDetalle">
              <span className="nutriNombre">Grasas Monoinsaturadas</span>
              <span className="nutriValor">{nutri.grasMono || 0}g</span>
              <span className="nutriDv">-</span>
            </div>
            <div className="nutriItemDetalle">
              <span className="nutriNombre">Grasas Poliinsaturadas</span>
              <span className="nutriValor">{nutri.grasPoli || 0}g</span>
              <span className="nutriDv">-</span>
            </div>
          </div>
        </div>

        {/* Minerales */}
        <div className="nutriDetalleSeccion">
          <h3>Minerales</h3>
          <div className="nutriGridDetalle nutriGrid3col">
            <div className="nutriItemDetalle">
              <span className="nutriNombre">Sodio</span>
              <span className="nutriValor">{nutri.sodio}mg</span>
              <span className="nutriDv">{Math.round((nutri.sodio / 2300) * 100)}%</span>
            </div>
            <div className="nutriItemDetalle">
              <span className="nutriNombre">Potasio</span>
              <span className="nutriValor">{nutri.potasio || 0}mg</span>
              <span className="nutriDv">{nutri.potasio ? Math.round((nutri.potasio / 3500) * 100) : 0}%</span>
            </div>
            <div className="nutriItemDetalle">
              <span className="nutriNombre">Calcio</span>
              <span className="nutriValor">{nutri.calcio || 0}mg</span>
              <span className="nutriDv">{nutri.calcio ? Math.round((nutri.calcio / 1000) * 100) : 0}%</span>
            </div>
            <div className="nutriItemDetalle">
              <span className="nutriNombre">Hierro</span>
              <span className="nutriValor">{nutri.hierro || 0}mg</span>
              <span className="nutriDv">{nutri.hierro ? Math.round((nutri.hierro / 18) * 100) : 0}%</span>
            </div>
            <div className="nutriItemDetalle">
              <span className="nutriNombre">Magnesio</span>
              <span className="nutriValor">{nutri.magnesio || 0}mg</span>
              <span className="nutriDv">{nutri.magnesio ? Math.round((nutri.magnesio / 400) * 100) : 0}%</span>
            </div>
            <div className="nutriItemDetalle">
              <span className="nutriNombre">Zinc</span>
              <span className="nutriValor">{nutri.zinc || 0}mg</span>
              <span className="nutriDv">{nutri.zinc ? Math.round((nutri.zinc / 11) * 100) : 0}%</span>
            </div>
          </div>
        </div>

        {/* Vitaminas */}
        <div className="nutriDetalleSeccion">
          <h3>Vitaminas</h3>
          <div className="nutriGridDetalle nutriGrid3col">
            <div className="nutriItemDetalle">
              <span className="nutriNombre">Vitamina A</span>
              <span className="nutriValor">{nutri.vitA || 0}IU</span>
              <span className="nutriDv">{nutri.vitA ? Math.round((nutri.vitA / 5000) * 100) : 0}%</span>
            </div>
            <div className="nutriItemDetalle">
              <span className="nutriNombre">Vitamina C</span>
              <span className="nutriValor">{nutri.vitC || 0}mg</span>
              <span className="nutriDv">{nutri.vitC ? Math.round((nutri.vitC / 90) * 100) : 0}%</span>
            </div>
            <div className="nutriItemDetalle">
              <span className="nutriNombre">Vitamina D</span>
              <span className="nutriValor">{nutri.vitD || 0}IU</span>
              <span className="nutriDv">{nutri.vitD ? Math.round((nutri.vitD / 800) * 100) : 0}%</span>
            </div>
            <div className="nutriItemDetalle">
              <span className="nutriNombre">Vitamina E</span>
              <span className="nutriValor">{nutri.vitE || 0}mg</span>
              <span className="nutriDv">{nutri.vitE ? Math.round((nutri.vitE / 15) * 100) : 0}%</span>
            </div>
            <div className="nutriItemDetalle">
              <span className="nutriNombre">Vitamina K</span>
              <span className="nutriValor">{nutri.vitK || 0}µg</span>
              <span className="nutriDv">{nutri.vitK ? Math.round((nutri.vitK / 120) * 100) : 0}%</span>
            </div>
            <div className="nutriItemDetalle">
              <span className="nutriNombre">Vitamina B12</span>
              <span className="nutriValor">{nutri.vitB12 || 0}µg</span>
              <span className="nutriDv">{nutri.vitB12 ? Math.round((nutri.vitB12 / 2.4) * 100) : 0}%</span>
            </div>
          </div>
        </div>

        {/* Otros */}
        <div className="nutriDetalleSeccion">
          <h3>Otros Nutrientes</h3>
          <div className="nutriGridSimple">
            <div className="nutriItemSimple">
              <span>Colesterol</span>
              <strong>{nutri.colesterol}mg</strong>
              <span className="nutriDvInline">{Math.round((nutri.colesterol / 300) * 100)}% DV</span>
            </div>
            <div className="nutriItemSimple">
              <span>Agua</span>
              <strong>{nutri.agua || 0}g</strong>
            </div>
            <div className="nutriItemSimple">
              <span>Cafeína</span>
              <strong>{nutri.cafeina || 0}mg</strong>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(247, 127, 0, 0.1)', borderRadius: '10px', fontSize: '0.9rem', color: 'var(--gris-oscuro)' }}>
          <strong>Nota:</strong> Los valores diarios (DV) están basados en una dieta de 2000 calorías. 
          Tus valores diarios pueden ser mayores o menores dependiendo de tus necesidades calóricas.
        </div>
      </div>
    </div>
  );
};

export default ModalNutricionDetallada;
