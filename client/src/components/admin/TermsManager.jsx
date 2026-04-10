import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import './TermsManager.css';

const TermsManager = () => {
  const [termsCurrent, setTermsCurrent] = useState(null);
  const [version,      setVersion]      = useState('');
  const [content,      setContent]      = useState('');
  const [loading,      setLoading]      = useState(true);
  const [publicando,   setPublicando]   = useState(false);
  const [preview,      setPreview]      = useState(false);

  useEffect(() => {
    cargarTerminos();
  }, []);

  const cargarTerminos = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/terms');
      if (data.terms) {
        setTermsCurrent(data.terms);
        setVersion(data.terms.version);
        setContent(data.terms.content);
      }
      // Si no hay términos en BD el editor queda vacío.
      // Esto no debería ocurrir porque seedTerms.js inserta v1.0.0 al arrancar el servidor.
    } catch {
      toast.error('Error cargando los términos. Verifica la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublicar = async () => {
    if (!version.trim()) return toast.error('La versión es obligatoria (ej: 1.1.0)');
    if (!content.trim()) return toast.error('El contenido no puede estar vacío');
    if (termsCurrent && version === termsCurrent.version)
      return toast.error('Debes cambiar el número de versión para publicar una actualización');

    const confirmado = window.confirm(
      `¿Publicar versión ${version}?\n\nEsto obligará a TODOS los usuarios a aceptar los nuevos términos la próxima vez que entren a la aplicación.`
    );
    if (!confirmado) return;

    setPublicando(true);
    try {
      const { data } = await api.put('/admin/terms', { version, content });
      toast.success(`Términos v${data.terms.version} publicados. Todos los usuarios deberán aceptarlos.`);
      setTermsCurrent(data.terms);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error publicando los términos');
    } finally {
      setPublicando(false);
    }
  };

  if (loading) {
    return (
      <div className="terms-manager-loading">
        <div className="spinner-small"></div>
        <p>Cargando términos...</p>
      </div>
    );
  }

  return (
    <div className="terms-manager">

      <div className="terms-manager-header">
        <div className="terms-manager-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          <div>
            <h2>Gestión de Términos y Condiciones</h2>
            {termsCurrent ? (
              <p className="terms-manager-meta">
                Versión activa: <strong>{termsCurrent.version}</strong>
                {termsCurrent.publishedAt && (
                  <> — publicada el {new Date(termsCurrent.publishedAt).toLocaleDateString('es-ES', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}</>
                )}
              </p>
            ) : (
              <p className="terms-manager-meta">No hay términos publicados aún</p>
            )}
          </div>
        </div>

        <div className="terms-manager-actions">
          <button
            className={`btn-preview ${preview ? 'active' : ''}`}
            onClick={() => setPreview(!preview)}
          >
            {preview ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Editar
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                Vista previa
              </>
            )}
          </button>
        </div>
      </div>

      <div className="terms-manager-aviso">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0}}>
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>
          Al publicar una nueva versión, <strong>todos los usuarios</strong> deberán aceptar los términos
          la próxima vez que accedan. El contenido soporta HTML básico:
          <code>&lt;h3&gt;</code> <code>&lt;p&gt;</code> <code>&lt;ul&gt;</code> <code>&lt;li&gt;</code> <code>&lt;strong&gt;</code>.
        </span>
      </div>

      <div className="terms-manager-version-row">
        <label>Número de versión</label>
        <input
          type="text"
          value={version}
          onChange={e => setVersion(e.target.value)}
          placeholder="Ej: 1.1.0"
          className="terms-version-input"
        />
        {termsCurrent && version === termsCurrent.version && (
          <span className="terms-version-hint">
            Cambia la versión para poder publicar una actualización
          </span>
        )}
      </div>

      {preview ? (
        <div className="terms-preview-container">
          <div className="terms-preview-label">Vista previa del documento</div>
          <div
            className="terms-preview-content"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      ) : (
        <div className="terms-editor-container">
          <label className="terms-editor-label">
            Contenido (HTML)
            <span className="terms-char-count">{content.length.toLocaleString()} caracteres</span>
          </label>
          <textarea
            className="terms-editor"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="El contenido se carga desde la base de datos..."
            spellCheck={false}
          />
        </div>
      )}

      <div className="terms-manager-footer">
        <button
          className="btn-publicar"
          onClick={handlePublicar}
          disabled={
            publicando ||
            !content.trim() ||
            !version.trim() ||
            (termsCurrent && version === termsCurrent.version)
          }
        >
          {publicando ? (
            <>
              <div className="spinner-small"></div>
              Publicando...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Publicar versión {version || '—'}
            </>
          )}
        </button>
        <p className="terms-manager-warning">
          Esta acción es irreversible. Se enviará la notificación de actualización a todos los usuarios.
        </p>
      </div>
    </div>
  );
};

export default TermsManager;