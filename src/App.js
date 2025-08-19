// src/App.js - Versión actualizada con mejor manejo de errores
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Páginas existentes
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import OlvidoPassword from './pages/auth/OlvidoPassword';
import ProfileSelection from './pages/profiles/ProfileSelection';
import TutorProfile from './pages/profiles/TutorProfile';
import InitialEvaluation from './pages/evaluation/InitialEvaluation';
import ResultadosEvaluacion from './pages/evaluation/ResultadosEvaluacion';
import ConsolaNino from './pages/console/ConsolaNino';
import TutorPanel from './pages/console/TutorPanel';
import ActividadContainer from './pages/console/actividades/ActividadContainer';

// NUEVO: Página de notificaciones
import NotificationsPage from './pages/notifications/NotificationsPage';

// NUEVO: Hook de automatización
import { useNotificationAutomation } from './hooks/useNotificationAutomation';

// Componente de Error Boundary
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ Error en la aplicación:', error, errorInfo);
    
    // En producción, podrías enviar el error a un servicio de monitoreo
    if (process.env.NODE_ENV === 'production') {
      // Ejemplo: enviarErrorAServicio(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              ¡Oops! Algo salió mal
            </h2>
            <p className="text-gray-700 mb-4">
              Ha ocurrido un error inesperado. Por favor, recarga la página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Recargar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Componente de Loading
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Cargando...</p>
    </div>
  </div>
);

// Componente wrapper para inicializar el sistema de notificaciones
function NotificationWrapper({ children }) {
  // Esto iniciará el monitoreo automático de notificaciones solo si es posible
  try {
    useNotificationAutomation();
  } catch (error) {
    console.warn('⚠️ Sistema de notificaciones no disponible:', error);
  }
  return children;
}

function App() {
  return (
    <AppErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Router>
          <NotificationWrapper>
            <ToastContainer
              position="top-right"
              autoClose={3000} 
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
            
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register/>} />
              <Route path="/verify-email" element={<VerifyEmail/>} />
              <Route path="/olvido-password" element={<OlvidoPassword/>} />
              <Route path="/profile-selection" element={<ProfileSelection/>} />
              <Route path="/tutor-profile" element={<TutorProfile/>} />
              <Route path="/evaluation" element={<InitialEvaluation/>} />
              <Route path="/evaluation/resultados" element={<ResultadosEvaluacion/>} />
              <Route path="/console" element={<ConsolaNino/>} />
              <Route path="/console/actividad/:actividadId" element={<ActividadContainer />} />
              
              {/* NUEVA: Ruta de notificaciones */}
              <Route path="/notifications" element={<NotificationsPage/>} />
              
              {/* Panel de Tutor/Padre */}
              <Route path="/tutor-panel" element={<TutorPanel/>} />
              <Route path="/admin" element={<TutorPanel/>} />
            </Routes>
          </NotificationWrapper>
        </Router>
      </Suspense>
    </AppErrorBoundary>
  );
}

export default App;