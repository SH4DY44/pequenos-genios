import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, sendVerificationEmail } from '../../config/firebase';
import banner from '../../assets/images/banner.jpeg';

const RegisterSchema = Yup.object().shape({
  email: Yup.string()
    .email('Formato de email inválido')
    .required('El email es requerido')
    .matches(
      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
      'El formato del email no es válido'
    )
    .test('no-temp-email', 'No se permiten emails temporales', (value) => {
      const tempEmailDomains = ['tempmail.com', 'temp.com'];
      return !tempEmailDomains.some(domain => value?.includes(domain));
    }),
  
  password: Yup.string()
    .required('La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!#%*?&])[A-Za-z\d@$!%*?&]/,
      'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial'
    ),
  
  confirmPassword: Yup.string()
    .required('Confirma tu contraseña')
    .oneOf([Yup.ref('password'), null], 'Las contraseñas deben coincidir')
});

function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleRegister = async (values, { setSubmitting }) => {
    try {
      setError('');
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      await sendVerificationEmail(userCredential.user);
      navigate('/verify-email',{
        state: {
          email: values.email
        }
      });
    }catch(err){
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('Ya existe una cuenta con este email');
          break;
        case 'auth/invalid-email':
          setError('Formato de email inválido');
          break;
        default:
          setError('Error al crear la cuenta');
      }
    }
    setSubmitting(false);
  }

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      
      // Verificar si el tutor ya existe en Firestore
      const tutorDoc = await getDoc(doc(db, 'tutors', auth.currentUser.uid));
      
      if (tutorDoc.exists()) {
        // Si ya existe, ir a selección de perfil
        navigate('/profile-selection');
      } else {
        // Si no existe, ir a crear perfil de tutor
        navigate('/tutor-profile');
      }
    } catch (err) {
      switch (err.code) {
        case 'auth/popup-closed-by-user':
          setError('Se cerró la ventana de inicio de sesión');
          break;
        default:
          setError('Error al iniciar sesión con Google');
      }
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
          <div className="flex justify-center mb-6">
            <img src={banner} alt="Logo" className="h-16" />
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-6 text-[var(--primary-blue)]">
            REGISTRARSE
          </h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              {error}
            </div>
          )}
          
          <Formik
            initialValues={{ email: '', password: '', confirmPassword: '' }}
            validationSchema={RegisterSchema}
            onSubmit={handleRegister}
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

                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Confirmar Contraseña:</label>
                  <Field
                    type="password"
                    name="confirmPassword"
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:border-[var(--primary-blue)]"
                    placeholder="Confirma tu contraseña"
                  />
                  {errors.confirmPassword && touched.confirmPassword && (
                    <div className="text-red-500 mt-1 text-sm">{errors.confirmPassword}</div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[var(--primary-blue)] text-white py-3 rounded-lg hover:opacity-90 transition-all font-medium text-lg shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>
              </Form>
            )}
          </Formik>

          <div className="relative flex items-center justify-center mt-6">
            <div className="border-t border-gray-300 w-full"></div>
            <span className="bg-[#F8F9FA] px-4 text-sm text-gray-500">O</span>
            <div className="border-t border-gray-300 w-full"></div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-all font-medium shadow-md"
            >
              <img 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                alt="Google"
                className="w-5 h-5"
              />
              Continuar con Google
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-700 mb-2">¿Ya tienes una cuenta?</p>
            <Link
              to="/login"
              className="text-[var(--primary-blue)] hover:underline font-medium"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;