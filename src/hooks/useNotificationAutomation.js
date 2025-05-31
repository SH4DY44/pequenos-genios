// src/hooks/useNotificationAutomation.js
import { useEffect, useCallback, useState, useRef } from 'react';
import { auth } from '../config/firebase';
import { NotificationScheduler } from '../services/notificationScheduler';

export function useNotificationAutomation() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);
  const intervalosRef = useRef({});
  const userRef = useRef(null);

  // ✅ CORREGIDO: Solo monitoreo ligero apropiado para frontend
  const iniciarMonitoreoLigero = useCallback(() => {
    // ✅ VALIDACIÓN: Solo si hay usuario autenticado
    if (!auth.currentUser) {
      console.log('⚠️ No hay usuario autenticado, saltando monitoreo');
      return null;
    }

    // ✅ MODO DESARROLLO: Comportamiento diferente
    if (process.env.NODE_ENV === 'development') {
      console.log('🧪 Monitoreo en modo desarrollo - intervalos reducidos');
    }

    console.log('🤖 Iniciando monitoreo ligero para usuario:', auth.currentUser.uid);
    setIsMonitoring(true);
    setLastCheck(new Date());

    // ✅ OPTIMIZADO: Intervalos más conservadores y apropiados para frontend
    const intervalos = {
      // ✅ CORREGIDO: Solo verificar logros cuando el usuario está activo (cada 5 minutos)
      logrosEnTiempoReal: setInterval(() => {
        if (auth.currentUser && document.visibilityState === 'visible') {
          console.log('🏆 Verificando logros en tiempo real...');
          // Solo verificar logros para perfiles activos del usuario actual
          verificarLogrosUsuarioActual();
        }
      }, process.env.NODE_ENV === 'development' ? 30000 : 300000), // 30s dev, 5min prod

      // ✅ AGREGADO: Verificación periódica de actividad del usuario (cada 30 minutos)
      actividadUsuario: setInterval(() => {
        if (auth.currentUser && document.visibilityState === 'visible') {
          console.log('👤 Verificando actividad del usuario actual...');
          verificarActividadUsuarioActual();
        }
      }, process.env.NODE_ENV === 'development' ? 60000 : 1800000), // 1min dev, 30min prod

      // ✅ AGREGADO: Limpieza periódica de recursos (cada hora)
      limpieza: setInterval(() => {
        console.log('🧹 Ejecutando limpieza de recursos...');
        limpiarRecursosLocales();
      }, 3600000) // 1 hora
    };

    intervalosRef.current = intervalos;
    console.log('✅ Monitoreo ligero iniciado');
    return intervalos;
  }, []);

  // ✅ AGREGADO: Verificar logros solo para el usuario actual
  const verificarLogrosUsuarioActual = useCallback(async () => {
    try {
      if (!auth.currentUser) return;

      // Obtener perfiles del usuario actual desde localStorage o context
      const perfilesActivos = await obtenerPerfilesActivos();
      
      for (const perfil of perfilesActivos) {
        await NotificationScheduler.monitorearLogrosEnTiempoReal(perfil.id);
      }
      
      setLastCheck(new Date());
    } catch (error) {
      console.error('Error verificando logros en tiempo real:', error);
    }
  }, []);

  // ✅ AGREGADO: Verificar actividad del usuario actual
  const verificarActividadUsuarioActual = useCallback(async () => {
    try {
      if (!auth.currentUser) return;

      // Solo enviar recordatorios si el usuario ha estado inactivo
      const tiempoInactivo = calcularTiempoInactividad();
      
      if (tiempoInactivo > 24) { // 24 horas sin actividad
        console.log(`⏰ Usuario inactivo por ${tiempoInactivo} horas`);
        // Aquí podrías triggear una notificación local o in-app
        mostrarRecordatorioLocal();
      }
    } catch (error) {
      console.error('Error verificando actividad del usuario:', error);
    }
  }, []);

  // ✅ AGREGADO: Obtener perfiles activos (desde context o localStorage)
  const obtenerPerfilesActivos = useCallback(async () => {
    // Esta función debería obtener los perfiles del usuario actual
    // desde el context de la aplicación o localStorage para evitar queries innecesarias
    try {
      // Implementación simplificada - en producción usar context o state management
      const perfilesGuardados = localStorage.getItem(`perfiles_${auth.currentUser?.uid}`);
      return perfilesGuardados ? JSON.parse(perfilesGuardados) : [];
    } catch (error) {
      console.error('Error obteniendo perfiles activos:', error);
      return [];
    }
  }, []);

  // ✅ AGREGADO: Calcular tiempo de inactividad
  const calcularTiempoInactividad = useCallback(() => {
    const ultimaActividad = localStorage.getItem(`ultima_actividad_${auth.currentUser?.uid}`);
    if (!ultimaActividad) return 0;
    
    const ahora = new Date();
    const ultima = new Date(ultimaActividad);
    return Math.floor((ahora - ultima) / (1000 * 60 * 60)); // Horas
  }, []);

  // ✅ AGREGADO: Mostrar recordatorio local (in-app)
  const mostrarRecordatorioLocal = useCallback(() => {
    // Mostrar notificación in-app en lugar de crear notificación en DB
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pequeños Genios', {
        body: '¡Es hora de que tus pequeños practiquen!',
        icon: '/banner.ico'
      });
    }
  }, []);

  // ✅ AGREGADO: Limpiar recursos locales
  const limpiarRecursosLocales = useCallback(() => {
    try {
      // Limpiar datos temporales del localStorage
      const keys = Object.keys(localStorage);
      const ahora = new Date();
      
      keys.forEach(key => {
        if (key.startsWith('temp_') || key.startsWith('cache_')) {
          const data = localStorage.getItem(key);
          try {
            const parsed = JSON.parse(data);
            if (parsed.timestamp && (ahora - new Date(parsed.timestamp)) > 86400000) {
              localStorage.removeItem(key); // Remover si tiene más de 24 horas
            }
          } catch (e) {
            // Si no se puede parsear, remover
            localStorage.removeItem(key);
          }
        }
      });
      
      console.log('🧹 Limpieza de recursos completada');
    } catch (error) {
      console.error('Error en limpieza de recursos:', error);
    }
  }, []);

  // ✅ MEJORADO: Limpiar intervalos con mejor manejo
  const detenerMonitoreo = useCallback(() => {
    if (intervalosRef.current && Object.keys(intervalosRef.current).length > 0) {
      Object.entries(intervalosRef.current).forEach(([nombre, interval]) => {
        if (interval) {
          clearInterval(interval);
          console.log(`🛑 Intervalo ${nombre} detenido`);
        }
      });
      intervalosRef.current = {};
      setIsMonitoring(false);
      console.log('🛑 Sistema de monitoreo detenido completamente');
    }
  }, []);

  // ✅ AGREGADO: Función para monitoreo manual
  const ejecutarVerificacionManual = useCallback(async () => {
    if (!auth.currentUser) {
      console.warn('No hay usuario autenticado para verificación manual');
      return;
    }

    try {
      console.log('🔄 Ejecutando verificación manual...');
      await verificarLogrosUsuarioActual();
      await verificarActividadUsuarioActual();
      console.log('✅ Verificación manual completada');
    } catch (error) {
      console.error('Error en verificación manual:', error);
    }
  }, [verificarLogrosUsuarioActual, verificarActividadUsuarioActual]);

  // ✅ AGREGADO: Registrar actividad del usuario
  const registrarActividad = useCallback(() => {
    if (auth.currentUser) {
      localStorage.setItem(`ultima_actividad_${auth.currentUser.uid}`, new Date().toISOString());
    }
  }, []);

  // ✅ CORREGIDO: useEffect principal con mejor lógica
  useEffect(() => {
    let intervalos = null;

    // ✅ OPTIMIZACIÓN: Solo iniciar si el usuario está autenticado
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        userRef.current = user;
        // Pequeña pausa para asegurar que la UI está lista
        setTimeout(() => {
          intervalos = iniciarMonitoreoLigero();
        }, 2000);
      } else {
        userRef.current = null;
        detenerMonitoreo();
      }
    });

    // ✅ AGREGADO: Listener para detectar actividad del usuario
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => registrarActividad();
    
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // ✅ AGREGADO: Listener para visibilidad de la página
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && auth.currentUser) {
        registrarActividad();
        // Verificar si necesitamos reanudar el monitoreo
        if (!isMonitoring) {
          intervalos = iniciarMonitoreoLigero();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // ✅ MEJORADO: Cleanup completo
    return () => {
      unsubscribe();
      detenerMonitoreo();
      
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [iniciarMonitoreoLigero, detenerMonitoreo, registrarActividad, isMonitoring]);

  // ✅ AGREGADO: Solicitar permisos de notificación
  const solicitarPermisosNotificacion = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        console.log('📱 Permisos de notificación:', permission);
        return permission === 'granted';
      } catch (error) {
        console.error('Error solicitando permisos de notificación:', error);
        return false;
      }
    }
    return Notification.permission === 'granted';
  }, []);

  // ✅ AGREGADO: Hook de inicialización
  useEffect(() => {
    // Solicitar permisos al montar el componente
    solicitarPermisosNotificacion();
  }, [solicitarPermisosNotificacion]);

  return {
    // Estados
    isMonitoring,
    lastCheck,
    userActive: !!userRef.current,
    
    // Funciones de control
    iniciarMonitoreoLigero,
    detenerMonitoreo,
    ejecutarVerificacionManual,
    registrarActividad,
    
    // Utilidades
    solicitarPermisosNotificacion,
    calcularTiempoInactividad,
    
    // Estados computados
    tiempoInactividad: calcularTiempoInactividad(),
    permisoNotificaciones: typeof window !== 'undefined' ? Notification?.permission : 'denied'
  };
}