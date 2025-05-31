// src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react';
import { auth } from '../config/firebase';
import { NotificationService } from '../services/notificationService';
import { toast } from 'react-toastify';

export function useNotifications() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState(null);

  // Cargar notificaciones con opciones
  const cargarNotificaciones = useCallback(async (options = {}) => {
    if (!auth.currentUser) {
      setNotificaciones([]);
      setEstadisticas(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // ✅ CORREGIDO: Pasar options como objeto
      const notifs = await NotificationService.obtenerNotificaciones(
        auth.currentUser.uid, 
        options
      );
      setNotificaciones(notifs);
      
      // Cargar estadísticas también
      const stats = await NotificationService.obtenerEstadisticas(auth.currentUser.uid);
      setEstadisticas(stats);
      
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
      toast.error('Error al cargar las notificaciones');
      setNotificaciones([]);
      setEstadisticas(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ OPTIMIZADO: Actualizar estado local en lugar de recargar todo
  const marcarComoLeida = useCallback(async (notificacionId) => {
    if (!auth.currentUser || !notificacionId) return;
    
    try {
      await NotificationService.marcarComoLeida(notificacionId);
      
      // ✅ OPTIMIZADO: Actualizar estado local
      setNotificaciones(prev => 
        prev.map(notif => 
          notif.id === notificacionId 
            ? { ...notif, leida: true, fechaLectura: new Date() }
            : notif
        )
      );
      
      // ✅ OPTIMIZADO: Actualizar estadísticas localmente
      setEstadisticas(prev => prev ? {
        ...prev,
        noLeidas: Math.max(0, prev.noLeidas - 1)
      } : null);
      
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
      toast.error('Error al marcar la notificación');
      // En caso de error, recargar para sincronizar
      await cargarNotificaciones();
    }
  }, [cargarNotificaciones]);

  // ✅ OPTIMIZADO: Marcar todas como leídas
  const marcarTodasComoLeidas = useCallback(async () => {
    if (!auth.currentUser) return;
    
    try {
      await NotificationService.marcarTodasComoLeidas(auth.currentUser.uid);
      
      // ✅ OPTIMIZADO: Actualizar estado local
      setNotificaciones(prev => 
        prev.map(notif => ({
          ...notif,
          leida: true,
          fechaLectura: notif.leida ? notif.fechaLectura : new Date()
        }))
      );
      
      // ✅ OPTIMIZADO: Actualizar estadísticas
      setEstadisticas(prev => prev ? {
        ...prev,
        noLeidas: 0
      } : null);
      
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
      toast.error('Error al marcar las notificaciones');
      // En caso de error, recargar
      await cargarNotificaciones();
    }
  }, [cargarNotificaciones]);

  // ✅ MEJORADO: Crear notificación y actualizar estado
  const crearNotificacion = useCallback(async (datosNotificacion) => {
    if (!auth.currentUser) return null;
    
    try {
      const id = await NotificationService.crearNotificacion({
        tutorId: auth.currentUser.uid,
        ...datosNotificacion
      });
      
      // ✅ OPTIMIZADO: Solo recargar si la creación fue exitosa
      if (id) {
        await cargarNotificaciones();
        toast.success('Notificación creada exitosamente');
      }
      
      return id;
    } catch (error) {
      console.error('Error creando notificación:', error);
      toast.error('Error al crear la notificación');
      return null;
    }
  }, [cargarNotificaciones]);

  // ✅ AGREGADO: Filtrar notificaciones por perfil
  const filtrarPorPerfil = useCallback((profileId) => {
    if (!profileId) return notificaciones;
    return notificaciones.filter(notif => notif.profileId === profileId);
  }, [notificaciones]);

  // ✅ MEJORADO: Obtener notificaciones por tipo
  const obtenerPorTipo = useCallback((tipo) => {
    if (!tipo) return notificaciones;
    return notificaciones.filter(notif => notif.tipo === tipo);
  }, [notificaciones]);

  // ✅ OPTIMIZADO: Obtener notificaciones no leídas
  const obtenerNoLeidas = useCallback(() => {
    return notificaciones.filter(notif => !notif.leida);
  }, [notificaciones]);

  // ✅ AGREGADO: Obtener notificaciones por prioridad
  const obtenerPorPrioridad = useCallback((prioridad) => {
    return notificaciones.filter(notif => notif.prioridad === prioridad);
  }, [notificaciones]);

  // ✅ AGREGADO: Obtener notificaciones recientes (últimos 7 días)
  const obtenerRecientes = useCallback(() => {
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);
    return notificaciones.filter(notif => notif.fechaCreacion >= hace7Dias);
  }, [notificaciones]);

  // ✅ CORREGIDO: Auth state listener mejorado
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        cargarNotificaciones();
      } else {
        setNotificaciones([]);
        setEstadisticas(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [cargarNotificaciones]);

  // ✅ MEJORADO: Auto-refresh con verificación de usuario
  useEffect(() => {
    if (!auth.currentUser) return;

    const interval = setInterval(() => {
      // Solo auto-refresh si hay usuario autenticado
      if (auth.currentUser) {
        cargarNotificaciones();
      }
    }, 60000); // Recargar cada minuto

    return () => clearInterval(interval);
  }, [cargarNotificaciones]);

  // ✅ AGREGADO: Cleanup al desmontar
  useEffect(() => {
    return () => {
      setNotificaciones([]);
      setEstadisticas(null);
    };
  }, []);

  return {
    // Estado
    notificaciones,
    loading,
    estadisticas,
    
    // Funciones principales
    cargarNotificaciones,
    marcarComoLeida,
    marcarTodasComoLeidas,
    crearNotificacion,
    
    // Funciones de filtrado
    obtenerPorTipo,
    obtenerNoLeidas,
    obtenerPorPrioridad,
    obtenerRecientes,
    filtrarPorPerfil,
    
    // Computed values
    tieneNoLeidas: (estadisticas?.noLeidas || 0) > 0,
    totalNoLeidas: estadisticas?.noLeidas || 0,
    totalNotificaciones: notificaciones.length,
    
    // ✅ AGREGADO: Estados útiles
    hayNotificaciones: notificaciones.length > 0,
    notificacionesAlta: obtenerPorPrioridad('alta'),
    notificacionesRecientes: obtenerRecientes()
  };
}