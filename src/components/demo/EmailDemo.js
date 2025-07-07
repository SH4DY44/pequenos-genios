import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { NotificationService } from '../../services/notificationService';
import emailService from '../../services/emailService';

const EmailDemo = () => {
  const [cargando, setCargando] = useState(false);
  const [correoDestinatario, setCorreoDestinatario] = useState('');
  const [tipoNotificacion, setTipoNotificacion] = useState('bienvenida');
  const [datosPersonalizados, setDatosPersonalizados] = useState({
    nombreNino: 'Juan',
    nombreTutor: 'María',
    puntos: 150,
    horasSinActividad: 48
  });

  const tiposNotificacion = [
    { 
      valor: 'bienvenida', 
      nombre: 'Bienvenida', 
      descripcion: 'Correo de bienvenida a nuevos usuarios' 
    },
    { 
      valor: 'actividad_pendiente', 
      nombre: 'Actividad Pendiente', 
      descripcion: 'Recordatorio cuando no hay actividad reciente' 
    },
    { 
      valor: 'logro_alcanzado', 
      nombre: 'Logro Alcanzado', 
      descripcion: 'Notificación de nuevo logro o insignia' 
    },
    { 
      valor: 'resumen_semanal', 
      nombre: 'Resumen Semanal', 
      descripcion: 'Resumen de progreso semanal' 
    },
    { 
      valor: 'recompensa_disponible', 
      nombre: 'Recompensa Disponible', 
      descripcion: 'Notificación de recompensa lista para reclamar' 
    },
    { 
      valor: 'sesion_completada', 
      nombre: 'Sesión Completada', 
      descripcion: 'Confirmación de sesión de práctica completada' 
    }
  ];

  const getDatosEjemplo = (tipo) => {
    const base = {
      nombreNino: datosPersonalizados.nombreNino,
      nombreTutor: datosPersonalizados.nombreTutor
    };

    switch (tipo) {
      case 'bienvenida':
        return base;
      
      case 'actividad_pendiente':
        return {
          ...base,
          horasSinActividad: datosPersonalizados.horasSinActividad || 48
        };
      
      case 'logro_alcanzado':
        return {
          ...base,
          logro: 'Maestro de Formas',
          puntos: datosPersonalizados.puntos || 150,
          descripcion: 'Ha completado 10 actividades de clasificación de formas'
        };
      
      case 'resumen_semanal':
        return {
          ...base,
          actividadesCompletadas: 15,
          tiempoTotal: 180,
          puntosTotales: 750,
          racha: 5,
          semana: 'esta semana'
        };
      
      case 'recompensa_disponible':
        return {
          ...base,
          recompensa: 'Sticker de Estrella Dorada',
          puntosRequeridos: 100,
          puntosActuales: datosPersonalizados.puntos || 150
        };
      
      case 'sesion_completada':
        return {
          ...base,
          duracion: 25,
          actividades: 5,
          puntos: 50,
          precision: 95
        };
      
      default:
        return base;
    }
  };

  const enviarCorreoDemo = async () => {
    if (!correoDestinatario) {
      toast.error('Por favor ingresa un correo electrónico');
      return;
    }

    setCargando(true);
    try {
      const datos = getDatosEjemplo(tipoNotificacion);
      
      // Enviar correo directamente usando el servicio
      await emailService.enviarCorreo(
        correoDestinatario,
        tipoNotificacion,
        datos
      );
      
      toast.success('¡Correo enviado exitosamente!');
      
    } catch (error) {
      console.error('Error enviando correo:', error);
      toast.error('Error enviando correo: ' + error.message);
    } finally {
      setCargando(false);
    }
  };

  const enviarNotificacionCompleta = async () => {
    if (!correoDestinatario) {
      toast.error('Por favor ingresa un correo electrónico');
      return;
    }

    setCargando(true);
    try {
      const datos = getDatosEjemplo(tipoNotificacion);
      
      // Simular IDs de usuario y perfil
      const tutorId = 'demo-tutor-' + Date.now();
      const profileId = 'demo-profile-' + Date.now();
      
      // Enviar notificación completa (esto requeriría autenticación real)
      // Por ahora solo enviar correo
      await emailService.enviarCorreo(
        correoDestinatario,
        tipoNotificacion,
        datos
      );
      
      toast.success('¡Notificación completa enviada!');
      
    } catch (error) {
      console.error('Error enviando notificación completa:', error);
      toast.error('Error: ' + error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          📧 Demo de Correos Electrónicos
        </h1>
        <p className="text-gray-600">
          Prueba las diferentes plantillas de correo de Pequeños Genios
        </p>
      </div>

      {/* Configuración */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Configuración del Correo</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Destinatario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo Destinatario
            </label>
            <input
              type="email"
              value={correoDestinatario}
              onChange={(e) => setCorreoDestinatario(e.target.value)}
              placeholder="ejemplo@gmail.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tipo de Notificación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Notificación
            </label>
            <select
              value={tipoNotificacion}
              onChange={(e) => setTipoNotificacion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {tiposNotificacion.map((tipo) => (
                <option key={tipo.valor} value={tipo.valor}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Datos Personalizados */}
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Datos Personalizados</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Niño
              </label>
              <input
                type="text"
                value={datosPersonalizados.nombreNino}
                onChange={(e) => setDatosPersonalizados({
                  ...datosPersonalizados,
                  nombreNino: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Tutor
              </label>
              <input
                type="text"
                value={datosPersonalizados.nombreTutor}
                onChange={(e) => setDatosPersonalizados({
                  ...datosPersonalizados,
                  nombreTutor: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Puntos
              </label>
              <input
                type="number"
                value={datosPersonalizados.puntos}
                onChange={(e) => setDatosPersonalizados({
                  ...datosPersonalizados,
                  puntos: parseInt(e.target.value) || 0
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horas Sin Actividad
              </label>
              <input
                type="number"
                value={datosPersonalizados.horasSinActividad}
                onChange={(e) => setDatosPersonalizados({
                  ...datosPersonalizados,
                  horasSinActividad: parseInt(e.target.value) || 0
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview del Tipo Seleccionado */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Vista Previa</h2>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">
              {tipoNotificacion === 'bienvenida' && '🎉'}
              {tipoNotificacion === 'actividad_pendiente' && '🎯'}
              {tipoNotificacion === 'logro_alcanzado' && '🏆'}
              {tipoNotificacion === 'resumen_semanal' && '📊'}
              {tipoNotificacion === 'recompensa_disponible' && '🎁'}
              {tipoNotificacion === 'sesion_completada' && '✅'}
            </span>
            <h3 className="text-lg font-semibold">
              {tiposNotificacion.find(t => t.valor === tipoNotificacion)?.nombre}
            </h3>
          </div>
          
          <p className="text-gray-600 mb-4">
            {tiposNotificacion.find(t => t.valor === tipoNotificacion)?.descripcion}
          </p>
          
          <div className="bg-white rounded-md p-3 border">
            <h4 className="font-medium mb-2">Datos que se enviarán:</h4>
            <pre className="text-sm text-gray-700 overflow-x-auto">
              {JSON.stringify(getDatosEjemplo(tipoNotificacion), null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Acciones</h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={enviarCorreoDemo}
            disabled={cargando || !correoDestinatario}
            className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cargando ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Enviando...
              </span>
            ) : (
              '📧 Enviar Solo Correo'
            )}
          </button>
          
          <button
            onClick={enviarNotificacionCompleta}
            disabled={cargando || !correoDestinatario}
            className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cargando ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Enviando...
              </span>
            ) : (
              '🚀 Enviar Notificación Completa'
            )}
          </button>
        </div>
      </div>

      {/* Información Adicional */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-3 text-blue-800">
          ℹ️ Información Importante
        </h2>
        
        <div className="space-y-2 text-sm text-blue-700">
          <p>• Asegúrate de que el servicio de email esté ejecutándose en http://localhost:3001</p>
          <p>• El correo se enviará usando las plantillas profesionales configuradas</p>
          <p>• Los datos se personalizarán según los valores ingresados</p>
          <p>• En producción, estas notificaciones se enviarían automáticamente</p>
        </div>
      </div>
    </div>
  );
};

export default EmailDemo;
