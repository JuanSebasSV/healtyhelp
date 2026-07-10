import { useState, useEffect, useCallback, useMemo, useRef, useEffectEvent } from "react";
import api from "../api/axios";
import { AuthContext } from "./authContext";

const ACTIVITY_EVENTS = [
  "mousemove",
  "keydown",
  "mousedown",
  "touchstart",
  "scroll",
  "click",
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const inactivityTimerRef = useRef(null);
  const autoLogoutEnabledRef = useRef(false);
  const autoLogoutMinutesRef = useRef(15);
  const checkAuthRetryRef = useRef(0);
  const checkAuthRef = useRef(null);
  const visibilityTimerRef = useRef(null);
  const limpiarSesion = useCallback(() => {
    if (visibilityTimerRef.current) {
      clearTimeout(visibilityTimerRef.current);
      visibilityTimerRef.current = null;
    }
    try { localStorage.removeItem('token'); sessionStorage.removeItem('token'); } catch (e) { void e; }
    setUser(null);
  }, []);

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (!autoLogoutEnabledRef.current) return;

    clearInactivityTimer();
    const ms = autoLogoutMinutesRef.current * 60 * 1000;
    inactivityTimerRef.current = setTimeout(() => {
      limpiarSesion();
    }, ms);
  }, [clearInactivityTimer, limpiarSesion]);

  const activityEventsRef = useRef(ACTIVITY_EVENTS);

  const stopActivityListeners = useCallback(() => {
    activityEventsRef.current.forEach((ev) =>
      window.removeEventListener(ev, resetInactivityTimer),
    );
    clearInactivityTimer();
  }, [clearInactivityTimer, resetInactivityTimer]);

  const startActivityListeners = useCallback(() => {
    stopActivityListeners();
    activityEventsRef.current.forEach((ev) =>
      window.addEventListener(ev, resetInactivityTimer, { passive: true }),
    );
    resetInactivityTimer();
  }, [stopActivityListeners, resetInactivityTimer]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!autoLogoutEnabledRef.current) return;
  
      if (document.visibilityState === "hidden") {
        const ms = autoLogoutMinutesRef.current * 60 * 1000;
        visibilityTimerRef.current = setTimeout(() => {
          limpiarSesion();
        }, ms);
      } else {
        if (visibilityTimerRef.current) {
          clearTimeout(visibilityTimerRef.current);
          visibilityTimerRef.current = null;
        }
      }
    };
  
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (visibilityTimerRef.current) clearTimeout(visibilityTimerRef.current);
    };
  }, [limpiarSesion]);

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

  const updateAutoLogout = useCallback(
    async (enabled, minutes) => {
      try {
        const payload = { autoLogoutEnabled: enabled };
        if (minutes !== undefined) payload.autoLogoutMinutes = minutes;

        await api.patch("/auth/preferences", payload);

        setUser((prev) =>
          prev
            ? {
                ...prev,
                autoLogoutEnabled: enabled,
                autoLogoutMinutes: minutes ?? prev.autoLogoutMinutes,
              }
            : prev,
        );

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

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      const userData = data.user;
      if (userData && !userData._id && userData.id) userData._id = userData.id;
      setUser(userData);
      applyAutoLogoutPrefs(
        data.user?.autoLogoutEnabled ?? false,
        data.user?.autoLogoutMinutes ?? 15,
      );
      checkAuthRetryRef.current = 0;
      setLoading(false);
    } catch (error) {
      if (error.sinConexion && checkAuthRetryRef.current < 8) {
        checkAuthRetryRef.current++;
        const delay = Math.min(1000 * checkAuthRetryRef.current, 5000);
        setTimeout(() => checkAuthRef.current?.(), delay);
      } else {
        checkAuthRetryRef.current = 0;
        if (
          error.response?.status === 401 ||
          error.response?.status === 404
        ) {
          limpiarSesion();
        }
        setLoading(false);
      }
    }
  }, [limpiarSesion, applyAutoLogoutPrefs]);

  useEffect(() => {
    checkAuthRef.current = checkAuth;
  }, [checkAuth]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const onTickIntervalo = useEffectEvent(() => {
    if (user) checkAuth();
  });

  useEffect(() => {
    const intervalo = setInterval(onTickIntervalo, 2 * 60 * 1000);
    return () => clearInterval(intervalo);
  }, [user]);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "token" && !e.newValue) {
        setUser(null);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (!user) {
      stopActivityListeners();
    }
  }, [user, stopActivityListeners]);

  const register = useCallback(async (userData) => {
    try {
      const { data } = await api.post("/auth/register", userData);
      if (data.needsVerification) {
        return { success: true, needsVerification: true, email: data.email };
      }
      if (data.user) {
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
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      const { data } = await api.post("/auth/login", credentials);
      if (data.user) setUser(data.user);

      applyAutoLogoutPrefs(
        data.user?.autoLogoutEnabled ?? false,
        data.user?.autoLogoutMinutes ?? 15,
      );

      return {
        success: true,
        needsGooglePassword: !!data.needsGooglePassword,
      };
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
  }, [applyAutoLogoutPrefs]);

  const logout = useCallback(async () => {
    stopActivityListeners();
    try {
      await api.post("/auth/logout");
    } catch (e) {
      if (!e.sinConexion) console.error('Logout error:', e.message);
    }
    limpiarSesion();
  }, [stopActivityListeners, limpiarSesion]);

  const forgotPassword = useCallback(async (email) => {
    try {
      await api.post("/auth/forgot-password", { email });
      return { success: true };
    } catch (error) {
      if (error.sinConexion)
        return { success: false, error: "Sin conexión al servidor." };
      return { success: false, error: error.response?.data?.error };
    }
  }, []);

  const resetPassword = useCallback(async (token, password) => {
    try {
      const { data } = await api.put(`/auth/reset-password/${token}`, {
        password,
      });
      if (data?.user) setUser(data.user);
      else await checkAuth();
      return { success: true };
    } catch (error) {
      if (error.sinConexion)
        return { success: false, error: "Sin conexión al servidor." };
      return { success: false, error: error.response?.data?.error };
    }
  }, [checkAuth]);

  const contextValue = useMemo(() => ({
    user,
    loading,
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    isAdmin: () => user?.role === "admin",
    checkAuth,
    updateAutoLogout,
  }), [user, loading, register, login, logout, forgotPassword, resetPassword, checkAuth, updateAutoLogout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};