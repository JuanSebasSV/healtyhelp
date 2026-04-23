import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  lazy,
  Suspense,
} from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./context/AuthProvider";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import FondoAnimado from "./components/layout/FondoAnimado";
import PrivateRoute from "./components/layout/PrivateRoute";
import api from "./api/axios";
import useAuth from "./hooks/useAuth";

const UserProfile = lazy(() => import("./components/profile/UserProfile"));
const Login = lazy(() => import("./components/auth/Login"));
const Register = lazy(() => import("./components/auth/Register"));
const GoogleCallback = lazy(() => import("./components/auth/GoogleCallback"));
const ForgotPassword = lazy(() => import("./components/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./components/auth/ResetPassword"));
const VerificarEmail = lazy(() => import("./components/auth/VerificarEmail"));
const VistaInicio = lazy(() => import("./components/inicio/VistaInicio"));
const VistaSeguimiento = lazy(
  () => import("./components/vistas/VistaSeguimiento"),
);
const VistaFavoritos = lazy(() => import("./components/vistas/VistaFavoritos"));
const VistaContacto = lazy(() => import("./components/vistas/VistaContacto"));
const VistaChatbot = lazy(() => import("./components/vistas/VistaChatbot"));
const Dashboard = lazy(() => import("./components/admin/Dashboard"));
const UserList = lazy(() => import("./components/admin/UserList"));
const Stats = lazy(() => import("./components/admin/Stats"));
const RecipeManagement = lazy(
  () => import("./components/admin/RecipeManagement"),
);
const ImagenesAprobacion = lazy(
  () => import("./components/admin/ImagenesAprobacion"),
);
const RobotIA = lazy(() => import("./components/inicio/RobotIA"));
const ModalTerminos = lazy(() => import("./components/admin/ModalTerminos"));
const ModalCompletarPerfil = lazy(
  () => import("./components/admin/ModalCompletarPerfil"),
);
const ModalCookies = lazy(() => import("./components/admin/ModalCookies"));
const ModalGooglePassword = lazy(
  () => import("./components/auth/ModalGooglePassword"),
);

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

const cookiesConsentidas = () =>
  getCookie(COOKIE_CONSENT_KEY) === "accepted" ||
  localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted";

const getPersisted = (key) => {
  if (cookiesConsentidas())
    return getCookie(key) || localStorage.getItem(key) || null;
  return sessionStorage.getItem(key) || null;
};

const setPersisted = (key, value) => {
  if (cookiesConsentidas()) {
    setCookie(key, value);
    localStorage.setItem(key, value);
  } else {
    sessionStorage.setItem(key, value);
  }
};

const migrarSessionACookies = () => {
  [TERMS_ACCEPTED_KEY, TERMS_VERSION_KEY].forEach((key) => {
    const val = sessionStorage.getItem(key);
    if (val) {
      setCookie(key, val);
      localStorage.setItem(key, val);
      sessionStorage.removeItem(key);
    }
  });
  setCookie(COOKIE_CONSENT_KEY, "accepted");
  localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
  sessionStorage.removeItem(COOKIE_CONSENT_KEY);
};

const RUTAS_LIBRES = [
  "/login",
  "/registro",
  "/recuperar",
  "/google-callback",
  "/verificar-email",
];

function AppContent() {
  const { user, checkAuth } = useAuth();

  const [modoOscuro, setModoOscuro] = useState(() => {
    const saved = localStorage.getItem("modoOscuro");
    return saved ? JSON.parse(saved) : false;
  });
  const [categoriaActiva, setCategoriaActiva] = useState("todas");
  const [favoritos, setFavoritos] = useState(() => {
    const saved = localStorage.getItem("favoritos");
    return saved ? JSON.parse(saved) : [];
  });
  const [robotIAActivo, setRobotIAActivo] = useState(false);
  const [recetas, setRecetas] = useState([]);
  const [cargandoRecetas, setCargandoRecetas] = useState(true);
  // recetaPendiente guarda { recetaId, resenaId, respuestaId } cuando se navega
  // desde una notificación. VistaInicio lo consume para auto-abrir la tarjeta correcta.
  const [recetaPendiente, setRecetaPendiente] = useState(null);
  const [versionFiltros, setVersionFiltros] = useState(0);
  const [mostrarCookies, setMostrarCookies] = useState(false);
  const [mostrarTerminos, setMostrarTerminos] = useState(false);
  const [esActualizacion, setEsActualizacion] = useState(false);
  const [mostrarCompletarPerfil, setMostrarCompletarPerfil] = useState(false);
  const [mostrarGooglePassword, setMostrarGooglePassword] = useState(false);
  const [activeTermsVersion, setActiveTermsVersion] = useState(null);

  const terminosAceptadosEnSesion = useRef(false);

  useEffect(() => {
    document.body.classList.toggle("modo-oscuro", modoOscuro);
    localStorage.setItem("modoOscuro", JSON.stringify(modoOscuro));
  }, [modoOscuro]);

  useEffect(() => {
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
  }, [favoritos]);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    api
      .get("/terms")
      .then(({ data }) => setActiveTermsVersion(data.terms?.version ?? "1.0.0"))
      .catch(() => setActiveTermsVersion("1.0.0"));
  }, []);

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
    // Calcular igual que el backend: desde los datos reales, no desde el campo cacheado.
    // Esto evita que el modal aparezca cuando el usuario ya tiene age/weight/height válidos
    // pero profileComplete quedó en false por desincronización.
    const profileRealmenteCompleto =
      user.age != null &&
      Number(user.age) >= 18 &&
      user.weight != null &&
      Number(user.weight) >= 40 &&
      user.height != null &&
      Number(user.height) >= 50;
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
          setEsActualizacion(
            user.termsAccepted === true && user.termsVersion !== serverVersion,
          );
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
          setEsActualizacion(
            localAccepted === "true" && localVersion !== version,
          );
          setMostrarTerminos(true);
        } else {
          resolverTerminos();
        }
      }
    },
    [user, resolverTerminos],
  );

  useEffect(() => {
    if (!activeTermsVersion) return;
    if (terminosAceptadosEnSesion.current) return;

    const ruta = window.location.pathname;
    const esRutaLibre = RUTAS_LIBRES.some((r) => ruta.startsWith(r));
    if (esRutaLibre) return;

    if (!user) {
      const yaDecidio =
        cookiesConsentidas() ||
        sessionStorage.getItem(COOKIE_CONSENT_KEY) === "dismissed";
      if (!yaDecidio) setMostrarCookies(true);
    }

    evaluarTerminos(activeTermsVersion);
  }, [user, activeTermsVersion, evaluarTerminos]);

  const handleCookiesAceptadas = useCallback(() => {
    migrarSessionACookies();
    setMostrarCookies(false);
  }, []);
  const handleCookiesRechazadas = useCallback(() => {
    sessionStorage.setItem(COOKIE_CONSENT_KEY, "dismissed");
    setMostrarCookies(false);
  }, []);

  const handleAceptarTerminos = useCallback(async () => {
    terminosAceptadosEnSesion.current = true;
    const version = activeTermsVersion || "1.0.0";
    setPersisted(TERMS_ACCEPTED_KEY, "true");
    setPersisted(TERMS_VERSION_KEY, version);
    if (user) {
      try {
        await api.post("/auth/accept-terms", { version });
        await checkAuth();
      } catch {
        terminosAceptadosEnSesion.current = false;
        return;
      }
    }
    setMostrarTerminos(false);
    resolverTerminos();
  }, [activeTermsVersion, user, checkAuth, resolverTerminos]);

  const handlePerfilCompletado = useCallback(() => {
    setMostrarCompletarPerfil(false); // cerrar inmediatamente sin esperar
    checkAuth(); // luego refrescar usuario desde BD
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

  // Navbar llama este handler con (recetaId, resenaId, respuestaId) al navegar
  // desde una notificación. Guardamos el objeto completo para que VistaInicio
  // pueda auto-abrir la tarjeta correcta y hacer scroll hasta el comentario.
  const handleAbrirReceta = useCallback(
    (recetaId, resenaId = null, respuestaId = null) => {
      setRecetaPendiente({ recetaId, resenaId, respuestaId });
    },
    [],
  );

  const toggleFav = useCallback((recetaId) => {
    setFavoritos((prev) =>
      prev.includes(recetaId)
        ? prev.filter((id) => id !== recetaId)
        : [...prev, recetaId],
    );
  }, []);

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
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Register />} />
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
        </main>

        <Footer />

        {user && (
          <Suspense fallback={null}>
            <RobotIA activo={robotIAActivo} toggleIA={toggleRobotIA} />
          </Suspense>
        )}

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
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
