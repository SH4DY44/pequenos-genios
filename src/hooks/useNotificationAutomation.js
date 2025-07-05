// src/hooks/useNotificationAutomation.js
import { useEffect, useCallback, useState, useRef } from 'react';
import { auth, db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { NotificationScheduler } from '../services/notificationScheduler';

export function useNotificationAutomation() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);
  const intervalosRef = useRef({});
  const userRef = useRef(null);

  // ✅ CORREGIDO: Obtener perfiles del usuario actual usando Firebase
  const obtenerPerfilesUsuario = useCallback(async (userId) => {
    try {
      const q = query(
        collection(db, 'childProfiles'),
        where('tutorId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        nombre: doc.data().fullName // Normalizar el nombre
      }));
    } catch (error) {
      console.error('Error obteniendo perfiles:', error);
      return [];
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

  // ✅ CORREGIDO: Función para verificar logros usando el NotificationScheduler existente
  const verificarLogrosUsuarioActual = useCallback(async () => {
    try {
      if (!auth.currentUser) return;

      // Obtener perfiles del usuario actual
      const perfiles = await obtenerPerfilesUsuario(auth.currentUser.uid);
      
      for (const perfil of perfiles) {
        // Usar el NotificationScheduler existente para verificar logros
        await NotificationScheduler.verificarLogros(perfil.id, perfil);
      }
    } catch (error) {
      console.error('Error verificando logros:', error);
    }
  }, [obtenerPerfilesUsuario]);

  // ✅ CORREGIDO: Función para verificar actividad usando el NotificationScheduler existente
  const verificarActividadUsuarioActual = useCallback(async () => {
    try {
      if (!auth.currentUser) return;

      // Obtener perfiles del usuario actual
      const perfiles = await obtenerPerfilesUsuario(auth.currentUser.uid);
      
      for (const perfil of perfiles) {
        // Usar el NotificationScheduler existente para verificar actividad
        await NotificationScheduler.verificarActividadPerfil(perfil.id, perfil);
      }
    } catch (error) {
      console.error('Error verificando actividad:', error);
    }
  }, [obtenerPerfilesUsuario]);

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
  }, [verificarLogrosUsuarioActual, verificarActividadUsuarioActual, limpiarRecursosLocales]);

  // ✅ AGREGADO: Calcular tiempo de inactividad
  const calcularTiempoInactividad = useCallback(() => {
    const ultimaActividad = localStorage.getItem(`ultima_actividad_${auth.currentUser?.uid}`);
    if (!ultimaActividad) return 0;
    
    const ahora = new Date();
    const ultima = new Date(ultimaActividad);
    return Math.floor((ahora - ultima) / (1000 * 60 * 60)); // Horas
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
    // ✅ OPTIMIZACIÓN: Solo iniciar si el usuario está autenticado
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        userRef.current = user;
        // Pequeña pausa para asegurar que la UI está lista
        setTimeout(() => {
          iniciarMonitoreoLigero();
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
          iniciarMonitoreoLigero();
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