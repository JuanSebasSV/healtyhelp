import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import './TermsManager.css';

/* ─────────────────────────────────────────
   Iconos SVG inline (sin dependencia extra)
───────────────────────────────────────── */
const Icons = {
  Doc: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  Eye: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Edit: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Info: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0}}>
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  Check: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  ListUl: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/>
      <line x1="9" y1="18" x2="20" y2="18"/>
      <circle cx="4" cy="6"  r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/>
    </svg>
  ),
  ListOl: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/>
      <line x1="10" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  Quote: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
    </svg>
  ),
  Undo: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 14 4 9 9 4"/>
      <path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
    </svg>
  ),
  Redo: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15 14 20 9 15 4"/>
      <path d="M4 20v-7a4 4 0 0 1 4-4h12"/>
    </svg>
  ),
  Spinner: () => <div className="spinner-small" />,
  Chevron: () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
};

/* ─────────────────────────────────────────
   Dropdown personalizado de bloques
───────────────────────────────────────── */
const BLOCK_OPTIONS = [
  { value: 'p',  label: 'Párrafo',         hint: 'Texto normal' },
  { value: 'h1', label: 'Título',          hint: 'Encabezado principal' },
  { value: 'h2', label: 'Sección',         hint: 'Subtítulo de sección' },
  { value: 'h3', label: 'Subsección',      hint: 'Subtítulo menor' },
];

const BlockDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = BLOCK_OPTIONS.find(o => o.value === value) || BLOCK_OPTIONS[0];

  /* Cerrar al hacer click fuera */
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="terms-block-dropdown" ref={ref}>
      <button
        type="button"
        className={`terms-block-trigger${open ? ' open' : ''}`}
        onMouseDown={e => { e.preventDefault(); setOpen(v => !v); }}
      >
        <span>{selected.label}</span>
        <Icons.Chevron />
      </button>

      {open && (
        <div className="terms-block-menu">
          {BLOCK_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`terms-block-option${opt.value === value ? ' active' : ''}`}
              onMouseDown={e => {
                e.preventDefault();
                onChange(opt.value);
                setOpen(false);
              }}
            >
              <span className={`terms-block-option-label terms-block-option-label--${opt.value}`}>
                {opt.label}
              </span>
              <span className="terms-block-option-hint">{opt.hint}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────
   Botón de toolbar
───────────────────────────────────────── */
const TbBtn = ({ title, active, onClick, children }) => (
  <button
    className={`terms-tb-btn${active ? ' active' : ''}`}
    title={title}
    onMouseDown={e => { e.preventDefault(); onClick(); }}
    type="button"
  >
    {children}
  </button>
);

/* ─────────────────────────────────────────
   Componente principal
───────────────────────────────────────── */
const TermsManager = () => {
  const [termsCurrent, setTermsCurrent] = useState(null);
  const [version,      setVersion]      = useState('');
  const [loading,      setLoading]      = useState(true);
  const [publicando,   setPublicando]   = useState(false);
  const [preview,      setPreview]      = useState(false);
  const [charCount,    setCharCount]    = useState(0);
  const [activeFormats, setActiveFormats] = useState({ bold: false, italic: false, underline: false, ul: false, ol: false });

  const editorRef  = useRef(null);
  const previewRef = useRef(null);

  /* ── Carga inicial ── */
  useEffect(() => { cargarTerminos(); }, []);

  const cargarTerminos = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/terms');
      if (data.terms) {
        setTermsCurrent(data.terms);
        setVersion(data.terms.version);
        // Inyectar HTML guardado en el editor
        if (editorRef.current) {
          editorRef.current.innerHTML = data.terms.content || '';
          actualizarContador();
        }
      }
    } catch {
      toast.error('Error cargando los términos. Verifica la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  /* Cuando el editor ya existe y hay datos, inyectar contenido */
  useEffect(() => {
    if (!loading && termsCurrent && editorRef.current) {
      editorRef.current.innerHTML = termsCurrent.content || '';
      actualizarContador();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  /* ── Contador de caracteres ── */
  const actualizarContador = useCallback(() => {
    if (editorRef.current) {
      setCharCount(editorRef.current.innerText.length);
    }
  }, []);

  /* ── Estado de botones de formato ── */
  const syncFormatos = useCallback(() => {
    setActiveFormats({
      bold:      document.queryCommandState('bold'),
      italic:    document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      ul:        document.queryCommandState('insertUnorderedList'),
      ol:        document.queryCommandState('insertOrderedList'),
    });
  }, []);

  /* ── Aplicar formato ── */
  const fmt = useCallback((cmd, value = null) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
    syncFormatos();
  }, [syncFormatos]);

  /* ── Aplicar bloque (H1/H2/H3/p) ── */
  const applyBlock = useCallback((tag) => {
    document.execCommand('formatBlock', false, `<${tag}>`);
    editorRef.current?.focus();
  }, []);

  /* ── Leer bloque actual para el selector ── */
  const blockActual = () => {
    const raw = document.queryCommandValue('formatBlock').toLowerCase().replace(/[<>]/g, '');
    return ['p', 'h1', 'h2', 'h3'].includes(raw) ? raw : 'p';
  };

  /* ── Toggle vista previa ── */
  const togglePreview = () => {
    if (!preview) {
      // Pasar al preview: copiar HTML del editor
      if (previewRef.current && editorRef.current) {
        previewRef.current.innerHTML = editorRef.current.innerHTML;
      }
    }
    setPreview(v => !v);
  };

  /* ── Publicar ── */
  const handlePublicar = async () => {
    const htmlContent = editorRef.current?.innerHTML || '';
    const textoPlano  = editorRef.current?.innerText?.trim() || '';

    if (!version.trim())   return toast.error('La versión es obligatoria (ej: 1.1.0)');
    if (!textoPlano)       return toast.error('El contenido no puede estar vacío');
    if (termsCurrent && version === termsCurrent.version)
      return toast.error('Debes cambiar el número de versión para publicar una actualización');

    const confirmado = window.confirm(
      `¿Publicar versión ${version}?\n\nEsto obligará a TODOS los usuarios a aceptar los nuevos términos la próxima vez que entren a la aplicación.`
    );
    if (!confirmado) return;

    setPublicando(true);
    try {
      const { data } = await api.put('/admin/terms', { version, content: htmlContent });
      toast.success(`Términos v${data.terms.version} publicados. Todos los usuarios deberán aceptarlos.`);
      setTermsCurrent(data.terms);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error publicando los términos');
    } finally {
      setPublicando(false);
    }
  };

  /* ── Deshabilitar publicar ── */
  const publicarDisabled =
    publicando ||
    charCount === 0 ||
    !version.trim() ||
    (termsCurrent && version === termsCurrent.version);

  /* ─────────────────── RENDER ─────────────────── */
  if (loading) {
    return (
      <div className="terms-manager-loading">
        <Icons.Spinner />
        <p>Cargando términos...</p>
      </div>
    );
  }

  return (
    <div className="terms-manager">

      {/* ── Cabecera ── */}
      <div className="terms-manager-header">
        <div className="terms-manager-title">
          <Icons.Doc />
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
            className={`btn-preview${preview ? ' active' : ''}`}
            onClick={togglePreview}
            type="button"
          >
            {preview ? <><Icons.Edit /> Editar</> : <><Icons.Eye /> Vista previa</>}
          </button>
        </div>
      </div>

      {/* ── Aviso ── */}
      <div className="terms-manager-aviso">
        <Icons.Info />
        <span>
          Al publicar una nueva versión, <strong>todos los usuarios</strong> deberán aceptar
          los términos la próxima vez que accedan.
          Usa la barra de herramientas para dar formato — el HTML se genera automáticamente.
        </span>
      </div>

      {/* ── Versión ── */}
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

      {/* ── Editor enriquecido ── */}
      {!preview && (
        <div className="terms-editor-container">
          <div className="terms-editor-label">
            <span>Contenido</span>
            <span className="terms-char-count">{charCount.toLocaleString('es-ES')} caracteres</span>
          </div>

          {/* Toolbar */}
          <div className="terms-toolbar">
            {/* Selector de bloque personalizado */}
            <BlockDropdown value={blockActual()} onChange={applyBlock} />

            <div className="terms-tb-sep" />

            <TbBtn title="Negrita (Ctrl+B)" active={activeFormats.bold}      onClick={() => fmt('bold')}>
              <strong style={{fontFamily:'Georgia,serif', fontSize:'13px'}}>N</strong>
            </TbBtn>
            <TbBtn title="Cursiva (Ctrl+I)" active={activeFormats.italic}    onClick={() => fmt('italic')}>
              <em style={{fontFamily:'Georgia,serif', fontSize:'13px'}}>K</em>
            </TbBtn>
            <TbBtn title="Subrayado (Ctrl+U)" active={activeFormats.underline} onClick={() => fmt('underline')}>
              <span style={{textDecoration:'underline', fontSize:'13px'}}>S</span>
            </TbBtn>

            <div className="terms-tb-sep" />

            <TbBtn title="Lista con viñetas" active={activeFormats.ul} onClick={() => fmt('insertUnorderedList')}>
              <Icons.ListUl />
            </TbBtn>
            <TbBtn title="Lista numerada" active={activeFormats.ol} onClick={() => fmt('insertOrderedList')}>
              <Icons.ListOl />
            </TbBtn>

            <div className="terms-tb-sep" />

            <TbBtn title="Cita / aviso destacado" active={false} onClick={() => fmt('formatBlock', 'blockquote')}>
              <Icons.Quote />
            </TbBtn>

            <div className="terms-tb-sep" />

            <TbBtn title="Deshacer (Ctrl+Z)" active={false} onClick={() => fmt('undo')}>
              <Icons.Undo />
            </TbBtn>
            <TbBtn title="Rehacer (Ctrl+Y)" active={false} onClick={() => fmt('redo')}>
              <Icons.Redo />
            </TbBtn>
          </div>

          {/* Área editable */}
          <div
            ref={editorRef}
            className="terms-editor-rich"
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            onInput={actualizarContador}
            onKeyUp={syncFormatos}
            onMouseUp={syncFormatos}
          />
        </div>
      )}

      {/* ── Vista previa ── */}
      {preview && (
        <div className="terms-preview-container">
          <div className="terms-preview-label">Vista previa del documento publicado</div>
          <div
            ref={previewRef}
            className="terms-preview-content"
          />
        </div>
      )}

      {/* ── Footer ── */}
      <div className="terms-manager-footer">
        <button
          className="btn-publicar"
          onClick={handlePublicar}
          disabled={publicarDisabled}
          type="button"
        >
          {publicando
            ? <><Icons.Spinner /> Publicando...</>
            : <><Icons.Check /> Publicar versión {version || '—'}</>
          }
        </button>
        <p className="terms-manager-warning">
          Esta acción es irreversible. Se enviará la notificación de actualización a todos los usuarios.
        </p>
      </div>

    </div>
  );
};

export default TermsManager;