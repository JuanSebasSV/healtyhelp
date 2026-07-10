import { memo } from 'react';
import './FondoAnimado.css';

const FondoAnimado = memo(() => (
  <>
    <div className="fondoAnimado" aria-hidden="true" />
    <div className="fondoTinte" aria-hidden="true" />
  </>
));
FondoAnimado.displayName = 'FondoAnimado';

export default FondoAnimado;