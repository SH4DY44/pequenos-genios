// src/services/notificationService.js
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';

export class NotificationService {
  
  /**
   * Crear una nueva notificación
   * @param {Object} notificationData - Datos de la notificación
   * @returns {Promise<string>} - ID de la notificación creada
   */
  static async crearNotificacion(notificationData) {
    try {
      // Validar datos requeridos
      if (!notificationData.tutorId || !notificationData.tipo || !notificationData.titulo) {
        throw new Error('Datos requeridos faltantes: tutorId, tipo, titulo');
      }

      const notificacion = {
        tutorId: notificationData.tutorId,
        profileId: notificationData.profileId || null,
        tipo: notificationData.tipo,
        titulo: notificationData.titulo,
        mensaje: notificationData.mensaje || '',
        datos: notificationData.datos || {},
        prioridad: notificationData.prioridad || 'normal',
        leida: false,
        fechaCreacion: serverTimestamp(),
        fechaLectura: null
      };

      const docRef = await addDoc(collection(db, 'notifications'), notificacion);
      console.log('Notificación creada con ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creando notificación:', error);
      throw error;
    }
  }

  /**
   * Obtener notificaciones de un tutor
   * @param {string} tutorId - ID del tutor
   * @param {Object} options - Opciones de filtrado
   * @returns {Promise<Array>} - Array de notificaciones
   */
  static async obtenerNotificaciones(tutorId, options = {}) {
    try {
      if (!tutorId) {
        throw new Error('tutorId es requerido');
      }

      let q = query(
        collection(db, 'notifications'),
        where('tutorId', '==', tutorId),
        orderBy('fechaCreacion', 'desc')
      );

      // Aplicar filtros opcionales
      if (options.profileId) {
        q = query(q, where('profileId', '==', options.profileId));
      }

      if (options.tipo) {
        q = query(q, where('tipo', '==', options.tipo));
      }

      if (options.soloNoLeidas) {
        q = query(q, where('leida', '==', false));
      }

      if (options.limite) {
        q = query(q, limit(options.limite));
      }

      const snapshot = await getDocs(q);
      const notificaciones = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fechaCreacion: doc.data().fechaCreacion?.toDate() || new Date(),
        fechaLectura: doc.data().fechaLectura?.toDate() || null
      }));

      return notificaciones;
    } catch (error) {
      console.error('Error obteniendo notificaciones:', error);
      throw error;
    }
  }

  /**
   * Marcar notificación como leída
   * @param {string} notificationId - ID de la notificación
   * @returns {Promise<void>}
   */
  static async marcarComoLeida(notificationId) {
    try {
      if (!notificationId) {
        throw new Error('notificationId es requerido');
      }

      await updateDoc(doc(db, 'notifications', notificationId), {
        leida: true,
        fechaLectura: serverTimestamp()
      });

      console.log('Notificación marcada como leída:', notificationId);
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
      throw error;
    }
  }

  /**
   * Marcar todas las notificaciones como leídas para un tutor
   * @param {string} tutorId - ID del tutor
   * @returns {Promise<void>}
   */
  static async marcarTodasComoLeidas(tutorId) {
    try {
      if (!tutorId) {
        throw new Error('tutorId es requerido');
      }

      const q = query(
        collection(db, 'notifications'),
        where('tutorId', '==', tutorId),
        where('leida', '==', false)
      );

      const snapshot = await getDocs(q);
      const updates = snapshot.docs.map(doc => 
        updateDoc(doc.ref, {
          leida: true,
          fechaLectura: serverTimestamp()
        })
      );

      await Promise.all(updates);
      console.log(`${updates.length} notificaciones marcadas como leídas`);
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de notificaciones
   * @param {string} tutorId - ID del tutor
   * @returns {Promise<Object>} - Estadísticas
   */
  static async obtenerEstadisticas(tutorId) {
    try {
      if (!tutorId) {
        throw new Error('tutorId es requerido');
      }

      const todas = await this.obtenerNotificaciones(tutorId);
      const noLeidas = todas.filter(n => !n.leida);
      
      // Notificaciones de la última semana
      const ultimaSemana = new Date();
      ultimaSemana.setDate(ultimaSemana.getDate() - 7);
      const recientes = todas.filter(n => n.fechaCreacion >= ultimaSemana);

      // Agrupar por tipo
      const porTipo = todas.reduce((acc, notif) => {
        acc[notif.tipo] = (acc[notif.tipo] || 0) + 1;
        return acc;
      }, {});

      return {
        total: todas.length,
        noLeidas: noLeidas.length,
        ultimaSemana: recientes.length,
        porTipo
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  /**
   * Crear notificación de actividad pendiente
   * @param {string} tutorId - ID del tutor
   * @param {string} profileId - ID del perfil del niño
   * @param {Object} datos - Datos adicionales
   * @returns {Promise<string>} - ID de la notificación
   */
  static async notificarActividadPendiente(tutorId, profileId, datos = {}) {
    return await this.crearNotificacion({
      tutorId,
      profileId,
      tipo: 'actividad_pendiente',
      titulo: '🎯 Recordatorio de actividad',
      mensaje: `${datos.nombreNino || 'Tu pequeño'} no ha realizado actividades hoy. ¡Es momento de aprender!`,
      datos: {
        nombreNino: datos.nombreNino,
        horasSinActividad: datos.horasSinActividad || 24,
        ultimaActividad: datos.ultimaActividad
      },
      prioridad: 'normal'
    });
  }

  /**
   * Crear notificación de logro alcanzado
   * @param {string} tutorId - ID del tutor
   * @param {string} profileId - ID del perfil del niño
   * @param {Object} datos - Datos del logro
   * @returns {Promise<string>} - ID de la notificación
   */
  static async notificarLogroAlcanzado(tutorId, profileId, datos = {}) {
    return await this.crearNotificacion({
      tutorId,
      profileId,
      tipo: 'logro_alcanzado',
      titulo: '🏆 ¡Nuevo logro desbloqueado!',
      mensaje: `${datos.nombreNino || 'Tu pequeño'} ha alcanzado el logro "${datos.logro}" y ganado ${datos.puntos || 0} puntos extra.`,
      datos: {
        nombreNino: datos.nombreNino,
        logro: datos.logro,
        puntos: datos.puntos,
        fecha: new Date().toISOString()
      },
      prioridad: 'alta'
    });
  }

  /**
   * Crear notificación de resumen semanal
   * @param {string} tutorId - ID del tutor
   * @param {string} profileId - ID del perfil del niño
   * @param {Object} datos - Datos del resumen
   * @returns {Promise<string>} - ID de la notificación
   */
  static async notificarResumenSemanal(tutorId, profileId, datos = {}) {
    return await this.crearNotificacion({
      tutorId,
      profileId,
      tipo: 'resumen_semanal',
      titulo: '📊 Resumen de la semana',
      mensaje: `Resumen semanal de ${datos.nombreNino || 'tu pequeño'}: ${datos.actividadesCompletadas || 0} actividades, ${datos.tiempoTotal || 0} minutos de práctica.`,
      datos: {
        nombreNino: datos.nombreNino,
        actividadesCompletadas: datos.actividadesCompletadas || 0,
        tiempoTotal: datos.tiempoTotal || 0,
        puntosTotales: datos.puntosTotales || 0,
        racha: datos.racha || 0,
        semana: datos.semana || this.obtenerSemanaActual()
      },
      prioridad: 'normal'
    });
  }

  /**
   * Crear notificación de evaluación recomendada
   * @param {string} tutorId - ID del tutor
   * @param {string} profileId - ID del perfil del niño
   * @param {Object} datos - Datos de la evaluación
   * @returns {Promise<string>} - ID de la notificación
   */
  static async notificarEvaluacionRecomendada(tutorId, profileId, datos = {}) {
    return await this.crearNotificacion({
      tutorId,
      profileId,
      tipo: 'evaluacion_recomendada',
      titulo: '📋 Nueva evaluación recomendada',
      mensaje: `Recomendamos realizar una nueva evaluación para ${datos.nombreNino || 'tu pequeño'}.`,
      datos: {
        nombreNino: datos.nombreNino,
        razon: datos.razon || 'Es momento de evaluar el progreso',
        ultimaEvaluacion: datos.ultimaEvaluacion,
        mesesTranscurridos: datos.mesesTranscurridos
      },
      prioridad: 'alta'
    });
  }

  /**
   * Crear recordatorio de uso
   * @param {string} tutorId - ID del tutor
   * @param {string} profileId - ID del perfil del niño
   * @param {Object} datos - Datos del recordatorio
   * @returns {Promise<string>} - ID de la notificación
   */
  static async notificarRecordatorioUso(tutorId, profileId, datos = {}) {
    return await this.crearNotificacion({
      tutorId,
      profileId,
      tipo: 'recordatorio_uso',
      titulo: '⏰ Hora de practicar',
      mensaje: `Es momento de que ${datos.nombreNino || 'tu pequeño'} practique con sus actividades diarias.`,
      datos: {
        nombreNino: datos.nombreNino,
        horaRecordatorio: datos.horaRecordatorio || new Date().getHours(),
        tipoRecordatorio: datos.tipoRecordatorio || 'diario'
      },
      prioridad: 'normal'
    });
  }

  /**
   * Obtener la semana actual en formato string
   * @returns {string} - Semana actual (ej: "2024-W22")
   */
  static obtenerSemanaActual() {
    const fecha = new Date();
    const inicioAno = new Date(fecha.getFullYear(), 0, 1);
    const dias = Math.floor((fecha - inicioAno) / (24 * 60 * 60 * 1000));
    const semana = Math.ceil((dias + inicioAno.getDay() + 1) / 7);
    return `${fecha.getFullYear()}-W${semana.toString().padStart(2, '0')}`;
  }

  /**
   * Crear notificación de recordatorio manual
   * @param {string} tutorId - ID del tutor
   * @param {string} profileId - ID del perfil del niño (opcional)
   * @param {Object} datos - Datos del recordatorio
   * @returns {Promise<string>} - ID de la notificación
   */
  static async crearRecordatorioManual(tutorId, profileId, datos = {}) {
    // ✅ CORREGIDO: Filtrar valores undefined
    const datosLimpios = {
      nombreNino: datos.nombreNino || 'Sin nombre',
      tipoRecordatorio: datos.tipoRecordatorio || 'general',
      creadoPor: 'tutor',
      fechaCreacion: new Date().toISOString()
    };

    // Solo agregar campos que no sean undefined
    if (datos.fechaProgramada) datosLimpios.fechaProgramada = datos.fechaProgramada;
    if (datos.notas) datosLimpios.notas = datos.notas;

    return await this.crearNotificacion({
      tutorId,
      profileId,
      tipo: 'recordatorio_manual',
      titulo: datos.titulo || '⏰ Recordatorio personalizado',
      mensaje: datos.mensaje || 'Tienes un recordatorio pendiente',
      datos: datosLimpios,
      prioridad: datos.prioridad || 'normal'
    });
  }

  /**
   * Crear recordatorio de cita médica/especialista
   * @param {string} tutorId - ID del tutor
   * @param {string} profileId - ID del perfil del niño
   * @param {Object} datos - Datos de la cita
   * @returns {Promise<string>} - ID de la notificación
   */
  static async crearRecordatorioCita(tutorId, profileId, datos = {}) {
    // ✅ CORREGIDO: Solo incluir campos definidos
    const datosLimpios = {
      nombreNino: datos.nombreNino || 'Sin nombre',
      especialista: datos.especialista || 'Especialista'
    };

    if (datos.fechaCita) datosLimpios.fechaCita = datos.fechaCita;
    if (datos.horaCita) datosLimpios.horaCita = datos.horaCita;
    if (datos.lugar) datosLimpios.lugar = datos.lugar;
    if (datos.notas) datosLimpios.notas = datos.notas;
    if (datos.telefono) datosLimpios.telefono = datos.telefono;

    return await this.crearNotificacion({
      tutorId,
      profileId,
      tipo: 'cita_especialista',
      titulo: '🏥 Recordatorio de cita médica',
      mensaje: `Recordatorio: ${datos.nombreNino} tiene cita con ${datos.especialista}${datos.fechaCita ? ` el ${datos.fechaCita}` : ''}`,
      datos: datosLimpios,
      prioridad: 'alta'
    });
  }

  /**
   * Crear recordatorio de medicamento
   * @param {string} tutorId - ID del tutor
   * @param {string} profileId - ID del perfil del niño
   * @param {Object} datos - Datos del medicamento
   * @returns {Promise<string>} - ID de la notificación
   */
  static async crearRecordatorioMedicamento(tutorId, profileId, datos = {}) {
    // ✅ CORREGIDO: Solo incluir campos definidos
    const datosLimpios = {
      nombreNino: datos.nombreNino || 'Sin nombre',
      nombreMedicamento: datos.nombreMedicamento || 'Medicamento'
    };

    if (datos.dosis) datosLimpios.dosis = datos.dosis;
    if (datos.horario) datosLimpios.horario = datos.horario;
    if (datos.instrucciones) datosLimpios.instrucciones = datos.instrucciones;
    if (datos.doctorReceta) datosLimpios.doctorReceta = datos.doctorReceta;

    return await this.crearNotificacion({
      tutorId,
      profileId,
      tipo: 'medicamento',
      titulo: '💊 Recordatorio de medicamento',
      mensaje: `Es hora de que ${datos.nombreNino} tome su medicamento: ${datos.nombreMedicamento}`,
      datos: datosLimpios,
      prioridad: 'alta'
    });
  }

  /**
   * Crear recordatorio de tarea especial
   * @param {string} tutorId - ID del tutor
   * @param {string} profileId - ID del perfil del niño
   * @param {Object} datos - Datos de la tarea
   * @returns {Promise<string>} - ID de la notificación
   */
  static async crearRecordatorioTarea(tutorId, profileId, datos = {}) {
    // ✅ CORREGIDO: Solo incluir campos definidos
    const datosLimpios = {
      nombreNino: datos.nombreNino || 'Sin nombre',
      nombreTarea: datos.nombreTarea || 'Tarea'
    };

    if (datos.materia) datosLimpios.materia = datos.materia;
    if (datos.fechaEntrega) datosLimpios.fechaEntrega = datos.fechaEntrega;
    if (datos.descripcion) datosLimpios.descripcion = datos.descripcion;
    if (datos.prioridadTarea) datosLimpios.prioridadTarea = datos.prioridadTarea;

    return await this.crearNotificacion({
      tutorId,
      profileId,
      tipo: 'tarea_especial',
      titulo: '📚 Recordatorio de tarea',
      mensaje: `${datos.nombreNino} tiene una tarea pendiente: ${datos.nombreTarea}`,
      datos: datosLimpios,
      prioridad: datos.prioridad || 'normal'
    });
  }

  /**
   * Obtener plantillas de recordatorios predefinidas
   * @returns {Object} - Plantillas organizadas por tipo
   */
  static obtenerPlantillasRecordatorios() {
    return {
      recordatorio_manual: [
        {
          id: 'practica_diaria',
          titulo: '🎯 Hora de practicar',
          mensaje: 'Es momento de que {nombreNino} practique sus actividades diarias',
          categoria: 'Práctica'
        },
        {
          id: 'descanso',
          titulo: '😴 Hora de descansar',
          mensaje: 'Es hora de que {nombreNino} tome un descanso',
          categoria: 'Bienestar'
        },
        {
          id: 'comida',
          titulo: '🍽️ Hora de comer',
          mensaje: 'Es hora de que {nombreNino} tome sus alimentos',
          categoria: 'Rutina'
        }
      ],
      cita_especialista: [
        {
          id: 'psicologo',
          titulo: '🧠 Cita con psicólogo',
          mensaje: 'Recordatorio: {nombreNino} tiene cita con el psicólogo',
          categoria: 'Salud Mental'
        },
        {
          id: 'pediatra',
          titulo: '👩‍⚕️ Cita con pediatra',
          mensaje: 'Recordatorio: {nombreNino} tiene cita con el pediatra',
          categoria: 'Salud'
        }
      ],
      medicamento: [
        {
          id: 'manana',
          titulo: '💊 Medicamento matutino',
          mensaje: 'Es hora de que {nombreNino} tome su medicamento de la mañana',
          categoria: 'Mañana'
        },
        {
          id: 'noche',
          titulo: '💊 Medicamento nocturno',
          mensaje: 'Es hora de que {nombreNino} tome su medicamento de la noche',
          categoria: 'Noche'
        }
      ],
      tarea_especial: [
        {
          id: 'matematicas',
          titulo: '📊 Tarea de matemáticas',
          mensaje: '{nombreNino} tiene tarea de matemáticas pendiente',
          categoria: 'Matemáticas'
        },
        {
          id: 'lectura',
          titulo: '📖 Tarea de lectura',
          mensaje: '{nombreNino} tiene tarea de lectura pendiente',
          categoria: 'Lenguaje'
        }
      ]
    };
  }

  /**
   * Aplicar plantilla a datos del recordatorio
   * @param {string} tipoPlantilla - Tipo de plantilla
   * @param {string} idPlantilla - ID de la plantilla específica
   * @param {Object} datos - Datos para reemplazar en la plantilla
   * @returns {Object} - Datos de notificación listos para crear
   */
  static aplicarPlantilla(tipoPlantilla, idPlantilla, datos) {
    const plantillas = this.obtenerPlantillasRecordatorios();
    const plantilla = plantillas[tipoPlantilla]?.find(p => p.id === idPlantilla);
    
    if (!plantilla) {
      throw new Error(`Plantilla ${idPlantilla} del tipo ${tipoPlantilla} no encontrada`);
    }

    // Reemplazar variables en la plantilla
    const titulo = plantilla.titulo.replace(/{(\w+)}/g, (match, key) => datos[key] || match);
    const mensaje = plantilla.mensaje.replace(/{(\w+)}/g, (match, key) => datos[key] || match);

    return {
      titulo,
      mensaje,
      categoria: plantilla.categoria,
      tipoRecordatorio: tipoPlantilla,
      plantillaUsada: idPlantilla,
      ...datos
    };
  }

  /**
   * Limpiar notificaciones antiguas (más de 30 días)
   * @param {string} tutorId - ID del tutor
   * @returns {Promise<number>} - Número de notificaciones eliminadas
   */
  static async limpiarNotificacionesAntiguas(tutorId) {
    try {
      const hace30Dias = new Date();
      hace30Dias.setDate(hace30Dias.getDate() - 30);

      const q = query(
        collection(db, 'notifications'),
        where('tutorId', '==', tutorId),
        where('fechaCreacion', '<', hace30Dias)
      );

      const snapshot = await getDocs(q);
      const eliminaciones = snapshot.docs.map(doc => 
        doc.ref.delete()
      );

      await Promise.all(eliminaciones);
      console.log(`${eliminaciones.length} notificaciones antiguas eliminadas`);
      return eliminaciones.length;
    } catch (error) {
      console.error('Error limpiando notificaciones antiguas:', error);
      throw error;
    }
  }
}