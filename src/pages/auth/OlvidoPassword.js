import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../../config/firebase';
import banner from '../../assets/images/banner.jpeg';
import { sendPasswordResetEmail } from 'firebase/auth';

const OlvidoPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await sendPasswordResetEmail(auth, email);
            setSuccess(true);
            setError('');
        }catch (error) {
            setError('No se pudo enviar el correo de restablecimiento de contraseña');
        }
    };

    return (
        <div className="min-h-screen bg-[var(--primary-yellow)]">
          <nav className="bg-[var(--primary-blue)] p-4">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img src={banner} alt="Pequeños Genios" className="h-12" />
                <span className="text-white ml-2 text-xl font-bold">PEQUEÑOS GENIOS</span>
              </Link>
            </div>
          </nav>
    
          <div className="flex justify-center items-center h-[calc(100vh-80px)]">
            <div className="bg-[#F8F9FA] p-8 rounded-xl shadow-lg max-w-md w-full mx-4 border-2 border-[var(--primary-blue)]">
              <h2 className="text-2xl font-bold text-center mb-6 text-[var(--primary-blue)]">
                Recuperar Contraseña
              </h2>
    
              {success ? (
                <div className="text-center">
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    Se ha enviado un email con instrucciones para recuperar tu contraseña.
                  </div>
                  <Link to="/login" className="text-[var(--primary-blue)] hover:underline">
                    Volver al inicio de sesión
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 mb-2">Email:</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                      placeholder="Ingresa tu email"
                      required
                    />
                  </div>
    
                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}
    
                  <button
                    type="submit"
                    className="w-full bg-[var(--primary-blue)] text-white py-3 rounded-lg hover:opacity-90 transition-all font-medium"
                  >
                    Enviar instrucciones
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      );
}

export default OlvidoPassword;