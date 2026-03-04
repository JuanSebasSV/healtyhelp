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

// Vistas principales
import VistaInicio from './components/inicio/VistaInicio';
import VistaHistorial from './components/vistas/VistaHistorial';
import VistaFavoritos from './components/vistas/VistaFavoritos';
import VistaContacto from './components/vistas/VistaContacto';

// Admin
import Dashboard from './components/admin/Dashboard';
import UserList from './components/admin/UserList';
import Stats from './components/admin/Stats';

// Premium
import VistaPremium from './components/vistas/VistaPremium';

// Otros
import RobotIA from './components/inicio/RobotIA';

// Hook de autenticación
import useAuth from './hooks/useAuth';

function AppContent() {
  const { user } = useAuth();
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
  const [recetas, setRecetas] = useState([]);

  // Aplicar modo oscuro
  useEffect(() => {
    document.body.classList.toggle('modo-oscuro', modoOscuro);
    localStorage.setItem('modoOscuro', JSON.stringify(modoOscuro));
  }, [modoOscuro]);

  // Guardar favoritos
  useEffect(() => {
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
  }, [favoritos]);

  // Cargar recetas desde el backend
  useEffect(() => {
    cargarRecetas();
  }, []);

  const cargarRecetas = async () => {
    try {
      // TODO: Descomentar cuando tengas el endpoint
      // const response = await api.get('/recipes');
      // setRecetas(response.data.recipes);
      
      // Temporalmente usa un array vacío hasta que conectes el backend
      setRecetas([]);
    } catch (error) {
      console.error('Error al cargar recetas:', error);
    }
  };

  const toggleModoOscuro = () => setModoOscuro(!modoOscuro);
  const toggleRobotIA = () => setRobotIAActivo(!robotIAActivo);
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
                  toggleFav={toggleFav}
                  favoritos={favoritos}
                  cambiarCategoria={cambiarCategoria}
                  categoriaActiva={categoriaActiva}
                />
              } 
            />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/google-callback" element={<GoogleCallback />} />
            <Route path="/recuperar" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/contacto" element={<VistaContacto />} />

            {/* Rutas protegidas */}
            <Route 
              path="/historial" 
              element={
                <PrivateRoute>
                  <VistaHistorial recetas={recetas} />
                </PrivateRoute>
              } 
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

            <Route path="/premium" element={<VistaPremium />} />

            {/* Ruta 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />

        {/* Robot IA flotante */}
        {user && (
          <RobotIA 
            activo={robotIAActivo} 
            toggleIA={toggleRobotIA} 
          />
        )}

        {/* Toast notifications */}
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