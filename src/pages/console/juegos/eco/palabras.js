// Configuración de niveles del juego
export const NIVELES_CONFIG = {
    basico: {
      numPalabras: 2,
      tiempoMemorizar: null, // Sin límite de tiempo
      tiempoMostrarPalabra: 2000, // 2 segundos por palabra
      puntosPorAcierto: 10,
      multiplicadorCombo: 1.2,
      maxCombo: 3,
      categorias: ['animales', 'colores'],
      descripcion: "Nivel Básico - Repite la secuencia a tu ritmo",
      instrucciones: "Observa y repite las palabras en el mismo orden"
    },
    'básico-alto': {
      numPalabras: 3,
      tiempoMemorizar:10,
      tiempoMostrarPalabra: 1800, // 1.8 segundos por palabra
      puntosPorAcierto: 15,
      multiplicadorCombo: 1.3,
      maxCombo: 4,
      categorias: ['animales', 'colores', 'numeros'],
      descripcion: "Nivel Básico Alto - ¡Más palabras, más diversión!",
      instrucciones: "¡Ahora con más palabras! Mantén el orden correcto"
    },
    intermedio: {
      numPalabras: 4,
      tiempoMemorizar: 20,
      tiempoMostrarPalabra: 1500, // 1.5 segundos por palabra
      puntosPorAcierto: 20,
      multiplicadorCombo: 1.4,
      maxCombo: 5,
      categorias: ['animales', 'colores', 'numeros', 'frutas', 'familia'],
      descripcion: "Nivel Intermedio - ¡Un verdadero reto!",
      instrucciones: "Mayor velocidad y más categorías. ¡Mantén la concentración!"
    },
    avanzado: {
      numPalabras: 6,
      tiempoMemorizar: 15,
      tiempoMostrarPalabra: 1200, // 1.2 segundos por palabra
      puntosPorAcierto: 30,
      multiplicadorCombo: 1.5,
      maxCombo: 6,
      categorias: ['animales', 'colores', 'numeros', 'frutas', 'familia', 'profesiones', 'deportes'],
      descripcion: "Nivel Avanzado - ¡Demuestra tu memoria!",
      instrucciones: "¡Máxima velocidad y todas las categorías! ¿Estás listo?"
    }
  };
  
  // Categorías de palabras con sus elementos
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
    duracionMostrar: 500, // Duración de la animación al mostrar carta
    duracionOcultar: 300, // Duración de la animación al ocultar carta
    duracionCelebrar: 1000, // Duración de la animación de celebración
    claseAcierto: 'animate-success',
    claseError: 'animate-error',
    claseCombo: 'animate-combo'
  };
  
  // Configuración de recompensas y logros
  export const RECOMPENSAS = {
    logros: {
      primerNivel: { puntos: 50, titulo: '¡Primera victoria!' },
      sinErrores: { puntos: 100, titulo: '¡Perfección!' },
      comboMax: { puntos: 150, titulo: '¡Combo Maestro!' },
      rapidez: { puntos: 75, titulo: '¡Velocista!' }
    },
    bonificaciones: {
      tiempoExtra: 10,
      sinErrores: 1.5, // Multiplicador por no cometer errores
      velocidad: 1.2 // Multiplicador por completar rápido
    }
  };