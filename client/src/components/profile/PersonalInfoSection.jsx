import { memo } from 'react';
import { FieldHint, InfoIcon } from './UserProfileUI';
import NumeroInput from './UserProfileNumeroInput';
import AvisoCampo from './UserProfileAvisoCampo';

const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const PersonalInfoSection = memo(({
  editando, form, touched, avisosCampo,
  handleChange, handleBlurPerf, user, formatBirthDate,
}) => (
  <div className="perfil-seccion">
    <div className="seccion-titulo">
      <div className="seccion-icono">🌱</div>
      <h3>Datos personales</h3>
    </div>
    <div className="campos-grid">
      <div className="campo-grupo">
        <label className="campo-label" htmlFor="up-name">Nombre completo</label>
        {editando ? (
          <>
            <input
              id="up-name"
              className={`campo-input${touched.name && !avisosCampo.name && form.name ? " campo-input--ok" : ""}${touched.name && avisosCampo.name ? " campo-input--error" : ""}`}
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              onBlur={() => handleBlurPerf("name")}
              placeholder="Tu nombre"
            />
            <FieldHint
              show={touched.name}
              items={[
                { ok: form.name.trim().length >= 2, label: "Mínimo 2 caracteres" },
                { ok: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(form.name.trim()), label: "Solo letras y espacios" },
              ]}
            />
            <AvisoCampo field="name" avisos={avisosCampo} />
          </>
        ) : (
          <div className="campo-valor">{user?.name || "—"}</div>
        )}
      </div>

      <div className="campo-grupo">
        <label className="campo-label" htmlFor="up-email">Correo electrónico</label>
        <div id="up-email" className="campo-valor campo-valor--bloqueado">
          {user?.email}
          <span className="campo-lock"><LockIcon /></span>
        </div>
        <p className="campo-hint">El email no se puede modificar</p>
      </div>

      <div className="campo-grupo">
        <label className="campo-label" htmlFor="up-fecha">Fecha de nacimiento</label>
        <div id="up-fecha" className="campo-valor campo-valor--bloqueado campo-valor--fecha">
          <div className="campo-fecha-fila">
            <span className="campo-fecha-texto">{formatBirthDate(user?.birthDate)}</span>
            <div className="campo-fecha-meta">
              {user?.age != null && (
                <span className="campo-edad-badge">{user.age} años</span>
              )}
              <span className="campo-lock"><LockIcon /></span>
            </div>
          </div>
        </div>
        <p className="campo-hint">La fecha de nacimiento no se puede modificar</p>
      </div>

      <div className="campo-grupo">
        <label className="campo-label" htmlFor="up-weight">Peso (kg)</label>
        {editando ? (
          <>
            <NumeroInput
              id="up-weight"
              name="weight"
              value={form.weight}
              onChange={handleChange}
              placeholder="Ej: 70"
              min={40}
              max={300}
              step={0.1}
            />
            <FieldHint
              show={touched.weight}
              items={form.weight ? [
                { ok: parseFloat(form.weight) >= 40, label: "Mínimo 40 kg" },
                { ok: parseFloat(form.weight) <= 300, label: "Máximo 300 kg" },
              ] : []}
            />
            <AvisoCampo field="weight" avisos={avisosCampo} />
          </>
        ) : (
          <div className="campo-valor">{user?.weight ? `${user.weight} kg` : "—"}</div>
        )}
      </div>

      <div className="campo-grupo">
        <label className="campo-label" htmlFor="up-height">Altura (cm)</label>
        <div id="up-height" className="campo-valor campo-valor--bloqueado">
          {user?.height ? `${user.height} cm` : "—"}
          <span className="campo-lock"><LockIcon /></span>
        </div>
        <p className="campo-hint">La altura no se puede modificar</p>
      </div>
    </div>
  </div>
));
PersonalInfoSection.displayName = 'PersonalInfoSection';

export default PersonalInfoSection;
