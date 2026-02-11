import React, { useState } from 'react';
import ModalNutricionDetallada from './ModalNutricionDetallada';

const NutricionGrafico = ({ nutri, onModalChange }) => {
  const [verDetalle, setVerDetalle] = useState(false);
  
  // Calcular porcentajes para el gráfico
  const totalMacros = nutri.gras + nutri.carb + nutri.prot;
  const porcGras = Math.round((nutri.gras / totalMacros) * 100);
  const porcCarb = Math.round((nutri.carb / totalMacros) * 100);
  const porcProt = Math.round((nutri.prot / totalMacros) * 100);

  // Calcular ángulos para el pie chart (en grados)
  const anguloGras = (porcGras / 100) * 360;
  const anguloCarb = (porcCarb / 100) * 360;
  
  // Función para crear path de arco SVG
  const crearArco = (startAngle, endAngle) => {
    const start = polarACartesiano(100, 100, 80, endAngle);
    const end = polarACartesiano(100, 100, 80, startAngle);
    const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", start.x, start.y,
      "A", 80, 80, 0, largeArc, 0, end.x, end.y,
      "L", 100, 100,
      "Z"
    ].join(" ");
  };

  const polarACartesiano = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  return (
    <>
      <div className="nutri-panel">
        <h3>Nutrición</h3>
        
        {/* Gráfico circular */}
        <svg viewBox="0 0 200 200" className="nutri-chart">
          {/* Fat - Cyan */}
          <path
            d={crearArco(0, anguloGras)}
            fill="#06b6d4"
            stroke="#ffffff"
            strokeWidth="2"
          />
          {/* Carbs - Amarillo */}
          <path
            d={crearArco(anguloGras, anguloGras + anguloCarb)}
            fill="#eab308"
            stroke="#ffffff"
            strokeWidth="2"
          />
          {/* Protein - Morado */}
          <path
            d={crearArco(anguloGras + anguloCarb, 360)}
            fill="#a855f7"
            stroke="#ffffff"
            strokeWidth="2"
          />
          {/* Círculo central blanco */}
          <circle cx="100" cy="100" r="45" fill="var(--blanco)" />
        </svg>

        {/* Leyenda del gráfico */}
        <div className="nutri-leyenda">
          <div className="nutri-leyenda-item">
            <span className="nutri-color" style={{backgroundColor: '#06b6d4'}}></span>
            <span>Grasas {porcGras}%</span>
          </div>
          <div className="nutri-leyenda-item">
            <span className="nutri-color" style={{backgroundColor: '#eab308'}}></span>
            <span>Carbohidratos {porcCarb}%</span>
          </div>
          <div className="nutri-leyenda-item">
            <span className="nutri-color" style={{backgroundColor: '#a855f7'}}></span>
            <span>Proteínas {porcProt}%</span>
          </div>
        </div>

        {/* Tabla de totales vs objetivos */}
        <div className="nutri-tabla-container">
          <table className="nutri-tabla">
            <thead>
              <tr>
                <th>Nutrientes</th>
                <th>Total</th>
                <th>objetivo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Calorias</td>
                <td>{nutri.cal}</td>
                <td>2199</td>
              </tr>
              <tr>
                <td>Carbohidratos</td>
                <td>{nutri.carb}g</td>
                <td>105 - 275g</td>
              </tr>
              <tr>
                <td>Grasas</td>
                <td>{nutri.gras}g</td>
                <td>66 - 123g</td>
              </tr>
              <tr>
                <td>Proteínas</td>
                <td>{nutri.prot}g</td>
                <td>108 - 275g</td>
              </tr>
              <tr>
                <td>Fibra</td>
                <td>{nutri.fiber}g</td>
                <td>25g</td>
              </tr>
              <tr>
                <td>Sodio</td>
                <td>{nutri.sodio}mg</td>
                <td>-</td>
              </tr>
              <tr>
                <td>Colesterol</td>
                <td>{nutri.colesterol}mg</td>
                <td>-</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Botón para ver detalles */}
        <button
          className="btn-primario btn-nutri-detalle"
          onClick={() => {
            setVerDetalle(true);
            if (onModalChange) onModalChange(true);
          }}
        >
          Información Nutricional Detallada
        </button>
      </div>

      {/* Modal detallado */}
      {verDetalle && (
        <ModalNutricionDetallada
          nutri={nutri}
          cerrar={() => {
            setVerDetalle(false);
            if (onModalChange) onModalChange(false);
          }}
        />
      )}
    </>
  );
};

export default NutricionGrafico;