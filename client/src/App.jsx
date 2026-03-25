import React, { useState, useEffect } from 'react';
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

// Admin
import Dashboard from './components/admin/Dashboard';
import UserList from './components/admin/UserList';
import Stats from './components/admin/Stats';
import RecipeManagement from './components/admin/RecipeManagement';

// Otros
import RobotIA from './components/inicio/RobotIA';

// Modales bloqueantes
import ModalTerminos, { TERMS_VERSION, TERMS_KEY } from './components/modals/ModalTerminos';
import ModalCompletarPerfil from './components/modals/ModalCompletarPerfil';

// API
import api from './api/axios';

// Hook de autenticación
import useAuth from './hooks/useAuth';

// Rutas donde NO mostramos los modales bloqueantes
const RUTAS_LIBRES = ['/login', '/registro', '/recuperar', '/google-callback', '/verificar-email'];

function AppContent() {
  const { user, checkAuth } = useAuth();
  const [modoOscuro, setModoOscuro] = useState(() => {
    const saved = localStorage.getItem('modoOscuro');
    return saved ? JSON.parse(saved) : false;
  });
  const [categoriaActiva, setCategoriaActiva]   = useState('todas');
  const [favoritos, setFavoritos]               = useState(() => {
    const saved = localStorage.getItem('favoritos');
    return saved ? JSON.parse(saved) : [];
  });
  const [robotIAActivo, setRobotIAActivo]       = useState(false);
  const [recetas, setRecetas]                   = useState([]);
  const [cargandoRecetas, setCargandoRecetas]   = useState(true);

  // ── Estado modales ──
  const [mostrarTerminos,        setMostrarTerminos]        = useState(false);
  const [esActualizacion,        setEsActualizacion]        = useState(false);
  const [mostrarCompletarPerfil, setMostrarCompletarPerfil] = useState(false);
  const [terminosResueltos,      setTerminosResueltos]      = useState(false);

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

  const cargarRecetas = async () => {
    setCargandoRecetas(true);
    try {
      const { data } = await api.get('/recipes?limit=200');
      setRecetas(data.recipes || []);
    } catch (error) {
      console.error('Error al cargar recetas:', error);
      setRecetas([]);
    } finally {
      setCargandoRecetas(false);
    }
  };

  // ── Lógica de términos y perfil ──
  useEffect(() => {
    const ruta = window.location.pathname;
    const esRutaLibre = RUTAS_LIBRES.some(r => ruta.startsWith(r));
    if (esRutaLibre) { setTerminosResueltos(true); return; }

    // Visitante sin cuenta
    if (!user) {
      const aceptadoLocal = localStorage.getItem(TERMS_KEY);
      if (!aceptadoLocal) {
        setMostrarTerminos(true);
        setEsActualizacion(false);
      } else {
        setTerminosResueltos(true);
      }
      return;
    }

    // Usuario registrado
    if (!user.termsAccepted || user.termsVersion !== TERMS_VERSION) {
      setMostrarTerminos(true);
      setEsActualizacion(!!user.termsAccepted); // ya aceptó antes pero versión distinta
      return;
    }

    // Términos OK — verificar perfil completo
    if (!user.profileComplete) {
      setMostrarCompletarPerfil(true);
      return;
    }

    setTerminosResueltos(true);
  }, [user]);

  const handleAceptarTerminos = async () => {
    if (user) {
      try {
        await api.post('/auth/accept-terms');
        await checkAuth(); // refrescar user en contexto
      } catch { return; }
    } else {
      localStorage.setItem(TERMS_KEY, 'true');
    }
    setMostrarTerminos(false);

    if (user && !user.profileComplete) {
      setMostrarCompletarPerfil(true);
    } else {
      setTerminosResueltos(true);
    }
  };

  const handlePerfilCompletado = () => {
    setMostrarCompletarPerfil(false);
    setTerminosResueltos(true);
    checkAuth();
  };

  const toggleModoOscuro = () => setModoOscuro(!modoOscuro);
  const toggleRobotIA    = () => setRobotIAActivo(!robotIAActivo);
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
        <Navbar
          modoOscuro={modoOscuro}
          toggleModoOscuro={toggleModoOscuro}
        />

        <main className="contenido-principal">
          <Routes>
            {/* Rutas públicas */}
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
            <Route path="/login"                    element={<Login />} />
            <Route path="/registro"                 element={<Register />} />
            <Route path="/google-callback"          element={<GoogleCallback />} />
            <Route path="/recuperar"                element={<ForgotPassword />} />
            <Route path="/reset-password/:token"    element={<ResetPassword />} />
            <Route path="/verificar-email"          element={<VerificarEmail />} />
            <Route path="/contacto"                 element={<VistaContacto />} />

            {/* Rutas protegidas */}
            <Route
              path="/seguimiento"
              element={
                <PrivateRoute>
                  <VistaSeguimiento recetas={recetas} />
                </PrivateRoute>
              }
            />
            {/* Redirigir /historial a /seguimiento por compatibilidad */}
            <Route path="/historial" element={<Navigate to="/seguimiento" replace />} />

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

            {/* Rutas de administrador */}
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
              path="/perfil"
              element={
                <PrivateRoute>
                  <UserProfile />
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

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />

        {user && (
          <RobotIA
            activo={robotIAActivo}
            toggleIA={toggleRobotIA}
          />
        )}

        {/* ── Modales bloqueantes ── */}
        {mostrarTerminos && (
          <ModalTerminos
            onAceptar={handleAceptarTerminos}
            esActualizacion={esActualizacion}
          />
        )}
        {!mostrarTerminos && mostrarCompletarPerfil && (
          <ModalCompletarPerfil
            onCompletado={handlePerfilCompletado}
            user={user}
          />
        )}

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
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