import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import banner from '../../assets/images/banner.jpeg';

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email inválido')
    .required('El email es requerido'),
  password: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es requerida'),
});

function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Animación de entrada elegante
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (values, { setSubmitting }) => {
    try {
      setError('');
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      await userCredential.user.reload();
      if (!userCredential.user.emailVerified) {
        navigate('/verify-email', {
          state: { email: values.email }
        });
        setSubmitting(false);
        return;
      }
      navigate('/profile-selection'); 
    } catch (err) {
      switch (err.code) {
        case 'auth/user-not-found':
          setError('No existe una cuenta con este email');
          break;
        case 'auth/wrong-password':
          setError('Contraseña incorrecta');
          break;
        default:
          setError('Ocurrió un error al iniciar sesión');
      }
    }
    setSubmitting(false);
  };

  return (
    <div className={`min-h-screen bg-[var(--primary-yellow)] transition-all duration-700 ease-out ${
      isLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
    }`}>
      <nav className={`bg-gradient-to-r from-blue-600 to-purple-700 p-4 transition-all duration-500 ease-out delay-100 ${
        isLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4'
      }`}>
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img src={banner} alt="Pequeños Genios" className="h-12" />
            <span className="text-white ml-2 text-xl font-bold">PEQUEÑOS GENIOS</span>
          </Link>
        </div>
      </nav>

      <div className="flex justify-center items-center h-[calc(100vh-80px)]">
        <div className={`bg-[#F8F9FA] p-8 rounded-xl shadow-lg max-w-md w-full mx-4 border-2 border-purple-500 transition-all duration-700 ease-out delay-300 ${
          isLoaded ? 'opacity-100 transform translate-y-0 scale-100' : 'opacity-0 transform translate-y-8 scale-95'
        }`}>
          <div className="flex justify-center mb-6">
            <img src={banner} alt="Logo" className="h-16" />
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-6 text-purple-700">
            INICIAR SESIÓN
          </h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              {error}
            </div>
          )}
          
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={LoginSchema}
            onSubmit={handleLogin}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-6">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Email:</label>
                  <Field
                    type="email"
                    name="email"
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Ingresa tu email"
                  />
                  {errors.email && touched.email && (
                    <div className="text-red-500 mt-1 text-sm">{errors.email}</div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Contraseña:</label>
                  <Field
                    type="password"
                    name="password"
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Ingresa tu contraseña"
                  />
                  {errors.password && touched.password && (
                    <div className="text-red-500 mt-1 text-sm">{errors.password}</div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-800 transition-all font-medium text-lg shadow-md disabled:opacity-50 transform hover:scale-105"
                >
                  {isSubmitting ? 'Iniciando sesión...' : 'Continuar'}
                </button>

                <div className='text-center mt-4'>
                  <Link to="/olvido-password" className="text-purple-600 hover:text-purple-800 hover:underline text-sm">
                    ¿Olvidaste tu contraseña?
                  </Link>

                </div>
              </Form>
            )}
          </Formik>

          <div className="mt-8 text-center">
            <p className="text-gray-700 mb-2">¿No tienes una cuenta?</p>
            <Link
              to="/register"
              className="text-purple-600 hover:text-purple-800 hover:underline font-medium"
            >
              Crear una nueva cuenta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;