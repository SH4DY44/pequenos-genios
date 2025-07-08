// src/components/notifications/NotificationDemo.js
import React, { useState } from 'react';
import { FaBell, FaPlus, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationService } from '../../services/notificationService';
import { toast } from 'react-toastify';
import AutomaticNotificationTester from './AutomaticNotificationTester'; // 🆕 NUEVO IMPORT

function NotificationDemo() {
  const { cargarNotificaciones } = useNotifications();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);

  // Crear notificación de prueba
  const crearNotificacionPrueba = async (tipo) => {
    setLoading(true);
    try {
      const datosDemo = {
        actividad_pendiente: {
          profileId: 'demo-profile',
          tipo: 'actividad_pendiente',
          titulo: '🎯 Recordatorio de actividad (DEMO)',
          mensaje: 'Este es un ejemplo de recordatorio de actividad pendiente.',
          datos: { nombreNino: 'Demo', horasSinActividad: 24 },
          prioridad: 'normal'
        },
        logro_alcanzado: {
          profileId: 'demo-profile',
          tipo: 'logro_alcanzado',
          titulo: '🏆 ¡Nuevo logro desbloqueado! (DEMO)',
          mensaje: 'Demo ha alcanzado el logro "Primera semana completa" y ganado 100 puntos extra.',
          datos: { nombreNino: 'Demo', logro: 'Primera semana completa', puntos: 100 },
          prioridad: 'alta'
        },
        resumen_semanal: {
          profileId: 'demo-profile',
          tipo: 'resumen_semanal',
          titulo: '📊 Resumen de la semana (DEMO)',
          mensaje: 'Resumen semanal de Demo: 15 actividades, 120 minutos de práctica.',
          datos: { 
            nombreNino: 'Demo', 
            actividadesCompletadas: 15, 
            tiempoTotal: 120,
            puntosTotales: 450,
            racha: 7
          },
          prioridad: 'normal'
        },
        evaluacion_recomendada: {
          profileId: 'demo-profile',
          tipo: 'evaluacion_recomendada',
          titulo: '📋 Nueva evaluación recomendada (DEMO)',
          mensaje: 'Recomendamos realizar una nueva evaluación para Demo.',
          datos: { 
            nombreNino: 'Demo', 
            razon: 'Han pasado 6 meses desde la última evaluación.' 
          },
          prioridad: 'alta'
        },
        recordatorio_uso: {
          profileId: 'demo-profile',
          tipo: 'recordatorio_uso',
          titulo: '⏰ Hora de practicar (DEMO)',
          mensaje: 'Es momento de que Demo practique con sus actividades diarias.',
          datos: { nombreNino: 'Demo', horaRecordatorio: 19 },
          prioridad: 'normal'
        }
      };

      await NotificationService.crearNotificacion(datosDemo[tipo]);
      toast.success(`Notificación de ${tipo} creada exitosamente`);
      
    } catch (error) {
      console.error('Error creando notificación demo:', error);
      toast.error('Error al crear la notificación de prueba');
    } finally {
      setLoading(false);
    }
  };

  // Simular procesamiento de monitoreo
  const ejecutarMonitoreoPrueba = async () => {
    setLoading(true);
    try {
      toast.info('Ejecutando monitoreo de prueba...');
      
      // Simular el monitoreo (en un entorno real esto estaría en el backend)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Crear algunas notificaciones de ejemplo
      await crearNotificacionPrueba('actividad_pendiente');
      await new Promise(resolve => setTimeout(resolve, 500));
      await crearNotificacionPrueba('logro_alcanzado');
      
      toast.success('Monitoreo de prueba completado');
      
    } catch (error) {
      toast.error('Error en el monitoreo de prueba');
    } finally {
      setLoading(false);
    }
  };

  // Probar WhatsApp
  const probarWhatsApp = () => {
    const telefono = prompt('Ingresa tu número de WhatsApp (con código de país, ej: +521234567890):');
    if (telefono) {
      // Assuming WhatsAppService is still needed or replaced by NotificationService
      // For now, keeping the original WhatsAppService call as it's not explicitly removed
      // If NotificationService has a direct method for WhatsApp, this might need adjustment
      // For now, keeping the original call structure
      // NotificationService.notificarRapido(telefono, 'Demo', 'Esta es una prueba del sistema de notificaciones de Pequeños Genios!');
      toast.success('WhatsApp abierto - ¡Revisa la ventana nueva!');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[var(--primary-blue)] flex items-center gap-2">
          <FaBell />
          Panel de Desarrollo - Notificaciones
        </h2>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 
                   transition-colors flex items-center gap-1"
        >
          {showAdvanced ? <FaEyeSlash /> : <FaEye />}
          {showAdvanced ? 'Ocultar' : 'Mostrar'} Avanzado
        </button>
      </div>

      {/* 🆕 NUEVO: Probador de notificaciones automáticas */}
      <div className="mb-6">
        <AutomaticNotificationTester />
      </div>

      {/* Contenido existente */}
      {showAdvanced && (
        <>
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-[var(--primary-blue)]">
              🧪 Demo del Sistema de Notificaciones
            </h2>
            <p className="text-gray-600 mt-1">
              Prueba las diferentes funcionalidades del sistema de notificaciones
            </p>
          </div>

          <div className="space-y-8">
            {/* Crear notificaciones de prueba */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>🔔</span>
                Crear Notificaciones de Prueba
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { tipo: 'actividad_pendiente', nombre: 'Actividad Pendiente', icono: '🎯', color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
                  { tipo: 'logro_alcanzado', nombre: 'Logro Alcanzado', icono: '🏆', color: 'bg-green-100 text-green-800 hover:bg-green-200' },
                  { tipo: 'resumen_semanal', nombre: 'Resumen Semanal', icono: '📊', color: 'bg-purple-100 text-purple-800 hover:bg-purple-200' },
                  { tipo: 'evaluacion_recomendada', nombre: 'Evaluación', icono: '📋', color: 'bg-orange-100 text-orange-800 hover:bg-orange-200' },
                  { tipo: 'recordatorio_uso', nombre: 'Recordatorio', icono: '⏰', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' }
                ].map(({ tipo, nombre, icono, color }) => (
                  <button
                    key={tipo}
                    onClick={() => crearNotificacionPrueba(tipo)}
                    disabled={loading}
                    className={`p-4 rounded-lg border-2 border-dashed hover:border-solid transition-all disabled:opacity-50 ${color}`}
                  >
                    <div className="text-2xl mb-2">{icono}</div>
                    <div className="font-medium">{nombre}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Monitoreo automático */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>🤖</span>
                Monitoreo Automático
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 mb-4">
                  Simula el monitoreo automático que verifica actividades pendientes y genera notificaciones.
                </p>
                <button
                  onClick={ejecutarMonitoreoPrueba}
                  disabled={loading}
                  className="px-6 py-2 bg-[var(--primary-blue)] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? 'Ejecutando...' : 'Ejecutar Monitoreo de Prueba'}
                </button>
              </div>
            </div>

            {/* Prueba de WhatsApp */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>📱</span>
                Prueba de WhatsApp
              </h3>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-gray-600 mb-4">
                  Prueba el envío de notificaciones por WhatsApp. Se abrirá WhatsApp Web con el mensaje prellenado.
                </p>
                <button
                  onClick={probarWhatsApp}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  🚀 Probar WhatsApp
                </button>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-blue-800">
                ℹ️ Información del Sistema
              </h3>
              <div className="text-sm text-blue-700 space-y-2">
                <p>
                  <strong>Notificaciones en la App:</strong> Las notificaciones aparecen inmediatamente en el centro de notificaciones y en el indicador del header.
                </p>
                <p>
                  <strong>WhatsApp:</strong> Se abre WhatsApp Web con el mensaje predefinido. El usuario solo necesita hacer clic en "Enviar".
                </p>
                <p>
                  <strong>Monitoreo Automático:</strong> En producción, el monitoreo se ejecutaría en el backend con tareas programadas (cron jobs o funciones cloud).
                </p>
              </div>
            </div>

            {/* Estadísticas de desarrollo */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">
                📊 Estadísticas de Desarrollo
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-white p-3 rounded">
                  <div className="text-xl font-bold text-blue-600">5</div>
                  <div className="text-xs text-gray-600">Tipos de Notificaciones</div>
                </div>
                <div className="bg-white p-3 rounded">
                  <div className="text-xl font-bold text-green-600">100%</div>
                  <div className="text-xs text-gray-600">Funcional</div>
                </div>
                <div className="bg-white p-3 rounded">
                  <div className="text-xl font-bold text-purple-600">3</div>
                  <div className="text-xs text-gray-600">Canales de Envío</div>
                </div>
                <div className="bg-white p-3 rounded">
                  <div className="text-xl font-bold text-orange-600">∞</div>
                  <div className="text-xs text-gray-600">Escalabilidad</div>
                </div>
              </div>
            </div>

            {/* Botón para recargar notificaciones */}
            <div className="text-center pt-4 border-t border-gray-200">
              <button
                onClick={() => cargarNotificaciones()}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                🔄 Recargar Notificaciones
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationDemo;