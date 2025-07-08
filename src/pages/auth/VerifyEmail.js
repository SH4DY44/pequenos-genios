import React, {useState, useEffect} from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {auth, sendVerificationEmail} from '../../config/firebase';
import banner from '../../assets/images/banner.jpeg';

function VerifyEmail() {
    const location = useLocation();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(60);
    const email = location.state?.email;

    useEffect(() => {
        if(!auth.currentUser){
            navigate('/login');
            return;
        }

        const interval = setInterval(async() =>{
            await auth.currentUser.reload();
            if(auth.currentUser.emailVerified){
                navigate('/tutor-profile');

            }

        }, 3000);

        return () => clearInterval(interval);

    }, [navigate]);

    useEffect(() => {
        const timer = countdown > 0 && setInterval(() => {
            setCountdown(countdown - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    const resendVerificationEmail = async () => {
        try {
            if(auth.currentUser){
                await sendVerificationEmail(auth.currentUser);
                setCountdown(60);
                alert('Email de verificación enviado');

            }
        } catch (error) {
            setError('Error al enviar el email de verificación');
        }
    };

    if(!email){
        return <navigate to="/register" replace/>;
    }


    return(
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
          <div className="flex justify-center mb-6">
            <img src={banner} alt="Logo" className="h-16" />
          </div>

          <h2 className="text-2xl font-bold text-center text-[var(--primary-blue)] mb-6">
            Verifica tu Email
          </h2>
          
          <div className="text-center mb-8">
            <div className="animate-bounce text-5xl mb-4">✉️</div>
            <p className="text-lg mb-2">Hemos enviado un enlace de verificación a:</p>
            <p className="font-bold text-[var(--primary-blue)]">{email}</p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p className="text-sm text-blue-700">
              Por favor, revisa tu bandeja de entrada y sigue las instrucciones para verificar tu cuenta.<br/>
              <span className="font-semibold">Si no encuentras el email en tu bandeja principal, revisa tu carpeta de spam o correo no deseado.</span>
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              {error}
            </div>
          )}

          <button
            onClick={resendVerificationEmail}
            disabled={countdown > 0}
            className="w-full bg-[var(--primary-blue)] text-white py-3 rounded-lg hover:opacity-90 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {countdown > 0 
              ? `Reenviar email en ${countdown}s` 
              : 'Reenviar email de verificación'
            }
          </button>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Una vez que verifiques tu email, serás redirigido automáticamente.</p>
          </div>
        </div>
      </div>
    </div>


    );

}

export default VerifyEmail;