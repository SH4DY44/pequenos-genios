import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import banner from '../../assets/images/banner.jpeg';

const TutorProfileSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(3, 'El nombre es muy corto')
    .max(50, 'El nombre es muy largo')
    .required('El nombre es requerido'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'El número debe tener 10 dígitos')
    .required('El teléfono es requerido'),
  relationship: Yup.string()
    .required('La relación con el niño es requerida'),
  // NUEVO: Preferencia de notificaciones
  preferenciaNotificacion: Yup.string()
    .oneOf(['email', 'whatsapp', 'sms', 'todos'])
    .default('whatsapp')
});


function TutorProfile() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  // Animación de entrada
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const userId = auth.currentUser.uid; //id del usuario
      
      // Agregar un pequeño delay para mostrar el estado de carga
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Guardar datos del tutor en Firestore
      await setDoc(doc(db, 'tutors', userId), {
        fullName: values.fullName,
        phone: values.phone,
        relationship: values.relationship,
        email: auth.currentUser.email,
        createdAt: new Date()
      });

      // Animación de salida antes de navegar
      setIsVisible(false);
      setTimeout(() => {
        navigate('/profile-selection');
      }, 400);
    } catch (err) {
      setError('Error al guardar los datos. Por favor intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-300 to-yellow-200">
      {/* Navbar con el nuevo gradiente */}
      <nav className="bg-gradient-to-r from-blue-600 to-purple-700 p-4 shadow-lg">
        <div className="flex items-center">
          <div className="flex items-center">
            <img src={banner} alt="Pequeños Genios" className="h-12" />
            <span className="text-white ml-2 text-xl font-bold">PEQUEÑOS GENIOS</span>
          </div>
        </div>
      </nav>

      <div className="flex justify-center items-center min-h-[calc(100vh-80px)] p-4">
        {/* Contenedor del modal con animación */}
        <div className={`bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-purple-200 transition-all duration-700 ease-out transform ${
          isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
        }`}>
          {/* Header con icono y título */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-700 rounded-full mb-4">
              <span className="text-2xl text-white">👨‍🏫</span>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent">
              Datos del Tutor
            </h2>
            <p className="text-gray-600 mt-2">
              Completa tu perfil para comenzar esta aventura educativa
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative mb-6 animate-pulse">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                {error}
              </div>
            </div>
          )}

          <Formik
            initialValues={{ fullName: '', phone: '', relationship: '' }}
            validationSchema={TutorProfileSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-6">
                <div className="space-y-1">
                  <label className="text-purple-700 mb-2 font-semibold flex items-center">
                    <span className="mr-2">👤</span>
                    Nombre completo:
                  </label>
                  <Field
                    name="fullName"
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border-2 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    placeholder="Ingresa tu nombre completo"
                  />
                  {errors.fullName && touched.fullName && (
                    <div className="text-red-500 mt-1 text-sm flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.fullName}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-purple-700 mb-2 font-semibold flex items-center">
                    <span className="mr-2">📱</span>
                    Teléfono:
                  </label>
                  <Field
                    name="phone"
                    type="tel"
                    className="w-full px-4 py-3 rounded-lg border-2 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    placeholder="Ej: 1234567890"
                  />
                  {errors.phone && touched.phone && (
                    <div className="text-red-500 mt-1 text-sm flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.phone}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-purple-700 mb-2 font-semibold flex items-center">
                    <span className="mr-2">👨‍👩‍👧‍👦</span>
                    Relación con el niño:
                  </label>
                  <Field
                    as="select"
                    name="relationship"
                    className="w-full px-4 py-3 rounded-lg border-2 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 cursor-pointer"
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="padre">Padre</option>
                    <option value="madre">Madre</option>
                    <option value="tutor">Tutor legal</option>
                    <option value="otro">Otro</option>
                  </Field>
                  {errors.relationship && touched.relationship && (
                    <div className="text-red-500 mt-1 text-sm flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.relationship}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-700 text-white py-4 rounded-lg hover:from-blue-700 hover:to-purple-800 transition-all duration-300 font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span className="mr-2">🚀</span>
                      Continuar
                    </div>
                  )}
                </button>
              </Form>
            )}
          </Formik>
          
          {/* Footer con mensaje motivacional */}
          <div className="text-center mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <p className="text-sm text-purple-600">
              ¡Estamos emocionados de comenzar esta aventura educativa contigo! 🌟
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorProfile;