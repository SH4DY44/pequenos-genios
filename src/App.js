// src/App.js - Versión actualizada
import React from 'react';
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
import AdminPanel from './pages/console/AdminPanel';
import ActividadContainer from './pages/console/actividades/ActividadContainer';

// NUEVO: Página de notificaciones
import NotificationsPage from './pages/notifications/NotificationsPage';

// NUEVO: Hook de automatización
import { useNotificationAutomation } from './hooks/useNotificationAutomation';

// Componente wrapper para inicializar el sistema de notificaciones
function NotificationWrapper({ children }) {
  // Esto iniciará el monitoreo automático de notificaciones
  useNotificationAutomation();
  return children;
}

function App() {
  return (
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
          
          <Route path="/admin" element={<AdminPanel/>} />
        </Routes>
      </NotificationWrapper>
    </Router>
  );
}

export default App;