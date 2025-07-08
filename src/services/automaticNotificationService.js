// src/services/automaticNotificationService.js
import { auth, db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import EmailService from './emailService';
import { NotificationService } from './notificationService';

class AutomaticNotificationService {
  constructor() {
    this.emailService = EmailService;
  }

  /**
   * Verificar si un niño no ha realizado actividades recientemente
   */
  async verificarActividadPendiente(profileId, horasLimite = 24) {
    try {
      const fechaLimite = new Date();
      fechaLimite.setHours(fechaLimite.getHours() - horasLimite);

      // Buscar la última actividad del niño
      const actividadesRef = collection(db, 'actividades');
      const q = query(
        actividadesRef,
        where('profileId', '==', profileId),
        orderBy('fechaCompletada', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // No hay actividades registradas
        return {
          necesitaNotificacion: true,
          horasSinActividad: horasLimite,
          ultimaActividad: null
        };
      }

      const ultimaActividad = snapshot.docs[0].data();
      const fechaUltimaActividad = ultimaActividad.fechaCompletada.toDate();
      
      if (fechaUltimaActividad < fechaLimite) {
        const horasSinActividad = Math.floor((Date.now() - fechaUltimaActividad.getTime()) / (1000 * 60 * 60));
        
        return {
          necesitaNotificacion: true,
          horasSinActividad,
          ultimaActividad
        };
      }

      return {
        necesitaNotificacion: false,
        horasSinActividad: 0,
        ultimaActividad
      };
    } catch (error) {
      console.error('Error verificando actividad pendiente:', error);
      throw error;
    }
  }

  /**
   * Enviar notificación automática de actividad pendiente
   */
  async enviarNotificacionActividadPendiente(profileId, datosActividad) {
    try {
      // Obtener información del perfil
      const perfilRef = collection(db, 'childProfiles');
      const perfilQuery = query(perfilRef, where('__name__', '==', profileId));
      const perfilSnapshot = await getDocs(perfilQuery);
      
      if (perfilSnapshot.empty) {
        throw new Error('Perfil no encontrado');
      }

      const perfil = perfilSnapshot.docs[0].data();
      const nombreNino = perfil.fullName || 'el niño';
      const nombreTutor = auth.currentUser?.displayName || 'Tutor';

      // Crear notificación en la base de datos
      const notificationData = {
        tutorId: auth.currentUser.uid,
        profileId,
        tipo: 'actividad_pendiente',
        titulo: `🎯 ${nombreNino} - Recordatorio de actividad`,
        mensaje: `Notamos que ${nombreNino} no ha realizado actividades en las últimas ${datosActividad.horasSinActividad} horas. ¡Es hora de continuar con el aprendizaje!`,
        datos: {
          nombreNino,
          nombreTutor,
          horasSinActividad: datosActividad.horasSinActividad,
          ultimaActividad: datosActividad.ultimaActividad,
          urlPlataforma: window.location.origin
        },
        prioridad: 'normal',
        leida: false,
        fechaCreacion: new Date()
      };

      const notificationId = await NotificationService.crearNotificacion(notificationData);

      // Enviar email automático
      const emailData = {
        nombreNino,
        nombreTutor,
        horasSinActividad: datosActividad.horasSinActividad,
        urlPlataforma: window.location.origin
      };

      await this.emailService.enviarNotificacionAutomatica('actividad_pendiente', emailData);

      console.log('✅ Notificación automática enviada:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error enviando notificación automática:', error);
      throw error;
    }
  }

  /**
   * Verificar y enviar notificaciones automáticas para todos los perfiles
   */
  async verificarYEnviarNotificacionesAutomaticas() {
    try {
      if (!auth.currentUser) {
        throw new Error('Usuario no autenticado');
      }

      // Obtener todos los perfiles del tutor
      const perfilesRef = collection(db, 'childProfiles');
      const perfilesQuery = query(perfilesRef, where('tutorId', '==', auth.currentUser.uid));
      const perfilesSnapshot = await getDocs(perfilesQuery);

      const resultados = [];

      for (const doc of perfilesSnapshot.docs) {
        const perfil = doc.data();
        
        try {
          // Verificar actividad pendiente
          const actividadPendiente = await this.verificarActividadPendiente(doc.id);
          
          if (actividadPendiente.necesitaNotificacion) {
            // Verificar si ya se envió una notificación reciente (últimas 6 horas)
            const notificacionReciente = await this.verificarNotificacionReciente(doc.id, 'actividad_pendiente', 6);
            
            if (!notificacionReciente) {
              const notificationId = await this.enviarNotificacionActividadPendiente(doc.id, actividadPendiente);
              resultados.push({
                perfilId: doc.id,
                nombreNino: perfil.fullName,
                notificationId,
                tipo: 'actividad_pendiente',
                enviado: true
              });
            } else {
              resultados.push({
                perfilId: doc.id,
                nombreNino: perfil.fullName,
                tipo: 'actividad_pendiente',
                enviado: false,
                razon: 'Notificación reciente ya enviada'
              });
            }
          }
        } catch (error) {
          console.error(`Error procesando perfil ${doc.id}:`, error);
          resultados.push({
            perfilId: doc.id,
            nombreNino: perfil.fullName,
            enviado: false,
            error: error.message
          });
        }
      }

      return resultados;
    } catch (error) {
      console.error('Error verificando notificaciones automáticas:', error);
      throw error;
    }
  }

  /**
   * Verificar si ya se envió una notificación reciente del mismo tipo
   */
  async verificarNotificacionReciente(profileId, tipo, horasLimite = 6) {
    try {
      const fechaLimite = new Date();
      fechaLimite.setHours(fechaLimite.getHours() - horasLimite);

      const notificacionesRef = collection(db, 'notifications');
      const q = query(
        notificacionesRef,
        where('profileId', '==', profileId),
        where('tipo', '==', tipo),
        where('fechaCreacion', '>=', fechaLimite),
        orderBy('fechaCreacion', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error verificando notificación reciente:', error);
      return false;
    }
  }

  /**
   * Enviar notificación de logro alcanzado
   */
  async enviarNotificacionLogro(profileId, logro, puntos, descripcion) {
    try {
      // Obtener información del perfil
      const perfilRef = collection(db, 'childProfiles');
      const perfilQuery = query(perfilRef, where('__name__', '==', profileId));
      const perfilSnapshot = await getDocs(perfilQuery);
      
      if (perfilSnapshot.empty) {
        throw new Error('Perfil no encontrado');
      }

      const perfil = perfilSnapshot.docs[0].data();
      const nombreNino = perfil.fullName || 'el niño';
      const nombreTutor = auth.currentUser?.displayName || 'Tutor';

      // Crear notificación en la base de datos
      const notificationData = {
        tutorId: auth.currentUser.uid,
        profileId,
        tipo: 'logro_alcanzado',
        titulo: `🏆 ${nombreNino} - ¡Nuevo Logro Desbloqueado!`,
        mensaje: `¡Felicitaciones! ${nombreNino} ha alcanzado el logro "${logro}" y ha ganado ${puntos} puntos.`,
        datos: {
          nombreNino,
          nombreTutor,
          logro,
          puntos,
          descripcion,
          urlPlataforma: window.location.origin
        },
        prioridad: 'normal',
        leida: false,
        fechaCreacion: new Date()
      };

      const notificationId = await NotificationService.crearNotificacion(notificationData);

      // Enviar email automático
      const emailData = {
        nombreNino,
        nombreTutor,
        logro,
        puntos,
        descripcion,
        urlPlataforma: window.location.origin
      };

      await this.emailService.enviarNotificacionAutomatica('logro_alcanzado', emailData);

      console.log('✅ Notificación de logro enviada:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error enviando notificación de logro:', error);
      throw error;
    }
  }

  /**
   * Enviar resumen semanal automático
   */
  async enviarResumenSemanal(profileId, estadisticas) {
    try {
      // Obtener información del perfil
      const perfilRef = collection(db, 'childProfiles');
      const perfilQuery = query(perfilRef, where('__name__', '==', profileId));
      const perfilSnapshot = await getDocs(perfilQuery);
      
      if (perfilSnapshot.empty) {
        throw new Error('Perfil no encontrado');
      }

      const perfil = perfilSnapshot.docs[0].data();
      const nombreNino = perfil.fullName || 'el niño';
      const nombreTutor = auth.currentUser?.displayName || 'Tutor';

      // Crear notificación en la base de datos
      const notificationData = {
        tutorId: auth.currentUser.uid,
        profileId,
        tipo: 'resumen_semanal',
        titulo: `📊 ${nombreNino} - Resumen Semanal`,
        mensaje: `Aquí tienes el resumen semanal del progreso de ${nombreNino}. ¡Sigue así!`,
        datos: {
          nombreNino,
          nombreTutor,
          ...estadisticas,
          urlPlataforma: window.location.origin
        },
        prioridad: 'baja',
        leida: false,
        fechaCreacion: new Date()
      };

      const notificationId = await NotificationService.crearNotificacion(notificationData);

      // Enviar email automático
      const emailData = {
        nombreNino,
        nombreTutor,
        ...estadisticas,
        urlPlataforma: window.location.origin
      };

      await this.emailService.enviarNotificacionAutomatica('resumen_semanal', emailData);

      console.log('✅ Resumen semanal enviado:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error enviando resumen semanal:', error);
      throw error;
    }
  }
}

export default new AutomaticNotificationService(); 