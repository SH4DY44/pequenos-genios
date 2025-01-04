import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
function App() {
  return (
    <Router>
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
      </Routes>
    </Router>
  );
}

export default App;