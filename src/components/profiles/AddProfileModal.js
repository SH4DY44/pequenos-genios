import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { 
    ProfileSchema, 
    strengthOptions, 
    difficultyOptions, 
    specialNeedsOptions 
} from '../../utils/profileConstants';

function AddProfileModal({ isOpen, onClose, onSubmit }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-[var(--primary-blue)] mb-6">
          Crear Nuevo Perfil
        </h2>

        <Formik
          initialValues={{
            fullName: '',
            birthDate: '',
            gender: '',
            primaryDiagnosis: '',
            tdahType: '',
            autismLevel: '',
            currentMedication: '',
            professionals: [],
            schoolGrade: '',
            schoolType: '',
            educationalSupport: [],
            strengths: [],
            difficulties: [],
            interests: '',
            specialNeeds: []
          }}
          validationSchema={ProfileSchema}
          onSubmit={onSubmit}
        >
          {({ errors, touched, values }) => (
            <Form className="space-y-6">
              {/* Datos Básicos */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Datos Básicos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Nombre completo:</label>
                    <Field
                      name="fullName"
                      className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                    />
                    {errors.fullName && touched.fullName && (
                      <div className="text-red-500 text-sm mt-1">{errors.fullName}</div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Fecha de nacimiento:</label>
                    <Field
                      type="date"
                      name="birthDate"
                      className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                    />
                    {errors.birthDate && touched.birthDate && (
                      <div className="text-red-600 text-sm mt-1 font-medium">* {errors.birthDate}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Género:</label>
                    <Field
                      as="select"
                      name="gender"
                      className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                    >
                      <option value="">Selecciona un género</option>
                      <option value="male">Masculino</option>
                      <option value="female">Femenino</option>
                      <option value="other">Otro</option>
                    </Field>
                    {errors.gender && touched.gender && (
                      <div className="text-red-500 text-sm mt-1">{errors.gender}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Información Médica */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Información Médica</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Diagnóstico primario:</label>
                    <Field
                      as="select"
                      name="primaryDiagnosis"
                      className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                    >
                      <option value="">Selecciona un diagnóstico</option>
                      <option value="TDAH">TDAH</option>
                      <option value="Autismo">Autismo</option>
                      <option value="Ambos">Ambos</option>
                    </Field>
                    {errors.primaryDiagnosis && touched.primaryDiagnosis && (
                      <div className="text-red-500 text-sm mt-1">{errors.primaryDiagnosis}</div>
                    )}
                  </div>

                  {(values.primaryDiagnosis === 'TDAH' || values.primaryDiagnosis === 'Ambos') && (
                    <div>
                      <label className="block text-gray-700 mb-2">Tipo de TDAH:</label>
                      <Field
                        as="select"
                        name="tdahType"
                        className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                      >
                        <option value="">Selecciona el tipo</option>
                        <option value="inatento">Inatento</option>
                        <option value="hiperactivo">Hiperactivo/Impulsivo</option>
                        <option value="combinado">Combinado</option>
                      </Field>      
                    </div>
                  )}

                  {(values.primaryDiagnosis === 'Autismo' || values.primaryDiagnosis === 'Ambos') && (
                    <div>
                      <label className="block text-gray-700 mb-2">Nivel de Autismo:</label>
                      <Field
                        as="select"
                        name="autismLevel"
                        className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                      >
                        <option value="">Selecciona el nivel</option>
                        <option value="nivel1">Nivel 1 (Requiere apoyo)</option>
                        <option value="nivel2">Nivel 2 (Requiere apoyo sustancial)</option>
                        <option value="nivel3">Nivel 3 (Requiere apoyo muy sustancial)</option>
                      </Field>
                    </div>
                  )}

                  <div>
                    <label className="block text-gray-700 mb-2">Medicación actual:</label>
                    <Field
                      name="currentMedication"
                      as="textarea"
                      className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                      placeholder="Opcional - Lista de medicamentos actuales"
                    />
                  </div>
                </div>
              </div>

              {/* Información Educativa */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Información Educativa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Grado escolar:</label>
                    <Field
                      name="schoolGrade"
                      className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                    />
                    {errors.schoolGrade && touched.schoolGrade && ( 
                      <div className="text-red-500">{errors.schoolGrade}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Tipo de escuela:</label>
                    <Field
                      as="select"
                      name="schoolType"
                      className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                    >
                      <option value="">Selecciona el tipo de escuela</option>
                      <option value="regular">Regular</option>
                      <option value="especial">Especial</option>
                      <option value="homeschool">Homeschooling</option>
                    </Field>
                    {errors.schoolType && touched.schoolType && (
                      <div className="text-red-500">{errors.schoolType}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Información de Desarrollo */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Información de Desarrollo</h3>
                
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Áreas de fortaleza:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {strengthOptions.map(option => (
                      <label key={option.value} className="flex items-center space-x-2">
                        <Field
                          type="checkbox"
                          name="strengths"
                          value={option.value}
                          className="form-checkbox h-5 w-5 text-[var(--primary-blue)]"
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                    {errors.strengths && touched.strengths && (
                      <div className="text-red-500 text-sm mt-1">{errors.strengths}</div>
                    )}  

                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Áreas de dificultad:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {difficultyOptions.map(option => (
                      <label key={option.value} className="flex items-center space-x-2">
                        <Field
                          type="checkbox"
                          name="difficulties"
                          value={option.value}
                          className="form-checkbox h-5 w-5 text-[var(--primary-blue)]"
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                    {errors.difficulties && touched.difficulties && (
                      <div className="text-red-500 text-sm mt-1">{errors.difficulties}</div>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Intereses específicos:</label>
                  <Field
                    name="interests"
                    as="textarea"
                    className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                    placeholder="Describe los intereses y actividades que motivan al niño"
                  />
                  {errors.interests && touched.interests && (
                    <div className="text-red-500 text-sm mt-1">{errors.interests}</div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Necesidades especiales:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {specialNeedsOptions.map(option => (
                      <label key={option.value} className="flex items-center space-x-2">
                        <Field
                          type="checkbox"
                          name="specialNeeds"
                          value={option.value}
                          className="form-checkbox h-5 w-5 text-[var(--primary-blue)]"
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                    {errors.specialNeeds && touched.specialNeeds && (
                      <div className="text-red-500 text-sm mt-1">{errors.specialNeeds}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[var(--primary-blue)] text-white rounded-lg hover:opacity-90"
                >
                  Crear Perfil
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default AddProfileModal;