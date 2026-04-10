// ModalTerminos.jsx — versión corregida
// La persistencia ya NO vive aquí; vive en useTermsGuard.js
// Este componente solo muestra el contenido y llama a onAceptar()

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import './ModalTerminos.css';

const ModalTerminos = ({ onAceptar, esActualizacion = false }) => {
  const [scrollado,    setScrollado]    = useState(false);
  const [aceptado,     setAceptado]     = useState(false);
  const [cargando,     setCargando]     = useState(false);
  const [termsData,    setTermsData]    = useState(null);
  const [loadingTerms, setLoadingTerms] = useState(true);
  const [errorCarga,   setErrorCarga]   = useState(false);

  useEffect(() => {
    const cargarTerminos = async () => {
      try {
        const { data } = await api.get('/terms');
        setTermsData(data.terms);
      } catch {
        setErrorCarga(true);
      } finally {
        setLoadingTerms(false);
      }
    };
    cargarTerminos();
  }, []);

  const handleScroll = (e) => {
    const el = e.target;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 50) setScrollado(true);
  };

  const handleAceptar = async () => {
    if (!aceptado || !scrollado) return;
    setCargando(true);
    // Delega toda la lógica de persistencia al padre (useTermsGuard)
    await onAceptar();
    setCargando(false);
  };

  const version = termsData?.version || '1.0.0';

  return (
    <div className="terminos-overlay">
      <div className="terminos-modal">

        <div className="terminos-header">
          <div className="terminos-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <h2>{esActualizacion ? 'Actualización de Términos' : 'Términos y Condiciones'}</h2>
            <p className="terminos-version">Versión {version} — Healthy Help</p>
          </div>
        </div>

        {esActualizacion && (
          <div className="terminos-aviso-actualizacion">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" strokeWidth="2"
                 style={{ marginRight: '8px', flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Hemos actualizado nuestros términos. Debes aceptarlos para continuar usando Healthy Help.
          </div>
        )}

        <p className="terminos-instruccion">
          Lee los términos completos antes de aceptar. Debes llegar al final del documento.
        </p>

        <div className="terminos-contenido" onScroll={handleScroll}>
          {loadingTerms && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              Cargando términos...
            </div>
          )}

          {!loadingTerms && errorCarga && (
            <div style={{
              textAlign: 'center', padding: '2rem',
              color: '#dc2626', background: '#fef2f2',
              borderRadius: '10px', border: '1px solid #fca5a5'
            }}>
              <strong>No se pudieron cargar los términos.</strong><br/>
              Verifica tu conexión e intenta recargar la página.
            </div>
          )}

          {!loadingTerms && !errorCarga && termsData?.content && (
            <div dangerouslySetInnerHTML={{ __html: termsData.content }} />
          )}

          {!loadingTerms && !errorCarga && (
            <div className="terminos-fin">✓ Has llegado al final del documento</div>
          )}
        </div>

        <div className="terminos-footer">
          <label className="terminos-checkbox-label">
            <input
              type="checkbox"
              checked={aceptado}
              onChange={e => setAceptado(e.target.checked)}
              disabled={!scrollado || loadingTerms || errorCarga}
            />
            <span>
              He leído y acepto los Términos y Condiciones, la Política de Privacidad
              y el Descargo de Responsabilidad en Salud de Healthy Help.
            </span>
          </label>

          {!scrollado && !errorCarga && (
            <p className="terminos-hint">
              Desplázate hasta el final del documento para poder aceptar.
            </p>
          )}

          <button
            className="terminos-btn-aceptar"
            onClick={handleAceptar}
            disabled={!aceptado || !scrollado || cargando || loadingTerms || errorCarga}
          >
            {cargando ? 'Guardando...' : 'Aceptar y Continuar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalTerminos; 