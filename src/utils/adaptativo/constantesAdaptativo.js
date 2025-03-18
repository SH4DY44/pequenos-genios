// Configuración de niveles base
export const NIVELES_BASE = {
    basico: {
        nombre: 'básico',
        rangoMin: 0,
        rangoMax: 0.4,
        descripcion: 'Nivel básico para comenzar'
    },
    basicoAlto: {
        nombre: 'básico-alto',
        rangoMin: 0.4,
        rangoMax: 0.6,
        descripcion: 'Nivel básico con mayor desafío'
    },
    intermedio: {
        nombre: 'intermedio',
        rangoMin: 0.6,
        rangoMax: 0.8,
        descripcion: 'Nivel intermedio con desafíos moderados'
    },
    avanzado: {
        nombre: 'avanzado',
        rangoMin: 0.8,
        rangoMax: 1,
        descripcion: 'Nivel avanzado con máximo desafío'
    }
};

// Parámetros de adaptación
export const PARAMETROS_ADAPTACION = {
    tasaAprendizaje: 0.1,
    umbralRendimiento: 0.7,
    tiempoBaseRespuesta: {
        basico: 5000,      // 5 segundos
        basicoAlto: 4000,  // 4 segundos
        intermedio: 3000,  // 3 segundos
        avanzado: 2000     // 2 segundos
    },
    tiempoMinimo: 1500     // 1.5 segundos como mínimo absoluto
};

// Añadimos las constantes que faltaban
export const METRICAS = {
    pesos: {
        precision: 0.3,    // Peso para la precisión en respuestas
        velocidad: 0.2,    // Peso para la velocidad de respuesta
        consistencia: 0.3, // Peso para la consistencia en el rendimiento
        complejidad: 0.2   // Peso para el manejo de complejidad
    },
    umbrales: {
        mejora: 0.8,       // Umbral para considerar mejora de nivel
        descenso: 0.4,     // Umbral para considerar descenso de nivel
        consistencia: 0.7   // Umbral para evaluar consistencia
    }
};

// Tipos de asistencia
export const TIPOS_ASISTENCIA = {
    alto: {
        nombre: 'alto',
        descripcion: 'Mayor ayuda visual y auditiva',
        pistas: true,
        ayudasVisuales: true,
        recordatorios: true
    },
    medio: {
        nombre: 'medio',
        descripcion: 'Ayuda moderada',
        pistas: true,
        ayudasVisuales: true,
        recordatorios: false
    },
    bajo: {
        nombre: 'bajo',
        descripcion: 'Mínima asistencia',
        pistas: false,
        ayudasVisuales: true,
        recordatorios: false
    }
};

// Recomendaciones por habilidad
export const RECOMENDACIONES = {
    atencion: {
        basico: 'Ejercicios simples de concentración',
        intermedio: 'Actividades de atención dividida',
        avanzado: 'Ejercicios complejos de atención sostenida'
    },
    memoria: {
        basico: 'Juegos de memoria con pocos elementos',
        intermedio: 'Secuencias y patrones moderados',
        avanzado: 'Ejercicios avanzados de memoria de trabajo'
    },
    velocidad: {
        basico: 'Actividades sin límite de tiempo',
        intermedio: 'Ejercicios con tiempo flexible',
        avanzado: 'Desafíos cronometrados'
    },
    precision: {
        basico: 'Tareas simples de precisión',
        intermedio: 'Ejercicios de precisión moderada',
        avanzado: 'Actividades de alta precisión'
    }
};