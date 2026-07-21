import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  lazy,
  Suspense,
} from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./context/AuthProvider";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import FondoAnimado from "./components/layout/FondoAnimado";
import PrivateRoute from "./components/layout/PrivateRoute";
import api from "./api/axios";
import useAuth from "./hooks/useAuth";

const safeLazy = (importFn, nombre) => lazy(() => {
  if (!navigator.onLine) {
    console.info(`[Red] Sin conexión para cargar "${nombre}".`);
    return Promise.resolve({ default: () => null });
  }
  return importFn();
});

const UserProfile = safeLazy(() => import("./components/profile/UserProfile"), "UserProfile");
const Login = safeLazy(() => import("./components/auth/Login"), "Login");
const Register = safeLazy(() => import("./components/auth/Register"), "Register");
const GoogleCallback = safeLazy(() => import("./components/auth/GoogleCallback"), "GoogleCallback");
const ForgotPassword = safeLazy(() => import("./components/auth/ForgotPassword"), "ForgotPassword");
const ResetPassword = safeLazy(() => import("./components/auth/ResetPassword"), "ResetPassword");
const VerificarEmail = safeLazy(() => import("./components/auth/VerificarEmail"), "VerificarEmail");
const VistaInicio = safeLazy(() => import("./components/inicio/VistaInicio"), "VistaInicio");
const VistaSeguimiento = safeLazy(() => import("./components/vistas/VistaSeguimiento"), "VistaSeguimiento");
const VistaFavoritos = safeLazy(() => import("./components/vistas/VistaFavoritos"), "VistaFavoritos");
const VistaContacto = safeLazy(() => import("./components/vistas/VistaContacto"), "VistaContacto");
const VistaChatbot = safeLazy(() => import("./components/vistas/VistaChatbot"), "VistaChatbot");
const Dashboard = safeLazy(() => import("./components/admin/Dashboard"), "Dashboard");
const UserList = safeLazy(() => import("./components/admin/UserList"), "UserList");
const Stats = safeLazy(() => import("./components/admin/Stats"), "Stats");
const RecipeManagement = safeLazy(() => import("./components/admin/RecipeManagement"), "RecipeManagement");
const ImagenesAprobacion = safeLazy(() => import("./components/admin/ImagenesAprobacion"), "ImagenesAprobacion");
const RobotIA = safeLazy(() => import("./components/inicio/RobotIA"), "RobotIA");
const ModalTerminos = safeLazy(() => import("./components/admin/ModalTerminos"), "ModalTerminos");
const ModalCompletarPerfil = safeLazy(() => import("./components/admin/ModalCompletarPerfil"), "ModalCompletarPerfil");
const ModalCookies = safeLazy(() => import("./components/admin/ModalCookies"), "ModalCookies");
const ModalGooglePassword = safeLazy(() => import("./components/auth/ModalGooglePassword"), "ModalGooglePassword");

const COOKIE_CONSENT_KEY = "hh_cookie_consent";
const TERMS_ACCEPTED_KEY = "hh_terms_accepted";
const TERMS_VERSION_KEY = "hh_terms_version";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const getCookie = (name) => {
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name + "=([^;]*)"),
  );
  return match ? decodeURIComponent(match[1]) : null;
};

const setCookie = (name, value, maxAge = COOKIE_MAX_AGE) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
};

const cookiesConsentidas = () => {
  try {
    return getCookie(COOKIE_CONSENT_KEY) === "accepted" ||
      localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted";
  } catch {
    return false;
  }
};

const safeGet = (storage, key) => {
  try { return storage.getItem(key); } catch { return null; }
};
const safeSet = (storage, key, value) => {
  try { storage.setItem(key, value); } catch { /* QuotaExceeded o storage deshabilitado */ }
};
const safeRemove = (storage, key) => {
  try { storage.removeItem(key); } catch { /* noop */ }
};

const getPersisted = (key) => {
  if (cookiesConsentidas())
    return getCookie(key) || safeGet(localStorage, key) || null;
  return safeGet(sessionStorage, key) || null;
};

const setPersisted = (key, value) => {
  if (cookiesConsentidas()) {
    setCookie(key, value);
    safeSet(localStorage, key, value);
  } else {
    safeSet(sessionStorage, key, value);
  }
};

const migrarSessionACookies = () => {
  [TERMS_ACCEPTED_KEY, TERMS_VERSION_KEY].forEach((key) => {
    const val = safeGet(sessionStorage, key);
    if (val) {
      setCookie(key, val);
      safeSet(localStorage, key, val);
      safeRemove(sessionStorage, key);
    }
  });
  setCookie(COOKIE_CONSENT_KEY, "accepted");
  safeSet(localStorage, COOKIE_CONSENT_KEY, "accepted");
  safeRemove(sessionStorage, COOKIE_CONSENT_KEY);
};

const RUTAS_LIBRES = [
  "/login",
  "/registro",
  "/recuperar",
  "/google-callback",
  "/verificar-email",
];

class SinConexionBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { sinConexion: false, nombreVista: '' };
  }
  static getDerivedStateFromError(error) {
    const esCargaFallida =
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('Importing a module script failed');
    if (esCargaFallida) {
      const match = error.message.match(/\/([^/]+)\.jsx/);
      const nombre = match ? match[1] : 'esta vista';
      console.info(`[Red] Sin conexión para cargar "${nombre}".`);
      return { sinConexion: true, nombreVista: nombre };
    }
    return null;
  }
  componentDidCatch(error) {
    if (!this.state.sinConexion) throw error;
  }
  render() {
    if (this.state.sinConexion) return this.props.fallback ?? null;
    return this.props.children;
  }
}

function AppContent() {
  const isPreview = new URLSearchParams(window.location.search).get('preview') === 'true';
  const { user, checkAuth } = useAuth();

  const [modoOscuro, setModoOscuro] = useState(() => {
    const saved = localStorage.getItem("modoOscuro:v1") ?? localStorage.getItem("modoOscuro");
    return saved ? JSON.parse(saved) : false;
  });
  const [categoriaActiva, setCategoriaActiva] = useState("todas");

  const [robotIAActivo, setRobotIAActivo] = useState(false);
  const [recetas, setRecetas] = useState([]);
  const [cargandoRecetas, setCargandoRecetas] = useState(true);
  const [recetaPendiente, setRecetaPendiente] = useState(null);
  const recetaPendienteKey = useRef(0);
  const [versionFiltros, setVersionFiltros] = useState(0);
  const [mostrarCookies, setMostrarCookies] = useState(false);
  const [mostrarTerminos, setMostrarTerminos] = useState(false);
  const [mostrarCompletarPerfil, setMostrarCompletarPerfil] = useState(false);
  const [mostrarGooglePassword, setMostrarGooglePassword] = useState(false);
  const [activeTermsVersion, setActiveTermsVersion] = useState(null);

  const esActualizacion = useMemo(() => {
    if (!activeTermsVersion) return false;
    if (user) {
      const serverVersion = user.activeTermsVersion || activeTermsVersion;
      return user.termsAccepted === true && user.termsVersion !== serverVersion;
    }
    const localVersion = getPersisted(TERMS_VERSION_KEY);
    const localAccepted = getPersisted(TERMS_ACCEPTED_KEY);
    return localAccepted === "true" && localVersion !== activeTermsVersion;
  }, [user, activeTermsVersion]);

  const terminosAceptadosEnSesion = useRef(false);
  const [backendListo, setBackendListo] = useState(false);
  const [favoritos, setFavoritos] = useState([]);

    // Cargar favoritos desde BD cuando hay usuario
useEffect(() => {
  if (!user) {
    setFavoritos([]);
    return;
  }
  api.get('/favoritos')
    .then(({ data }) => {
      setFavoritos(data.favoritos.map(id => id.toString()));
    })
    .catch(() => setFavoritos([]));
}, [user]);

  useEffect(() => {
    document.body.classList.toggle("modo-oscuro", modoOscuro);
    localStorage.setItem("modoOscuro:v1", JSON.stringify(modoOscuro));
  }, [modoOscuro]);


  useEffect(() => {
    let cancelled = false;
    let intentos = 0;
    const MAX_INTENTOS = 10;
    const INTERVALO = 1000;
    const ping = async () => {
      try {
        await api.get("/terms");
        if (!cancelled) setBackendListo(true);
      } catch {
        if (!cancelled && intentos < MAX_INTENTOS) {
          intentos++;
          setTimeout(ping, INTERVALO);
        } else if (!cancelled) {
          setBackendListo(true);
        }
      }
    };
    ping();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!backendListo) return;
    checkAuth();
  }, [backendListo, checkAuth]);

  useEffect(() => {
    if (!backendListo) return;
    let cancelled = false;
    const cargar = async () => {
      setCargandoRecetas(true);
      try {
        const { data } = await api.get("/recipes?limit=200");
        if (!cancelled) setRecetas(data.recipes || []);
      } catch {
        if (!cancelled) setRecetas([]);
      } finally {
        if (!cancelled) setCargandoRecetas(false);
      }
    };
    cargar();
    return () => {
      cancelled = true;
    };
  }, [backendListo]);

  useEffect(() => {
    if (!backendListo) return;
    api
      .get("/terms")
      .then(({ data }) => setActiveTermsVersion(data.terms?.version ?? "1.0.0"))
      .catch(() => setActiveTermsVersion("1.0.0"));
  }, [backendListo]);

  useEffect(() => {
    if (!user) {
      setMostrarGooglePassword(false);
      return;
    }
    if (window.location.pathname.startsWith("/google-callback")) return;
    if (user.googleId && user.hasPassword === false) {
      setMostrarGooglePassword(true);
    } else {
      setMostrarGooglePassword(false);
    }
  }, [user]);

  const resolverTerminos = useCallback(() => {
    if (!user) return;
    const profileRealmenteCompleto = (
      user.age    != null && Number(user.age)    >= 18 &&
      user.weight != null && Number(user.weight) >= 40 &&
      user.height != null && Number(user.height) >= 50
    );
    if (!profileRealmenteCompleto) {
      setMostrarCompletarPerfil(true);
    }
  }, [user]);

  const evaluarTerminos = useCallback(
    (version) => {
      if (user) {
        const serverVersion = user.activeTermsVersion || version;
        const necesita =
          !user.termsAccepted || user.termsVersion !== serverVersion;
        if (necesita) {
          setMostrarTerminos(true);
        } else {
          setPersisted(TERMS_ACCEPTED_KEY, "true");
          setPersisted(TERMS_VERSION_KEY, serverVersion);
          resolverTerminos();
        }
      } else {
        const localVersion = getPersisted(TERMS_VERSION_KEY);
        const localAccepted = getPersisted(TERMS_ACCEPTED_KEY);
        if (localAccepted !== "true" || localVersion !== version) {
          setMostrarTerminos(true);
        } else {
          resolverTerminos();
        }
      }
    },
    [user, resolverTerminos],
  );

  useEffect(() => {
    if (isPreview) return;
    if (!user) {
      const yaDecidio =
        cookiesConsentidas() ||
        sessionStorage.getItem(COOKIE_CONSENT_KEY) === "dismissed";
      if (!yaDecidio) setMostrarCookies(true);
    }
  }, [user, isPreview]);

  useEffect(() => {
    if (isPreview) return;
    if (!activeTermsVersion) return;
    if (terminosAceptadosEnSesion.current) return;

    const ruta = window.location.pathname;
    const esRutaLibre = RUTAS_LIBRES.some((r) => ruta.startsWith(r));
    if (esRutaLibre) return;

    evaluarTerminos(activeTermsVersion);
  }, [user, activeTermsVersion, evaluarTerminos, isPreview]);

  const handleCookiesAceptadas = useCallback(() => {
    migrarSessionACookies();
    setMostrarCookies(false);
  }, []);
  const handleCookiesRechazadas = useCallback(() => {
    sessionStorage.setItem(COOKIE_CONSENT_KEY, "dismissed");
    setMostrarCookies(false);
  }, []);

  const handleAceptarTerminos = useCallback(async (versionAceptada) => {
    terminosAceptadosEnSesion.current = true;
    const version = versionAceptada || activeTermsVersion || "1.0.0";
    setPersisted(TERMS_ACCEPTED_KEY, "true");
    setPersisted(TERMS_VERSION_KEY, version);
    if (user) {
      try {
        const { data } = await api.post("/auth/accept-terms", { version });
        await checkAuth();
        if (data?.version) setActiveTermsVersion(data.version);
        setMostrarTerminos(false);
        resolverTerminos();
      } catch (err) {
        terminosAceptadosEnSesion.current = false;
        if (err?.response?.status === 409 && err.response.data?.activeVersion) {
          setActiveTermsVersion(err.response.data.activeVersion);
        }
        toast.error(err?.response?.data?.error || 'Error al guardar la aceptación de términos');
        setMostrarTerminos(false);
        resolverTerminos();
      }
    } else {
      setMostrarTerminos(false);
      resolverTerminos();
    }
  }, [activeTermsVersion, user, checkAuth, resolverTerminos]);

  const handlePerfilCompletado = useCallback(() => {
    setMostrarCompletarPerfil(false); 
    checkAuth();
  }, [checkAuth]);

  const handleGooglePasswordSuccess = useCallback(() => {
    setMostrarGooglePassword(false);
    checkAuth();
  }, [checkAuth]);

  const toggleModoOscuro = useCallback(
    () => setModoOscuro((prev) => !prev),
    [],
  );
  const toggleRobotIA = useCallback(
    () => setRobotIAActivo((prev) => !prev),
    [],
  );
  const cambiarCategoria = useCallback((cat) => setCategoriaActiva(cat), []);

  const handleAbrirReceta = useCallback(
    (recetaId, resenaId = null, respuestaId = null) => {
      recetaPendienteKey.current += 1;
      setRecetaPendiente({
        recetaId,
        resenaId,
        respuestaId,
        _key: recetaPendienteKey.current,
      });
    },
    [],
  );

  const toggleFav = useCallback(async (recetaId) => {
    if (!user) return;
  
    const favoritosAnteriores = [...favoritos];
  
    setFavoritos(prev =>
      prev.includes(recetaId)
        ? prev.filter(id => id !== recetaId)
        : [...prev, recetaId]
    );
  
    try {
      const { data } = await api.post(`/favoritos/${recetaId}`);
      setFavoritos(data.favoritos.map(id => id.toString()));
    } catch (error) {
      setFavoritos(favoritosAnteriores);
      
      const mensajeError = error.response?.data?.error || "Error al actualizar favoritos";
      alert(mensajeError); 
      
      console.error("Error en toggleFav:", mensajeError);
    }
  }, [user, favoritos]);


  return (
    <Router>
      <div className="App">
        <FondoAnimado />
        <Navbar
          modoOscuro={modoOscuro}
          toggleModoOscuro={toggleModoOscuro}
          onAbrirReceta={handleAbrirReceta}
        />

        <main className="contenido-principal">
          <SinConexionBoundary>
          <Suspense fallback={null}>
            <Routes>
              <Route
                path="/"
                element={
                  <VistaInicio
                    recetas={recetas}
                    recetaPendiente={recetaPendiente}
                    onRecetaPendienteResuelta={() => setRecetaPendiente(null)}
                    cargandoRecetas={cargandoRecetas}
                    toggleFav={toggleFav}
                    favoritos={favoritos}
                    cambiarCategoria={cambiarCategoria}
                    categoriaActiva={categoriaActiva}
                    usuario={user}
                    onFiltrosCambiados={() => setVersionFiltros((v) => v + 1)}
                  />
                }
              />
              <Route
                path="/login"
                element={user ? <Navigate to="/" replace /> : <Login />}
              />
              <Route
                path="/registro"
                element={user ? <Navigate to="/" replace /> : <Register />}
              />
              <Route path="/google-callback" element={<GoogleCallback />} />
              <Route path="/recuperar" element={<ForgotPassword />} />
              <Route
                path="/reset-password/:token"
                element={<ResetPassword />}
              />
              <Route path="/verificar-email" element={<VerificarEmail />} />
              <Route path="/contacto" element={<VistaContacto />} />
              <Route
                path="/chatbot"
                element={
                  <VistaChatbot abrirFlotante={() => setRobotIAActivo(true)} />
                }
              />
              <Route
                path="/seguimiento"
                element={
                  <PrivateRoute>
                    <VistaSeguimiento
                      recetas={recetas}
                      versionFiltros={versionFiltros}
                    />
                  </PrivateRoute>
                }
              />
              <Route
                path="/historial"
                element={<Navigate to="/seguimiento" replace />}
              />
              <Route
                path="/favoritos"
                element={
                  <PrivateRoute>
                    <VistaFavoritos
                      recetas={recetas}
                      toggleFav={toggleFav}
                      favoritos={favoritos}
                    />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <PrivateRoute requireAdmin={true}>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <PrivateRoute requireAdmin={true}>
                    <UserList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/stats"
                element={
                  <PrivateRoute requireAdmin={true}>
                    <Stats />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/recipes"
                element={
                  <PrivateRoute requireAdmin={true}>
                    <RecipeManagement />
                  </PrivateRoute>
                }
              />
              <Route
                path="/perfil"
                element={
                  <PrivateRoute>
                    <UserProfile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/imagenes"
                element={
                  <PrivateRoute requireAdmin={true}>
                    <ImagenesAprobacion />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          </SinConexionBoundary>
        </main>

        <Footer />

        {user && (
          <SinConexionBoundary>
          <Suspense fallback={null}>
            <RobotIA activo={robotIAActivo} toggleIA={toggleRobotIA} />
          </Suspense>
          </SinConexionBoundary>
        )}

        <SinConexionBoundary>
        <Suspense fallback={null}>
          {mostrarGooglePassword && (
            <ModalGooglePassword onSuccess={handleGooglePasswordSuccess} />
          )}
          {!mostrarGooglePassword && mostrarTerminos && (
            <ModalTerminos
              onAceptar={handleAceptarTerminos}
              esActualizacion={esActualizacion}
            />
          )}
          {!mostrarGooglePassword && mostrarCookies && (
            <ModalCookies
              onAceptar={handleCookiesAceptadas}
              onRechazar={handleCookiesRechazadas}
            />
          )}
          {!mostrarGooglePassword &&
            !mostrarTerminos &&
            mostrarCompletarPerfil && (
              <ModalCompletarPerfil
                onCompletado={handlePerfilCompletado}
                user={user}
              />
            )}
        </Suspense>
        </SinConexionBoundary>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          draggable
          pauseOnHover
          theme={modoOscuro ? "dark" : "light"}
        />
      </div>
    </Router>
  );
}

function App() {
  useEffect(() => {
    let raf = 0;
    let clearTimer = 0;
    const setScroll = () => {
      if (clearTimer) clearTimeout(clearTimer);
      document.body.classList.add('is-scrolling');
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = 0;
        clearTimer = setTimeout(() => {
          document.body.classList.remove('is-scrolling');
          clearTimer = 0;
        }, 120);
      });
    };
    window.addEventListener('scroll', setScroll, { passive: true });
    window.addEventListener('wheel', setScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', setScroll);
      window.removeEventListener('wheel', setScroll);
      if (raf) cancelAnimationFrame(raf);
      if (clearTimer) clearTimeout(clearTimer);
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    let pending = 0;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const flush = () => {
      raf = 0;
      if (!pending) return;
      const dy = pending;
      pending = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const cur = window.scrollY;
      const target = Math.max(0, Math.min(max, cur + dy));
      window.scrollTo({ top: target, behavior: reducedMotion?.matches ? 'auto' : 'smooth' });
    };
    const onWheel = (e) => {
      if (reducedMotion?.matches) return;
      const target = e.target;
      const modalAncestor = target && target.closest && target.closest('[data-modal], .modal-overlay, .terminos-overlay, .terminos-modal, .al-modal-overlay, .pn-modal-movil, .vistaChatbot, .robotChat, .rec-panel, .seg-col, .filtroModalOverlay, .filtroModal');
      if (modalAncestor) return;
      const capped = Math.max(-60, Math.min(60, e.deltaY));
      if (capped === 0) return;
      e.preventDefault();
      pending += capped;
      if (!raf) raf = requestAnimationFrame(flush);
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', onWheel);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const onMouseDown = (e) => {
      if (e.button === 1) e.preventDefault();
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
