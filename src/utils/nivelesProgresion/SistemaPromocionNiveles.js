import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { toast } from 'react-toastify';

/**
 * Sistema de Promoción Automática de Niveles
 * Evalúa el progreso del niño y determina si debe ser promovido al siguiente nivel
 */
export class SistemaPromocionNiveles {

  // Definición de criterios para promoción de niveles
  static CRITERIOS_PROMOCION = {
    'básico_a_básico-alto': {
      nivelActual: 'básico',
      nivelSiguiente: 'básico-alto',
      criterios: {
        actividadesCompletadas: 15,        // Mínimo 15 actividades
        puntosTotales: 150,                // Mínimo 150 puntos
        precisonPromedio: 70,              // 70% de precisión promedio
        rachaMinima: 3,                    // Al menos 3 días consecutivos
        tiempoEnNivel: 7,                  // Mínimo 7 días en el nivel
        actividadesPerfectas: 3            // Al menos 3 actividades perfectas
      }
    },
    'básico-alto_a_intermedio': {
      nivelActual: 'básico-alto',
      nivelSiguiente: 'intermedio',
      criterios: {
        actividadesCompletadas: 30,
        puntosTotales: 400,
        precisonPromedio: 75,
        rachaMinima: 5,
        tiempoEnNivel: 10,
        actividadesPerfectas: 5,
        juegosCompletados: 10              // Diversidad en juegos
      }
    },
    'intermedio_a_avanzado': {
      nivelActual: 'intermedio',
      nivelSiguiente: 'avanzado',
      criterios: {
        actividadesCompletadas: 50,
        puntosTotales: 800,
        precisonPromedio: 80,
        rachaMinima: 7,
        tiempoEnNivel: 14,
        actividadesPerfectas: 8,
        juegosCompletados: 15,
        logrosObtenidos: 5                 // Debe tener varios logros
      }
    }
  };

  // Configuración de evaluación temporal
  static PERIODO_EVALUACION = {
    dias: 30,  // Evaluar las últimas 4 semanas
    sesionesMinimas: 10  // Mínimo 10 sesiones para evaluar
  };

  /**
   * Evaluar si un niño debe ser promovido al siguiente nivel
   * @param {string} profileId - ID del perfil del niño
   * @returns {Promise<object>} - Resultado de la evaluación
   */
  static async evaluarPromocion(profileId) {
    try {
      console.log('🎓 Iniciando evaluación de promoción para:', profileId);
      
      // 1. Obtener datos actuales del perfil
      const perfilData = await this.obtenerDatosPerfil(profileId);
      if (!perfilData) {
        throw new Error('Perfil no encontrado');
      }

      const nivelActual = perfilData.resultadosEvaluacion?.nivelAsignado?.nivel || 'básico';
      
      // 2. Verificar si ya está en el nivel máximo
      if (nivelActual === 'avanzado') {
        return {
          puedePromoverse: false,
          razon: 'Ya está en el nivel máximo',
          nivelActual,
          sugerencias: ['Continuar con actividades desafiantes', 'Explorar nuevas categorías']
        };
      }

      // 3. Obtener configuración de promoción para el nivel actual
      const configPromocion = this.obtenerConfiguracionPromocion(nivelActual);
      if (!configPromocion) {
        return {
          puedePromoverse: false,
          razon: 'No hay configuración de promoción para este nivel',
          nivelActual
        };
      }

      // 4. Evaluar actividades recientes
      const estadisticasRecientes = await this.obtenerEstadisticasRecientes(profileId);
      
      // 5. Evaluar cada criterio
      const evaluacionCriterios = await this.evaluarCriterios(
        perfilData, 
        estadisticasRecientes, 
        configPromocion.criterios
      );

      // 6. Determinar si cumple todos los criterios
      const cumpleTodos = evaluacionCriterios.every(c => c.cumple);
      const porcentajeCumplimiento = (evaluacionCriterios.filter(c => c.cumple).length / evaluacionCriterios.length) * 100;

      return {
        puedePromoverse: cumpleTodos,
        nivelActual: configPromocion.nivelActual,
        nivelSiguiente: configPromocion.nivelSiguiente,
        porcentajeCumplimiento: Math.round(porcentajeCumplimiento),
        evaluacionCriterios,
        sugerencias: this.generarSugerencias(evaluacionCriterios),
        fechaEvaluacion: new Date()
      };

    } catch (error) {
      console.error('❌ Error evaluando promoción:', error);
      return {
        puedePromoverse: false,
        error: error.message,
        nivelActual: 'básico'
      };
    }
  }

  /**
   * Promover automáticamente a un niño al siguiente nivel
   * @param {string} profileId - ID del perfil del niño
   * @param {object} evaluacion - Resultado de la evaluación de promoción
   * @returns {Promise<boolean>} - Éxito de la promoción
   */
  static async promoverNivel(profileId, evaluacion = null) {
    try {
      // Si no se proporciona evaluación, hacer una nueva
      if (!evaluacion) {
        evaluacion = await this.evaluarPromocion(profileId);
      }

      if (!evaluacion.puedePromoverse) {
        console.log('❌ No cumple criterios para promoción');
        return false;
      }

      console.log(`🎉 Promoviendo de ${evaluacion.nivelActual} a ${evaluacion.nivelSiguiente}`);

      // Actualizar el nivel en el perfil
      const perfilRef = doc(db, 'childProfiles', profileId);
      await updateDoc(perfilRef, {
        'resultadosEvaluacion.nivelAsignado.nivel': evaluacion.nivelSiguiente,
        'resultadosEvaluacion.nivelAsignado.fechaActualizacion': new Date(),
        'resultadosEvaluacion.nivelAsignado.razonCambio': 'Promoción automática por progreso',
        'historialNiveles': [
          ...(await this.obtenerHistorialNiveles(profileId) || []),
          {
            nivelAnterior: evaluacion.nivelActual,
            nivelNuevo: evaluacion.nivelSiguiente,
            fecha: new Date(),
            criteriosCumplidos: evaluacion.evaluacionCriterios.filter(c => c.cumple).length,
            totalCriterios: evaluacion.evaluacionCriterios.length,
            porcentajeCumplimiento: evaluacion.porcentajeCumplimiento
          }
        ]
      });

      // Notificar promoción
      await this.notificarPromocion(profileId, evaluacion);

      console.log('✅ Promoción completada exitosamente');
      return true;

    } catch (error) {
      console.error('❌ Error promoviendo nivel:', error);
      return false;
    }
  }

  /**
   * Verificar automáticamente promociones para todos los perfiles activos
   * (Función que se puede ejecutar periódicamente)
   */
  static async verificarPromocionesAutomaticas() {
    try {
      console.log('🔄 Verificando promociones automáticas...');
      
      // Obtener perfiles activos (con actividad reciente)
      const perfilesActivos = await this.obtenerPerfilesActivos();
      
      let promocionesRealizadas = 0;
      
      for (const perfil of perfilesActivos) {
        const evaluacion = await this.evaluarPromocion(perfil.id);
        
        if (evaluacion.puedePromoverse) {
          const exito = await this.promoverNivel(perfil.id, evaluacion);
          if (exito) {
            promocionesRealizadas++;
          }
        }
      }

      console.log(`✅ Verificación completada. ${promocionesRealizadas} promociones realizadas.`);
      return promocionesRealizadas;

    } catch (error) {
      console.error('❌ Error en verificación automática:', error);
      return 0;
    }
  }

  // ==================== MÉTODOS AUXILIARES ====================

  /**
   * Obtener datos del perfil
   */
  static async obtenerDatosPerfil(profileId) {
    const perfilRef = doc(db, 'childProfiles', profileId);
    const perfilDoc = await getDoc(perfilRef);
    return perfilDoc.exists() ? { ...perfilDoc.data(), id: profileId } : null;
  }

  /**
   * Obtener configuración de promoción para un nivel
   */
  static obtenerConfiguracionPromocion(nivelActual) {
    const configs = Object.values(this.CRITERIOS_PROMOCION);
    return configs.find(config => config.nivelActual === nivelActual);
  }

  /**
   * Obtener estadísticas recientes del niño
   */
  static async obtenerEstadisticasRecientes(profileId) {
    try {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - this.PERIODO_EVALUACION.dias);

      // Obtener actividades recientes
      const actividadesRef = collection(db, 'activitySessions');
      const q = query(
        actividadesRef,
        where('childProfileId', '==', profileId),
        where('timestamp', '>=', fechaLimite),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      const actividades = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calcular estadísticas
      const totalActividades = actividades.length;
      const actividadesExitosas = actividades.filter(act => act.completada && act.porcentaje >= 60).length;
      const puntosObtenidos = actividades.reduce((sum, act) => sum + (act.puntos || 0), 0);
      const precisonPromedio = totalActividades > 0 ? 
        actividades.reduce((sum, act) => sum + (act.porcentaje || 0), 0) / totalActividades : 0;

      return {
        totalActividades,
        actividadesExitosas,
        puntosObtenidos,
        precisonPromedio,
        primerActividad: totalActividades > 0 ? actividades[actividades.length - 1].timestamp.toDate() : null,
        ultimaActividad: totalActividades > 0 ? actividades[0].timestamp.toDate() : null
      };

    } catch (error) {
      console.error('Error obteniendo estadísticas recientes:', error);
      return {
        totalActividades: 0,
        actividadesExitosas: 0,
        puntosObtenidos: 0,
        precisonPromedio: 0
      };
    }
  }

  /**
   * Evaluar criterios específicos
   */
  static async evaluarCriterios(perfilData, estadisticasRecientes, criterios) {
    const evaluaciones = [];

    // Evaluar actividades completadas
    if (criterios.actividadesCompletadas) {
      const actual = perfilData.actividadesCompletadas || 0;
      evaluaciones.push({
        criterio: 'Actividades Completadas',
        requerido: criterios.actividadesCompletadas,
        actual,
        cumple: actual >= criterios.actividadesCompletadas,
        progreso: Math.min((actual / criterios.actividadesCompletadas) * 100, 100)
      });
    }

    // Evaluar puntos totales
    if (criterios.puntosTotales) {
      const actual = perfilData.puntosTotales || 0;
      evaluaciones.push({
        criterio: 'Puntos Totales',
        requerido: criterios.puntosTotales,
        actual,
        cumple: actual >= criterios.puntosTotales,
        progreso: Math.min((actual / criterios.puntosTotales) * 100, 100)
      });
    }

    // Evaluar precisión promedio
    if (criterios.precisonPromedio) {
      const actual = estadisticasRecientes.precisonPromedio;
      evaluaciones.push({
        criterio: 'Precisión Promedio',
        requerido: criterios.precisonPromedio,
        actual: Math.round(actual),
        cumple: actual >= criterios.precisonPromedio,
        progreso: Math.min((actual / criterios.precisonPromedio) * 100, 100)
      });
    }

    // Evaluar racha
    if (criterios.rachaMinima) {
      const actual = perfilData.racha || 0;
      evaluaciones.push({
        criterio: 'Racha de Días',
        requerido: criterios.rachaMinima,
        actual,
        cumple: actual >= criterios.rachaMinima,
        progreso: Math.min((actual / criterios.rachaMinima) * 100, 100)
      });
    }

    // Evaluar tiempo en nivel actual
    if (criterios.tiempoEnNivel) {
      const fechaAsignacion = perfilData.resultadosEvaluacion?.nivelAsignado?.fechaActualizacion?.toDate() || 
                             perfilData.fechaCreacion?.toDate() || 
                             new Date();
      const diasEnNivel = Math.floor((Date.now() - fechaAsignacion.getTime()) / (1000 * 60 * 60 * 24));
      
      evaluaciones.push({
        criterio: 'Tiempo en Nivel',
        requerido: criterios.tiempoEnNivel,
        actual: diasEnNivel,
        cumple: diasEnNivel >= criterios.tiempoEnNivel,
        progreso: Math.min((diasEnNivel / criterios.tiempoEnNivel) * 100, 100)
      });
    }

    // Evaluar actividades perfectas
    if (criterios.actividadesPerfectas) {
      const actual = perfilData.actividadesPerfectas || 0;
      evaluaciones.push({
        criterio: 'Actividades Perfectas',
        requerido: criterios.actividadesPerfectas,
        actual,
        cumple: actual >= criterios.actividadesPerfectas,
        progreso: Math.min((actual / criterios.actividadesPerfectas) * 100, 100)
      });
    }

    // Evaluar juegos completados
    if (criterios.juegosCompletados) {
      const actual = perfilData.juegosCompletados || 0;
      evaluaciones.push({
        criterio: 'Juegos Completados',
        requerido: criterios.juegosCompletados,
        actual,
        cumple: actual >= criterios.juegosCompletados,
        progreso: Math.min((actual / criterios.juegosCompletados) * 100, 100)
      });
    }

    // Evaluar logros obtenidos
    if (criterios.logrosObtenidos) {
      const actual = Object.keys(perfilData.logros || {}).length;
      evaluaciones.push({
        criterio: 'Logros Obtenidos',
        requerido: criterios.logrosObtenidos,
        actual,
        cumple: actual >= criterios.logrosObtenidos,
        progreso: Math.min((actual / criterios.logrosObtenidos) * 100, 100)
      });
    }

    return evaluaciones;
  }

  /**
   * Generar sugerencias basadas en criterios no cumplidos
   */
  static generarSugerencias(evaluacionCriterios) {
    const sugerencias = [];
    
    evaluacionCriterios.forEach(criterio => {
      if (!criterio.cumple) {
        switch (criterio.criterio) {
          case 'Actividades Completadas':
            sugerencias.push(`Completar ${criterio.requerido - criterio.actual} actividades más`);
            break;
          case 'Puntos Totales':
            sugerencias.push(`Ganar ${criterio.requerido - criterio.actual} puntos más`);
            break;
          case 'Precisión Promedio':
            sugerencias.push(`Mejorar precisión al ${criterio.requerido}% (actual: ${criterio.actual}%)`);
            break;
          case 'Racha de Días':
            sugerencias.push(`Mantener racha por ${criterio.requerido - criterio.actual} días más`);
            break;
          case 'Tiempo en Nivel':
            sugerencias.push(`Continuar practicando por ${criterio.requerido - criterio.actual} días más`);
            break;
          case 'Actividades Perfectas':
            sugerencias.push(`Completar ${criterio.requerido - criterio.actual} actividades perfectas más`);
            break;
          case 'Juegos Completados':
            sugerencias.push(`Completar ${criterio.requerido - criterio.actual} juegos más`);
            break;
          case 'Logros Obtenidos':
            sugerencias.push(`Obtener ${criterio.requerido - criterio.actual} logros más`);
            break;
          default:
            sugerencias.push(`Mejorar en ${criterio.criterio}`);
            break;
        }
      }
    });

    return sugerencias;
  }

  /**
   * Obtener historial de niveles
   */
  static async obtenerHistorialNiveles(profileId) {
    try {
      const perfilData = await this.obtenerDatosPerfil(profileId);
      return perfilData?.historialNiveles || [];
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      return [];
    }
  }

  /**
   * Notificar promoción
   */
  static async notificarPromocion(profileId, evaluacion) {
    try {
      // Mostrar toast de felicitación
      toast.success(
        `🎉 ¡Felicidades! Has sido promovido al nivel ${evaluacion.nivelSiguiente.toUpperCase()}`,
        { 
          duration: 5000,
          position: 'top-center'
        }
      );

      // Aquí podrías agregar más notificaciones:
      // - Email al tutor
      // - Notificación en la app
      // - Registro en sistema de notificaciones

      console.log(`🎉 Promoción notificada: ${evaluacion.nivelActual} → ${evaluacion.nivelSiguiente}`);

    } catch (error) {
      console.error('Error notificando promoción:', error);
    }
  }

  /**
   * Obtener perfiles activos (con actividad reciente)
   */
  static async obtenerPerfilesActivos() {
    // Esta función necesitaría implementarse según tu estructura
    // Por ahora devuelvo una implementación básica
    return [];
  }

  /**
   * Verificar si un niño está listo para promoción (uso directo en la UI)
   */
  static async verificarPromocionDisponible(profileId) {
    const evaluacion = await this.evaluarPromocion(profileId);
    return {
      disponible: evaluacion.puedePromoverse,
      evaluacion
    };
  }
}

export default SistemaPromocionNiveles;
