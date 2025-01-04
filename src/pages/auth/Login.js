import React, { useState } from 'react';
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

  const handleLogin = async (values, { setSubmitting }) => {
    try {
      setError('');
      await signInWithEmailAndPassword(auth, values.email, values.password);
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
          
          <h2 className="text-2xl font-bold text-center mb-6 text-[var(--primary-blue)]">
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
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:border-[var(--primary-blue)]"
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
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:border-[var(--primary-blue)]"
                    placeholder="Ingresa tu contraseña"
                  />
                  {errors.password && touched.password && (
                    <div className="text-red-500 mt-1 text-sm">{errors.password}</div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[var(--primary-blue)] text-white py-3 rounded-lg hover:opacity-90 transition-all font-medium text-lg shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Iniciando sesión...' : 'Continuar'}
                </button>

                <div className='text-center mt-4'>
                  <Link to="/olvido-password" className="text-[var(--primary-blue)] hover:underline text-sm">
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
              className="text-[var(--primary-blue)] hover:underline font-medium"
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