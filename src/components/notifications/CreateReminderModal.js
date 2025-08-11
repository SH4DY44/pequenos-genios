// src/components/notifications/CreateReminderModal.js
import React, { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { FaTimes, FaEnvelope, FaBell, FaUserMd, FaPills, FaBook, FaCheck } from 'react-icons/fa';
import { TutorService } from '../../services/tutorService'; // Tu TutorService existente
import { NotificationService } from '../../services/notificationService';
import EmailService from '../../services/emailService'; // 🆕 NUEVO: Importar EmailService
import { ReminderScheduler } from '../../services/reminderScheduler'; // 🆕 NUEVO: Importar ReminderScheduler
import { toast } from 'react-toastify';
import { auth } from '../../config/firebase';

// Esquema de validación
const ReminderSchema = Yup.object().shape({
  tipo: Yup.string()
    .oneOf(['recordatorio_manual', 'cita_especialista', 'medicamento', 'tarea_especial'])
    .required('Selecciona un tipo de recordatorio'),
  
  titulo: Yup.string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(100, 'El título no puede exceder 100 caracteres')
    .required('El título es requerido'),
  
  mensaje: Yup.string()
    .min(10, 'El mensaje debe tener al menos 10 caracteres')
    .max(500, 'El mensaje no puede exceder 500 caracteres')
    .required('El mensaje es requerido'),
  
  profileId: Yup.string()
    .required('Selecciona un perfil'),
  
  telefono: Yup.string()
    .matches(/^[+]?[0-9\s\-()]{10,15}$/, 'Formato de teléfono inválido')
    .required('El teléfono es requerido'),
  
  enviarEmail: Yup.boolean(),
  
  // Campos específicos por tipo con validación de fechas futuras
  especialista: Yup.string().when('tipo', {
    is: 'cita_especialista',
    then: schema => schema.required('El especialista es requerido'),
    otherwise: schema => schema.nullable()
  }),
  
  fechaCita: Yup.date().when('tipo', {
    is: 'cita_especialista',
    then: schema => schema
      .required('La fecha de la cita es requerida')
      .min(new Date(Date.now() + 60000), 'La fecha de la cita debe ser al menos 1 minuto en el futuro'),
    otherwise: schema => schema.nullable()
  }),
  
  medicamento: Yup.string().when('tipo', {
    is: 'medicamento',
    then: schema => schema.required('El medicamento es requerido'),
    otherwise: schema => schema.nullable()
  }),
  
  dosis: Yup.string().when('tipo', {
    is: 'medicamento',
    then: schema => schema.required('La dosis es requerida'),
    otherwise: schema => schema.nullable()
  }),
  
  materia: Yup.string().when('tipo', {
    is: 'tarea_especial',
    then: schema => schema.required('La materia es requerida'),
    otherwise: schema => schema.nullable()
  }),
  
  fechaEntrega: Yup.date().when('tipo', {
    is: 'tarea_especial',
    then: schema => schema
      .required('La fecha de entrega es requerida')
      .min(new Date(Date.now() + 60000), 'La fecha de entrega debe ser al menos 1 minuto en el futuro'),
    otherwise: schema => schema.nullable()
  })
});

// Tipos de recordatorio disponibles
const TIPOS_RECORDATORIO = [
  {
    id: 'recordatorio_manual',
    nombre: 'Recordatorio General',
    descripcion: 'Mensaje personalizado',
    icono: <FaBell className="text-blue-500" />,
    color: 'bg-blue-50 border-blue-200',
    plantillas: [
      {
        titulo: 'Hora de actividades',
        mensaje: 'Es momento de hacer las actividades en Pequeños Genios. ¡Vamos a aprender jugando!'
      },
      {
        titulo: 'Descanso importante',
        mensaje: 'Recuerda tomar un descanso. Es importante relajarse entre actividades.'
      }
    ]
  },
  {
    id: 'cita_especialista',
    nombre: 'Cita Médica',
    descripcion: 'Recordatorio de cita con especialista',
    icono: <FaUserMd className="text-green-500" />,
    color: 'bg-green-50 border-green-200',
    plantillas: [
      {
        titulo: 'Cita con psicólogo',
        mensaje: 'Recordatorio: Tienes cita con el psicólogo mañana. No olvides llevar el cuaderno de seguimiento.'
      },
      {
        titulo: 'Cita con neurólogo',
        mensaje: 'Recordatorio: Cita con el neurólogo próximamente. Preparar lista de preguntas.'
      }
    ]
  },
  {
    id: 'medicamento',
    nombre: 'Medicamento',
    descripcion: 'Recordatorio de tratamiento',
    icono: <FaPills className="text-red-500" />,
    color: 'bg-red-50 border-red-200',
    plantillas: [
      {
        titulo: 'Hora del medicamento',
        mensaje: 'Es hora de tomar el medicamento. Recuerda seguir las indicaciones del médico.'
      }
    ]
  },
  {
    id: 'tarea_especial',
    nombre: 'Tarea Escolar',
    descripcion: 'Actividad académica específica',
    icono: <FaBook className="text-purple-500" />,
    color: 'bg-purple-50 border-purple-200',
    plantillas: [
      {
        titulo: 'Tarea de matemáticas',
        mensaje: 'Recordatorio: Completar la tarea de matemáticas para mañana.'
      },
      {
        titulo: 'Proyecto escolar',
        mensaje: 'No olvides trabajar en el proyecto escolar. ¡Puedes hacerlo!'
      }
    ]
  }
];

function CreateReminderModal({ isOpen, onClose, perfiles = [], onSuccess }) {
  // Estados
  const [loading, setLoading] = useState(false);
  const [infoContacto, setInfoContacto] = useState(null);
  const [loadingContacto, setLoadingContacto] = useState(true);
  const [emailDisponible, setEmailDisponible] = useState(true); // 🆕 NUEVO: Email siempre disponible
  // const [emailServiceStatus, setEmailServiceStatus] = useState(null); // 🔇 COMENTADO: Estado del servicio

  // 🆕 NUEVO: Calcular fechas mínimas dinámicamente
  const getFechaMinima = () => {
    const ahora = new Date();
    ahora.setMinutes(ahora.getMinutes() + 1); // Al menos 1 minuto en el futuro
    return ahora.toISOString().slice(0, 16);
  };

  const getFechaMinimaDate = () => {
    const ahora = new Date();
    ahora.setDate(ahora.getDate() + 0); // Desde hoy
    return ahora.toISOString().split('T')[0];
  };

  // Cargar información del tutor al abrir el modal
  useEffect(() => {
    if (isOpen) {
      cargarInfoContacto();
      // verificarEmailService(); //  Para evitar problemas visuales
    }
  }, [isOpen]);

  //  Verificar estado del servicio de email (para evitar problemas visuales)
  /*
  const verificarEmailService = async () => {
    try {
      console.log('🔍 Verificando estado del servicio de email...');
      console.log('🔍 EmailService:', EmailService);
      const status = await EmailService.verificarEmailService();
      console.log('🔍 Estado del servicio obtenido:', status);
      setEmailServiceStatus(status ? { estado: 'ACTIVO' } : { estado: 'ERROR' });
      console.log('✅ Estado del servicio de email:', status);
    } catch (error) {
      console.error('❌ Error verificando estado del servicio de email:', error);
      setEmailServiceStatus({ estado: 'ERROR', error: error.message });
    }
  };
  */

  const cargarInfoContacto = async () => {
    try {
      setLoadingContacto(true);
      console.log('🔄 Cargando información de contacto...');

      // Usar tu TutorService existente
      const contacto = await TutorService.obtenerInfoContacto();

      setInfoContacto(contacto);
      setEmailDisponible(true); // 🆕 NUEVO: Email siempre disponible
      
      console.log('✅ Info de contacto cargada:', contacto);
    } catch (error) {
      console.error('❌ Error cargando info de contacto:', error);
      toast.error('Error al cargar la información de contacto');
    } finally {
      setLoadingContacto(false);
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setLoading(true);
      console.log('🚀 Creando recordatorio:', values);

      // Encontrar el perfil seleccionado
      const perfilSeleccionado = perfiles.find(p => p.id === values.profileId);
      const nombreNino = perfilSeleccionado?.fullName || 'Niño';

      // 1. Preparar datos específicos según el tipo
      let datosEspecificos = {
        nombreNino,
        creadorPor: 'tutor',
        telefonoEnviado: values.telefono,
        tipoRecordatorio: values.tipo
      };

      // Agregar campos específicos según el tipo
      switch (values.tipo) {
        case 'cita_especialista':
          datosEspecificos = {
            ...datosEspecificos,
            especialista: values.especialista,
            fechaCita: values.fechaCita
          };
          break;
        case 'medicamento':
          datosEspecificos = {
            ...datosEspecificos,
            medicamento: values.medicamento,
            dosis: values.dosis
          };
          break;
        case 'tarea_especial':
          datosEspecificos = {
            ...datosEspecificos,
            materia: values.materia,
            fechaEntrega: values.fechaEntrega
          };
          break;
        default:
          // No hay campos específicos para otros tipos
          break;
      }

      // Tipos soportados por el backend para notificación automática
      const tiposSoportados = {
        actividad_pendiente: NotificationService.notificarActividadPendienteConEmail,
        logro_alcanzado: NotificationService.notificarLogroConEmail,
        resumen_semanal: NotificationService.enviarResumenSemanalConEmail,
        bienvenida: NotificationService.enviarBienvenida,
        recompensa_disponible: NotificationService.notificarRecompensaConEmail,
        sesion_completada: NotificationService.notificarSesionCompletadaConEmail
      };

      // Si el tipo es soportado, llamar a la función correspondiente
      if (tiposSoportados[values.tipo]) {
        await tiposSoportados[values.tipo](
          auth.currentUser.uid,
          values.profileId,
          datosEspecificos
        );
        toast.success('¡Recordatorio y correo enviados correctamente!');
      } else {
        // 2. Crear la notificación en la base de datos
        const notificationData = {
          tutorId: auth.currentUser.uid,
          profileId: values.profileId,
          tipo: values.tipo,
          titulo: values.titulo,
          mensaje: values.mensaje,
          datos: datosEspecificos,
          prioridad: values.tipo === 'medicamento' ? 'alta' : 'normal'
        };

        const notificationId = await NotificationService.crearNotificacion(notificationData);
        console.log('✅ Notificación creada con ID:', notificationId);

        // 🆕 NUEVO: Enviar por Email si está marcado
        if (values.enviarEmail) {
          try {
            console.log('📧 Iniciando envío de email inmediato...');
            console.log('📧 EmailService disponible:', !!EmailService);
            console.log('📧 Método enviarRecordatorioPersonalizado disponible:', !!EmailService.enviarRecordatorioPersonalizado);
            
            const emailData = {
              nombreNino,
              nombreTutor: auth.currentUser?.displayName || 'Tutor',
              titulo: values.titulo,
              mensaje: values.mensaje,
              tipoRecordatorio: values.tipo,
              ...datosEspecificos
            };

            console.log('📧 Datos del email a enviar:', emailData);
            
            const resultado = await EmailService.enviarRecordatorioPersonalizado(emailData);
            console.log('📧 Resultado del envío:', resultado);
            console.log('📧 Email inmediato enviado correctamente');
            toast.success('📧 Recordatorio enviado por email');
          } catch (emailError) {
            console.error('❌ Error enviando email inmediato:', emailError);
            console.error('❌ Stack trace:', emailError.stack);
            toast.warning('⚠️ El recordatorio se creó pero hubo un problema enviando el email: ' + emailError.message);
          }
        }

        // 🆕 NUEVO: Programar recordatorio automático para la fecha especificada
        await programarRecordatorioAutomatico(values, nombreNino, datosEspecificos);
        
        toast.success('¡Recordatorio creado exitosamente!');
      }

      // 4. Actualizar teléfono del tutor si cambió
      if (values.telefono && values.telefono !== infoContacto?.telefono) {
        await TutorService.actualizarTelefono(values.telefono);
        console.log('📞 Teléfono actualizado en el perfil');
      }

      resetForm();
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('❌ Error creando recordatorio:', error);
      toast.error('Error al crear el recordatorio: ' + error.message);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Aplicar plantilla
  const aplicarPlantilla = (plantilla, setFieldValue) => {
    setFieldValue('titulo', plantilla.titulo);
    setFieldValue('mensaje', plantilla.mensaje);
  };

  // 🆕 NUEVO: Programar recordatorio automático para la fecha especificada
  const programarRecordatorioAutomatico = async (values, nombreNino, datosEspecificos) => {
    try {
      let fechaProgramada = null;
      
      // Determinar la fecha para el recordatorio automático según el tipo
      switch (values.tipo) {
        case 'cita_especialista':
          if (values.fechaCita) {
            // Programar recordatorio 1 día antes de la cita
            fechaProgramada = new Date(values.fechaCita);
            fechaProgramada.setDate(fechaProgramada.getDate() - 1);
            fechaProgramada.setHours(19, 0, 0, 0); // 7:00 PM del día anterior
          }
          break;
          
        case 'tarea_especial':
          if (values.fechaEntrega) {
            // Programar recordatorio 1 día antes de la entrega
            fechaProgramada = new Date(values.fechaEntrega);
            fechaProgramada.setDate(fechaProgramada.getDate() - 1);
            fechaProgramada.setHours(18, 0, 0, 0); // 6:00 PM del día anterior
          }
          break;
          
        case 'medicamento':
          // Para medicamentos, programar recordatorio diario a una hora específica
          // Por simplicidad, programaremos para mañana a la misma hora
          fechaProgramada = new Date();
          fechaProgramada.setDate(fechaProgramada.getDate() + 1);
          fechaProgramada.setHours(8, 0, 0, 0); // 8:00 AM todos los días
          break;
          
        default:
          // Para recordatorios generales, no programar automáticamente
          return;
      }
      
      if (fechaProgramada && fechaProgramada > new Date()) {
        const recordatorioData = {
          tutorId: auth.currentUser.uid,
          profileId: values.profileId,
          nombreNino,
          tipo: values.tipo,
          fechaProgramada,
          datos: {
            titulo: values.titulo,
            mensaje: values.mensaje,
            ...datosEspecificos
          }
        };
        
        const recordatorioId = await ReminderScheduler.programarRecordatorio(recordatorioData);
        console.log('📅 Recordatorio automático programado:', recordatorioId);
        
        // Mostrar mensaje informativo
        const fechaFormateada = fechaProgramada.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        toast.info(`📅 Recordatorio automático programado para: ${fechaFormateada}`, {
          autoClose: 8000
        });
      }
    } catch (error) {
      console.warn('⚠️ Error programando recordatorio automático:', error);
      // No fallar el proceso principal si hay error en la programación
    }
  };

  if (!isOpen) return null;

  // Determinar el valor inicial de profileId
  const initialProfileId = perfiles.length === 1 ? perfiles[0].id : '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 className="text-2xl font-bold text-[var(--primary-blue)] flex items-center gap-2">
            <FaBell />
            Crear Recordatorio Personalizado
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {loadingContacto ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-blue)] mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando información de contacto...</p>
            </div>
          ) : (
            <Formik
              initialValues={{
                tipo: 'recordatorio_manual',
                titulo: '',
                mensaje: '',
                profileId: initialProfileId,
                telefono: infoContacto?.telefono || '',
                enviarEmail: true, // 🆕 NUEVO: Email siempre disponible
                // Campos específicos
                especialista: '',
                fechaCita: '',
                medicamento: '',
                dosis: '',
                materia: '',
                fechaEntrega: ''
              }}
              validationSchema={ReminderSchema}
              enableReinitialize
              onSubmit={handleSubmit}
            >
              {({ errors, touched, values, setFieldValue }) => {
                const tipoSeleccionado = TIPOS_RECORDATORIO.find(t => t.id === values.tipo);

                return (
                  <Form className="space-y-6">
                    {/* Selector de tipo de recordatorio */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-3">
                        📋 Tipo de recordatorio:
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {TIPOS_RECORDATORIO.map(tipo => (
                          <label
                            key={tipo.id}
                            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              values.tipo === tipo.id
                                ? `${tipo.color} border-current`
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Field
                              type="radio"
                              name="tipo"
                              value={tipo.id}
                              className="sr-only"
                            />
                            <div className="flex items-center gap-3">
                              {tipo.icono}
                              <div>
                                <div className="font-medium">{tipo.nombre}</div>
                                <div className="text-sm text-gray-600">{tipo.descripcion}</div>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                      {errors.tipo && touched.tipo && (
                        <div className="text-red-500 text-sm mt-1">{errors.tipo}</div>
                      )}
                    </div>

                    {/* Seleccionar perfil */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        👶 Para quién es el recordatorio:
                      </label>
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700">
                        {perfiles[0]?.fullName || 'Perfil sin nombre'}
                      </div>
                    </div>

                    {/* Campos específicos según el tipo */}
                    {values.tipo === 'cita_especialista' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg">
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">
                            🩺 Especialista:
                          </label>
                          <Field
                            name="especialista"
                            placeholder="Ej: Dr. García - Psicólogo"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          />
                          {errors.especialista && touched.especialista && (
                            <div className="text-red-500 text-sm mt-1">{errors.especialista}</div>
                          )}
                        </div>
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">
                            📅 Fecha de la cita:
                          </label>
                          <Field
                            type="datetime-local"
                            name="fechaCita"
                            min={getFechaMinima()}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          />
                          {errors.fechaCita && touched.fechaCita && (
                            <div className="text-red-500 text-sm mt-1">{errors.fechaCita}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {values.tipo === 'medicamento' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-red-50 rounded-lg">
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">
                            💊 Medicamento:
                          </label>
                          <Field
                            name="medicamento"
                            placeholder="Ej: Metilfenidato"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                          />
                          {errors.medicamento && touched.medicamento && (
                            <div className="text-red-500 text-sm mt-1">{errors.medicamento}</div>
                          )}
                        </div>
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">
                            ⚖️ Dosis:
                          </label>
                          <Field
                            name="dosis"
                            placeholder="Ej: 10mg por la mañana"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                          />
                          {errors.dosis && touched.dosis && (
                            <div className="text-red-500 text-sm mt-1">{errors.dosis}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {values.tipo === 'tarea_especial' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-purple-50 rounded-lg">
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">
                            📖 Materia:
                          </label>
                          <Field
                            name="materia"
                            placeholder="Ej: Matemáticas"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                          {errors.materia && touched.materia && (
                            <div className="text-red-500 text-sm mt-1">{errors.materia}</div>
                          )}
                        </div>
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">
                            📅 Fecha de entrega:
                          </label>
                          <Field
                            type="date"
                            name="fechaEntrega"
                            min={getFechaMinimaDate()}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                          {errors.fechaEntrega && touched.fechaEntrega && (
                            <div className="text-red-500 text-sm mt-1">{errors.fechaEntrega}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Título */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        📝 Título del recordatorio:
                      </label>
                      <Field
                        name="titulo"
                        placeholder="Ej: Hora de tomar medicamento"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-blue)] focus:border-transparent"
                      />
                      {errors.titulo && touched.titulo && (
                        <div className="text-red-500 text-sm mt-1">{errors.titulo}</div>
                      )}
                    </div>

                    {/* Mensaje */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        💬 Mensaje del recordatorio:
                      </label>
                      <Field
                        as="textarea"
                        name="mensaje"
                        rows={4}
                        placeholder="Escribe el mensaje completo del recordatorio..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-blue)] focus:border-transparent resize-none"
                      />
                      {errors.mensaje && touched.mensaje && (
                        <div className="text-red-500 text-sm mt-1">{errors.mensaje}</div>
                      )}
                    </div>

                    {/* Plantillas rápidas */}
                    {tipoSeleccionado?.plantillas && tipoSeleccionado.plantillas.length > 0 && (
                      <div className={`${tipoSeleccionado.color} rounded-lg p-4`}>
                        <h3 className="font-medium text-gray-800 mb-3">🚀 Plantillas rápidas:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {tipoSeleccionado.plantillas.map((plantilla, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => aplicarPlantilla(plantilla, setFieldValue)}
                              className="text-left p-3 bg-white rounded border hover:shadow-md transition-all"
                            >
                              <div className="font-medium text-gray-700">{plantilla.titulo}</div>
                              <div className="text-sm text-gray-600 line-clamp-2">{plantilla.mensaje}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Teléfono */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        📞 Tu número de teléfono:
                      </label>
                      <Field
                        name="telefono"
                        placeholder="Ej: +521234567890"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-blue)] focus:border-transparent"
                      />
                      {errors.telefono && touched.telefono && (
                        <div className="text-red-500 text-sm mt-1">{errors.telefono}</div>
                      )}
                      <p className="text-gray-500 text-sm mt-1">
                        💡 Este número se guardará en tu perfil para futuros recordatorios
                      </p>
                    </div>

                    {/* Enviar por Email */}
                    <div className={`rounded-lg p-4 ${emailDisponible ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <Field
                          type="checkbox"
                          name="enviarEmail"
                          disabled={!emailDisponible}
                          className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 disabled:opacity-50"
                        />
                        <div className="flex items-center gap-2">
                          <FaEnvelope className={`text-xl ${emailDisponible ? 'text-green-600' : 'text-gray-400'}`} />
                          <span className={`font-medium ${emailDisponible ? 'text-green-800' : 'text-gray-600'}`}>
                            Enviar también por Email
                          </span>
                        </div>
                      </label>
                      <p className={`text-sm mt-2 ml-8 ${emailDisponible ? 'text-green-700' : 'text-gray-600'}`}>
                        {emailDisponible 
                          ? 'Se enviará un email con el recordatorio'
                          : 'Email no disponible'
                        }
                      </p>
                      
                      {/* 🔇 COMENTADO: Indicador de estado del servicio 
                      {emailServiceStatus && (
                        <div className="mt-3 ml-8 flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            emailServiceStatus.estado === 'ACTIVO' ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <span className={`text-xs ${
                            emailServiceStatus.estado === 'ACTIVO' ? 'text-green-700' : 'text-red-700'
                          }`}>
                            Servicio de email: {emailServiceStatus.estado === 'ACTIVO' ? 'CONECTADO' : 'DESCONECTADO'}
                          </span>
                        </div>
                      )}
                      */}
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-[var(--primary-blue)] text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Creando...
                          </>
                        ) : (
                          <>
                            <FaBell />
                            Crear Recordatorio
                          </>
                        )}
                      </button>
                    </div>
                  </Form>
                );
              }}
            </Formik>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateReminderModal;