import { memo } from 'react';
import { FieldHint, InfoIcon } from './UserProfileUI';
import EyeIcon from './UserProfileEyeIcon';
import AvisoCampo from './UserProfileAvisoCampo';

const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const SecuritySection = memo(({
  editando, form, handleChange, user,
}) => (
  <div className="campo-grupo">
    <label className="campo-label" htmlFor="up-alergia">Alergia alimentaria</label>
    {editando ? (
      <input
        id="up-alergia"
        className="campo-input"
        type="text"
        name="alergia"
        value={form.alergia}
        onChange={handleChange}
        placeholder="Ej: frutos secos, mariscos"
      />
    ) : (
      <div className="campo-valor">{user?.alergia || "—"}</div>
    )}
  </div>
));

const PasswordSection = memo(({
  editando, form, handleChange, handleBlurPerf, touched, avisosCampo,
  showPass, showPassConf, setShowPass, setShowPassConf,
}) => {
  if (!editando) {
    return (
      <div className="campo-grupo">
        <label className="campo-label" htmlFor="up-contrasena">Contraseña</label>
        <div id="up-contrasena" className="campo-valor">••••••••••</div>
      </div>
    );
  }
  return (
    <>
      <div className="campo-grupo">
        <label className="campo-label" htmlFor="up-password">Nueva contraseña</label>
        <div className="inputWrapper">
          <input
            id="up-password"
            className={`campo-input${touched.password && !avisosCampo.password && form.password ? " campo-input--ok" : ""}${touched.password && avisosCampo.password ? " campo-input--error" : ""}`}
            type={showPass ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            onBlur={() => handleBlurPerf("password")}
            placeholder="Mínimo 8 caracteres"
          />
          <button
            type="button"
            className="eyeButton"
            onClick={() => setShowPass((p) => !p)}
            tabIndex={-1}
            aria-label="Mostrar u ocultar contraseña"
          >
            <EyeIcon open={showPass} />
          </button>
        </div>
        <FieldHint
          show={!!form.password}
          items={[
            { ok: form.password.length >= 8, label: "Mínimo 8 caracteres" },
            { ok: /[a-z]/.test(form.password), label: "Una letra minúscula" },
            { ok: /[A-Z]/.test(form.password), label: "Una letra mayúscula" },
            { ok: /[0-9]/.test(form.password), label: "Un número" },
          ]}
        />
        <AvisoCampo field="password" avisos={avisosCampo} />
      </div>
      <div className="campo-grupo">
        <label className="campo-label" htmlFor="up-confirmPassword">Confirmar contraseña</label>
        <div className="inputWrapper">
          <input
            id="up-confirmPassword"
            className={`campo-input ${form.confirmPassword && form.password !== form.confirmPassword ? "campo-input--error" : ""}`}
            type={showPassConf ? "text" : "password"}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            onBlur={() => handleBlurPerf("confirmPassword")}
            placeholder="Repetir nueva contraseña"
          />
          <button
            type="button"
            className="eyeButton"
            onClick={() => setShowPassConf((p) => !p)}
            tabIndex={-1}
            aria-label="Mostrar u ocultar contraseña"
          >
            <EyeIcon open={showPassConf} />
          </button>
        </div>
        <FieldHint
          show={!!form.confirmPassword}
          items={[{
            ok: form.confirmPassword && form.confirmPassword === form.password,
            label: "Las contraseñas coinciden",
          }]}
        />
        <AvisoCampo field="confirmPassword" avisos={avisosCampo} />
      </div>
    </>
  );
});
PasswordSection.displayName = 'PasswordSection';

export { SecuritySection, PasswordSection };
