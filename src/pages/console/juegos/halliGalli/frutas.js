export const NIVELES_CONFIG = {
    basico:{
        numFrutas: 3, // Corregido de numfrutas a numFrutas
        tiempoEntreFrutas: 2000,
        duracionJuego: 60,
        puntosPorAcierto: 10,
        penalizacionError: -5,
        mostrarContador: true,
        descripcion: "Nivel Básico, un nivel con pocas frutas."
    }
    ,
    "basico-alto": {
        numFrutas: 4,
        tiempoEntreFrutas: 1500,
        duracionJuego: 90,
        puntosPorAcierto: 15,
        penalizacionError: -8,
        mostrarContador: true,
        descripcion: "Nivel Básico Alto, aumenta la dificultad con más frutas y menor tiempo."
    },
    intermedio: {
        numFrutas: 6,
        tiempoEntreFrutas: 1000,
        duracionJuego: 90,
        puntosPorAcierto: 20,
        penalizacionError: -10,
        mostrarContador: true,
        descripcion: "Nivel Intermedio, mayor desafío con más frutas y tiempo de juego."
    },
    avanzado: {
        numFrutas: 7,
        tiempoEntreFrutas:400,
        duracionJuego: 120,
        puntosPorAcierto: 25,
        penalizacionError: -15,
        mostrarContador: true,
        descripcion: "Nivel Avanzado, máxima dificultad con todas las frutas y mayor velocidad."
    }
};

export const FRUTAS = [
    { id: 'f1', nombre: 'Manzana', imagen: '🍎', color: 'text-red-500' },
    { id: 'f2', nombre: 'Plátano', imagen: '🍌', color: 'text-yellow-500' },
    { id: 'f3', nombre: 'Naranja', imagen: '🍊', color: 'text-orange-500' },
    { id: 'f4', nombre: 'Uvas', imagen: '🍇', color: 'text-purple-500' },
    { id: 'f5', nombre: 'Fresa', imagen: '🍓', color: 'text-pink-600' },
    { id: 'f6', nombre: 'Sandía', imagen: '🍉', color: 'text-green-500' },
    { id: 'f7', nombre: 'Piña', imagen: '🍍', color: 'text-yellow-600' }  
];

export const ANIMACIONES = {
    entradaFruta: 'animate-bounce',
    timbrePresionado: 'animate-ping',
    acierto: 'animate-success',
    error: 'animate-error'
};