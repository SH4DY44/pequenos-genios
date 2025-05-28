import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    updateDoc, 
    doc,
    serverTimestamp,
    limit
  } from 'firebase/firestore';
  import { db } from '../config/firebase';
  
  export class NotificationService {
    
    // Crear una nueva notificación
    static async crearNotificacion({
      tutorId,
      profileId,
      tipo,
      titulo,
      mensaje,
      datos = {},
      programada = null,
      prioridad = 'normal'
    }) {
      try {
        const notificacion = {
          tutorId,
          profileId,
          tipo,
          titulo,
          mensaje,
          datos,
          prioridad,
          leida: false,
          enviada: false,
          fechaCreacion: serverTimestamp(),
          fechaProgramada: programada ? new Date(programada) : null,
          fechaEnviada: null,
          activa: true
        };
  
        const docRef = await addDoc(collection(db, 'notificaciones'), notificacion);
        
        // Si no está programada, enviarla inmediatamente
        if (!programada) {
          await this.enviarNotificacion(docRef.id);
        }
        
        return docRef.id;
      } catch (error) {
        console.error('Error creando notificación:', error);
        throw error;
      }
    }
  
    // Obtener notificaciones de un tutor
    static async obtenerNotificaciones(tutorId, soloNoLeidas = false) {
      try {
        let q = query(
          collection(db, 'notificaciones'),
          where('tutorId', '==', tutorId),
          where('activa', '==', true),
          orderBy('fechaCreacion', 'desc'),
          limit(50)
        );
  
        if (soloNoLeidas) {
          q = query(
            collection(db, 'notificaciones'),
            where('tutorId', '==', tutorId),
            where('leida', '==', false),
            where('activa', '==', true),
            orderBy('fechaCreacion', 'desc'),
            limit(20)
          );
        }
  
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fechaCreacion: doc.data().fechaCreacion?.toDate(),
          fechaProgramada: doc.data().fechaProgramada?.toDate(),
          fechaEnviada: doc.data().fechaEnviada?.toDate()
        }));
      } catch (error) {
        console.error('Error obteniendo notificaciones:', error);
        return [];
      }
    }
  
    // Marcar notificación como leída
    static async marcarComoLeida(notificacionId) {
      try {
        await updateDoc(doc(db, 'notificaciones', notificacionId), {
          leida: true,
          fechaLeida: serverTimestamp()
        });
      } catch (error) {
        console.error('Error marcando notificación como leída:', error);
      }
    }
  
    // Marcar todas las notificaciones como leídas
    static async marcarTodasComoLeidas(tutorId) {
      try {
        const notificaciones = await this.obtenerNotificaciones(tutorId, true);
        
        const promesas = notificaciones.map(notif => 
          updateDoc(doc(db, 'notificaciones', notif.id), {
            leida: true,
            fechaLeida: serverTimestamp()
          })
        );
        
        await Promise.all(promesas);
      } catch (error) {
        console.error('Error marcando todas las notificaciones como leídas:', error);
      }
    }
  
    // Enviar notificación (aquí implementarías el envío por email real)
    static async enviarNotificacion(notificacionId) {
      try {
        // Por ahora solo marcamos como enviada
        // En producción aquí llamarías a un servicio de email
        await updateDoc(doc(db, 'notificaciones', notificacionId), {
          enviada: true,
          fechaEnviada: serverTimestamp()
        });
  
        console.log(`Notificación ${notificacionId} enviada`);
        return true;
      } catch (error) {
        console.error('Error enviando notificación:', error);
        return false;
      }
    }
  
    // Procesar notificaciones programadas
    static async procesarNotificacionesProgramadas() {
      try {
        const ahora = new Date();
        const q = query(
          collection(db, 'notificaciones'),
          where('enviada', '==', false),
          where('fechaProgramada', '<=', ahora),
          where('activa', '==', true)
        );
  
        const snapshot = await getDocs(q);
        const promesas = snapshot.docs.map(doc => 
          this.enviarNotificacion(doc.id)
        );
  
        await Promise.all(promesas);
        console.log(`Procesadas ${snapshot.docs.length} notificaciones programadas`);
      } catch (error) {
        console.error('Error procesando notificaciones programadas:', error);
      }
    }
  
    // Crear notificación de actividad pendiente
    static async notificarActividadPendiente(tutorId, profileId, nombreNino, horasSinActividad) {
      return this.crearNotificacion({
        tutorId,
        profileId,
        tipo: 'actividad_pendiente',
        titulo: '🎯 Actividad pendiente',
        mensaje: `${nombreNino} no ha realizado actividades en ${horasSinActividad} horas. ¡Es hora de practicar!`,
        datos: { horasSinActividad },
        prioridad: 'normal'
      });
    }
  
    // Crear notificación de logro alcanzado
    static async notificarLogroAlcanzado(tutorId, profileId, nombreNino, logro, puntos) {
      return this.crearNotificacion({
        tutorId,
        profileId,
        tipo: 'logro_alcanzado',
        titulo: '🏆 ¡Nuevo logro desbloqueado!',
        mensaje: `${nombreNino} ha alcanzado el logro "${logro}" y ganado ${puntos} puntos extra.`,
        datos: { logro, puntos },
        prioridad: 'alta'
      });
    }
  
    // Crear notificación de progreso semanal
    static async notificarProgresoSemanal(tutorId, profileId, nombreNino, estadisticas) {
      const mensaje = `Resumen semanal de ${nombreNino}: ${estadisticas.actividadesCompletadas} actividades, ${estadisticas.tiempoTotal} minutos de práctica.`;
      
      return this.crearNotificacion({
        tutorId,
        profileId,
        tipo: 'resumen_semanal',
        titulo: '📊 Resumen de la semana',
        mensaje,
        datos: estadisticas,
        prioridad: 'normal'
      });
    }
  
    // Crear notificación de nueva evaluación recomendada
    static async notificarEvaluacionRecomendada(tutorId, profileId, nombreNino, razon) {
      return this.crearNotificacion({
        tutorId,
        profileId,
        tipo: 'evaluacion_recomendada',
        titulo: '📋 Nueva evaluación recomendada',
        mensaje: `Recomendamos realizar una nueva evaluación para ${nombreNino}. ${razon}`,
        datos: { razon },
        prioridad: 'alta'
      });
    }
  
    // Crear recordatorio de uso diario
    static async programarRecordatorioUso(tutorId, profileId, nombreNino, horaRecordatorio) {
      const fechaProgramada = new Date();
      fechaProgramada.setHours(horaRecordatorio, 0, 0, 0);
      
      // Si la hora ya pasó hoy, programar para mañana
      if (fechaProgramada <= new Date()) {
        fechaProgramada.setDate(fechaProgramada.getDate() + 1);
      }
  
      return this.crearNotificacion({
        tutorId,
        profileId,
        tipo: 'recordatorio_uso',
        titulo: '⏰ Hora de practicar',
        mensaje: `Es momento de que ${nombreNino} practique con sus actividades diarias.`,
        datos: { horaRecordatorio },
        programada: fechaProgramada,
        prioridad: 'normal'
      });
    }
  
    // Obtener estadísticas de notificaciones
    static async obtenerEstadisticas(tutorId) {
      try {
        const notificaciones = await this.obtenerNotificaciones(tutorId);
        
        const estadisticas = {
          total: notificaciones.length,
          noLeidas: notificaciones.filter(n => !n.leida).length,
          porTipo: {},
          ultimaSemana: 0
        };
  
        const unaSemanaAtras = new Date();
        unaSemanaAtras.setDate(unaSemanaAtras.getDate() - 7);
  
        notificaciones.forEach(notif => {
          // Contar por tipo
          estadisticas.porTipo[notif.tipo] = (estadisticas.porTipo[notif.tipo] || 0) + 1;
          
          // Contar última semana
          if (notif.fechaCreacion > unaSemanaAtras) {
            estadisticas.ultimaSemana++;
          }
        });
  
        return estadisticas;
      } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        return null;
      }
    }
  }