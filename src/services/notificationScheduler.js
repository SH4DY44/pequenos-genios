// src/services/notificationScheduler.js
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  getDoc,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { NotificationService } from './notificationService';

export class NotificationScheduler {
  
  // Verificar actividades pendientes para todos los perfiles
  static async verificarActividadesPendientes() {
    try {
      const perfilesSnapshot = await getDocs(collection(db, 'childProfiles'));
      const promesas = perfilesSnapshot.docs.map(doc => 
        this.verificarActividadPerfil(doc.id, doc.data())
      );
      
      await Promise.all(promesas);
      console.log('Verificación de actividades pendientes completada');
    } catch (error) {
      console.error('Error verificando actividades pendientes:', error);
    }
  }

  // ✅ CORREGIDO: Verificar actividad de un perfil específico
  static async verificarActividadPerfil(profileId, perfilData) {
    try {
      if (!perfilData.tutorId) {
        console.warn(`Perfil ${profileId} no tiene tutorId asignado`);
        return;
      }

      const ultimaActividad = perfilData.ultimaActividad?.toDate() || new Date(0);
      const ahora = new Date();
      const horasSinActividad = Math.floor((ahora - ultimaActividad) / (1000 * 60 * 60));
      
      // Configuración de recordatorios por horas sin actividad
      const configuracionRecordatorios = [
        { horas: 24, mensaje: 'Han pasado 24 horas sin actividad' },
        { horas: 48, mensaje: 'Han pasado 2 días sin práctica' },
        { horas: 72, mensaje: 'Han pasado 3 días sin usar la plataforma' },
        { horas: 168, mensaje: 'Ha pasado una semana sin actividad' }
      ];

      // Verificar si necesita recordatorio
      const recordatorioNecesario = configuracionRecordatorios.find(
        config => horasSinActividad >= config.horas && 
        horasSinActividad < config.horas + 24 // Evitar spam diario
      );

      if (recordatorioNecesario) {
        // Verificar si ya se envió este tipo de recordatorio recientemente
        const yaEnviado = await this.verificarRecordatorioReciente(
          perfilData.tutorId, 
          profileId, 
          'actividad_pendiente',
          24 // Horas
        );

        if (!yaEnviado) {
          // ✅ CORREGIDO: Usar estructura correcta de parámetros
          await NotificationService.notificarActividadPendiente(
            perfilData.tutorId,
            profileId,
            {
              nombreNino: perfilData.fullName,
              horasSinActividad: horasSinActividad,
              ultimaActividad: ultimaActividad
            }
          );
        }
      }
    } catch (error) {
      console.error(`Error verificando actividad del perfil ${profileId}:`, error);
    }
  }

  // Generar resúmenes semanales
  static async generarResumenesSemanales() {
    try {
      const perfilesSnapshot = await getDocs(collection(db, 'childProfiles'));
      const promesas = perfilesSnapshot.docs.map(doc => 
        this.generarResumenSemanal(doc.id, doc.data())
      );
      
      await Promise.all(promesas);
      console.log('Generación de resúmenes semanales completada');
    } catch (error) {
      console.error('Error generando resúmenes semanales:', error);
    }
  }

  // ✅ CORREGIDO: Generar resumen semanal para un perfil
  static async generarResumenSemanal(profileId, perfilData) {
    try {
      if (!perfilData.tutorId) {
        console.warn(`Perfil ${profileId} no tiene tutorId asignado`);
        return;
      }

      // Verificar si ya se envió el resumen esta semana
      const yaEnviado = await this.verificarRecordatorioReciente(
        perfilData.tutorId,
        profileId,
        'resumen_semanal',
        168 // 7 días
      );

      if (yaEnviado) return;

      // Calcular estadísticas de la semana
      const estadisticasSemana = await this.calcularEstadisticasSemana(profileId);
      
      if (estadisticasSemana.actividadesCompletadas > 0) {
        // ✅ CORREGIDO: Usar método existente con estructura correcta
        await NotificationService.notificarResumenSemanal(
          perfilData.tutorId,
          profileId,
          {
            nombreNino: perfilData.fullName,
            ...estadisticasSemana
          }
        );
      }
    } catch (error) {
      console.error(`Error generando resumen semanal para ${profileId}:`, error);
    }
  }

  // Calcular estadísticas de la última semana
  static async calcularEstadisticasSemana(profileId) {
    try {
      const perfilDoc = await getDoc(doc(db, 'childProfiles', profileId));
      if (!perfilDoc.exists()) {
        throw new Error(`Perfil ${profileId} no encontrado`);
      }

      const perfilData = perfilDoc.data();
      
      // Obtener registro de actividades de la última semana
      const registroActividades = perfilData.registroActividades || {};
      let actividadesCompletadas = 0;
      
      // Sumar actividades de los últimos 7 días
      for (let i = 0; i < 7; i++) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - i);
        const fechaKey = fecha.toISOString().split('T')[0];
        
        if (registroActividades[fechaKey]) {
          actividadesCompletadas += registroActividades[fechaKey];
        }
      }

      // Obtener estadísticas de juegos
      const estadisticasJuegos = perfilData.estadisticasJuegos || {};
      const juegosMasJugados = Object.entries(estadisticasJuegos)
        .map(([juego, stats]) => ({
          nombre: juego,
          partidas: stats.partidasJugadas || 0,
          puntuacion: stats.maxPuntuacion || 0
        }))
        .sort((a, b) => b.partidas - a.partidas)
        .slice(0, 3);

      return {
        actividadesCompletadas,
        tiempoTotal: Math.round((perfilData.tiempoTotal || 0) / 60), // Convertir a minutos
        puntosTotales: perfilData.puntosTotales || 0,
        juegosMasJugados,
        racha: perfilData.racha || 0,
        nivel: perfilData.resultadosEvaluacion?.nivelAsignado?.nivel || 'básico',
        semana: this.obtenerSemanaActual()
      };
    } catch (error) {
      console.error('Error calculando estadísticas de la semana:', error);
      return {
        actividadesCompletadas: 0,
        tiempoTotal: 0,
        puntosTotales: 0,
        juegosMasJugados: [],
        racha: 0,
        nivel: 'básico',
        semana: this.obtenerSemanaActual()
      };
    }
  }

  // Verificar si un perfil necesita nueva evaluación
  static async verificarEvaluacionesRecomendadas() {
    try {
      const perfilesSnapshot = await getDocs(collection(db, 'childProfiles'));
      const promesas = perfilesSnapshot.docs.map(doc => 
        this.verificarNecesidadEvaluacion(doc.id, doc.data())
      );
      
      await Promise.all(promesas);
      console.log('Verificación de evaluaciones recomendadas completada');
    } catch (error) {
      console.error('Error verificando evaluaciones recomendadas:', error);
    }
  }

  // ✅ CORREGIDO: Verificar si un perfil necesita nueva evaluación
  static async verificarNecesidadEvaluacion(profileId, perfilData) {
    try {
      if (!perfilData.tutorId) {
        console.warn(`Perfil ${profileId} no tiene tutorId asignado`);
        return;
      }

      const fechaEvaluacion = perfilData.fechaEvaluacion?.toDate();
      if (!fechaEvaluacion) return;

      const ahora = new Date();
      const mesesSinEvaluacion = Math.floor((ahora - fechaEvaluacion) / (1000 * 60 * 60 * 24 * 30));
      
      // Recomendar nueva evaluación cada 6 meses
      if (mesesSinEvaluacion >= 6) {
        const yaEnviado = await this.verificarRecordatorioReciente(
          perfilData.tutorId,
          profileId,
          'evaluacion_recomendada',
          720 // 30 días
        );

        if (!yaEnviado) {
          const razon = `Han pasado ${mesesSinEvaluacion} meses desde la última evaluación. Una nueva evaluación ayudará a ajustar mejor las actividades.`;
          
          // ✅ CORREGIDO: Usar estructura correcta de parámetros
          await NotificationService.notificarEvaluacionRecomendada(
            perfilData.tutorId,
            profileId,
            {
              nombreNino: perfilData.fullName,
              razon: razon,
              ultimaEvaluacion: fechaEvaluacion,
              mesesTranscurridos: mesesSinEvaluacion
            }
          );
        }
      }
    } catch (error) {
      console.error(`Error verificando necesidad de evaluación para ${profileId}:`, error);
    }
  }

  // ✅ CORREGIDO: Detectar y notificar logros
  static async verificarLogros(profileId, perfilData) {
    try {
      if (!perfilData.tutorId) {
        console.warn(`Perfil ${profileId} no tiene tutorId asignado`);
        return;
      }

      const logrosDetectados = await this.detectarNuevosLogros(profileId, perfilData);
      
      for (const logro of logrosDetectados) {
        // ✅ CORREGIDO: Usar estructura correcta de parámetros
        await NotificationService.notificarLogroAlcanzado(
          perfilData.tutorId,
          profileId,
          {
            nombreNino: perfilData.fullName,
            logro: logro.nombre,
            puntos: logro.puntos,
            fecha: new Date().toISOString()
          }
        );

        // Actualizar puntos en el perfil
        await updateDoc(doc(db, 'childProfiles', profileId), {
          puntosTotales: increment(logro.puntos),
          [`logros.${logro.id}`]: {
            nombre: logro.nombre,
            descripcion: logro.descripcion,
            puntos: logro.puntos,
            fechaObtenido: new Date()
          }
        });
      }
    } catch (error) {
      console.error(`Error verificando logros para ${profileId}:`, error);
    }
  }

  // Detectar nuevos logros basados en el progreso
  static async detectarNuevosLogros(profileId, perfilData) {
    const logrosDisponibles = [
      {
        id: 'primera_semana',
        nombre: 'Primera Semana Completa',
        descripcion: 'Completó actividades durante 7 días seguidos',
        puntos: 100,
        condicion: (data) => (data.racha || 0) >= 7
      },
      {
        id: 'cien_puntos',
        nombre: 'Centenario',
        descripcion: 'Alcanzó 100 puntos totales',
        puntos: 50,
        condicion: (data) => (data.puntosTotales || 0) >= 100
      },
      {
        id: 'mil_puntos',
        nombre: 'Maestro de Puntos',
        descripcion: 'Alcanzó 1000 puntos totales',
        puntos: 200,
        condicion: (data) => (data.puntosTotales || 0) >= 1000
      },
      {
        id: 'diez_actividades',
        nombre: 'Estudiante Dedicado',
        descripcion: 'Completó 10 actividades',
        puntos: 75,
        condicion: (data) => (data.actividadesCompletadas || 0) >= 10
      },
      {
        id: 'memorama_master',
        nombre: 'Maestro del Memorama',
        descripcion: 'Ganó 10 partidas de Memorama',
        puntos: 150,
        condicion: (data) => (data.estadisticasJuegos?.memorama?.victorias || 0) >= 10
      }
    ];

    const logrosActuales = perfilData.logros || {};
    const nuevosLogros = [];

    for (const logro of logrosDisponibles) {
      // Verificar si ya tiene este logro
      if (logrosActuales[logro.id]) continue;
      
      // Verificar si cumple la condición
      if (logro.condicion(perfilData)) {
        nuevosLogros.push(logro);
      }
    }

    return nuevosLogros;
  }

  // ✅ CORREGIDO: Verificar si ya se envió un tipo de recordatorio recientemente
  static async verificarRecordatorioReciente(tutorId, profileId, tipo, horasAtras) {
    try {
      const fechaLimite = new Date();
      fechaLimite.setHours(fechaLimite.getHours() - horasAtras);

      // ✅ CORREGIDO: Usar el nombre correcto de la colección
      const notificacionesQuery = query(
        collection(db, 'notifications'), // <- CORREGIDO: era 'notificaciones'
        where('tutorId', '==', tutorId),
        where('profileId', '==', profileId),
        where('tipo', '==', tipo),
        where('fechaCreacion', '>', fechaLimite)
      );

      const snapshot = await getDocs(notificacionesQuery);
      return snapshot.docs.length > 0;
    } catch (error) {
      console.error('Error verificando recordatorio reciente:', error);
      return false;
    }
  }

  // ✅ CORREGIDO: Función principal para ejecutar todas las verificaciones
  static async ejecutarMonitoreo() {
    console.log('Iniciando monitoreo de notificaciones...');
    
    try {
      await Promise.all([
        this.verificarActividadesPendientes(),
        this.verificarEvaluacionesRecomendadas()
        // ✅ REMOVIDO: procesarNotificacionesProgramadas() no existe
      ]);
      
      // Los resúmenes semanales solo los domingos
      const esDomingo = new Date().getDay() === 0;
      if (esDomingo) {
        await this.generarResumenesSemanales();
      }
      
      console.log('Monitoreo de notificaciones completado');
    } catch (error) {
      console.error('Error en el monitoreo de notificaciones:', error);
    }
  }

  // ✅ AGREGADO: Programar recordatorios diarios para un perfil
  static async programarRecordatoriosDiarios(tutorId, profileId, nombreNino, horaRecordatorio = 19) {
    try {
      // ✅ CORREGIDO: Usar método existente con estructura correcta
      await NotificationService.notificarRecordatorioUso(
        tutorId,
        profileId,
        {
          nombreNino: nombreNino,
          horaRecordatorio: horaRecordatorio,
          tipoRecordatorio: 'diario'
        }
      );
      
      console.log(`Recordatorio diario programado para ${nombreNino}`);
    } catch (error) {
      console.error('Error programando recordatorio diario:', error);
    }
  }

  // ✅ AGREGADO: Obtener la semana actual en formato string
  static obtenerSemanaActual() {
    const fecha = new Date();
    const inicioAno = new Date(fecha.getFullYear(), 0, 1);
    const dias = Math.floor((fecha - inicioAno) / (24 * 60 * 60 * 1000));
    const semana = Math.ceil((dias + inicioAno.getDay() + 1) / 7);
    return `${fecha.getFullYear()}-W${semana.toString().padStart(2, '0')}`;
  }

  // ✅ AGREGADO: Método para monitoreo en tiempo real
  static async monitorearLogrosEnTiempoReal(profileId) {
    try {
      const perfilDoc = await getDoc(doc(db, 'childProfiles', profileId));
      if (!perfilDoc.exists()) return;

      const perfilData = perfilDoc.data();
      await this.verificarLogros(profileId, perfilData);
    } catch (error) {
      console.error(`Error en monitoreo en tiempo real para ${profileId}:`, error);
    }
  }
}