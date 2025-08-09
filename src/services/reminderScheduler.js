// src/services/reminderScheduler.js
import { 
  collection, 
  addDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import EmailService from './emailService';

export class ReminderScheduler {
  
  /**
   * Programar recordatorio automático para una fecha específica
   */
  static async programarRecordatorio(recordatorioData) {
    try {
      console.log('📅 Programando recordatorio:', recordatorioData);
      
      const {
        tutorId,
        profileId,
        nombreNino,
        tipo,
        fechaProgramada,
        datos
      } = recordatorioData;

      // Validar que la fecha sea futura
      const ahora = new Date();
      const fechaRecordatorio = new Date(fechaProgramada);
      
      if (fechaRecordatorio <= ahora) {
        throw new Error('La fecha del recordatorio debe ser futura');
      }

      // Crear el recordatorio programado en Firestore
      const recordatorioProgramado = {
        tutorId,
        profileId,
        nombreNino,
        tipo,
        fechaProgramada: fechaRecordatorio,
        datos,
        estado: 'programado',
        fechaCreacion: new Date(),
        intentosEnvio: 0,
        maxIntentos: 3
      };

      const docRef = await addDoc(
        collection(db, 'recordatoriosProgramados'), 
        recordatorioProgramado
      );
      
      console.log('✅ Recordatorio programado con ID:', docRef.id);
      return docRef.id;
      
    } catch (error) {
      console.error('❌ Error programando recordatorio:', error);
      throw error;
    }
  }

  /**
   * Procesar recordatorios que deben enviarse ahora
   */
  static async procesarRecordatoriosPendientes() {
    try {
      console.log('🔄 Procesando recordatorios pendientes...');
      
      const ahora = new Date();
      const hace5Minutos = new Date(ahora.getTime() - 5 * 60 * 1000);
      
      // Buscar recordatorios que deben enviarse en los próximos 5 minutos
      const recordatoriosQuery = query(
        collection(db, 'recordatoriosProgramados'),
        where('estado', '==', 'programado'),
        where('fechaProgramada', '<=', ahora),
        where('fechaProgramada', '>=', hace5Minutos),
        orderBy('fechaProgramada', 'asc'),
        limit(50)
      );

      const snapshot = await getDocs(recordatoriosQuery);
      const recordatorios = snapshot.docs;
      
      console.log(`📨 Encontrados ${recordatorios.length} recordatorios para procesar`);

      for (const recordatorioDoc of recordatorios) {
        const recordatorioId = recordatorioDoc.id;
        const recordatorioData = recordatorioDoc.data();
        
        try {
          await this.enviarRecordatorioProgramado(recordatorioId, recordatorioData);
        } catch (error) {
          console.error(`❌ Error enviando recordatorio ${recordatorioId}:`, error);
          await this.manejarErrorEnvio(recordatorioId, recordatorioData, error);
        }
      }
      
    } catch (error) {
      console.error('❌ Error procesando recordatorios pendientes:', error);
    }
  }

  /**
   * Enviar un recordatorio programado específico
   */
  static async enviarRecordatorioProgramado(recordatorioId, recordatorioData) {
    try {
      console.log(`📤 Enviando recordatorio programado: ${recordatorioId}`);
      
      const { tipo, datos, tutorId, profileId, nombreNino } = recordatorioData;

      // Preparar datos para el email según el tipo
      let tipoEmail = 'recordatorio_general';
      let datosEmail = {
        nombreNino,
        nombreTutor: 'Tutor',
        titulo: datos.titulo || 'Recordatorio programado',
        mensaje: datos.mensaje || '',
        urlPlataforma: window.location?.origin || 'https://pequenosgenios.com'
      };

      switch (tipo) {
        case 'cita_especialista':
        case 'cita_medica':
          tipoEmail = 'recordatorio_cita_medica';
          datosEmail = {
            ...datosEmail,
            especialista: datos.especialista || 'Especialista',
            fechaCita: this.formatearFecha(datos.fechaCita),
            hora: this.extraerHora(datos.fechaCita),
            lugar: datos.lugar || ''
          };
          break;
          
        case 'medicamento':
          tipoEmail = 'recordatorio_medicamento';
          datosEmail = {
            ...datosEmail,
            medicamento: datos.medicamento || 'Medicamento',
            dosis: datos.dosis || '',
            hora: this.extraerHora(recordatorioData.fechaProgramada)
          };
          break;
          
        case 'tarea_especial':
        case 'tarea_escolar':
          tipoEmail = 'recordatorio_tarea_escolar';
          datosEmail = {
            ...datosEmail,
            materia: datos.materia || 'Materia',
            fechaEntrega: this.formatearFecha(datos.fechaEntrega),
            descripcion: datos.descripcion || datos.mensaje || ''
          };
          break;
      }

      // Obtener email del tutor desde Firebase Auth o Firestore
      const emailTutor = await this.obtenerEmailTutor(tutorId);
      
      if (!emailTutor) {
        throw new Error('No se pudo obtener el email del tutor');
      }

      // Enviar el email
      await EmailService.enviarCorreo(emailTutor, tipoEmail, datosEmail);
      
      // Marcar como enviado
      await updateDoc(doc(db, 'recordatoriosProgramados', recordatorioId), {
        estado: 'enviado',
        fechaEnvio: new Date(),
        intentosEnvio: recordatorioData.intentosEnvio + 1
      });
      
      console.log(`✅ Recordatorio enviado exitosamente: ${recordatorioId}`);
      
    } catch (error) {
      console.error(`❌ Error enviando recordatorio ${recordatorioId}:`, error);
      throw error;
    }
  }

  /**
   * Manejar errores en el envío de recordatorios
   */
  static async manejarErrorEnvio(recordatorioId, recordatorioData, error) {
    try {
      const intentosActuales = recordatorioData.intentosEnvio + 1;
      const maxIntentos = recordatorioData.maxIntentos || 3;
      
      if (intentosActuales >= maxIntentos) {
        // Marcar como fallido después de varios intentos
        await updateDoc(doc(db, 'recordatoriosProgramados', recordatorioId), {
          estado: 'fallido',
          ultimoError: error.message,
          intentosEnvio: intentosActuales,
          fechaUltimoIntento: new Date()
        });
        
        console.log(`❌ Recordatorio marcado como fallido: ${recordatorioId}`);
      } else {
        // Reprogramar para dentro de 15 minutos
        const nuevaFecha = new Date();
        nuevaFecha.setMinutes(nuevaFecha.getMinutes() + 15);
        
        await updateDoc(doc(db, 'recordatoriosProgramados', recordatorioId), {
          fechaProgramada: nuevaFecha,
          ultimoError: error.message,
          intentosEnvio: intentosActuales,
          fechaUltimoIntento: new Date()
        });
        
        console.log(`🔄 Recordatorio reprogramado para dentro de 15 minutos: ${recordatorioId}`);
      }
    } catch (updateError) {
      console.error(`❌ Error actualizando estado del recordatorio ${recordatorioId}:`, updateError);
    }
  }

  /**
   * Limpiar recordatorios antiguos
   */
  static async limpiarRecordatoriosAntiguos() {
    try {
      console.log('🧹 Limpiando recordatorios antiguos...');
      
      const hace30Dias = new Date();
      hace30Dias.setDate(hace30Dias.getDate() - 30);
      
      const recordatoriosAntiguosQuery = query(
        collection(db, 'recordatoriosProgramados'),
        where('fechaCreacion', '<', hace30Dias)
      );

      const snapshot = await getDocs(recordatoriosAntiguosQuery);
      
      for (const doc of snapshot.docs) {
        await deleteDoc(doc.ref);
      }
      
      console.log(`🗑️ Eliminados ${snapshot.docs.length} recordatorios antiguos`);
      
    } catch (error) {
      console.error('❌ Error limpiando recordatorios antiguos:', error);
    }
  }

  /**
   * Obtener estadísticas de recordatorios
   */
  static async obtenerEstadisticas() {
    try {
      const estadisticas = {
        programados: 0,
        enviados: 0,
        fallidos: 0,
        total: 0
      };

      const queryProgramados = query(
        collection(db, 'recordatoriosProgramados'),
        where('estado', '==', 'programado')
      );
      const snapshotProgramados = await getDocs(queryProgramados);
      estadisticas.programados = snapshotProgramados.docs.length;

      const queryEnviados = query(
        collection(db, 'recordatoriosProgramados'),
        where('estado', '==', 'enviado')
      );
      const snapshotEnviados = await getDocs(queryEnviados);
      estadisticas.enviados = snapshotEnviados.docs.length;

      const queryFallidos = query(
        collection(db, 'recordatoriosProgramados'),
        where('estado', '==', 'fallido')
      );
      const snapshotFallidos = await getDocs(queryFallidos);
      estadisticas.fallidos = snapshotFallidos.docs.length;

      estadisticas.total = estadisticas.programados + estadisticas.enviados + estadisticas.fallidos;

      return estadisticas;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return { programados: 0, enviados: 0, fallidos: 0, total: 0 };
    }
  }

  /**
   * Métodos auxiliares
   */
  static formatearFecha(fecha) {
    if (!fecha) return '';
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return fechaObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  static extraerHora(fecha) {
    if (!fecha) return '';
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return fechaObj.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  static async obtenerEmailTutor(tutorId) {
    try {
      // Implementar según tu estructura de datos
      // Por ahora, usar auth.currentUser como fallback
      if (typeof window !== 'undefined' && window.auth?.currentUser) {
        return window.auth.currentUser.email;
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo email del tutor:', error);
      return null;
    }
  }

  /**
   * Cancelar un recordatorio programado
   */
  static async cancelarRecordatorio(recordatorioId) {
    try {
      await updateDoc(doc(db, 'recordatoriosProgramados', recordatorioId), {
        estado: 'cancelado',
        fechaCancelacion: new Date()
      });
      
      console.log(`❌ Recordatorio cancelado: ${recordatorioId}`);
      return true;
    } catch (error) {
      console.error(`❌ Error cancelando recordatorio ${recordatorioId}:`, error);
      return false;
    }
  }
}
