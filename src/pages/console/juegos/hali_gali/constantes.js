// Frutas disponibles para el juego
export const FRUTAS = {
    manzana: { id: 'f1', nombre: 'Manzana', emoji: '🍎' },
    platano: { id: 'f2', nombre: 'Plátano', emoji: '🍌' },
    naranja: { id: 'f3', nombre: 'Naranja', emoji: '🍊' },
    uva: { id: 'f4', nombre: 'Uva', emoji: '🍇' },
    fresa: { id: 'f5', nombre: 'Fresa', emoji: '🍓' },
    sandia: { id: 'f6', nombre: 'Sandía', emoji: '🍉' },
    pera: { id: 'f7', nombre: 'Pera', emoji: '🍐' }
};

// Configuración de niveles
export const CONFIGURACION_NIVELES = {
    basico: {
        nombre: 'básico',
        frutasDisponibles: 3,        
        velocidad: 2000,             
        tiempoRespuesta: 3000,      
        cantidadObjetivo: 5,         
        puntosPorAcierto: 10,
        penalizacionError: 2,
        descripcion: "Nivel Básico - Identifica las frutas a un ritmo tranquilo",
        ayudaVisual: true,          
        contadorVisible: true,       
        vibracionFeedback: true,     
        instrucciones: "Toca el timbre cuando veas 5 frutas iguales"
    },
    "basico-alto": {
        nombre: 'básico-alto',
        frutasDisponibles: 4,        
        velocidad: 1500,             
        tiempoRespuesta: 2500,       
        cantidadObjetivo: 5,
        puntosPorAcierto: 15,
        penalizacionError: 3,
        descripcion: "Nivel Básico Alto - ¡Un poco más rápido!",
        ayudaVisual: true,
        contadorVisible: true,
        vibracionFeedback: true,
        instrucciones: "¡Mantén la atención! Toca cuando veas 5 frutas iguales"
    },
    intermedio: {
        nombre: 'intermedio',
        frutasDisponibles: 5,        // 5 tipos de frutas
        velocidad: 1000,             // 1 segundo entre frutas
        tiempoRespuesta: 2000,       // 2 segundos para responder
        cantidadObjetivo: 5,
        puntosPorAcierto: 20,
        penalizacionError: 5,
        descripcion: "Nivel Intermedio - ¡Aumenta la velocidad!",
        ayudaVisual: false,          // Sin ayudas visuales
        contadorVisible: true,
        vibracionFeedback: true,
        instrucciones: "Mantén el ritmo y encuentra las 5 frutas iguales"
    },
    avanzado: {
        nombre: 'avanzado',
        frutasDisponibles: 7,        // 7 tipos de frutas
        velocidad: 500,              // 0.5 segundos entre frutas
        tiempoRespuesta: 1500,       // 1.5 segundos para responder
        cantidadObjetivo: 5,
        puntosPorAcierto: 30,
        penalizacionError: 8,
        descripcion: "Nivel Avanzado - ¡Máxima velocidad!",
        ayudaVisual: false,
        contadorVisible: false,      // Sin contador visible
        vibracionFeedback: true,
        instrucciones: "¡Demuestra tu rapidez y precisión!"
    }
};

// Efectos de sonido del juego
export const SONIDOS = {
    timbre: 'bell.mp3',
    acierto: 'success.mp3',
    error: 'error.mp3',
    nuevaFruta: 'pop.mp3',
    victoria: 'win.mp3',
    derrota: 'lose.mp3'
};

// Sistema de puntuación y combos
export const SISTEMA_PUNTOS = {
    comboBase: 1.5,          // Multiplicador base para combos
    comboMax: 4,             // Multiplicador máximo
    bonusPrecision: 1.2,     // Bonus por precisión alta
    bonusVelocidad: 1.3,     // Bonus por respuesta rápida
    puntosPerfecto: 50       // Puntos extra por ronda perfecta
};