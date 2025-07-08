// src/components/notifications/AutomaticNotificationTester.js
import React, { useState } from 'react';
import { FaPlay, FaStop, FaSync, FaEnvelope, FaBell, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { auth, db } from '../../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import AutomaticNotificationService from '../../services/automaticNotificationService';
import EmailService from '../../services/emailService';
import { toast } from 'react-toastify';

function AutomaticNotificationTester() {
  const [loading, setLoading] = useState(false);
  const [emailServiceStatus, setEmailServiceStatus] = useState(null);
  const [lastTestResults, setLastTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  // Verificar estado del servicio de email
  const verificarEmailService = async () => {
    try {
      setLoading(true);
      const status = await EmailService.verificarEstado();
      setEmailServiceStatus(status.data);
      toast.success('✅ Estado del servicio de email verificado');
    } catch (error) {
      console.error('Error verificando email service:', error);
      setEmailServiceStatus({ estado: 'ERROR', error: error.message });
      toast.error('❌ Error verificando servicio de email');
    } finally {
      setLoading(false);
    }
  };

  // Probar notificaciones automáticas
  const probarNotificacionesAutomaticas = async () => {
    try {
      setLoading(true);
      setIsRunning(true);
      
      const resultados = await AutomaticNotificationService.verificarYEnviarNotificacionesAutomaticas();
      setLastTestResults(resultados);
      
      const enviados = resultados.filter(r => r.enviado).length;
      const fallidos = resultados.filter(r => !r.enviado).length;
      
      if (enviados > 0) {
        toast.success(`✅ ${enviados} notificaciones automáticas enviadas`);
      }
      
      if (fallidos > 0) {
        toast.warning(`⚠️ ${fallidos} notificaciones no enviadas (ver detalles)`);
      }
      
      if (enviados === 0 && fallidos === 0) {
        toast.info('ℹ️ No se necesitaron notificaciones automáticas');
      }
      
    } catch (error) {
      console.error('Error probando notificaciones automáticas:', error);
      toast.error('❌ Error probando notificaciones automáticas');
    } finally {
      setLoading(false);
      setIsRunning(false);
    }
  };

  // Enviar correo de prueba
  const enviarCorreoPrueba = async () => {
    try {
      setLoading(true);
      
      const emailTutor = auth.currentUser?.email;
      if (!emailTutor) {
        toast.error('❌ No se pudo obtener el email del tutor');
        return;
      }
      
      await EmailService.enviarPrueba(emailTutor);
      toast.success('✅ Correo de prueba enviado correctamente');
      
    } catch (error) {
      console.error('Error enviando correo de prueba:', error);
      toast.error('❌ Error enviando correo de prueba');
    } finally {
      setLoading(false);
    }
  };

  // Probar notificación de logro
  const probarNotificacionLogro = async () => {
    try {
      setLoading(true);
      
      // Obtener el primer perfil disponible
      const perfilesRef = collection(db, 'childProfiles');
      const perfilesQuery = query(perfilesRef, where('tutorId', '==', auth.currentUser.uid));
      const perfilesSnapshot = await getDocs(perfilesQuery);
      
      if (perfilesSnapshot.empty) {
        toast.error('❌ No hay perfiles de niños disponibles');
        return;
      }
      
      const primerPerfil = perfilesSnapshot.docs[0];
      
      await AutomaticNotificationService.enviarNotificacionLogro(
        primerPerfil.id,
        'Primer Logro de Prueba',
        50,
        'Este es un logro de prueba para verificar el sistema de notificaciones automáticas'
      );
      
      toast.success('✅ Notificación de logro enviada correctamente');
      
    } catch (error) {
      console.error('Error probando notificación de logro:', error);
      toast.error('❌ Error enviando notificación de logro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <FaBell className="text-2xl text-[var(--primary-blue)]" />
        <h2 className="text-xl font-bold text-[var(--primary-blue)]">
          🧪 Probador de Notificaciones Automáticas
        </h2>
      </div>

      {/* Estado del servicio de email */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-800">📧 Estado del Servicio de Email</h3>
          <button
            onClick={verificarEmailService}
            disabled={loading}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 
                     transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            <FaSync className={loading ? 'animate-spin' : ''} />
            Verificar
          </button>
        </div>
        
        {emailServiceStatus ? (
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              emailServiceStatus.estado === 'ACTIVO' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className={`text-sm ${
              emailServiceStatus.estado === 'ACTIVO' ? 'text-green-700' : 'text-red-700'
            }`}>
              {emailServiceStatus.estado}
              {emailServiceStatus.error && ` - ${emailServiceStatus.error}`}
            </span>
          </div>
        ) : (
          <p className="text-sm text-gray-600">Haz clic en "Verificar" para comprobar el estado</p>
        )}
      </div>

      {/* Botones de prueba */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={probarNotificacionesAutomaticas}
          disabled={loading || isRunning}
          className="p-4 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 
                   transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <FaPlay />
          Probar Notificaciones Automáticas
        </button>

        <button
          onClick={enviarCorreoPrueba}
          disabled={loading}
          className="p-4 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 
                   transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <FaEnvelope />
          Enviar Correo de Prueba
        </button>

        <button
          onClick={probarNotificacionLogro}
          disabled={loading}
          className="p-4 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 
                   transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <FaCheck />
          Probar Notificación de Logro
        </button>

        <button
          onClick={() => setIsRunning(false)}
          disabled={!isRunning}
          className="p-4 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 
                   transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <FaStop />
          Detener Proceso
        </button>
      </div>

      {/* Resultados de la última prueba */}
      {lastTestResults && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-medium text-gray-800 mb-3">📊 Resultados de la Última Prueba</h3>
          
          <div className="space-y-3">
            {lastTestResults.map((resultado, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  resultado.enviado 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {resultado.enviado ? (
                    <FaCheck className="text-green-600" />
                  ) : (
                    <FaExclamationTriangle className="text-yellow-600" />
                  )}
                  <span className="font-medium text-sm">
                    {resultado.nombreNino || `Perfil ${resultado.perfilId}`}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600">
                  {resultado.enviado ? (
                    <>
                      <span className="text-green-700">✅ Notificación enviada</span>
                      {resultado.notificationId && (
                        <span className="block text-xs text-gray-500">
                          ID: {resultado.notificationId}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="text-yellow-700">⚠️ No enviado</span>
                      {resultado.razon && (
                        <span className="block text-xs text-gray-500">
                          Razón: {resultado.razon}
                        </span>
                      )}
                      {resultado.error && (
                        <span className="block text-xs text-red-500">
                          Error: {resultado.error}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">ℹ️ Información</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Las notificaciones automáticas se envían cuando un niño no ha realizado actividades en 24+ horas</li>
          <li>• Se evita enviar notificaciones duplicadas en un período de 6 horas</li>
          <li>• Los correos se envían al email del tutor autenticado</li>
          <li>• Todas las notificaciones se guardan en la base de datos</li>
        </ul>
      </div>
    </div>
  );
}

export default AutomaticNotificationTester; 