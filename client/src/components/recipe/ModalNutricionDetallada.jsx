import React, { useEffect } from 'react';

const ModalNutricionDetallada = ({ nutri, cerrar }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="modal-overlay" onClick={cerrar}>
      <div className="modal-contenido modal-nutri-detalle modal-nutri-amplio" onClick={(e) => e.stopPropagation()}>
        <button className="modal-cerrar" onClick={cerrar}>✕</button>
        <h2>Nutrición Detallada</h2>
        
        {/* Sección principal de nutrientes */}
        <div className="nutri-detalle-seccion">
          <h3>Mis Objetivos Nutricionales</h3>
          <table className="tabla-nutri-completa">
            <thead>
              <tr>
                <th>Nutriente</th>
                <th>Cantidad</th>
                <th>Objetivo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Calorías</td>
                <td>{nutri.cal}</td>
                <td>2199</td>
              </tr>
              <tr>
                <td>● Carbohidratos</td>
                <td>{nutri.carb}g</td>
                <td>105 - 275g</td>
              </tr>
              <tr>
                <td>● Grasas</td>
                <td>{nutri.gras}g</td>
                <td>66 - 123g</td>
              </tr>
              <tr>
                <td>● Proteínas</td>
                <td>{nutri.prot}g</td>
                <td>108 - 275g</td>
              </tr>
              <tr>
                <td>Carbohidratos Netos</td>
                <td>{nutri.carbNetos}g</td>
                <td>-</td>
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
              <tr>
                <td>Calcio</td>
                <td>{nutri.calcio} mg</td>
                <td>{Math.round((nutri.calcio / 1000) * 100)}%</td>
              </tr>
              <tr>
                <td>Hierro</td>
                <td>{nutri.hierro} mg</td>
                <td>{Math.round((nutri.hierro / 8) * 100)}%</td>
              </tr>
              <tr>
                <td>Potasio</td>
                <td>{nutri.potasio} mg</td>
                <td>{Math.round((nutri.potasio / 4700) * 100)}%</td>
              </tr>
              <tr>
                <td>Vitamina D</td>
                <td>{nutri.vitD} μg</td>
                <td>{Math.round((nutri.vitD / 15) * 100)}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Vitaminas y Minerales */}
        <div className="nutri-detalle-seccion">
          <h3>Vitaminas y Minerales</h3>
          <div className="nutri-grid-detalle nutri-grid-3col">
            <div className="nutri-item-detalle">
              <span className="nutri-nombre">Alfa caroteno</span>
              <span className="nutri-valor">{nutri.alphaCaroteno} μg</span>
              <span className="nutri-dv">–</span>
            </div>
            <div className="nutri-item-detalle">
              <span className="nutri-nombre">Beta caroteno</span>
              <span className="nutri-valor">{nutri.betaCaroteno} μg</span>
              <span className="nutri-dv">–</span>
            </div>
            <div className="nutri-item-detalle">
              <span className="nutri-nombre">Cafeína</span>
              <span className="nutri-valor">{nutri.cafeina} mg</span>
              <span className="nutri-dv">–</span>
            </div>
            <div className="nutri-item-detalle">
              <span className="nutri-nombre">Colina</span>
              <span className="nutri-valor">{nutri.colina} mg</span>
              <span className="nutri-dv">{Math.round((nutri.colina / 550) * 100)}%</span>
            </div>
            <div className="nutri-item-detalle">
              <span className="nutri-nombre">Cobre</span>
              <span className="nutri-valor">{nutri.cobre} mg</span>
              <span className="nutri-dv">{Math.round((nutri.cobre / 0.9) * 100)}%</span>
            </div>
            <div className="nutri-item-detalle">
              <span className="nutri-nombre">Fluoruro</span>
              <span className="nutri-valor">{nutri.fluoruro} μg</span>
              <span className="nutri-dv">–</span>
            </div>
            <div className="nutri-item-detalle">
              <span className="nutri-nombre">Folato (B9)</span>
              <span className="nutri-valor">{nutri.folato} μg</span>
              <span className="nutri-dv">{Math.round((nutri.folato / 400) * 100)}%</span>
            </div>
            <div className="nutri-item-detalle">
              <span className="nutri-nombre">Licopeno</span>
              <span className="nutri-valor">{nutri.licopeno} μg</span>
              <span className="nutri-dv">–</span>
            </div>
            <div className="nutri-item-detalle">
              <span className="nutri-nombre">Magnesio</span>
              <span className="nutri-valor">{nutri.magnesio} mg</span>
              <span className="nutri-dv">{Math.round((nutri.magnesio / 400) * 100)}%</span>
            </div>
            <div className="nutri-item-detalle">
              <span className="nutri-nombre">Manganeso</span>
              <span className="nutri-valor">{nutri.manganeso} mg</span>
              <span className="nutri-dv">{Math.round((nutri.manganeso / 2.3) * 100)}%</span>
            </div>
            <div className="nutri-item-detalle">
              <span className="nutri-nombre">Niacina</span>
              <span className="nutri-valor">{nutri.niacina} mg</span>
              <span className="nutri-dv">{Math.round((nutri.niacina / 16) * 100)}%</span>
            </div>
            <div className="nutri-item-detalle">
              <span className="nutri-nombre">Ácido pantoténico</span>
              <span className="nutri-valor">{nutri.acPantotenico} mg</span>
              <span className="nutri-dv">{Math.round((nutri.acPantotenico / 5) * 100)}%</span>
            </div>
            <div className="nutri-item-detalle">
              <span className="nutri-nombre">Fósforo</span>
              <span className="nutri-valor">{nutri.fosforo} mg</span>
              <span className="nutri-dv">{Math.round((nutri.fosforo / 700) * 100)}%</span>
            </div>
            <div className="nutri-item-detalle">
              <span className="nutri-nombre">Retinol</span>
              <span className="nutri-valor">{nutri.retinol} μg</span>
              <span className="nutri-dv">–</span>
            </div>
            <div className="nutri-item-detalle">
              <span className="nutri-nombre">Riboflavina (B2)</span>
              <span className="nutri-valor">{nutri.riboflavina} mg</span>
              <span className="nutri-dv">{Math.round((nutri.riboflavina / 1.3) * 100)}%</span>
            </div>
            <div className="nutri-item-detalle">
              <span className="nutri-nombre">Selenio</span>
              <span className="nutri-valor">{nutri.selenio} μg</span>
              <span className="nutri-dv">{Math.round((nutri.selenio / 55) * 100)}%</span>
            </div>
            <div className="nutri-item-detalle">
              <span className="nutri-nombre">Teobromina</span>
              <span className="nutri-valor">{nutri.teobromina} mg</span>
              <span className="nutri-dv">–</span>
            </div>
            <div className="nutri-item-detalle">
              <span className="nutri-nombre">Tiamina</span>
              <span className="nutri-valor">{nutri.tiamina} mg</span>
              <span className="nutri-dv">{Math.round((nutri.tiamina / 1.2) * 100)}%</span>
            </div>
            <div className="nutri-item-detalle">
              <span className="nutri-nombre">Vitamina A IU</span>
              <span className="nutri-valor">{nutri.vitAIU} IU</span>
              <span className="nutri-dv">–</span>
            </div>
            <div className="nutri-item-detalle">
              <span className="nutri-nombre">Vitamina A</span>
              <span className="nutri-valor">{nutri.vitA} μg</span>
              <span className="nutri-dv">{Math.round((nutri.vitA / 900) * 100)}%</span>
            </div>
            <div className="nutri-item-detalle">
              <span className="nutri-nombre">Vitamina B12</span>
              <span className="nutri-valor">{nutri.vitB12} μg</span>
              <span className="nutri-dv">{Math.round((nutri.vitB12 / 2.4) * 100)}%</span>
            </div>
            <div className="nutri-item-detalle">
              <span className="nutri-nombre">Vitamina B6</span>
              <span className="nutri-valor">{nutri.vitB6} mg</span>
              <span className="nutri-dv">{Math.round((nutri.vitB6 / 1.3) * 100)}%</span>
            </div>
            <div className="nutri-item-detalle">
              <span className="nutri-nombre">Vitamina C</span>
              <span className="nutri-valor">{nutri.vitC} mg</span>
              <span className="nutri-dv">{Math.round((nutri.vitC / 90) * 100)}%</span>
            </div>
            <div className="nutri-item-detalle">
              <span className="nutri-nombre">Vitamina D IU</span>
              <span className="nutri-valor">{nutri.vitDIU} IU</span>
              <span className="nutri-dv">–</span>
            </div>
            <div className="nutri-item-detalle">
              <span className="nutri-nombre">Vitamina D2</span>
              <span className="nutri-valor">{nutri.vitD2} μg</span>
              <span className="nutri-dv">–</span>
            </div>
            <div className="nutri-item-detalle">
              <span className="nutri-nombre">Vitamina D3</span>
              <span className="nutri-valor">{nutri.vitD3} μg</span>
              <span className="nutri-dv">–</span>
            </div>
            <div className="nutri-item-detalle">
              <span className="nutri-nombre">Vitamina E</span>
              <span className="nutri-valor">{nutri.vitE} mg</span>
              <span className="nutri-dv">{Math.round((nutri.vitE / 15) * 100)}%</span>
            </div>
            <div className="nutri-item-detalle">
              <span className="nutri-nombre">Vitamina K</span>
              <span className="nutri-valor">{nutri.vitK} μg</span>
              <span className="nutri-dv">{Math.round((nutri.vitK / 120) * 100)}%</span>
            </div>
            <div className="nutri-item-detalle">
              <span className="nutri-nombre">Zinc</span>
              <span className="nutri-valor">{nutri.zinc} mg</span>
              <span className="nutri-dv">{Math.round((nutri.zinc / 11) * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Azúcares */}
        <div className="nutri-detalle-seccion">
          <h3>Azúcares</h3>
          <div className="nutri-grid-simple">
            <div className="nutri-item-simple">
              <span>Azúcar</span>
              <strong>{nutri.azucar} g</strong>
            </div>
            <div className="nutri-item-simple">
              <span>Sacarosa</span>
              <strong>{nutri.sacarosa} g</strong>
            </div>
            <div className="nutri-item-simple">
              <span>Glucosa</span>
              <strong>{nutri.glucosa} g</strong>
            </div>
            <div className="nutri-item-simple">
              <span>Fructosa</span>
              <strong>{nutri.fructosa} g</strong>
            </div>
            <div className="nutri-item-simple">
              <span>Lactosa</span>
              <strong>{nutri.lactosa} g</strong>
            </div>
            <div className="nutri-item-simple">
              <span>Maltosa</span>
              <strong>{nutri.maltosa} g</strong>
            </div>
            <div className="nutri-item-simple">
              <span>Galactosa</span>
              <strong>{nutri.galactosa} g</strong>
            </div>
            <div className="nutri-item-simple">
              <span>Almidón</span>
              <strong>{nutri.almidon} g</strong>
            </div>
          </div>
        </div>

        {/* Grasas */}
        <div className="nutri-detalle-seccion">
          <h3>Grasas</h3>
          <div className="nutri-grid-simple">
            <div className="nutri-item-simple">
              <span>Grasas saturadas</span>
              <strong>{nutri.grasSat} g</strong>
              <span className="nutri-dv-inline">{Math.round((nutri.grasSat / 20) * 100)}%</span>
            </div>
            <div className="nutri-item-simple">
              <span>Grasas monoinsaturadas</span>
              <strong>{nutri.grasMonoins} g</strong>
            </div>
            <div className="nutri-item-simple">
              <span>Grasas poliinsaturadas</span>
              <strong>{nutri.grasPoliins} g</strong>
            </div>
            <div className="nutri-item-simple">
              <span>Grasas trans</span>
              <strong>{nutri.grasTrans} g</strong>
            </div>
          </div>
        </div>

        {/* Ácidos Grasos */}
        <div className="nutri-detalle-seccion">
          <h3>Ácidos Grasos</h3>
          <div className="nutri-grid-simple">
            <div className="nutri-item-simple">
              <span>Omega 3 total</span>
              <strong>{nutri.omega3} g</strong>
            </div>
            <div className="nutri-item-simple">
              <span>Omega 6 total</span>
              <strong>{nutri.omega6} g</strong>
            </div>
            <div className="nutri-item-simple">
              <span>Alpha Linolenic Acid (ALA)</span>
              <strong>{nutri.ala} g</strong>
            </div>
            <div className="nutri-item-simple">
              <span>Docosahexaenoic Acid (DHA)</span>
              <strong>{nutri.dha} g</strong>
            </div>
            <div className="nutri-item-simple">
              <span>Eicosapentaenoic Acid (EPA)</span>
              <strong>{nutri.epa} g</strong>
            </div>
            <div className="nutri-item-simple">
              <span>Docosapentaenoic Acid (DPA)</span>
              <strong>{nutri.dpa} g</strong>
            </div>
          </div>
        </div>

        {/* Aminoácidos */}
        <div className="nutri-detalle-seccion">
          <h3>Aminoácidos</h3>
          <div className="nutri-grid-simple">
            <div className="nutri-item-simple">
              <span>Alanina</span>
              <strong>{nutri.alanina} g</strong>
            </div>
            <div className="nutri-item-simple">
              <span>Arginina</span>
              <strong>{nutri.arginina} g</strong>
            </div>
            <div className="nutri-item-simple">
              <span>Ácido aspártico</span>
              <strong>{nutri.aspArtico} g</strong>
            </div>
            <div className="nutri-item-simple">
              <span>Cistina</span>
              <strong>{nutri.cistina} g</strong>
            </div>
            <div className="nutri-item-simple">
              <span>Ácido glutámico</span>
              <strong>{nutri.glutamico} g</strong>
            </div>
            <div className="nutri-item-simple">
              <span>Glicina</span>
              <strong>{nutri.glicina} g</strong>
            </div>
            <div className="nutri-item-simple">
              <span>Histidina</span>
              <strong>{nutri.histidina} g</strong>
            </div>
            <div className="nutri-item-simple">
              <span>Hidroxiprolina</span>
              <strong>{nutri.hidroxiprolina} g</strong>
            </div>
            <div className="nutri-item-simple">
              <span>Isoleucina</span>
              <strong>{nutri.isoleucina} g</strong>
            </div>
            <div className="nutri-item-simple">
              <span>Leucina</span>
              <strong>{nutri.leucina} g</strong>
            </div>
            <div className="nutri-item-simple">
              <span>Lisina</span>
              <strong>{nutri.lisina} g</strong>
            </div>
            <div className="nutri-item-simple">
              <span>Metionina</span>
              <strong>{nutri.metionina} g</strong>
            </div>
            <div className="nutri-item-simple">
              <span>Fenilalanina</span>
              <strong>{nutri.fenilalanina} g</strong>
            </div>
            <div className="nutri-item-simple">
              <span>Prolina</span>
              <strong>{nutri.prolina} g</strong>
            </div>
            <div className="nutri-item-simple">
              <span>Serina</span>
              <strong>{nutri.serina} g</strong>
            </div>
            <div className="nutri-item-simple">
              <span>Treonina</span>
              <strong>{nutri.treonina} g</strong>
            </div>
            <div className="nutri-item-simple">
              <span>Triptófano</span>
              <strong>{nutri.triptofano} g</strong>
            </div>
            <div className="nutri-item-simple">
              <span>Tirosina</span>
              <strong>{nutri.tirosina} g</strong>
            </div>
            <div className="nutri-item-simple">
              <span>Valina</span>
              <strong>{nutri.valina} g</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalNutricionDetallada;