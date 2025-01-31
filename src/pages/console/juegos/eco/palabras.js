export const CATEGORIAS = {
  animales: [
    { id: 'a1', palabra: 'Perro', imagen: '🐶', sonido: 'perro.mp3' },
    { id: 'a2', palabra: 'Gato', imagen: '🐱', sonido: 'gato.mp3' },
    { id: 'a3', palabra: 'Conejo', imagen: '🐰', sonido: 'conejo.mp3' },
    { id: 'a4', palabra: 'Pájaro', imagen: '🦜', sonido: 'pajaro.mp3' },
    { id: 'a5', palabra: 'Pez', imagen: '🐠', sonido: 'pez.mp3' },
    { id: 'a6', palabra: 'Tortuga', imagen: '🐢', sonido: 'tortuga.mp3' }
  ],
  colores: [
    { id: 'c1', palabra: 'Rojo', imagen: '🔴', sonido: 'rojo.mp3' },
    { id: 'c2', palabra: 'Azul', imagen: '🔵', sonido: 'azul.mp3' },
    { id: 'c3', palabra: 'Verde', imagen: '🟢', sonido: 'verde.mp3' },
    { id: 'c4', palabra: 'Amarillo', imagen: '💛', sonido: 'amarillo.mp3' },
    { id: 'c5', palabra: 'Morado', imagen: '💜', sonido: 'morado.mp3' },
    { id: 'c6', palabra: 'Naranja', imagen: '🟠', sonido: 'naranja.mp3' }
  ],
  numeros: [
    { id: 'n1', palabra: 'Uno', imagen: '1️⃣', sonido: 'uno.mp3' },
    { id: 'n2', palabra: 'Dos', imagen: '2️⃣', sonido: 'dos.mp3' },
    { id: 'n3', palabra: 'Tres', imagen: '3️⃣', sonido: 'tres.mp3' },
    { id: 'n4', palabra: 'Cuatro', imagen: '4️⃣', sonido: 'cuatro.mp3' },
    { id: 'n5', palabra: 'Cinco', imagen: '5️⃣', sonido: 'cinco.mp3' },
    { id: 'n6', palabra: 'Seis', imagen: '6️⃣', sonido: 'seis.mp3' }
  ],
  frutas: [
    { id: 'f1', palabra: 'Manzana', imagen: '🍎', sonido: 'manzana.mp3' },
    { id: 'f2', palabra: 'Plátano', imagen: '🍌', sonido: 'platano.mp3' },
    { id: 'f3', palabra: 'Naranja', imagen: '🍊', sonido: 'naranja.mp3' },
    { id: 'f4', palabra: 'Uvas', imagen: '🍇', sonido: 'uvas.mp3' },
    { id: 'f5', palabra: 'Fresa', imagen: '🍓', sonido: 'fresa.mp3' },
    { id: 'f6', palabra: 'Sandía', imagen: '🍉', sonido: 'sandia.mp3' }
  ],
  familia: [
    { id: 'fa1', palabra: 'Mamá', imagen: '👩', sonido: 'mama.mp3' },
    { id: 'fa2', palabra: 'Papá', imagen: '👨', sonido: 'papa.mp3' },
    { id: 'fa3', palabra: 'Hermano', imagen: '👦', sonido: 'hermano.mp3' },
    { id: 'fa4', palabra: 'Hermana', imagen: '👧', sonido: 'hermana.mp3' },
    { id: 'fa5', palabra: 'Abuela', imagen: '👵', sonido: 'abuela.mp3' },
    { id: 'fa6', palabra: 'Abuelo', imagen: '👴', sonido: 'abuelo.mp3' }
  ],
  profesiones: [
    { id: 'p1', palabra: 'Doctor', imagen: '👨‍⚕️', sonido: 'doctor.mp3' },
    { id: 'p2', palabra: 'Profesor', imagen: '👨‍🏫', sonido: 'profesor.mp3' },
    { id: 'p3', palabra: 'Chef', imagen: '👨‍🍳', sonido: 'chef.mp3' },
    { id: 'p4', palabra: 'Bombero', imagen: '👨‍🚒', sonido: 'bombero.mp3' },
    { id: 'p5', palabra: 'Policía', imagen: '👮', sonido: 'policia.mp3' },
    { id: 'p6', palabra: 'Granjero', imagen: '👨‍🌾', sonido: 'granjero.mp3' }
  ],
  deportes: [
    { id: 'd1', palabra: 'Fútbol', imagen: '⚽', sonido: 'futbol.mp3' },
    { id: 'd2', palabra: 'Básquet', imagen: '🏀', sonido: 'basquet.mp3' },
    { id: 'd3', palabra: 'Tenis', imagen: '🎾', sonido: 'tenis.mp3' },
    { id: 'd4', palabra: 'Natación', imagen: '🏊', sonido: 'natacion.mp3' },
    { id: 'd5', palabra: 'Béisbol', imagen: '⚾', sonido: 'beisbol.mp3' },
    { id: 'd6', palabra: 'Voleibol', imagen: '🏐', sonido: 'voleibol.mp3' }
  ]
};

export const NIVELES_CONFIG = {
  basico: {
    numSecuencias: 5, // Número de secuencias para completar el nivel
    numElementos: 2,  // Elementos por secuencia
    tiempoMemorizar: null,  // Sin límite de tiempo en nivel básico
    tiempoVisualizacion: 2500, 
    puntosBase: 10,
    multiplicadorCombo: 1.2,
    maxCombo: 3,
    categorias: ['animales', 'colores'],
    descripcion: "Nivel Básico - Memoriza secuencias cortas a tu ritmo",
    instrucciones: "Observa y repite la secuencia en el mismo orden",
    intentosMaximos: 3
  },
  'básico-alto': {
    numSecuencias: 6,
    numElementos: 3,
    tiempoMemorizar: 10,
    tiempoVisualizacion: 2000,
    puntosBase: 15,
    multiplicadorCombo: 1.3,
    maxCombo: 4,
    categorias: ['animales', 'colores', 'numeros'],
    descripcion: "Nivel Básico Alto - ¡Más elementos, más desafío!",
    instrucciones: "Mantén la concentración y sigue el orden correcto",
    intentosMaximos: 3
  },
  intermedio: {
    numSecuencias: 7,
    numElementos: 4,
    tiempoMemorizar: 20,
    tiempoVisualizacion: 1500,
    puntosBase: 20,
    multiplicadorCombo: 1.4,
    maxCombo: 5,
    categorias: ['animales', 'colores', 'numeros', 'frutas', 'familia'],
    descripcion: "Nivel Intermedio - ¡Un verdadero reto para tu memoria!",
    instrucciones: "Mayor velocidad y más categorías. ¡Mantén el ritmo!",
    intentosMaximos: 3
  },
  avanzado: {
    numSecuencias: 8,
    numElementos: 6,
    tiempoMemorizar: 15,
    tiempoVisualizacion: 1500,
    puntosBase: 30,
    multiplicadorCombo: 1.5,
    maxCombo: 6,
    categorias: ['animales', 'colores', 'numeros', 'frutas', 'familia', 'profesiones', 'deportes'],
    descripcion: "Nivel Avanzado - ¡Pon a prueba tus habilidades!",
    instrucciones: "¡Máxima velocidad y todas las categorías! ¿Estás listo?",
    intentosMaximos: 3
  }
};
  
 
  
  // Configuración de efectos de sonido del juego
  export const SONIDOS = {
    acierto: 'success.mp3',
    error: 'error.mp3',
    nivel_completado: 'level-complete.mp3',
    juego_completado: 'game-complete.mp3',
    combo: 'combo.mp3'
  };
  
  // Configuración de animaciones y feedback visual
  export const ANIMACIONES = {
    duracionMostrar: {
      enter: 'animate-fade-in-up',
      exit: 'animate-fade-out-down',
      duration: 500
    },
    duracionOcultar: {
      enter: 'animate-fade-in',
      exit: 'animate-fade-out',
      duration: 300
    },
    secuencia: {
      appear: 'animate-bounce',
      success: 'animate-success',
      error: 'animate-shake',
      duration: 1000
    },
    combo: {
      show: 'animate-scale-up',
      hide: 'animate-scale-down',
      duration: 500
    }
  };
  
  // Configuración de recompensas y logros
  export const RECOMPENSAS = {
    logros: {
      primerNivel: {
        id: 'first_win',
        titulo: '¡Primera victoria!',
        descripcion: 'Completa tu primer nivel',
        puntos: 50,
        icono: '🎯'
      },
      sinErrores: {
        id: 'perfect',
        titulo: '¡Perfección!',
        descripcion: 'Completa un nivel sin errores',
        puntos: 100,
        icono: '⭐'
      },
      comboMax: {
        id: 'max_combo',
        titulo: '¡Combo Maestro!',
        descripcion: 'Alcanza el combo máximo',
        puntos: 150,
        icono: '🔥'
      },
      velocista: {
        id: 'speedster',
        titulo: '¡Velocista!',
        descripcion: 'Completa un nivel en tiempo récord',
        puntos: 75,
        icono: '⚡'
      }
    },
    bonificaciones: {
      tiempoExtra: {
        valor: 10,
        descripcion: 'Segundos extra por buen rendimiento'
      },
      sinErrores: {
        multiplicador: 1.5,
        descripcion: 'Multiplicador por nivel perfecto'
      },
      velocidad: {
        multiplicador: 1.2,
        descripcion: 'Multiplicador por velocidad'
      }
    }
  };