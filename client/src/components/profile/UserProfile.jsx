import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import api from "../../api/axios";
import { validatePassword, validateName } from "../../utils/validation";

/*  Iconos inline  */
import "./UserProfile.css";

const EyeIcon = ({ open }) =>
  open ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

const NumeroInput = ({
  name,
  value,
  onChange,
  placeholder,
  min,
  max,
  step,
}) => {
  const s = parseFloat(step) || 1;
  const increment = () => {
    const v = parseFloat(value) || (min ?? 0);
    if (max !== undefined && v >= max) return;
    onChange({
      target: { name, value: String(parseFloat((v + s).toFixed(4))) },
    });
  };
  const decrement = () => {
    const v = parseFloat(value) || (min ?? 0);
    if (min !== undefined && v <= min) return;
    onChange({
      target: { name, value: String(parseFloat((v - s).toFixed(4))) },
    });
  };
  return (
    <div className="numero-wrapper">
      <input
        className="campo-input"
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
      />
      <div className="numero-flechas">
        <button type="button" onClick={increment}>
          <svg viewBox="0 0 24 24" fill="none">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
        <button type="button" onClick={decrement}>
          <svg viewBox="0 0 24 24" fill="none">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, marginTop: "1px" }}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const AvisoInline = ({ titulo, mensaje, variante = "naranja" }) => (
  <div className={`aviso-inline aviso-inline--${variante}`}>
    <InfoIcon />
    <span>
      <strong>{titulo}</strong> {mensaje}
    </span>
  </div>
);

const FieldHint = ({ show, items }) => {
  if (!show || !items || items.length === 0) return null;
  if (items.every((i) => i.ok)) return null;
  return (
    <ul className="field-hints">
      {items.map((item, idx) => (
        <li key={idx} className={item.ok ? "hint-ok" : "hint-pending"}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            width="12"
            height="12"
          >
            {item.ok ? (
              <polyline points="20 6 9 17 4 12" />
            ) : (
              <circle cx="12" cy="12" r="9" />
            )}
          </svg>
          {item.label}
        </li>
      ))}
    </ul>
  );
};

const UserProfile = () => {
  const { user, checkAuth, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef  = useRef(null);
  const mensajeTimer  = useRef(null);

  const [editando, setEditando] = useState(false);
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
  const [erroresPassword, setErroresPassword] = useState([]);

  const [form, setForm] = useState({
    name: user?.name || "",
    weight: user?.weight || "",
    alergia: user?.alergia || "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.name || "",
        weight: user.weight || "",
        alergia: user.alergia || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (mensajeTimer.current) clearTimeout(mensajeTimer.current);
    };
  }, []);

  const [touched, setTouched] = useState({});
  const [avisosCampo, setAvisos] = useState({});

  const mostrarMensaje = (tipo, texto) => {
    if (mensajeTimer.current) clearTimeout(mensajeTimer.current);
    setMensaje({ tipo, texto });
    mensajeTimer.current = setTimeout(() => setMensaje(null), 3500);
  };

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

  const AVISOS_PERF = {
    nombre_caracteres: {
      titulo: "Solo letras.",
      mensaje: "El nombre no puede contener números ni símbolos.",
      variante: "naranja",
    },
    pass_debil: {
      titulo: "Contraseña débil.",
      mensaje:
        "Usa al menos 8 caracteres combinando mayúsculas, minúsculas y un número.",
      variante: "naranja",
    },
    passConf_mismatch: {
      titulo: "No coinciden.",
      mensaje: "Las contraseñas ingresadas son distintas. Verifícalas.",
      variante: "rojo",
    },
    peso_bajo: {
      titulo: "Peso mínimo 40 kg.",
      mensaje: "Ingresa un peso válido.",
      variante: "naranja",
    },
    peso_alto: {
      titulo: "Peso máximo 300 kg.",
      mensaje: "El valor máximo aceptado es 300 kg.",
      variante: "rojo",
    },
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nuevoForm = { ...form, [name]: value };
    setForm(nuevoForm);

    if (name === "password") {
      if (value) {
        const { errors } = validatePassword(value);
        setErroresPassword(errors);
      } else {
        setErroresPassword([]);
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
      setAvisos((prev) => ({ ...prev, [name]: avisoKey, ...extra }));
    }
  };

  const handleBlurPerf = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const avisoKey = calcularAvisoPerf(field, form[field], form);
    setAvisos((prev) => ({ ...prev, [field]: avisoKey }));
  };

  const renderAvisoPerfil = (field) => {
    const key = avisosCampo[field];
    if (!key || !AVISOS_PERF[key]) return null;
    const { titulo, mensaje, variante } = AVISOS_PERF[key];
    return (
      <AvisoInline titulo={titulo} mensaje={mensaje} variante={variante} />
    );
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
        setErroresPassword(errors);
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
      setEditando(false);
      setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      setErroresPassword([]);
      setTouched({});
      setAvisos({});
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
    setEditando(false);
    setMensaje(null);
    setErroresPassword([]);
    setForm({
      name: user?.name || "",
      weight: user?.weight || "",
      alergia: user?.alergia || "",
      password: "",
      confirmPassword: "",
    });
    setTouched({});
    setAvisos({});
  };

  const handleEliminarCuenta = async () => {
    if (confirmTexto !== "ELIMINAR") {
      mostrarMensaje("error", "Escribe ELIMINAR para confirmar");
      return;
    }
    setEliminandoCuenta(true);
    try {
      await api.delete("/auth/account", { data: { confirmacion: "ELIMINAR" } });
      logout();
      navigate("/");
    } catch (error) {
      mostrarMensaje(
        "error",
        error.response?.data?.error || "Error al eliminar la cuenta",
      );
      setEliminandoCuenta(false);
    }
  };

  const handleCerrarSesion = () => {
    logout();
    navigate("/");
  };

  const initials = useMemo(() => {
    if (!user?.name) return "?";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [user?.name]);

  const formatBirthDate = (bd) => {
    if (!bd) return "—";
    const fecha = new Date(bd);
    return fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const joinDate = useMemo(() =>
    user?.createdAt
      ? new Date(user.createdAt).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
        })
      : "Fecha desconocida"
  , [user?.createdAt]);

  const avatarSrc = avatarPreview || user?.avatar;

  return (
    <div className="perfil-pagina">
      <div className="perfil-contenedor">
        {/*Sidebar*/}
        <div className="perfil-sidebar">
          <div className="perfil-identidad">
            <div
              className={`avatar-wrapper ${avatarSrc ? "avatar-wrapper--clickable" : ""}`}
              onClick={() => avatarSrc && setVerFoto(true)}
              title={avatarSrc ? "Ver foto de perfil" : ""}
            >
              <div className="avatar-anillo" />
              {avatarSrc && !avatarSrc.includes("googleusercontent.com") ? (
                <img
                  src={avatarSrc}
                  alt={user?.name}
                  className="avatar-img"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="avatar-iniciales"
                style={{
                  display:
                    avatarSrc && !avatarSrc.includes("googleusercontent.com")
                      ? "none"
                      : "flex",
                }}
              >
                <span>{initials}</span>
              </div>
            </div>

            <button
              className="avatar-cambiar"
              onClick={handleAvatarClick}
              title="Cambiar foto de perfil"
              disabled={subiendoAvatar}
            >
              {subiendoAvatar ? (
                <span className="spinner" />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />

            {user?.avatar && (
              <button
                className="btn-quitar-avatar"
                onClick={handleEliminarAvatar}
                disabled={subiendoAvatar}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
                Quitar foto
              </button>
            )}

            <h2 className="perfil-nombre">{user?.name}</h2>
            <p className="perfil-email-display">{user?.email}</p>

            {user?.role === "admin" && (
              <div className="perfil-rol-badge">
                <span>Administrador</span>
              </div>
            )}

            <div className="perfil-stats">
              <div className="stat-item">
                <span className="stat-icono">📅</span>
                <div>
                  <p className="stat-label">Miembro desde</p>
                  <p className="stat-valor">{joinDate}</p>
                </div>
              </div>

              {user?.googleId && (
                <div className="stat-item">
                  <span className="stat-icono">🔗</span>
                  <div>
                    <p className="stat-label">Vinculada con</p>
                    <p className="stat-valor">Google</p>
                  </div>
                </div>
              )}
            </div>

            <button className="btn-cerrar-sesion" onClick={handleCerrarSesion}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 21H5a2 2 0 0 0-2 2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Cerrar sesión
            </button>
          </div>

          <div className="sidebar-deco">
            <svg
              viewBox="0 0 200 300"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 280 C100 280 100 100 100 80"
                stroke="rgba(79,119,45,0.4)"
                strokeWidth="2"
              />
              <path
                d="M100 200 C70 180 40 160 60 130 C80 100 100 140 100 140"
                fill="rgba(79,119,45,0.25)"
                stroke="rgba(79,119,45,0.4)"
                strokeWidth="1.5"
              />
              <path
                d="M100 170 C130 150 160 130 140 100 C120 70 100 110 100 110"
                fill="rgba(79,119,45,0.2)"
                stroke="rgba(79,119,45,0.35)"
                strokeWidth="1.5"
              />
              <path
                d="M100 240 C75 225 55 200 70 175 C85 150 100 180 100 180"
                fill="rgba(247,127,0,0.15)"
                stroke="rgba(247,127,0,0.3)"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>

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
              <button className="btn-editar" onClick={() => setEditando(true)}>
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
                <button className="btn-cancelar" onClick={handleCancelar}>
                  Cancelar
                </button>
                <button
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

          <div className="perfil-seccion">
            <div className="seccion-titulo">
              <div className="seccion-icono">🌱</div>
              <h3>Datos personales</h3>
            </div>
            <div className="campos-grid">
              <div className="campo-grupo">
                <label className="campo-label">Nombre completo</label>
                {editando ? (
                  <>
                    <input
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
                        {
                          ok: form.name.trim().length >= 2,
                          label: "Mínimo 2 caracteres",
                        },
                        {
                          ok: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(
                            form.name.trim(),
                          ),
                          label: "Solo letras y espacios",
                        },
                      ]}
                    />
                    {renderAvisoPerfil("name")}
                  </>
                ) : (
                  <div className="campo-valor">{user?.name || "—"}</div>
                )}
              </div>

              <div className="campo-grupo">
                <label className="campo-label">Correo electrónico</label>
                <div className="campo-valor campo-valor--bloqueado">
                  {user?.email}
                  <span className="campo-lock">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                </div>
                <p className="campo-hint">El email no se puede modificar</p>
              </div>

              <div className="campo-grupo">
                <label className="campo-label">Fecha de nacimiento</label>
                <div className="campo-valor campo-valor--bloqueado campo-valor--fecha">
                  <div className="campo-fecha-fila">
                    <span className="campo-fecha-texto">
                      {formatBirthDate(user?.birthDate)}
                    </span>
                    <div className="campo-fecha-meta">
                      {user?.age != null && (
                        <span className="campo-edad-badge">
                          {user.age} años
                        </span>
                      )}
                      <span className="campo-lock">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect
                            x="3"
                            y="11"
                            width="18"
                            height="11"
                            rx="2"
                            ry="2"
                          />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
                <p className="campo-hint">
                  La fecha de nacimiento no se puede modificar
                </p>
              </div>

              <div className="campo-grupo">
                <label className="campo-label">Peso (kg)</label>
                {editando ? (
                  <>
                    <NumeroInput
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
                      items={
                        form.weight
                          ? [
                              {
                                ok: parseFloat(form.weight) >= 40,
                                label: "Mínimo 40 kg",
                              },
                              {
                                ok: parseFloat(form.weight) <= 300,
                                label: "Máximo 300 kg",
                              },
                            ]
                          : []
                      }
                    />
                    {renderAvisoPerfil("weight")}
                  </>
                ) : (
                  <div className="campo-valor">
                    {user?.weight ? `${user.weight} kg` : "—"}
                  </div>
                )}
              </div>

              <div className="campo-grupo">
                <label className="campo-label">Altura (cm)</label>
                <div className="campo-valor campo-valor--bloqueado">
                  {user?.height ? `${user.height} cm` : "—"}
                  <span className="campo-lock">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                </div>
                <p className="campo-hint">La altura no se puede modificar</p>
              </div>
            </div>
          </div>

          <div className="campo-grupo">
            <label className="campo-label">Alergia alimentaria</label>
            {editando ? (
              <input
                className="campo-input"
                type="text"
                name="alergia"
                value={form.alergia}
                onChange={handleChange}
                placeholder="Ej: maní, lactosa, gluten..."
              />
            ) : (
              <div className="campo-valor">{user?.alergia || "—"}</div>
            )}
          </div>

          {!user?.googleId && (
            <div className="perfil-seccion">
              <div className="seccion-titulo">
                <div className="seccion-icono">🔒</div>
                <h3>Seguridad</h3>
              </div>
              {editando ? (
                <div className="campos-grid">
                  <div className="campo-grupo">
                    <label className="campo-label">Nueva contraseña</label>
                    <div className="inputWrapper">
                      <input
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
                    {renderAvisoPerfil("password")}
                  </div>
                  <div className="campo-grupo">
                    <label className="campo-label">Confirmar contraseña</label>
                    <div className="inputWrapper">
                      <input
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
                    {renderAvisoPerfil("confirmPassword")}
                  </div>
                </div>
              ) : (
                <div className="campo-grupo">
                  <label className="campo-label">Contraseña</label>
                  <div className="campo-valor">••••••••••</div>
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
        <div className="foto-modal-overlay" onClick={() => setVerFoto(false)}>
          <div className="foto-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="foto-modal-cerrar"
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
          onClick={() => {
            setModalEliminar(false);
            setConfirmTexto("");
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