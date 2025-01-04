import * as Yup from 'yup';

export const strengthOptions = [
  { value: 'verbal', label: 'Habilidades verbales' },
  { value: 'math', label: 'Habilidades matemáticas' },
  { value: 'memory', label: 'Memoria' },
  { value: 'creativity', label: 'Creatividad' },
  { value: 'art', label: 'Habilidades artísticas' },
  { value: 'sports', label: 'Deportes/Actividad física' },
  { value: 'social', label: 'Habilidades sociales' },
  { value: 'tech', label: 'Tecnología' },
  { value: 'music', label: 'Música' },
  { value: 'reading', label: 'Lectura' }
];

export const difficultyOptions = [
  { value: 'attention', label: 'Atención y concentración' },
  { value: 'impulse', label: 'Control de impulsos' },
  { value: 'organization', label: 'Organización y planificación' },
  { value: 'social', label: 'Habilidades sociales' },
  { value: 'verbal', label: 'Comunicación verbal' },
  { value: 'reading', label: 'Comprensión lectora' },
  { value: 'writing', label: 'Escritura' },
  { value: 'math', label: 'Matemáticas' },
  { value: 'emotional', label: 'Control emocional' },
  { value: 'motor', label: 'Motricidad fina/gruesa' }
];

export const specialNeedsOptions = [
  { value: 'communication', label: 'Apoyo en comunicación' },
  { value: 'mobility', label: 'Apoyo en movilidad' },
  { value: 'sensory', label: 'Adaptaciones sensoriales' },
  { value: 'behavioral', label: 'Apoyo conductual' },
  { value: 'academic', label: 'Apoyo académico' },
  { value: 'emotional', label: 'Apoyo emocional' },
  { value: 'social', label: 'Apoyo en habilidades sociales' }
];
export const ProfileSchema = Yup.object().shape({
    fullName: Yup.string()
      .min(2, 'El nombre es muy corto')
      .max(50, 'El nombre es muy largo')
      .required('El nombre es requerido'),
    birthDate: Yup.date()
      .max(new Date(), 'La fecha no puede ser futura')
      .test('age', 'La edad debe ser entre 3 y 17 años', function(value) {
        if (!value) return false;
        const age = new Date().getFullYear() - new Date(value).getFullYear();
        return age >= 3 && age <= 17;
      })
    .required('La fecha de nacimiento es requerida'),
    gender: Yup.string()
      .required('El género es requerido'),
    primaryDiagnosis: Yup.string()
      .required('El diagnóstico primario es requerido'),
    tdahType: Yup.string().nullable(),
    autismLevel: Yup.string().nullable(),
    currentMedication: Yup.string().nullable(),
    professionals: Yup.array().of(Yup.string()).nullable(),
    schoolGrade: Yup.string()
      .required('El grado escolar es requerido'),
    schoolType: Yup.string()
      .required('El tipo de escuela es requerido'),
    educationalSupport: Yup.array().of(Yup.string()).nullable(),
    strengths: Yup.array()
      .of(Yup.string())
      .min(1, 'Selecciona al menos una fortaleza'),
    difficulties: Yup.array()
      .of(Yup.string())
      .min(1, 'Selecciona al menos una dificultad'),
    interests: Yup.string()
      .required('Los intereses son requeridos'),
    specialNeeds: Yup.array().of(Yup.string()).nullable()
  });