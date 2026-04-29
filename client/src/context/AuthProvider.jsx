import { useState, useEffect, useCallback, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./authContext";
import api from "../api/axios";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Refs para el sistema de cierre automático
  const inactivityTimerRef = useRef(null);
  const autoLogoutEnabledRef = useRef(false);
  const autoLogoutMinutesRef = useRef(15);
  //Limpiar sesión
  const limpiarSesion = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  //Timer de inactividad
  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const resetInactivityTimer = useCallback(() => {
    // Solo actúa si el auto-logout está habilitado para este usuario
    if (!autoLogoutEnabledRef.current) return;

    clearInactivityTimer();
    const ms = autoLogoutMinutesRef.current * 60 * 1000;
    inactivityTimerRef.current = setTimeout(() => {
      limpiarSesion();
    }, ms);
  }, [clearInactivityTimer, limpiarSesion]);

  //Registrar/quitar eventos de actividad del usuario
  const ACTIVITY_EVENTS = [
    "mousemove",
    "keydown",
    "mousedown",
    "touchstart",
    "scroll",
    "click",
  ];

  const stopActivityListeners = useCallback(() => {
    ACTIVITY_EVENTS.forEach((ev) =>
      window.removeEventListener(ev, resetInactivityTimer),
    );
    clearInactivityTimer();
  }, [clearInactivityTimer, resetInactivityTimer]);

  const startActivityListeners = useCallback(() => {
    stopActivityListeners();
    ACTIVITY_EVENTS.forEach((ev) =>
      window.addEventListener(ev, resetInactivityTimer, { passive: true }),
    );
    resetInactivityTimer(); // arrancar el timer de inmediato
  }, [stopActivityListeners, resetInactivityTimer]);

  //Cierre al ocultar la pestaña/ventana
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "hidden" &&
        autoLogoutEnabledRef.current
      ) {
        limpiarSesion();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [limpiarSesion]);

  //Actualizar preferencias de auto-logout en vivo
  const applyAutoLogoutPrefs = useCallback(
    (enabled, minutes) => {
      autoLogoutEnabledRef.current = enabled;
      autoLogoutMinutesRef.current = minutes ?? 15;

      if (enabled) {
        startActivityListeners();
      } else {
        stopActivityListeners();
      }
    },
    [startActivityListeners, stopActivityListeners],
  );

  // Guarda en BD y actualiza el estado local al instante
  const updateAutoLogout = useCallback(
    async (enabled, minutes) => {
      try {
        const payload = { autoLogoutEnabled: enabled };
        if (minutes !== undefined) payload.autoLogoutMinutes = minutes;

        await api.patch("/auth/preferences", payload);

        // Actualizar el user en el estado
        setUser((prev) =>
          prev
            ? {
                ...prev,
                autoLogoutEnabled: enabled,
                autoLogoutMinutes: minutes ?? prev.autoLogoutMinutes,
              }
            : prev,
        );

        // Aplicar la lógica de listeners/timer de inmediato
        applyAutoLogoutPrefs(enabled, minutes);

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || "Error al guardar preferencia",
        };
      }
    },
    [applyAutoLogoutPrefs],
  );

  //checkAuth
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        limpiarSesion();
        setLoading(false);
        return;
      }
    } catch {
      limpiarSesion();
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);

      // Arrancar/parar listeners según la preferencia guardada en BD
      applyAutoLogoutPrefs(
        data.user.autoLogoutEnabled ?? false,
        data.user.autoLogoutMinutes ?? 15,
      );
    } catch (error) {
      if (error.sinConexion) {
        console.warn("[Auth] Backend no disponible, manteniendo sesión local.");
      } else if (
        error.response?.status === 401 ||
        error.response?.status === 404
      ) {
        limpiarSesion();
      }
    } finally {
      setLoading(false);
    }
  }, [limpiarSesion, applyAutoLogoutPrefs]);

  // Verificar al montar
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Verificar cada 2 minutos que el usuario sigue existiendo
  useEffect(() => {
    const intervalo = setInterval(
      () => {
        const token = localStorage.getItem("token");
        if (token && user) checkAuth();
      },
      2 * 60 * 1000,
    );
    return () => clearInterval(intervalo);
  }, [user, checkAuth]);

  // Detectar cambios en localStorage desde otras pestañas
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "token" && !e.newValue) {
        setUser(null);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Limpiar listeners cuando el usuario cierra sesión
  useEffect(() => {
    if (!user) {
      stopActivityListeners();
    }
  }, [user, stopActivityListeners]);

  //Funciones de auth
  const register = async (userData) => {
    try {
      const { data } = await api.post("/auth/register", userData);
      if (data.needsVerification) {
        return { success: true, needsVerification: true, email: data.email };
      }
      if (data.token) {
        localStorage.setItem("token", data.token);
        setUser(data.user);
      }
      return { success: true };
    } catch (error) {
      if (error.sinConexion) {
        return {
          success: false,
          error:
            "No se puede conectar al servidor. Verifica que el backend esté corriendo.",
        };
      }
      const err = error.response?.data;
      return {
        success: false,
        error: err?.error || "Error en registro",
        needsVerification: err?.needsVerification,
        email: err?.email,
      };
    }
  };

  const login = async (credentials) => {
    try {
      const { data } = await api.post("/auth/login", credentials);
      localStorage.setItem("token", data.token);
      setUser(data.user);

      // Al iniciar sesión, aplicar las preferencias del usuario recién autenticado
      applyAutoLogoutPrefs(
        data.user.autoLogoutEnabled ?? false,
        data.user.autoLogoutMinutes ?? 15,
      );

      return { success: true };
    } catch (error) {
      if (error.sinConexion) {
        return {
          success: false,
          error:
            "No se puede conectar al servidor. Verifica que el backend esté corriendo.",
        };
      }
      const err = error.response?.data;
      return {
        success: false,
        error: err?.error || "Error en login",
        locked: err?.locked,
        lockUntil: err?.lockUntil,
        needsVerification: err?.needsVerification,
        email: err?.email,
        attemptsLeft: err?.attemptsLeft,
      };
    }
  };

  const logout = useCallback(() => {
    stopActivityListeners();
    limpiarSesion();
  }, [stopActivityListeners, limpiarSesion]);

  const forgotPassword = async (email) => {
    try {
      await api.post("/auth/forgot-password", { email });
      return { success: true };
    } catch (error) {
      if (error.sinConexion)
        return { success: false, error: "Sin conexión al servidor." };
      return { success: false, error: error.response?.data?.error };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const { data } = await api.put(`/auth/reset-password/${token}`, {
        password,
      });
      localStorage.setItem("token", data.token);
      return { success: true };
    } catch (error) {
      if (error.sinConexion)
        return { success: false, error: "Sin conexión al servidor." };
      return { success: false, error: error.response?.data?.error };
    }
  };

  const isAdmin = () => user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        forgotPassword,
        resetPassword,
        isAdmin,
        checkAuth,
        updateAutoLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
