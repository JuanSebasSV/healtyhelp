import React, { useState, useEffect, useReducer, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import api from "../../api/axios";
import { validatePassword, validateName } from "../../utils/validation";
import EyeIcon from "./UserProfileEyeIcon";
import NumeroInput from "./UserProfileNumeroInput";
import { InfoIcon, AvisoInline, FieldHint } from "./UserProfileUI";
import ProfileSidebar from "./ProfileSidebar";
import PersonalInfoSection from "./PersonalInfoSection";
import { PasswordSection, SecuritySection } from "./UserProfileSecurity";
import AvisoCampo from "./UserProfileAvisoCampo";
import { AVISOS_PERF } from "./UserProfileData";

import "./UserProfile.css";

const initialEditSession = {
  editando: false,
  erroresPassword: [],
  touched: {},
  avisosCampo: {},
};

function editSessionReducer(state, action) {
  switch (action.type) {
    case "OPEN_EDIT":
      return { ...state, editando: true };
    case "CLOSE_EDIT":
      return { ...state, editando: false };
    case "END_EDIT":
      return {
        ...state,
        editando: false,
        erroresPassword: [],
        touched: {},
        avisosCampo: {},
      };
    case "SET_ERRORES_PASSWORD": {
      const errors =
        typeof action.errors === "function"
          ? action.errors(state.erroresPassword)
          : action.errors;
      return { ...state, erroresPassword: errors };
    }
    case "SET_TOUCHED": {
      const next =
        typeof action.touched === "function"
          ? action.touched(state.touched)
          : { ...state.touched, ...action.touched };
      return { ...state, touched: next };
    }
    case "SET_AVISOS": {
      const next =
        typeof action.avisos === "function"
          ? action.avisos(state.avisosCampo)
          : { ...state.avisosCampo, ...action.avisos };
      return { ...state, avisosCampo: next };
    }
    default:
      return state;
  }
}

const calcularAvisoPerf = (field, value, formActual) => {
  switch (field) {
    case "name": {
      if (!value) return null;
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value.trim()))
        return "nombre_caracteres";
      return null;
    }
    case "password": {
      if (!value) return null;
      const fuerte =
        value.length >= 8 &&
        /[a-z]/.test(value) &&
        /[A-Z]/.test(value) &&
        /\d/.test(value);
      return fuerte ? null : "pass_debil";
    }
    case "confirmPassword": {
      if (!value) return null;
      return value !== formActual.password ? "passConf_mismatch" : null;
    }
    case "weight": {
      if (!value) return null;
      const n = parseFloat(value);
      if (isNaN(n) || n <= 0) return null;
      if (n < 40) return "peso_bajo";
      if (n > 300) return "peso_alto";
      return null;
    }
    default:
      return null;
  }
};

const formatBirthDate = (bd) => {
  if (!bd) return "—";
  const fecha = new Date(bd);
  return fecha.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const UserProfile = () => {
  const { user, checkAuth, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef  = useRef(null);
  const mensajeTimer  = useRef(null);

  const [editSession, dispatchEdit] = useReducer(editSessionReducer, initialEditSession);
  const editando = editSession.editando;
  const erroresPassword = editSession.erroresPassword;
  const touched = editSession.touched;
  const avisosCampo = editSession.avisosCampo;
  const [guardando, setGuardando] = useState(false);
  const [subiendoAvatar, setSubiendoAvatar] = useState(false);
  const [eliminandoCuenta, setEliminandoCuenta] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [confirmTexto, setConfirmTexto] = useState("");
  const [verFoto, setVerFoto] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [showPassConf, setShowPassConf] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || "",
    weight: user?.weight || "",
    alergia: user?.alergia || "",
    password: "",
    confirmPassword: "",
  });

  const lastSyncedUserId = useMemo(() => user?.id || user?._id, [user?.id, user?._id]);
  const [syncedUserId, setSyncedUserId] = useState(lastSyncedUserId);
  if (user && syncedUserId !== lastSyncedUserId) {
    setSyncedUserId(lastSyncedUserId);
    setForm((prev) => ({
      ...prev,
      name: user.name || "",
      weight: user.weight || "",
      alergia: user.alergia || "",
    }));
  }

  useEffect(() => {
    return () => {
      if (mensajeTimer.current) clearTimeout(mensajeTimer.current);
    };
  }, []);

  const mostrarMensaje = useCallback((tipo, texto) => {
    if (mensajeTimer.current) clearTimeout(mensajeTimer.current);
    setMensaje({ tipo, texto });
    mensajeTimer.current = setTimeout(() => setMensaje(null), 5000);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nuevoForm = { ...form, [name]: value };
    setForm(nuevoForm);

    if (name === "password") {
      if (value) {
        const { errors } = validatePassword(value);
        dispatchEdit({ type: "SET_ERRORES_PASSWORD", errors });
      } else {
        dispatchEdit({ type: "SET_ERRORES_PASSWORD", errors: [] });
      }
    }

    if (touched[name]) {
      const avisoKey = calcularAvisoPerf(name, value, nuevoForm);
      const extra = {};
      if (name === "password" && touched["confirmPassword"]) {
        extra.confirmPassword = calcularAvisoPerf(
          "confirmPassword",
          nuevoForm.confirmPassword,
          nuevoForm,
        );
      }
      dispatchEdit({ type: "SET_AVISOS", avisos: { [name]: avisoKey, ...extra } });
    }
  };

  const handleBlurPerf = (field) => {
    dispatchEdit({ type: "SET_TOUCHED", touched: { [field]: true } });
    const avisoKey = calcularAvisoPerf(field, form[field], form);
    dispatchEdit({ type: "SET_AVISOS", avisos: { [field]: avisoKey } });
  };

  const handleAvatarClick = () => {
    if (!subiendoAvatar) fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      mostrarMensaje("error", "La imagen no puede superar 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);

    setSubiendoAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      await api.put("/auth/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await checkAuth();
      setAvatarPreview(null);
      mostrarMensaje("exito", "¡Foto de perfil actualizada!");
    } catch (error) {
      setAvatarPreview(null);
      mostrarMensaje(
        "error",
        error.response?.data?.error || "Error al subir la imagen",
      );
    } finally {
      setSubiendoAvatar(false);
      e.target.value = "";
    }
  };

  const handleEliminarAvatar = async () => {
    setSubiendoAvatar(true);
    try {
      await api.delete("/auth/avatar");
      await checkAuth();
      mostrarMensaje("exito", "Foto de perfil eliminada");
    } catch {
      mostrarMensaje("error", "Error al eliminar la foto");
    } finally {
      setSubiendoAvatar(false);
    }
  };

  const handleGuardar = async () => {
      if (form.password) {
        const { isValid, errors } = validatePassword(form.password);
        if (!isValid) {
          dispatchEdit({ type: "SET_ERRORES_PASSWORD", errors });
          mostrarMensaje("error", errors[0]);
          return;
        }
      if (form.password !== form.confirmPassword) {
        mostrarMensaje("error", "Las contraseñas no coinciden");
        return;
      }
    }

    const nameValidation = validateName(form.name);
    if (!nameValidation.isValid) {
      mostrarMensaje("error", nameValidation.error);
      return;
    }

    setGuardando(true);
    try {
      const payload = {
        name: form.name,
        ...(form.weight && { weight: parseFloat(form.weight) }),
        alergia: form.alergia.trim(),
      };
      if (form.password) payload.password = form.password;
      await api.put("/auth/profile", payload);
      await checkAuth();
      dispatchEdit({ type: "END_EDIT" });
      setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      mostrarMensaje("exito", "¡Perfil actualizado correctamente!");
    } catch (error) {
      mostrarMensaje(
        "error",
        error.response?.data?.error || "Error al actualizar",
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelar = () => {
    dispatchEdit({ type: "END_EDIT" });
    setMensaje(null);
    setForm({
      name: user?.name || "",
      weight: user?.weight || "",
      alergia: user?.alergia || "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleEliminarCuenta = async () => {
    if (confirmTexto !== "ELIMINAR") {
      mostrarMensaje("error", "Escribe ELIMINAR para confirmar");
      return;
    }
    setEliminandoCuenta(true);
    try {
      await api.delete("/auth/account", { data: { confirmacion: "ELIMINAR" } });
      await logout();
      navigate("/");
    } catch (error) {
      mostrarMensaje(
        "error",
        error.response?.data?.error || "Error al eliminar la cuenta",
      );
      setEliminandoCuenta(false);
    }
  };

  const handleCerrarSesion = async () => {
    await logout();
    navigate("/");
  };

  const userName = user?.name;
  const initials = useMemo(() => {
    if (!userName) return "?";
    return userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [userName]);

  const userCreatedAt = user?.createdAt;
  const joinDate = useMemo(() =>
    userCreatedAt
      ? new Date(userCreatedAt).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
        })
      : "Fecha desconocida"
  , [userCreatedAt]);

  const avatarSrc = avatarPreview || user?.avatar;

  return (
    <div className="perfil-pagina">
      <div className="perfil-contenedor">
        {/*Sidebar*/}
        <ProfileSidebar
          avatarSrc={avatarSrc}
          initials={initials}
          setVerFoto={setVerFoto}
          subiendoAvatar={subiendoAvatar}
          handleAvatarClick={handleAvatarClick}
          fileInputRef={fileInputRef}
          handleAvatarChange={handleAvatarChange}
          user={user}
          handleEliminarAvatar={handleEliminarAvatar}
          joinDate={joinDate}
          handleCerrarSesion={handleCerrarSesion}
        />

        {/*Contenido principal*/}
        <div className="perfil-contenido">
          <div className="perfil-header">
            <div>
              <h1 className="perfil-titulo">
                <span className="titulo-linea-verde" />
                Mi Perfil
              </h1>
              <p className="perfil-subtitulo">
                Gestiona tu información personal y preferencias
              </p>
            </div>
            {!editando ? (
              <button type="button" className="btn-editar" onClick={() => dispatchEdit({ type: "OPEN_EDIT" })}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Editar perfil
              </button>
            ) : (
              <div className="btn-group">
                <button type="button" className="btn-cancelar" onClick={handleCancelar}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-guardar"
                  onClick={handleGuardar}
                  disabled={guardando}
                >
                  {guardando ? (
                    <span className="spinner" />
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  {guardando ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            )}
          </div>

          {mensaje && (
            <div className={`perfil-mensaje perfil-mensaje--${mensaje.tipo}`}>
              <span>{mensaje.tipo === "exito" ? "✅" : "⚠️"}</span>
              {mensaje.texto}
            </div>
          )}

          <PersonalInfoSection
            editando={editando}
            form={form}
            touched={touched}
            avisosCampo={avisosCampo}
            handleChange={handleChange}
            handleBlurPerf={handleBlurPerf}
            user={user}
            formatBirthDate={formatBirthDate}
          />

          <SecuritySection
            editando={editando}
            form={form}
            handleChange={handleChange}
            user={user}
          />

          {!user?.googleId && (
            <div className="perfil-seccion">
              <div className="seccion-titulo">
                <div className="seccion-icono">🔒</div>
                <h3>Seguridad</h3>
              </div>
              {editando ? (
                <div className="campos-grid">
                  <div className="campo-grupo">
                    <label className="campo-label" htmlFor="up-password">Nueva contraseña</label>
                    <div className="inputWrapper">
                      <input
                        id="up-password"
                        className={`campo-input ${erroresPassword.length > 0 && form.password ? "campo-input--error" : ""}`}
                        type={showPass ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        onBlur={() => handleBlurPerf("password")}
                        placeholder="Dejar vacío para no cambiar"
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
                        {
                          ok: form.password.length >= 8,
                          label: "Mínimo 8 caracteres",
                        },
                        {
                          ok: /[a-z]/.test(form.password),
                          label: "Una letra minúscula",
                        },
                        {
                          ok: /[A-Z]/.test(form.password),
                          label: "Una letra mayúscula",
                        },
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
                      items={[
                        {
                          ok:
                            form.confirmPassword &&
                            form.confirmPassword === form.password,
                          label: "Las contraseñas coinciden",
                        },
                      ]}
                    />
                    <AvisoCampo field="confirmPassword" avisos={avisosCampo} />
                  </div>
                </div>
              ) : (
                <div className="campo-grupo">
                  <label className="campo-label" htmlFor="up-contrasena">Contraseña</label>
                  <div id="up-contrasena" className="campo-valor">••••••••••</div>
                </div>
              )}
            </div>
          )}

          {user?.googleId && (
            <div className="perfil-seccion perfil-seccion--google">
              <div className="google-vinculo">
                <div className="google-logo">
                  <svg viewBox="0 0 24 24" width="28" height="28">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="google-titulo">Cuenta vinculada con Google</p>
                  <p className="google-desc">
                    Tu sesión se gestiona de forma segura a través de Google
                    OAuth
                  </p>
                </div>
                <div className="google-check">✓</div>
              </div>
            </div>
          )}

          {/* Zona peligrosa — Eliminar cuenta */}
          {!user?.isSuperAdmin && (
            <div className="perfil-seccion perfil-seccion--peligro">
              <div className="seccion-titulo">
                <div className="seccion-icono seccion-icono--peligro">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </div>
                <h3>Zona de peligro</h3>
              </div>
              <p className="peligro-desc">
                Eliminar tu cuenta borrará permanentemente todos tus datos:
                consumos, reseñas y configuraciones. Esta acción no se puede
                deshacer.
              </p>
              <button
                type="button"
                className="btn-eliminar-cuenta"
                onClick={() => setModalEliminar(true)}
              >
                Eliminar mi cuenta
              </button>
            </div>
          )}

          <div className="perfil-deco-bottom">
            <div className="deco-linea" />
            <span className="deco-hoja">🌿</span>
            <div className="deco-linea" />
          </div>
        </div>
      </div>

      {verFoto && avatarSrc && (
        <div className="foto-modal-overlay" role="button" tabIndex={0} onClick={() => setVerFoto(false)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setVerFoto(false); }}}>
          <div className="foto-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="foto-modal-cerrar"
              aria-label="Cerrar vista de foto"
              onClick={() => setVerFoto(false)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <img
              src={avatarSrc}
              alt={user?.name}
              className="foto-modal-img"
              referrerPolicy="no-referrer"
            />
            <p className="foto-modal-nombre">{user?.name}</p>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminación */}
      {modalEliminar && (
        <div
          className="modal-overlay"
          role="button"
          tabIndex={0}
          onClick={() => {
            setModalEliminar(false);
            setConfirmTexto("");
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setModalEliminar(false);
              setConfirmTexto("");
            }
          }}
        >
          <div
            className="modal-eliminar-cuenta"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-eliminar__icono">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3>¿Eliminar tu cuenta?</h3>
            <p>
              Esta acción es <strong>permanente e irreversible</strong>. Se
              eliminarán:
            </p>
            <ul>
              <li>Todos tus consumos registrados</li>
              <li>Todas tus reseñas en recetas</li>
              <li>Tu perfil y configuraciones</li>
            </ul>
            <p className="modal-eliminar__instruccion">
              Escribe <strong>ELIMINAR</strong> para confirmar:
            </p>
            <input
              className="modal-eliminar__input"
              type="text"
              value={confirmTexto}
              onChange={(e) => setConfirmTexto(e.target.value)}
              placeholder="ELIMINAR"
              autoFocus
            />
            <div className="modal-eliminar__acciones">
              <button
                type="button"
                className="modal-eliminar__btn-cancelar"
                onClick={() => {
                  setModalEliminar(false);
                  setConfirmTexto("");
                }}
                disabled={eliminandoCuenta}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="modal-eliminar__btn-confirmar"
                onClick={handleEliminarCuenta}
                disabled={eliminandoCuenta || confirmTexto !== "ELIMINAR"}
              >
                {eliminandoCuenta ? "Eliminando..." : "Eliminar cuenta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;