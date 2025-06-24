import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { toast } from 'react-toastify';
import RewardsService from '../../../services/rewardsService';
// TutorialModal se define al final del archivo como componente local

// ✅ CORREGIDO: Configuración usando llaves sin acentos para consistencia
const NIVELES_CONFIG = {
  'basico': {
    formasActivas: ['circulo', 'cuadrado', 'triangulo'],
    formasPorRonda: 5,
    totalRondas: 3,
    tiempoLimite: null, // Sin límite de tiempo
    puntosBase: 10, // Puntos base según especificación
    descripcion: "Nivel básico - Arrastra las formas"
  },
  'basico-alto': {
    formasActivas: ['circulo', 'cuadrado', 'triangulo', 'rectangulo'],
    formasPorRonda: 6,
    totalRondas: 4,
    tiempoLimite: 240, // 4 minutos
    puntosBase: 15, // Puntos incrementados para nivel básico-alto
    descripcion: "Nivel básico-alto - Más formas y tiempo limitado"
  },
  'intermedio': {
    formasActivas: ['circulo', 'cuadrado', 'triangulo', 'rectangulo', 'pentagono'],
    formasPorRonda: 8,
    totalRondas: 5,
    tiempoLimite: 180, // 3 minutos
    puntosBase: 20, // Puntos nivel intermedio
    descripcion: "Nivel intermedio - Mayor desafío"
  },
  'avanzado': {
    formasActivas: ['circulo', 'cuadrado', 'triangulo', 'rectangulo', 'pentagono', 'estrella'],
    formasPorRonda: 10,
    totalRondas: 6,
    tiempoLimite: 120, // 2 minutos
    puntosBase: 25, // Puntos nivel avanzado
    descripcion: "Nivel avanzado - Máximo desafío"
  }
};

// Definición de formas con SVG
const FORMAS = [
  {
    id: 'circulo',
    nombre: 'Círculo',
    color: '#FF6B6B',
    svg: <circle cx="50" cy="50" r="35" fill="currentColor" />
  },
  {
    id: 'cuadrado',
    nombre: 'Cuadrado',
    color: '#4ECDC4',
    svg: <rect x="15" y="15" width="70" height="70" fill="currentColor" />
  },
  {
    id: 'triangulo',
    nombre: 'Triángulo',
    color: '#45B7D1',
    svg: <polygon points="50,15 15,85 85,85" fill="currentColor" />
  },
  {
    id: 'rectangulo',
    nombre: 'Rectángulo',
    color: '#96CEB4',
    svg: <rect x="10" y="25" width="80" height="50" fill="currentColor" />
  },
  {
    id: 'pentagono',
    nombre: 'Pentágono',
    color: '#FFEAA7',
    svg: <polygon points="50,15 85,35 72,75 28,75 15,35" fill="currentColor" />
  },
  {
    id: 'estrella',
    nombre: 'Estrella',
    color: '#FD79A8',
    svg: <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="currentColor" />
  }
];

function ClasificacionFormas({ actividad, perfilNino, onComplete, onClose }) {
  const navigate = useNavigate();
  
  // Estados del juego
  const [formasParaClasificar, setFormasParaClasificar] = useState([]);
  const [formasClasificadas, setFormasClasificadas] = useState({});
  const [formaArrastrada, setFormaArrastrada] = useState(null);
  const [puntuacion, setPuntuacion] = useState(0);
  const [rondaActual, setRondaActual] = useState(1);
  const [tiempoRestante, setTiempoRestante] = useState(null);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [tiempoInicio, setTiempoInicio] = useState(null);
  
  // ✅ CORREGIDO: Mapeo correcto de niveles
  const nivelActual = (() => {
    const nivelPerfil = perfilNino?.resultadosEvaluacion?.nivelAsignado?.nivel || 'básico';
    const NIVEL_MAPPING = {
      'básico': 'basico',
      'básico-alto': 'basico-alto',
      'intermedio': 'intermedio',
      'avanzado': 'avanzado'
    };
    return NIVEL_MAPPING[nivelPerfil] || 'basico';
  })();

  const config = NIVELES_CONFIG[nivelActual];
  const formasActivas = config.formasActivas.map(id => FORMAS.find(f => f.id === id));

  // Inicializar juego
  useEffect(() => {
    if (!showTutorial) {
      iniciarNuevaRonda();
      setTiempoInicio(Date.now());
      if (config.tiempoLimite) {
        setTiempoRestante(config.tiempoLimite);
      }
    }
  }, [showTutorial]);

  // Timer del juego
  useEffect(() => {
    let interval = null;
    if (tiempoRestante > 0 && !juegoTerminado) {
      interval = setInterval(() => {
        setTiempoRestante(tiempo => {
          if (tiempo <= 1) {
            finalizarJuego('Tiempo agotado');
            return 0;
          }
          return tiempo - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [tiempoRestante, juegoTerminado]);

  const generarFormasAleatorias = () => {
    const formas = [];
    for (let i = 0; i < config.formasPorRonda; i++) {
      const formaAleatoria = formasActivas[Math.floor(Math.random() * formasActivas.length)];
      formas.push({
        ...formaAleatoria,
        uniqueId: `${formaAleatoria.id}-${i}-${Date.now()}`,
        posX: Math.random() * 250 + 'px',
        posY: Math.random() * 200 + 'px'
      });
    }
    return formas;
  };

  const iniciarNuevaRonda = () => {
    const nuevasFormas = generarFormasAleatorias();
    setFormasParaClasificar(nuevasFormas);
    setFormasClasificadas({});
    setFeedback('');
  };

  const manejarDragStart = (e, forma) => {
    setFormaArrastrada(forma);
    e.dataTransfer.effectAllowed = 'move';
  };

  const manejarDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const manejarDrop = (e, tipoContenedor) => {
    e.preventDefault();
    
    if (!formaArrastrada) return;

    if (formaArrastrada.id === tipoContenedor) {
      // Clasificación correcta
      const nuevasFormasClasificadas = {
        ...formasClasificadas,
        [formaArrastrada.uniqueId]: true
      };
      setFormasClasificadas(nuevasFormasClasificadas);
      setFeedback('¡Excelente! ✨');
      toast.success('¡Forma clasificada correctamente!');

      // Verificar si completó la ronda
      if (Object.keys(nuevasFormasClasificadas).length === config.formasPorRonda) {
        setTimeout(() => {
          if (rondaActual >= config.totalRondas) {
            finalizarJuego('Completado');
          } else {
            setRondaActual(prev => prev + 1);
            iniciarNuevaRonda();
            setFeedback('¡Ronda completada! Siguiente nivel...');
          }
        }, 1500);
      }
    } else {
      // Clasificación incorrecta
      setFeedback('¡Inténtalo de nuevo! 🤔');
      toast.warning('Esa no es la forma correcta');
    }

    setFormaArrastrada(null);
    setTimeout(() => setFeedback(''), 2000);
  };

  // ✅ CORREGIDO: Sistema de puntuación y estrellas mejorado
  const finalizarJuego = async (razon) => {
    if (juegoTerminado) return;
    setJuegoTerminado(true);
    
    try {
      // Calcular métricas reales del rendimiento
      const totalFormasEsperadas = config.totalRondas * config.formasPorRonda;
      const formasCompletadas = Object.keys(formasClasificadas).length + 
                                ((rondaActual - 1) * config.formasPorRonda);
      const porcentajeCorrecto = (formasCompletadas / totalFormasEsperadas) * 100;
      
      // Tiempo transcurrido
      const tiempoTranscurrido = tiempoInicio ? (Date.now() - tiempoInicio) / 1000 : 0;
      const tiempoObjetivo = config.tiempoLimite || 300; // 5 minutos por defecto si no hay límite
      
      // ✅ Puntuación según especificación del sistema
      let puntosFinales = 0;
      
      if (razon === 'Completado') {
        // Actividad completada exitosamente
        if (nivelActual === 'avanzado') {
          puntosFinales = 20; // Nivel difícil = 20 pts
        } else {
          puntosFinales = 10; // Completar actividad = 10 pts
        }
        
        // Bonificación por tiempo récord (si completó rápido)
        if (config.tiempoLimite && tiempoTranscurrido < (tiempoObjetivo * 0.7)) {
          puntosFinales += 5; // 5 pts adicionales por tiempo récord
        }
      } else {
        // Actividad incompleta - puntos proporcionales mínimos
        puntosFinales = Math.max(5, Math.floor((config.puntosBase * porcentajeCorrecto) / 100));
      }

      // Agregar puntos
      await RewardsService.agregarPuntos(
        perfilNino.id,
        puntosFinales,
        `Clasificación de Formas - ${razon} - Nivel: ${nivelActual}`
      );

      // ✅ CORREGIDO: Calcular estrellas con métricas reales
      const recompensa = await RewardsService.otorgarRecompensaActividad(
        perfilNino.id,
        actividad.id,
        {
          porcentajeCorrecto: Math.round(porcentajeCorrecto),
          tiempo: Math.round(tiempoTranscurrido),
          tiempoObjetivo: tiempoObjetivo
        }
      );

      // Actualizar puntuación mostrada
      setPuntuacion(puntosFinales);

      // Notificar a la IU
      if (onComplete) {
        onComplete({
          puntos: puntosFinales,
          estrellas: recompensa.estrellas,
          nombreActividad: actividad?.titulo || 'Clasificación de Formas',
          porcentajeCompletado: Math.round(porcentajeCorrecto),
          nivel: nivelActual,
          tiempoUsado: Math.round(tiempoTranscurrido)
        });
      }

      console.log('✅ Clasificación de Formas completada:', {
        puntos: puntosFinales,
        estrellas: recompensa.estrellas,
        porcentaje: porcentajeCorrecto,
        nivel: nivelActual,
        tiempo: tiempoTranscurrido
      });

    } catch (error) {
      console.error('Error finalizando actividad:', error);
      toast.error('Error al guardar el progreso');
    }
  };

  const formatearTiempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showTutorial) {
    return (
      <TutorialModal
        titulo="Clasificación de Formas"
        instrucciones={[
          "Arrastra cada forma a su contenedor correspondiente",
          `Clasifica ${config.formasPorRonda} formas por ronda`,
          `Completa ${config.totalRondas} rondas para ganar`,
          config.tiempoLimite ? `Tienes ${formatearTiempo(config.tiempoLimite)} para completar` : "No hay límite de tiempo",
          `Ganarás ${config.puntosBase} puntos base por completar + bonificaciones`
        ]}
        onStart={() => setShowTutorial(false)}
        onClose={onClose}
      />
    );
  }

  if (juegoTerminado) {
    const totalFormasEsperadas = config.totalRondas * config.formasPorRonda;
    const formasCompletadas = Object.keys(formasClasificadas).length + 
                              ((rondaActual - 1) * config.formasPorRonda);
    const porcentajeLogrado = Math.round((formasCompletadas / totalFormasEsperadas) * 100);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">
            {rondaActual >= config.totalRondas ? '🎉' : '⏰'}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {rondaActual >= config.totalRondas ? '¡Felicitaciones!' : '¡Buen Intento!'}
          </h2>
          <div className="space-y-2 text-gray-600 mb-6">
            <p>Formas clasificadas: {formasCompletadas}/{totalFormasEsperadas}</p>
            <p>Rondas completadas: {rondaActual}/{config.totalRondas}</p>
            <p>Progreso: {porcentajeLogrado}%</p>
            <p>Puntos obtenidos: {puntuacion}</p>
            <p>Nivel: {config.descripcion}</p>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            disabled={cargando}
          >
            {cargando ? 'Guardando...' : 'Continuar'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      {/* Header con información del juego */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>
            <h1 className="text-xl font-bold text-gray-800">Clasificación de Formas</h1>
            <span className="text-sm bg-gray-100 px-2 py-1 rounded">{config.descripcion}</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-sm text-gray-500">Ronda</div>
              <div className="text-lg font-bold text-blue-600">
                {rondaActual}/{config.totalRondas}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-gray-500">Clasificadas</div>
              <div className="text-lg font-bold text-green-600">
                {Object.keys(formasClasificadas).length}/{config.formasPorRonda}
              </div>
            </div>
            
            {tiempoRestante !== null && (
              <div className="text-center">
                <div className="text-sm text-gray-500">Tiempo</div>
                <div className={`text-lg font-bold ${tiempoRestante < 30 ? 
                  'text-red-600' : 'text-gray-800'}`}>
                  {formatearTiempo(tiempoRestante)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Área del juego */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Área de formas para clasificar */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
            Arrastra las formas a sus contenedores
          </h3>
          <div className="relative bg-gray-50 rounded-lg h-80 p-4 overflow-hidden">
            {formasParaClasificar.map(forma => (
              !formasClasificadas[forma.uniqueId] && (
                <div
                  key={forma.uniqueId}
                  draggable
                  onDragStart={(e) => manejarDragStart(e, forma)}
                  className="absolute cursor-move transform hover:scale-110 transition-transform"
                  style={{
                    left: forma.posX,
                    top: forma.posY,
                    color: forma.color
                  }}
                >
                  <svg width="60" height="60" viewBox="0 0 100 100">
                    {forma.svg}
                  </svg>
                </div>
              )
            ))}
          </div>
          
          {/* Feedback */}
          {feedback && (
            <div className="mt-4 text-center">
              <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold">
                {feedback}
              </div>
            </div>
          )}
        </div>

        {/* Contenedores de clasificación */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
            Contenedores de Formas
          </h3>
          <div className="space-y-4">
            {formasActivas.map(forma => (
              <div
                key={forma.id}
                onDragOver={manejarDragOver}
                onDrop={(e) => manejarDrop(e, forma.id)}
                className="border-4 border-dashed border-gray-300 rounded-lg p-6 min-h-20 flex items-center justify-center hover:border-blue-400 transition-colors"
                style={{ 
                  borderColor: formaArrastrada?.id === forma.id ? forma.color : undefined,
                  backgroundColor: formaArrastrada?.id === forma.id ? `${forma.color}15` : undefined
                }}
              >
                <div className="flex items-center space-x-3">
                  <svg width="40" height="40" viewBox="0 0 100 100" style={{ color: forma.color }}>
                    {forma.svg}
                  </svg>
                  <span className="text-lg font-semibold text-gray-700">
                    {forma.nombre}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente Tutorial Local
function TutorialModal({ titulo, instrucciones, onStart, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔷</div>
          <h2 className="text-2xl font-bold text-gray-800">{titulo}</h2>
        </div>
        
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Cómo jugar:</h3>
          <ul className="text-gray-600 space-y-2">
            {instrucciones.map((instruccion, index) => (
              <li key={index} className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">
                  {index + 1}
                </span>
                {instruccion}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onStart}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            ¡Comenzar!
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClasificacionFormas;