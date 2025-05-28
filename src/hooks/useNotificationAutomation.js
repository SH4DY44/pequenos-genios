// src/hooks/useNotificationAutomation.js
import { useEffect, useCallback } from 'react';
import { NotificationScheduler } from '../services/notificationScheduler';

export function useNotificationAutomation() {
  
  // Ejecutar monitoreo automático
  const iniciarMonitoreoAutomatico = useCallback(() => {
    console.log('🤖 Iniciando sistema de monitoreo automático...');
    
    // Ejecutar inmediatamente al cargar
    NotificationScheduler.ejecutarMonitoreo();
    
    // Configurar intervalos (solo en producción o cuando hay usuarios)
    const intervalos = {
      // Verificar actividades pendientes cada 4 horas
      actividades: setInterval(() => {
        console.log('🔍 Verificando actividades pendientes...');
        NotificationScheduler.verificarActividadesPendientes();
      }, 4 * 60 * 60 * 1000),
      
      // Procesar notificaciones programadas cada hora  
      programadas: setInterval(() => {
        console.log('⏰ Procesando notificaciones programadas...');
        NotificationScheduler.procesarNotificacionesProgramadas();
      }, 60 * 60 * 1000),
      
      // Verificar evaluaciones recomendadas una vez al día
      evaluaciones: setInterval(() => {
        console.log('📋 Verificando evaluaciones recomendadas...');
        NotificationScheduler.verificarEvaluacionesRecomendadas();
      }, 24 * 60 * 60 * 1000)
    };
    
    console.log('✅ Sistema de monitoreo iniciado');
    return intervalos;
  }, []);

  // Limpiar intervalos
  const detenerMonitoreo = useCallback((intervalos) => {
    if (intervalos) {
      Object.values(intervalos).forEach(interval => {
        if (interval) clearInterval(interval);
      });
      console.log('🛑 Sistema de monitoreo detenido');
    }
  }, []);

  // Hook principal
  useEffect(() => {
    const intervalos = iniciarMonitoreoAutomatico();
    
    // Cleanup al desmontar
    return () => detenerMonitoreo(intervalos);
  }, [iniciarMonitoreoAutomatico, detenerMonitoreo]);

  return {
    iniciarMonitoreoAutomatico,
    detenerMonitoreo
  };
}