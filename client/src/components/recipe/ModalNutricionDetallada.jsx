import React, { memo } from 'react';
import { createPortal } from 'react-dom';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';
import useModalLayerHint from '../../hooks/useModalLayerHint';
import './ModalNutricionDetallada.css';

const FilaNutri = memo(({ nombre, valor, unidad }) => (
  <div className="nutriItemDetalle">
    <span className="nutriNombre">{nombre}</span>
    <span className="nutriValor">{valor ?? 0} {unidad}</span>
  </div>
));
FilaNutri.displayName = 'FilaNutri';

const IconoCerrar = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
));
IconoCerrar.displayName = 'IconoCerrar';

const IconoVolver = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
));
IconoVolver.displayName = 'IconoVolver';

const ModalNutricionDetallada = memo(({ nutri, cerrar, volver }) => {

  useBodyScrollLock(true);
  useModalLayerHint(true);

  return createPortal(
    <div className="modal-overlay" data-modal="true" role="button" tabIndex={0} onClick={cerrar} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cerrar(); }}}>
      <div className="modalNutriWrapper" onClick={e => e.stopPropagation()}>

        <button type="button" className="btn-cerrar-modal" onClick={cerrar} aria-label="Cerrar">
          <IconoCerrar />
        </button>

        <div className="modalNutriDetalle">

          <div className="modalNutriHeader">
            <button type="button" className="btn-volver-nutri" onClick={volver}>
              <IconoVolver />
              Volver
            </button>
            <h2>Información Nutricional Detallada</h2>
          </div>

          <div className="nutriDetalleSeccion">
            <h3>Vitaminas y Minerales</h3>
            <div className="nutriGridDetalle">
              <FilaNutri nombre="Alfa caroteno"               valor={nutri.alfaCaroteno} unidad="µg" />
              <FilaNutri nombre="Beta caroteno"               valor={nutri.betaCaroteno} unidad="µg" />
              <FilaNutri nombre="Cafeína"                     valor={nutri.cafeina}      unidad="mg" />
              <FilaNutri nombre="Colina"                      valor={nutri.colina}       unidad="mg" />
              <FilaNutri nombre="Cobre"                       valor={nutri.cobre}        unidad="mg" />
              <FilaNutri nombre="Flúor"                       valor={nutri.fluor}        unidad="µg" />
              <FilaNutri nombre="Folato (Vitamina B9)"        valor={nutri.folato}       unidad="µg" />
              <FilaNutri nombre="Licopeno"                    valor={nutri.licopeno}     unidad="µg" />
              <FilaNutri nombre="Magnesio"                    valor={nutri.magnesio}     unidad="mg" />
              <FilaNutri nombre="Manganeso"                   valor={nutri.manganeso}    unidad="mg" />
              <FilaNutri nombre="Niacina (Vitamina B3)"       valor={nutri.niacina}      unidad="mg" />
              <FilaNutri nombre="Ácido pantoténico (Vit. B5)" valor={nutri.acidoPant}    unidad="mg" />
              <FilaNutri nombre="Fósforo"                     valor={nutri.fosforo}      unidad="mg" />
              <FilaNutri nombre="Retinol"                     valor={nutri.retinol}      unidad="µg" />
              <FilaNutri nombre="Riboflavina (Vitamina B2)"   valor={nutri.riboflavina}  unidad="mg" />
              <FilaNutri nombre="Selenio"                     valor={nutri.selenio}      unidad="µg" />
              <FilaNutri nombre="Teobromina"                  valor={nutri.teobromina}   unidad="mg" />
              <FilaNutri nombre="Tiamina (Vitamina B1)"       valor={nutri.tiamina}      unidad="mg" />
              <FilaNutri nombre="Vitamina A (UI)"             valor={nutri.vitAui}       unidad="IU" />
              <FilaNutri nombre="Vitamina A"                  valor={nutri.vitA}         unidad="µg" />
              <FilaNutri nombre="Vitamina B12"                valor={nutri.vitB12}       unidad="µg" />
              <FilaNutri nombre="Vitamina B6"                 valor={nutri.vitB6}        unidad="mg" />
              <FilaNutri nombre="Vitamina C"                  valor={nutri.vitC}         unidad="mg" />
              <FilaNutri nombre="Vitamina D (UI)"             valor={nutri.vitDui}       unidad="IU" />
              <FilaNutri nombre="Vitamina D2"                 valor={nutri.vitD2}        unidad="µg" />
              <FilaNutri nombre="Vitamina D3"                 valor={nutri.vitD3}        unidad="µg" />
              <FilaNutri nombre="Vitamina E"                  valor={nutri.vitE}         unidad="mg" />
              <FilaNutri nombre="Vitamina K"                  valor={nutri.vitK}         unidad="µg" />
              <FilaNutri nombre="Zinc"                        valor={nutri.zinc}         unidad="mg" />
            </div>
          </div>

          <div className="nutriDetalleSeccion">
            <h3>Azúcares</h3>
            <div className="nutriGridDetalle">
              <FilaNutri nombre="Azúcar total" valor={nutri.azucar}    unidad="g" />
              <FilaNutri nombre="Sacarosa"     valor={nutri.sacarosa}  unidad="g" />
              <FilaNutri nombre="Glucosa"      valor={nutri.glucosa}   unidad="g" />
              <FilaNutri nombre="Fructosa"     valor={nutri.fructosa}  unidad="g" />
              <FilaNutri nombre="Lactosa"      valor={nutri.lactosa}   unidad="g" />
              <FilaNutri nombre="Maltosa"      valor={nutri.maltosa}   unidad="g" />
              <FilaNutri nombre="Galactosa"    valor={nutri.galactosa} unidad="g" />
              <FilaNutri nombre="Almidón"      valor={nutri.almidon}   unidad="g" />
            </div>
          </div>

          <div className="nutriDetalleSeccion">
            <h3>Grasas</h3>
            <div className="nutriGridDetalle">
              <FilaNutri nombre="Grasas saturadas"       valor={nutri.grasSat}     unidad="g" />
              <FilaNutri nombre="Grasas monoinsaturadas" valor={nutri.grasMonoins} unidad="g" />
              <FilaNutri nombre="Grasas poliinsaturadas" valor={nutri.grasPoliins} unidad="g" />
              <FilaNutri nombre="Grasas trans"           valor={nutri.grasTrans}   unidad="g" />
            </div>
          </div>

          <div className="nutriDetalleSeccion">
            <h3>Ácidos Grasos</h3>
            <div className="nutriGridDetalle">
              <FilaNutri nombre="Omega 3 total"                 valor={nutri.omega3} unidad="g" />
              <FilaNutri nombre="Omega 6 total"                 valor={nutri.omega6} unidad="g" />
              <FilaNutri nombre="Ácido alfa-linolénico (ALA)"   valor={nutri.ala}    unidad="g" />
              <FilaNutri nombre="Ácido docosahexaenoico (DHA)"  valor={nutri.dha}    unidad="g" />
              <FilaNutri nombre="Ácido eicosapentaenoico (EPA)" valor={nutri.epa}    unidad="g" />
              <FilaNutri nombre="Ácido docosapentaenoico (DPA)" valor={nutri.dpa}    unidad="g" />
            </div>
          </div>

          <div className="nutriDetalleSeccion">
            <h3>Aminoácidos</h3>
            <div className="nutriGridDetalle">
              <FilaNutri nombre="Alanina"         valor={nutri.alanina}      unidad="g" />
              <FilaNutri nombre="Arginina"        valor={nutri.arginina}     unidad="g" />
              <FilaNutri nombre="Ácido aspártico" valor={nutri.acidoAsp}     unidad="g" />
              <FilaNutri nombre="Cistina"         valor={nutri.cistina}      unidad="g" />
              <FilaNutri nombre="Ácido glutámico" valor={nutri.acidoGlu}     unidad="g" />
              <FilaNutri nombre="Glicina"         valor={nutri.glicina}      unidad="g" />
              <FilaNutri nombre="Histidina"       valor={nutri.histidina}    unidad="g" />
              <FilaNutri nombre="Hidroxiprolina"  valor={nutri.hidroxiprol}  unidad="g" />
              <FilaNutri nombre="Isoleucina"      valor={nutri.isoleucina}   unidad="g" />
              <FilaNutri nombre="Leucina"         valor={nutri.leucina}      unidad="g" />
              <FilaNutri nombre="Lisina"          valor={nutri.lisina}       unidad="g" />
              <FilaNutri nombre="Metionina"       valor={nutri.metionina}    unidad="g" />
              <FilaNutri nombre="Fenilalanina"    valor={nutri.fenilalanina} unidad="g" />
              <FilaNutri nombre="Prolina"         valor={nutri.prolina}      unidad="g" />
              <FilaNutri nombre="Serina"          valor={nutri.serina}       unidad="g" />
              <FilaNutri nombre="Treonina"        valor={nutri.treonina}     unidad="g" />
              <FilaNutri nombre="Triptófano"      valor={nutri.triptofano}   unidad="g" />
              <FilaNutri nombre="Tirosina"        valor={nutri.tirosina}     unidad="g" />
              <FilaNutri nombre="Valina"          valor={nutri.valina}       unidad="g" />
            </div>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
});

ModalNutricionDetallada.displayName = 'ModalNutricionDetallada';

export default ModalNutricionDetallada;