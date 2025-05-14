import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; // Importar
import 'react-toastify/dist/ReactToastify.css'; // Importar CSS
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

function App() {
  return (
    <Router>
      {/* Colocar ToastContainer aquí, fuera de Routes si es posible */}
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
        theme="light" // o "dark" o "colored"
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
        <Route path="/admin" element={<AdminPanel/>} />
      </Routes>
    </Router>
  );
}

export default App;