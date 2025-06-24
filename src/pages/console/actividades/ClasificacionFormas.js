// src/pages/console/actividades/ClasificacionFormas.js
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { RewardsService } from '../../../services/rewardsService';

// Configuración de formas
const FORMAS = [
  {
    id: 'circulo',
    nombre: 'Círculo',
    emoji: '🔵',
    color: '#3b82f6',
    svg: (
      <circle cx="50" cy="50" r="40" fill="currentColor" />
    )
  },
  {
    id: 'cuadrado',
    nombre: 'Cuadrado',
    emoji: '🟦',
    color: '#ef4444',
    svg: (
      <rect x="10" y="10" width="80" height="80" rx="5" fill="currentColor" />
    )
  },
  {
    id: 'triangulo',
    nombre: 'Triángulo',
    emoji: '🔺',
    color: '#22c55e',
    svg: (
      <polygon points="50,10 10,90 90,90" fill="currentColor" />
    )
  },
  {
    id: 'estrella',
    nombre: 'Estrella',
    emoji: '⭐',
    color: '#f59e0b',
    svg: (
      <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="currentColor" />
    )
  }
];

// Configuración de niveles
const NIVELES_CONFIG = {
  'básico': {
    formasActivas: ['circulo', 'cuadrado'],
    formasPorRonda: 4,
    totalRondas: 5,
    tiempoLimite: null,
    puntosPorAcierto: 15,
    descripcion: "Clasifica círculos y cuadrados"
  },
  'básico-alto': {
    formasActivas: ['circulo', 'cuadrado', 'triangulo'],
    formasPorRonda: 6,
    totalRondas: 6,
    tiempoLimite: 180, // 3 minutos
    puntosPorAcierto: 20,
    descripcion: "Clasifica 3 tipos de formas"
  },
  'intermedio': {
    formasActivas: ['circulo', 'cuadrado', 'triangulo', 'estrella'],
    formasPorRonda: 8,
    totalRondas: 7,
    tiempoLimite: 150, // 2.5 minutos
    puntosPorAcierto: 25,
    descripcion: "Clasifica todas las formas"
  },
  'avanzado': {
    formasActivas: ['circulo', 'cuadrado', 'triangulo', 'estrella'],
    formasPorRonda: 10,
    totalRondas: 8,
    tiempoLimite: 120, // 2 minutos
    puntosPorAcierto: 30,
    descripcion: "Clasificación rápida y precisa"
  }
};

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

  // Configuración según nivel del niño
  const nivelActual = perfilNino?.resultadosEvaluacion?.nivelAsignado?.nivel || 'básico';
  const config = NIVELES_CONFIG[nivelActual] || NIVELES_CONFIG['básico'];

  // Obtener formas activas para este nivel
  const formasActivas = config.formasActivas.map(id => FORMAS.find(f => f.id === id));

  // Inicializar juego
  useEffect(() => {
    if (!showTutorial) {
      iniciarNuevaRonda();
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
            finalizarJuego('tiempo_agotado');
            return 0;
          }
          return tiempo - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [tiempoRestante, juegoTerminado]);

  const generarFormasAleatorias = useCallback(() => {
    const formas = [];
    for (let i = 0; i < config.formasPorRonda; i++) {
      const formaAleatoria = formasActivas[Math.floor(Math.random() * formasActivas.length)];
      formas.push({
        ...formaAleatoria,
        uniqueId: `${formaAleatoria.id}-${i}-${Date.now()}`,
        posX: Math.random() * 300 + 50,
        posY: Math.random() * 200 + 50
      });
    }
    return formas;
  }, [formasActivas, config.formasPorRonda]);

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

  const manejarDrop = (e, contenedorId) => {
    e.preventDefault();
    
    if (!formaArrastrada) return;

    const esCorrecta = formaArrastrada.id === contenedorId;
    
    if (esCorrecta) {
      // Clasificación correcta
      const nuevasClasificadas = {
        ...formasClasificadas,
        [formaArrastrada.uniqueId]: contenedorId
      };
      setFormasClasificadas(nuevasClasificadas);
      
      const nuevaPuntuacion = puntuacion + config.puntosPorAcierto;
      setPuntuacion(nuevaPuntuacion);
      
      setFeedback('¡Correcto! +' + config.puntosPorAcierto + ' puntos');
      toast.success('¡Bien hecho! 🎉');

      // Verificar si se completó la ronda
      const formasRestantes = formasParaClasificar.filter(
        forma => !nuevasClasificadas[forma.uniqueId]
      );

      if (formasRestantes.length === 1) {
        // Ronda completada
        setTimeout(() => {
          if (rondaActual >= config.totalRondas) {
            finalizarJuego('completado');
          } else {
            setRondaActual(rondaActual + 1);
            iniciarNuevaRonda();
            toast.success('¡Ronda completada! Siguiente nivel...');
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

  const finalizarJuego = async (razon) => {
    setJuegoTerminado(true);
    let puntosFinales = puntuacion;
    try {
      await RewardsService.agregarPuntos(
        perfilNino.id,
        puntosFinales,
        `Clasificación de Formas - ${razon}`
      );
      // Otorgar solo 1 estrella
      const recompensa = await RewardsService.otorgarRecompensaActividad(
        perfilNino.id,
        actividad.id,
        {
          porcentajeCorrecto: 50,
          tiempo: 100,
          tiempoObjetivo: 0
        }
      );
      // Notificar a la IU (si aplica)
      if (onComplete) {
        onComplete({
          puntos: puntosFinales,
          estrellas: recompensa.estrellas,
          nombreActividad: actividad?.titulo || 'Clasificación de Formas'
        });
      }
    } catch (error) {
      console.error("Error actualizando puntos:", error);
    }
  };

  const actualizarPuntosEnFirebase = async (puntosFinales) => {
    if (!perfilNino?.id || !actividad?.categoria) {
      return false;
    }
    
    setCargando(true);
    
    try {
      const perfilRef = doc(db, "childProfiles", perfilNino.id);
      const perfilDoc = await getDoc(perfilRef);
      
      if (!perfilDoc.exists()) {
        return false;
      }
      
      const datosActualizacion = {
        ultimaActividad: new Date(),
        actividadesCompletadas: increment(1),
        puntosTotales: increment(puntosFinales)
      };
      
      // Actualizar estadísticas de la categoría
      const categoria = actividad.categoria;
      if (perfilDoc.data().estadisticasActividades?.[categoria]) {
        datosActualizacion[`estadisticasActividades.${categoria}.completadas`] = increment(1);
        datosActualizacion[`estadisticasActividades.${categoria}.puntuacion`] = increment(puntosFinales);
      }
      
      await updateDoc(perfilRef, datosActualizacion);
      
      // Intentar desbloquear logros
      try {
        await RewardsService.verificarLogros(perfilNino.id, {
          tipo: 'actividad_completada',
          categoria,
          puntuacion: puntosFinales,
          formasClasificadas: Object.keys(formasClasificadas).length
        });
      } catch (error) {
        console.log('Error verificando logros:', error);
      }
      
      return true;
    } catch (error) {
      console.error("Error actualizando puntos:", error);
      return false;
    } finally {
      setCargando(false);
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
          `Completa ${config.totalRondas} rondas`,
          config.tiempoLimite ? `Tienes ${formatearTiempo(config.tiempoLimite)} para completar` : "No hay límite de tiempo",
          "Ganarás puntos por cada forma clasificada correctamente"
        ]}
        onStart={() => setShowTutorial(false)}
        onClose={onClose}
      />
    );
  }

  if (juegoTerminado) {
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
            <p>Formas clasificadas: {Object.keys(formasClasificadas).length}</p>
            <p>Rondas completadas: {rondaActual}/{config.totalRondas}</p>
            <p>Puntos obtenidos: {puntuacion}</p>
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
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-sm text-gray-500">Ronda</div>
              <div className="text-lg font-bold text-blue-600">
                {rondaActual}/{config.totalRondas}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-gray-500">Puntos</div>
              <div className="text-lg font-bold text-green-600">{puntuacion}</div>
            </div>
            
            {tiempoRestante !== null && (
              <div className="text-center">
                <div className="text-sm text-gray-500">Tiempo</div>
                <div className={`text-lg font-bold ${tiempoRestante < 30 ? 'text-red-600' : 'text-gray-800'}`}>
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
                style={{ borderColor: formaArrastrada?.id === forma.id ? forma.color : undefined }}
              >
                <div className="flex items-center space-x-4">
                  <div style={{ color: forma.color }}>
                    <svg width="40" height="40" viewBox="0 0 100 100">
                      {forma.svg}
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-700">
                    {forma.nombre}
                  </span>
                  <span className="text-2xl">{forma.emoji}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente Tutorial
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