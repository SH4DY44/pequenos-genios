// Tipos para el sistema adaptativo
export const TiposNivel = {
    BASICO: 'basico',
    BASICO_ALTO: 'basico-alto',
    INTERMEDIO: 'intermedio',
    AVANZADO: 'avanzado'
};

// Tipos de métricas que se pueden medir
export const TiposMetrica = {
    PRECISION: 'precision',
    VELOCIDAD: 'velocidad',
    CONSISTENCIA: 'consistencia',
    COMPLEJIDAD: 'complejidad'
};

// Tipos de asistencia disponibles
export const TiposAsistencia = {
    ALTO: 'alto',
    MEDIO: 'medio',
    BAJO: 'bajo'
};

// Tipos de habilidades que se evalúan
export const TiposHabilidad = {
    ATENCION: 'atencion',
    MEMORIA: 'memoria',
    VELOCIDAD: 'velocidad',
    PRECISION: 'precision'
};

// Estructura de una sesión de juego
export const EstructuraSesion = {
    respuestasCorrectas: 0,
    intentosTotales: 0,
    tiempoRespuesta: 0,
    precisionPatrones: [],
    tasaCompletado: 0
};

// Estructura de métricas de adaptación
export const EstructuraMetricas = {
    tasaExito: 0,
    tiempoPromedioRespuesta: 0,
    puntuacionConsistencia: 0,
    nivelDesafio: 0
};

// Estructura de estadísticas adaptativas
export const EstructuraEstadisticas = {
    nivelActual: TiposNivel.BASICO,
    historialRendimiento: [],
    nivelesHabilidad: {
        [TiposHabilidad.ATENCION]: 0,
        [TiposHabilidad.MEMORIA]: 0,
        [TiposHabilidad.VELOCIDAD]: 0,
        [TiposHabilidad.PRECISION]: 0
    },
    metricasAdaptacion: EstructuraMetricas
};

// Estructura de ajustes del sistema
export const EstructuraAjustes = {
    dificultad: TiposNivel.BASICO,
    nivelApoyo: TiposAsistencia.MEDIO,
    recomendaciones: []
};

// Estructura de parámetros de juego
export const EstructuraParametrosJuego = {
    limiteTiempo: 0,
    cantidadElementos: 0,
    nivelAsistencia: TiposAsistencia.MEDIO
};