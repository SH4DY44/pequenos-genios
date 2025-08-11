import { useState, useEffect, useCallback } from 'react';
import { SistemaPromocionNiveles } from '../utils/nivelesProgresion/SistemaPromocionNiveles';
import { toast } from 'react-toastify';

/**
 * Hook personalizado para manejar la promoción automática de niveles
 * @param {string} profileId - ID del perfil del niño
 * @param {object} perfilNino - Datos actuales del perfil del niño
 * @returns {object} - Estado y funciones para manejar promociones
 */
export function usePromocionNiveles(profileId, perfilNino) {
  const [evaluacionActual, setEvaluacionActual] = useState(null);
  const [cargandoEvaluacion, setCargandoEvaluacion] = useState(false);
  const [promocionDisponible, setPromocionDisponible] = useState(false);
  const [ultimaVerificacion, setUltimaVerificacion] = useState(null);

  // Evaluar promoción
  const evaluarPromocion = useCallback(async () => {
    if (!profileId || cargandoEvaluacion) return;

    setCargandoEvaluacion(true);
    try {
      const evaluacion = await SistemaPromocionNiveles.evaluarPromocion(profileId);
      setEvaluacionActual(evaluacion);
      setPromocionDisponible(evaluacion.puedePromoverse);
      setUltimaVerificacion(new Date());
      
      return evaluacion;
    } catch (error) {
      console.error('Error evaluando promoción:', error);
      return null;
    } finally {
      setCargandoEvaluacion(false);
    }
  }, [profileId, cargandoEvaluacion]);

  // Promover nivel
  const promoverNivel = useCallback(async () => {
    if (!profileId || !evaluacionActual?.puedePromoverse) return false;

    try {
      const exito = await SistemaPromocionNiveles.promoverNivel(profileId, evaluacionActual);
      
      if (exito) {
        // Actualizar estado local
        setPromocionDisponible(false);
        setEvaluacionActual(null);
        
        // Mostrar notificación de éxito
        toast.success(
          `🎉 ¡Nivel actualizado a ${evaluacionActual.nivelSiguiente.toUpperCase()}!`,
          { duration: 5000 }
        );

        // Recargar evaluación después de promoción
        setTimeout(() => {
          evaluarPromocion();
        }, 2000);
      }
      
      return exito;
    } catch (error) {
      console.error('Error promoviendo nivel:', error);
      toast.error('Error al actualizar el nivel');
      return false;
    }
  }, [profileId, evaluacionActual, evaluarPromocion]);

  // Efecto para limpiar estado cuando cambia el profileId
  useEffect(() => {
    if (profileId) {
      // Limpiar estado anterior cuando cambia el profileId
      setEvaluacionActual(null);
      setPromocionDisponible(false);
      setUltimaVerificacion(null);
      setCargandoEvaluacion(false);
    }
  }, [profileId]);

  // Verificar automáticamente cada vez que cambian los datos del perfil
  useEffect(() => {
    if (profileId && perfilNino) {
      // Verificar si el nivel del perfil cambió desde la última evaluación
      const nivelActualPerfil = perfilNino?.resultadosEvaluacion?.nivelAsignado?.nivel || 'básico';
      const nivelUltimaEvaluacion = evaluacionActual?.nivelActual || '';
      const nivelCambio = nivelActualPerfil !== nivelUltimaEvaluacion;
      
      // Verificar solo si han pasado al menos 5 minutos desde la última verificación
      // O si el nivel cambió (siempre reevaluar en este caso)
      const ahora = new Date();
      const tiempoEsperaCompleto = (!ultimaVerificacion || 
          (ahora - ultimaVerificacion) > 5 * 60 * 1000); // 5 minutos
      
      if (tiempoEsperaCompleto || nivelCambio) {
        console.log('🎓 Iniciando evaluación de promoción:', {
          profileId,
          nivelCambio,
          tiempoEsperaCompleto,
          nivelActualPerfil,
          nivelUltimaEvaluacion
        });
        
        // Delay para evitar muchas evaluaciones seguidas
        const timer = setTimeout(() => {
          evaluarPromocion();
        }, 1000);

        return () => clearTimeout(timer);
      }
    }
  }, [profileId, perfilNino, ultimaVerificacion, evaluacionActual?.nivelActual, evaluarPromocion]);

  // Efecto de limpieza cuando se desmonta el componente
  useEffect(() => {
    return () => {
      // Limpiar estado al desmontar
      setEvaluacionActual(null);
      setPromocionDisponible(false);
      setUltimaVerificacion(null);
      setCargandoEvaluacion(false);
    };
  }, []);

  // Calcular progreso hacia el siguiente nivel
  const calcularProgresoHaciaSiguienteNivel = useCallback(() => {
    if (!evaluacionActual?.evaluacionCriterios) return 0;
    
    const cumplidos = evaluacionActual.evaluacionCriterios.filter(c => c.cumple).length;
    const total = evaluacionActual.evaluacionCriterios.length;
    
    return Math.round((cumplidos / total) * 100);
  }, [evaluacionActual]);

  // Obtener criterio más próximo a cumplir
  const obtenerSiguienteCriterio = useCallback(() => {
    if (!evaluacionActual?.evaluacionCriterios) return null;
    
    // Buscar el criterio no cumplido con mayor progreso
    const criteriosNoCumplidos = evaluacionActual.evaluacionCriterios
      .filter(c => !c.cumple)
      .sort((a, b) => b.progreso - a.progreso);
    
    return criteriosNoCumplidos[0] || null;
  }, [evaluacionActual]);

  return {
    // Estado
    evaluacionActual,
    promocionDisponible,
    cargandoEvaluacion,
    ultimaVerificacion,
    
    // Funciones
    evaluarPromocion,
    promoverNivel,
    calcularProgresoHaciaSiguienteNivel,
    obtenerSiguienteCriterio,
    
    // Datos calculados
    nivelActual: evaluacionActual?.nivelActual || 'básico',
    nivelSiguiente: evaluacionActual?.nivelSiguiente || null,
    porcentajeCumplimiento: evaluacionActual?.porcentajeCumplimiento || 0,
    criteriosCumplidos: evaluacionActual?.evaluacionCriterios?.filter(c => c.cumple).length || 0,
    totalCriterios: evaluacionActual?.evaluacionCriterios?.length || 0,
    sugerencias: evaluacionActual?.sugerencias || []
  };
}
