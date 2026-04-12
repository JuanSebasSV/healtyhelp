import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Profile
import UserProfile from './components/profile/UserProfile';

// Context
import { AuthProvider } from './context/AuthProvider';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import FondoAnimado from './components/layout/FondoAnimado';
import PrivateRoute from './components/layout/PrivateRoute';

// Auth
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import GoogleCallback from './components/auth/GoogleCallback';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import VerificarEmail from './components/auth/VerificarEmail';

// Vistas principales
import VistaInicio from './components/inicio/VistaInicio';
import VistaSeguimiento from './components/vistas/VistaSeguimiento';
import VistaFavoritos from './components/vistas/VistaFavoritos';
import VistaContacto from './components/vistas/VistaContacto';
import VistaChatbot from './components/vistas/VistaChatbot';

// Admin
import Dashboard from './components/admin/Dashboard';
import UserList from './components/admin/UserList';
import Stats from './components/admin/Stats';
import RecipeManagement from './components/admin/RecipeManagement';
import ImagenesAprobacion from './components/admin/ImagenesAprobacion';

// Otros
import RobotIA from './components/inicio/RobotIA';

// Modales bloqueantes
import ModalTerminos from './components/admin/ModalTerminos';
import ModalCompletarPerfil from './components/admin/ModalCompletarPerfil';
import ModalCookies from './components/admin/ModalCookies';

// API
import api from './api/axios';

// Hooks
import useAuth from './hooks/useAuth';
import useChat from './hooks/useChat'; // ✅ hook compartido de chat

// ─── Helpers de persistencia ──────────────────────────────────────────────────
const COOKIE_CONSENT_KEY = 'hh_cookie_consent';
const TERMS_ACCEPTED_KEY = 'hh_terms_accepted';
const TERMS_VERSION_KEY  = 'hh_terms_version';
const COOKIE_MAX_AGE     = 60 * 60 * 24 * 365;

const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
};

const setCookie = (name, value, maxAge = COOKIE_MAX_AGE) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
};

const cookiesConsentidas = () =>
  getCookie(COOKIE_CONSENT_KEY) === 'accepted' ||
  localStorage.getItem(COOKIE_CONSENT_KEY) === 'accepted';

const getPersisted = (key) => {
  if (cookiesConsentidas()) return getCookie(key) || localStorage.getItem(key) || null;
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
  [TERMS_ACCEPTED_KEY, TERMS_VERSION_KEY].forEach(key => {
    const val = sessionStorage.getItem(key);
    if (val) {
      setCookie(key, val);
      localStorage.setItem(key, val);
      sessionStorage.removeItem(key);
    }
  });
  setCookie(COOKIE_CONSENT_KEY, 'accepted');
  localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
  sessionStorage.removeItem(COOKIE_CONSENT_KEY);
};

const RUTAS_LIBRES = ['/login', '/registro', '/recuperar', '/google-callback', '/verificar-email'];

// ─── AppContent ───────────────────────────────────────────────────────────────
function AppContent() {
  const { user, checkAuth } = useAuth();

  // ✅ Estado del chat compartido entre RobotIA y VistaChatbot
  const chatProps = useChat();

  const [modoOscuro, setModoOscuro] = useState(() => {
    const saved = localStorage.getItem('modoOscuro');
    return saved ? JSON.parse(saved) : false;
  });
  const [categoriaActiva, setCategoriaActiva] = useState('todas');
  const [favoritos, setFavoritos] = useState(() => {
    const saved = localStorage.getItem('favoritos');
    return saved ? JSON.parse(saved) : [];
  });
  const [robotIAActivo, setRobotIAActivo] = useState(false);
  const [recetas, setRecetas]             = useState([]);
  const [cargandoRecetas, setCargandoRecetas] = useState(true);

  const [mostrarCookies,         setMostrarCookies]         = useState(false);
  const [mostrarTerminos,        setMostrarTerminos]        = useState(false);
  const [esActualizacion,        setEsActualizacion]        = useState(false);
  const [mostrarCompletarPerfil, setMostrarCompletarPerfil] = useState(false);
  const [terminosResueltos,      setTerminosResueltos]      = useState(false);
  const [activeTermsVersion,     setActiveTermsVersion]     = useState(null);

  const terminosAceptadosEnSesion = useRef(false);

  useEffect(() => {
    document.body.classList.toggle('modo-oscuro', modoOscuro);
    localStorage.setItem('modoOscuro', JSON.stringify(modoOscuro));
  }, [modoOscuro]);

  useEffect(() => {
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
  }, [favoritos]);

  useEffect(() => {
    cargarRecetas();
  }, []);

  useEffect(() => {
    api.get('/terms')
      .then(({ data }) => setActiveTermsVersion(data.terms?.version ?? '1.0.0'))
      .catch(() => setActiveTermsVersion('1.0.0'));
  }, []);

  const cargarRecetas = async () => {
    setCargandoRecetas(true);
    try {
      const { data } = await api.get('/recipes?limit=200');
      setRecetas(data.recipes || []);
    } catch {
      setRecetas([]);
    } finally {
      setCargandoRecetas(false);
    }
  };

  useEffect(() => {
    if (!activeTermsVersion) return;
    if (terminosAceptadosEnSesion.current) return;

    const ruta = window.location.pathname;
    const esRutaLibre = RUTAS_LIBRES.some(r => ruta.startsWith(r));
    if (esRutaLibre) { setTerminosResueltos(true); return; }

    if (!user) {
      const yaDecidio = cookiesConsentidas() ||
                        sessionStorage.getItem(COOKIE_CONSENT_KEY) === 'dismissed';
      if (!yaDecidio) setMostrarCookies(true);
    }

    evaluarTerminos(activeTermsVersion);
  }, [user, activeTermsVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  const evaluarTerminos = (version) => {
    if (user) {
      const serverVersion = user.activeTermsVersion || version;
      const necesita = !user.termsAccepted || user.termsVersion !== serverVersion;
      if (necesita) {
        setEsActualizacion(user.termsAccepted === true && user.termsVersion !== serverVersion);
        setMostrarTerminos(true);
      } else {
        setPersisted(TERMS_ACCEPTED_KEY, 'true');
        setPersisted(TERMS_VERSION_KEY, serverVersion);
        resolverTerminos();
      }
    } else {
      const localVersion  = getPersisted(TERMS_VERSION_KEY);
      const localAccepted = getPersisted(TERMS_ACCEPTED_KEY);
      if (localAccepted !== 'true' || localVersion !== version) {
        setEsActualizacion(localAccepted === 'true' && localVersion !== version);
        setMostrarTerminos(true);
      } else {
        resolverTerminos();
      }
    }
  };

  const resolverTerminos = () => {
    if (user && !user.profileComplete) {
      setMostrarCompletarPerfil(true);
    } else {
      setTerminosResueltos(true);
    }
  };

  const handleCookiesAceptadas  = () => { migrarSessionACookies(); setMostrarCookies(false); };
  const handleCookiesRechazadas = () => { sessionStorage.setItem(COOKIE_CONSENT_KEY, 'dismissed'); setMostrarCookies(false); };

  const handleAceptarTerminos = async () => {
    terminosAceptadosEnSesion.current = true;
    const version = activeTermsVersion || '1.0.0';
    setPersisted(TERMS_ACCEPTED_KEY, 'true');
    setPersisted(TERMS_VERSION_KEY, version);
    if (user) {
      try {
        await api.post('/auth/accept-terms', { version });
        await checkAuth();
      } catch {
        terminosAceptadosEnSesion.current = false;
        return;
      }
    }
    setMostrarTerminos(false);
    resolverTerminos();
  };

  const handlePerfilCompletado = () => {
    setMostrarCompletarPerfil(false);
    setTerminosResueltos(true);
    checkAuth();
  };

  const toggleModoOscuro = () => setModoOscuro(prev => !prev);
  const toggleRobotIA    = () => setRobotIAActivo(prev => !prev);
  const cambiarCategoria = (cat) => setCategoriaActiva(cat);

  const toggleFav = (recetaId) => {
    setFavoritos(prev =>
      prev.includes(recetaId)
        ? prev.filter(id => id !== recetaId)
        : [...prev, recetaId]
    );
  };

  return (
    <Router>
      <div className="App">
        <FondoAnimado />
        <Navbar modoOscuro={modoOscuro} toggleModoOscuro={toggleModoOscuro} />

        <main className="contenido-principal">
          <Routes>
            <Route
              path="/"
              element={
                <VistaInicio
                  recetas={recetas}
                  cargandoRecetas={cargandoRecetas}
                  toggleFav={toggleFav}
                  favoritos={favoritos}
                  cambiarCategoria={cambiarCategoria}
                  categoriaActiva={categoriaActiva}
                />
              }
            />
            <Route path="/login"                 element={<Login />} />
            <Route path="/registro"              element={<Register />} />
            <Route path="/google-callback"       element={<GoogleCallback />} />
            <Route path="/recuperar"             element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verificar-email"       element={<VerificarEmail />} />
            <Route path="/contacto"              element={<VistaContacto />} />
            <Route
              path="/chatbot"
              element={
                // ✅ chatProps comparte el mismo estado que RobotIA
                <VistaChatbot
                  abrirFlotante={() => setRobotIAActivo(true)}
                  chatProps={chatProps}
                />
              }
            />

            <Route path="/seguimiento" element={<PrivateRoute><VistaSeguimiento recetas={recetas} /></PrivateRoute>} />
            <Route path="/historial"   element={<Navigate to="/seguimiento" replace />} />
            <Route path="/favoritos"   element={
              <PrivateRoute>
                <VistaFavoritos recetas={recetas} toggleFav={toggleFav} favoritos={favoritos} />
              </PrivateRoute>
            } />

            <Route path="/admin"          element={<PrivateRoute requireAdmin={true}><Dashboard /></PrivateRoute>} />
            <Route path="/admin/users"    element={<PrivateRoute requireAdmin={true}><UserList /></PrivateRoute>} />
            <Route path="/admin/stats"    element={<PrivateRoute requireAdmin={true}><Stats /></PrivateRoute>} />
            <Route path="/admin/recipes"  element={<PrivateRoute requireAdmin={true}><RecipeManagement /></PrivateRoute>} />
            <Route path="/perfil"         element={<PrivateRoute><UserProfile /></PrivateRoute>} />
            <Route path="/admin/imagenes" element={<PrivateRoute requireAdmin={true}><ImagenesAprobacion /></PrivateRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />

        {/* ✅ chatProps compartido — mismo historial que VistaChatbot */}
        {user && <RobotIA activo={robotIAActivo} toggleIA={toggleRobotIA} chatProps={chatProps} />}

        {mostrarTerminos && (
          <ModalTerminos onAceptar={handleAceptarTerminos} esActualizacion={esActualizacion} />
        )}
        {mostrarCookies && (
          <ModalCookies onAceptar={handleCookiesAceptadas} onRechazar={handleCookiesRechazadas} />
        )}
        {!mostrarTerminos && mostrarCompletarPerfil && (
          <ModalCompletarPerfil onCompletado={handlePerfilCompletado} user={user} />
        )}

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          draggable
          pauseOnHover
          theme={modoOscuro ? 'dark' : 'light'}
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