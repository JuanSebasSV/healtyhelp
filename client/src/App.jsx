import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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

// API
import api from './api/axios';

// Hook de autenticación
import useAuth from './hooks/useAuth';

/* ── Wrapper que detecta si estamos en "/" para quitar el padding del hero ── */
function MainLayout({ children, isHome }) {
  return (
    <main className={`contenido-principal${isHome ? ' contenido-home' : ''}`}>
      {children}
    </main>
  );
}

function AppContent() {
  const { user } = useAuth();
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

        <Routes>
          {/* ── Ruta inicio — sin padding, hero a pantalla completa ── */}
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

          {/* ── Rutas públicas con contenedor normal ── */}
          <Route
            path="/login"
            element={<main className="contenido-principal"><Login /></main>}
          />
          <Route
            path="/registro"
            element={<main className="contenido-principal"><Register /></main>}
          />
          <Route
            path="/google-callback"
            element={<main className="contenido-principal"><GoogleCallback /></main>}
          />
          <Route
            path="/recuperar"
            element={<main className="contenido-principal"><ForgotPassword /></main>}
          />
          <Route
            path="/reset-password/:token"
            element={<main className="contenido-principal"><ResetPassword /></main>}
          />
          <Route
            path="/contacto"
            element={<main className="contenido-principal"><VistaContacto /></main>}
          />

          {/* ── Rutas protegidas ── */}
          <Route
            path="/seguimiento"
            element={
              <main className="contenido-principal">
                <PrivateRoute>
                  <VistaSeguimiento recetas={recetas} />
                </PrivateRoute>
              </main>
            }
          />
          <Route path="/historial" element={<Navigate to="/seguimiento" replace />} />

          <Route
            path="/favoritos"
            element={
              <main className="contenido-principal">
                <PrivateRoute>
                  <VistaFavoritos
                    recetas={recetas}
                    toggleFav={toggleFav}
                    favoritos={favoritos}
                  />
                </PrivateRoute>
              </main>
            }
          />

          {/* ── Rutas de administrador ── */}
          <Route
            path="/admin"
            element={
              <main className="contenido-principal">
                <PrivateRoute requireAdmin={true}>
                  <Dashboard />
                </PrivateRoute>
              </main>
            }
          />
          <Route
            path="/admin/users"
            element={
              <main className="contenido-principal">
                <PrivateRoute requireAdmin={true}>
                  <UserList />
                </PrivateRoute>
              </main>
            }
          />
          <Route
            path="/admin/stats"
            element={
              <main className="contenido-principal">
                <PrivateRoute requireAdmin={true}>
                  <Stats />
                </PrivateRoute>
              </main>
            }
          />
          <Route
            path="/perfil"
            element={
              <main className="contenido-principal">
                <PrivateRoute>
                  <UserProfile />
                </PrivateRoute>
              </main>
            }
          />
          <Route
            path="/admin/recipes"
            element={
              <main className="contenido-principal">
                <PrivateRoute requireAdmin={true}>
                  <RecipeManagement />
                </PrivateRoute>
              </main>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Footer />

        {user && (
          <RobotIA
            activo={robotIAActivo}
            toggleIA={toggleRobotIA}
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