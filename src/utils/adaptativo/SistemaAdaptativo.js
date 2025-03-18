import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { 
    NIVELES_BASE, 
    PARAMETROS_ADAPTACION, 
    METRICAS, 
    TIPOS_ASISTENCIA, 
    RECOMENDACIONES 
} from './constantesAdaptativo';

class SistemaAdaptativo {
    constructor(perfilId) {
        this.perfilId = perfilId;
        this.estadisticasActuales = null;
        this.tasaAprendizaje = PARAMETROS_ADAPTACION.tasaAprendizaje;
        this.umbralRendimiento = PARAMETROS_ADAPTACION.umbralRendimiento;
    }

    // Inicializar sistema con datos del perfil
    async inicializar() {
        const perfilRef = doc(db, 'childProfiles', this.perfilId);
        const perfilSnap = await getDoc(perfilRef);
        
        if (perfilSnap.exists()) {
            this.estadisticasActuales = perfilSnap.data().estadisticasAdaptativas || {
                nivelActual: 'basico',
                historalRendimiento: [],
                nivelesHabilidad: {
                    atencion: 0,
                    memoria: 0,
                    velocidad: 0,
                    precision: 0
                },
                metricasAdaptacion: {
                    tasaExito: 0,
                    tiempoPromedioRespuesta: 0,
                    puntuacionConsistencia: 0,
                    nivelDesafio: 0
                }
            };
        }
        return this.estadisticasActuales;
    }

    // Analizar rendimiento en tiempo real
    analizarRendimiento(sesionJuego) {
        const {
            respuestasCorrectas,
            intentosTotales,
            tiempoRespuesta,
            precisionPatrones,
            tasaCompletado
        } = sesionJuego;

        // Calcular métricas clave
        const tasaExito = respuestasCorrectas / intentosTotales;
        const tiempoNormalizado = this.normalizarTiempoRespuesta(tiempoRespuesta);
        const puntuacionConsistencia = this.calcularConsistencia(precisionPatrones);
        
        // Actualizar métricas de adaptación
        this.estadisticasActuales.metricasAdaptacion = {
            tasaExito,
            tiempoPromedioRespuesta: tiempoNormalizado,
            puntuacionConsistencia,
            nivelDesafio: this.calcularNivelDesafio(tasaExito, tiempoNormalizado)
        };

        return this.determinarAjustes();
    }

    // Determinar ajustes necesarios
    determinarAjustes() {
        const ajustes = {
            dificultad: this.calcularAjusteDificultad(),
            nivelApoyo: this.calcularNivelApoyo(),
            recomendaciones: this.generarRecomendaciones()
        };

        // Ajustar parámetros específicos del juego
        const parametrosJuego = {
            limiteTiempo: this.ajustarLimiteTiempo(),
            cantidadElementos: this.ajustarCantidadElementos(),
            nivelAsistencia: this.determinarNivelAsistencia()
        };

        return { ajustes, parametrosJuego };
    }

    // Calcular ajuste de dificultad basado en rendimiento
    calcularAjusteDificultad() {
        const { tasaExito, puntuacionConsistencia } = this.estadisticasActuales.metricasAdaptacion;
        const nivelActual = this.estadisticasActuales.nivelActual;
        const nivelesDisponibles = Object.keys(NIVELES_BASE);
        const indiceNivelActual = nivelesDisponibles.indexOf(nivelActual);
        
        if (tasaExito > METRICAS.umbrales.mejora && 
            puntuacionConsistencia > METRICAS.umbrales.consistencia) {
            // Considerar subida de nivel
            return indiceNivelActual < nivelesDisponibles.length - 1 ? 
                   nivelesDisponibles[indiceNivelActual + 1] : 
                   nivelActual;
        } else if (tasaExito < METRICAS.umbrales.descenso || 
                   puntuacionConsistencia < METRICAS.umbrales.consistencia / 2) {
            // Considerar bajada de nivel
            return indiceNivelActual > 0 ? 
                   nivelesDisponibles[indiceNivelActual - 1] : 
                   nivelActual;
        }
        
        return nivelActual;
    }

    // Ajustar límite de tiempo basado en velocidad de respuesta
    ajustarLimiteTiempo() {
        const { tiempoPromedioRespuesta, tasaExito } = this.estadisticasActuales.metricasAdaptacion;
        const tiempoBase = PARAMETROS_ADAPTACION.tiempoBaseRespuesta[this.estadisticasActuales.nivelActual];
        
        let tiempoAjustado = tiempoBase;
        if (tasaExito > METRICAS.umbrales.mejora) {
            tiempoAjustado *= 0.9; // Reducir tiempo para aumentar desafío
        } else if (tasaExito < METRICAS.umbrales.descenso) {
            tiempoAjustado *= 1.2; // Aumentar tiempo para dar más apoyo
        }
        
        return Math.max(tiempoAjustado, PARAMETROS_ADAPTACION.tiempoMinimo);
    }

    // Calcular nivel de apoyo
    calcularNivelApoyo() {
        const { tasaExito, puntuacionConsistencia } = this.estadisticasActuales.metricasAdaptacion;
        
        if (tasaExito < METRICAS.umbrales.descenso || 
            puntuacionConsistencia < METRICAS.umbrales.consistencia / 2) {
            return TIPOS_ASISTENCIA.alto;
        } else if (tasaExito < METRICAS.umbrales.mejora || 
                   puntuacionConsistencia < METRICAS.umbrales.consistencia) {
            return TIPOS_ASISTENCIA.medio;
        } else {
            return TIPOS_ASISTENCIA.bajo;
        }
    }

    // Ajustar cantidad de elementos basado en nivel de habilidad
    ajustarCantidadElementos() {
        const { nivelActual } = this.estadisticasActuales;
        const baseElementos = {
            'basico': 4,
            'basico-alto': 6,
            'intermedio': 8,
            'avanzado': 12
        };

        const { tasaExito, puntuacionConsistencia } = this.estadisticasActuales.metricasAdaptacion;
        let ajuste = 0;

        if (tasaExito > 0.85 && puntuacionConsistencia > 0.8) {
            ajuste = 2;
        } else if (tasaExito < 0.4 || puntuacionConsistencia < 0.3) {
            ajuste = -2;
        }

        return Math.max(4, baseElementos[nivelActual] + ajuste);
    }

    // Determinar nivel de asistencia
    determinarNivelAsistencia() {
        const { tasaExito, puntuacionConsistencia } = this.estadisticasActuales.metricasAdaptacion;
        
        if (tasaExito < METRICAS.umbrales.descenso || 
            puntuacionConsistencia < METRICAS.umbrales.consistencia / 2) {
            return TIPOS_ASISTENCIA.alto;
        } else if (tasaExito < METRICAS.umbrales.mejora || 
                   puntuacionConsistencia < METRICAS.umbrales.consistencia) {
            return TIPOS_ASISTENCIA.medio;
        } else {
            return TIPOS_ASISTENCIA.bajo;
        }
    }

    // Generar recomendaciones personalizadas
    generarRecomendaciones() {
        const { nivelesHabilidad } = this.estadisticasActuales;
        const recomendaciones = [];

        Object.entries(nivelesHabilidad).forEach(([habilidad, nivel]) => {
            if (nivel < METRICAS.umbrales.mejora) {
                recomendaciones.push({
                    habilidad,
                    recomendacion: this.obtenerRecomendacionHabilidad(habilidad, nivel),
                    prioridad: this.calcularPrioridad(nivel)
                });
            }
        });

        return recomendaciones.sort((a, b) => b.prioridad - a.prioridad);
    }

    // Actualizar estadísticas en la base de datos
    async actualizarEstadisticas() {
        try {
            const perfilRef = doc(db, 'childProfiles', this.perfilId);
            await updateDoc(perfilRef, {
                estadisticasAdaptativas: this.estadisticasActuales
            });
            return true;
        } catch (error) {
            console.error('Error actualizando estadísticas adaptativas:', error);
            return false;
        }
    }

    // Utilidades auxiliares
    normalizarTiempoRespuesta(tiempo) {
        const tiempoBase = PARAMETROS_ADAPTACION.tiempoBaseRespuesta[this.estadisticasActuales.nivelActual];
        return Math.min(Math.max(tiempo / tiempoBase, 0), 1);
    }

    calcularConsistencia(patrones) {
        if (!patrones || patrones.length === 0) return 0;
        return patrones.reduce((acc, val) => acc + val, 0) / patrones.length;
    }

    calcularNivelDesafio(tasaExito, tiempoNormalizado) {
        return (tasaExito * METRICAS.pesos.precision + 
                (1 - tiempoNormalizado) * METRICAS.pesos.velocidad);
    }

    obtenerRecomendacionHabilidad(habilidad, nivel) {
        const nivelRecomendacion = nivel < 0.4 ? 'basico' : 
                                  nivel < 0.7 ? 'intermedio' : 'avanzado';
        return RECOMENDACIONES[habilidad][nivelRecomendacion];
    }

    calcularPrioridad(nivel) {
        return (1 - nivel) * 100;
    }
}

export default SistemaAdaptativo;