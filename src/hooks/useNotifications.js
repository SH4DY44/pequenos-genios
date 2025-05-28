// src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react';
import { auth } from '../config/firebase';
import { NotificationService } from '../services/notificationService';
import { toast } from 'react-toastify';

export function useNotifications() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState(null);

  // Cargar notificaciones
  const cargarNotificaciones = useCallback(async (soloNoLeidas = false) => {
    if (!auth.currentUser) return;
    
    try {
      setLoading(true);
      const notifs = await NotificationService.obtenerNotificaciones(
        auth.currentUser.uid, 
        soloNoLeidas
      );
      setNotificaciones(notifs);
      
      // Cargar estadísticas también
      const stats = await NotificationService.obtenerEstadisticas(auth.currentUser.uid);
      setEstadisticas(stats);
      
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
      toast.error('Error al cargar las notificaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  // Marcar como leída
  const marcarComoLeida = useCallback(async (notificacionId) => {
    try {
      await NotificationService.marcarComoLeida(notificacionId);
      // Recargar notificaciones desde Firestore para asegurar sincronización
      await cargarNotificaciones();
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
      toast.error('Error al marcar la notificación');
    }
  }, [cargarNotificaciones]);

  // Marcar todas como leídas
  const marcarTodasComoLeidas = useCallback(async () => {
    if (!auth.currentUser) return;
    try {
      await NotificationService.marcarTodasComoLeidas(auth.currentUser.uid);
      // Recargar notificaciones desde Firestore para asegurar sincronización
      await cargarNotificaciones();
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
      toast.error('Error al marcar las notificaciones');
    }
  }, [cargarNotificaciones]);

  // Crear notificación personalizada
  const crearNotificacion = useCallback(async (datosNotificacion) => {
    if (!auth.currentUser) return;
    
    try {
      const id = await NotificationService.crearNotificacion({
        tutorId: auth.currentUser.uid,
        ...datosNotificacion
      });
      
      // Recargar notificaciones
      await cargarNotificaciones();
      
      return id;
    } catch (error) {
      console.error('Error creando notificación:', error);
      toast.error('Error al crear la notificación');
      return null;
    }
  }, [cargarNotificaciones]);

  // Obtener notificaciones por tipo
  const obtenerPorTipo = useCallback((tipo) => {
    return notificaciones.filter(notif => notif.tipo === tipo);
  }, [notificaciones]);

  // Obtener notificaciones no leídas
  const obtenerNoLeidas = useCallback(() => {
    return notificaciones.filter(notif => !notif.leida);
  }, [notificaciones]);

  // Cargar notificaciones al montar el componente
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

  // Configurar intervalo para recargar notificaciones
  useEffect(() => {
    if (!auth.currentUser) return;

    const interval = setInterval(() => {
      cargarNotificaciones();
    }, 60000); // Recargar cada minuto

    return () => clearInterval(interval);
  }, [cargarNotificaciones]);

  return {
    // Estado
    notificaciones,
    loading,
    estadisticas,
    
    // Funciones
    cargarNotificaciones,
    marcarComoLeida,
    marcarTodasComoLeidas,
    crearNotificacion,
    
    // Utilidades
    obtenerPorTipo,
    obtenerNoLeidas,
    
    // Computed values
    tieneNoLeidas: estadisticas?.noLeidas > 0,
    totalNoLeidas: estadisticas?.noLeidas || 0
  };
}