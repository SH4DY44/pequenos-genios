import React, { useState } from 'react';
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
    .required('El nombre es requerido')
    .matches(/^[a-zA-ZÀ-ÿ\s]{3,50}$/, 'El nombre solo puede contener letras'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'El número debe tener 10 dígitos')
    .required('El teléfono es requerido'),
  relationship: Yup.string()
    .required('La relación con el niño es requerida')
});

function TutorProfile() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const userId = auth.currentUser.uid;
      
      // Guardar datos del tutor en Firestore
      await setDoc(doc(db, 'tutors', userId), {
        fullName: values.fullName,
        phone: values.phone,
        relationship: values.relationship,
        email: auth.currentUser.email,
        createdAt: new Date()
      });

      navigate('/profile-selection');
    } catch (err) {
      setError('Error al guardar los datos. Por favor intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--primary-yellow)]">
      <nav className="bg-[var(--primary-blue)] p-4">
        <div className="flex items-center">
          <div className="flex items-center">
            <img src={banner} alt="Pequeños Genios" className="h-12" />
            <span className="text-white ml-2 text-xl font-bold">PEQUEÑOS GENIOS</span>
          </div>
        </div>
      </nav>

      <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
        <div className="bg-[#F8F9FA] p-8 rounded-xl shadow-lg max-w-md w-full mx-4 border-2 border-[var(--primary-blue)]">
          <h2 className="text-2xl font-bold text-center text-[var(--primary-blue)] mb-6">
            Datos del Tutor
          </h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              {error}
            </div>
          )}

          <Formik
            initialValues={{ fullName: '', phone: '', relationship: '' }}
            validationSchema={TutorProfileSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-6">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">
                    Nombre completo:
                  </label>
                  <Field
                    name="fullName"
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                    placeholder="Ingresa tu nombre completo"
                  />
                  {errors.fullName && touched.fullName && (
                    <div className="text-red-500 mt-1 text-sm">{errors.fullName}</div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-medium">
                    Teléfono:
                  </label>
                  <Field
                    name="phone"
                    type="tel"
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                    placeholder="10 dígitos"
                  />
                  {errors.phone && touched.phone && (
                    <div className="text-red-500 mt-1 text-sm">{errors.phone}</div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-medium">
                    Relación con el niño:
                  </label>
                  <Field
                    as="select"
                    name="relationship"
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="padre">Padre</option>
                    <option value="madre">Madre</option>
                    <option value="tutor">Tutor legal</option>
                    <option value="otro">Otro</option>
                  </Field>
                  {errors.relationship && touched.relationship && (
                    <div className="text-red-500 mt-1 text-sm">{errors.relationship}</div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[var(--primary-blue)] text-white py-3 rounded-lg hover:opacity-90 transition-all font-medium text-lg shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Continuar'}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}

export default TutorProfile;