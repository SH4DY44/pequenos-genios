import React, { useState, useEffect, useReducer, useCallback } from 'react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import { toast } from 'react-toastify';
import TutorialModal from './TutorialModal';
import BotonTimbre from './BotonTimbre';
import FrutasDisplay from './FrutasDisplay';
import { NIVELES_CONFIG, FRUTAS } from './frutas';
import { NotificationService } from '../../../../services/notificationService';
import { auth } from '../../../../config/firebase';

// Acciones del juego
const GAME_ACTIONS = {
  START_GAME: 'START_GAME',
  SHOW_FRUIT: 'SHOW_FRUIT',
  PRESS_BELL: 'PRESS_BELL',
  UPDATE_TIMER: 'UPDATE_TIMER',
  UPDATE_SCORE: 'UPDATE_SCORE',
  RESET_FRUIT_COUNT: 'RESET_FRUIT_COUNT',
  END_GAME: 'END_GAME',
  RESET_GAME: 'RESET_GAME'
};

// Estado inicial del juego
const initialGameState = {
  frutasActuales: {}, // Conteo de frutas por tipo
  secuenciaFrutas: [], // Historial de frutas mostradas
  ultimaFruta: null,
  puntuacion: 0,
  tiempoRestante: null,
  juegoIniciado: false,
  juegoTerminado: false,
  timbrePresionado: false
};

// Reducer para el estado del juego
function gameReducer(state, action) {
  switch (action.type) {
    case GAME_ACTIONS.START_GAME:
      return {
        ...initialGameState,
        juegoIniciado: true,
        tiempoRestante: action.payload.duration
      };
      
    case GAME_ACTIONS.SHOW_FRUIT:
      const { fruta } = action.payload;
      const nuevasFrutas = { ...state.frutasActuales };
      
      // Actualizar conteo de la fruta
      nuevasFrutas[fruta.id] = (nuevasFrutas[fruta.id] || 0) + 1;
      
      return {
        ...state,
        frutasActuales: nuevasFrutas,
        secuenciaFrutas: [...state.secuenciaFrutas, fruta],
        ultimaFruta: fruta
      };
      
    case GAME_ACTIONS.PRESS_BELL:
      return {
        ...state,
        timbrePresionado: true
      };
      
    case GAME_ACTIONS.UPDATE_TIMER:
      return {
        ...state,
        tiempoRestante: action.payload.time,
        timbrePresionado: false
      };
      
    case GAME_ACTIONS.UPDATE_SCORE:
      return {
        ...state,
        puntuacion: state.puntuacion + action.payload.points
      };
    
    case GAME_ACTIONS.RESET_FRUIT_COUNT:
      return {
        ...state,
        frutasActuales: {},
        secuenciaFrutas: []
      };
      
    case GAME_ACTIONS.END_GAME:
      return {
        ...state,
        juegoTerminado: true,
        juegoIniciado: false
      };
      
    case GAME_ACTIONS.RESET_GAME:
      return initialGameState;
      
    case 'NO_OP':
      return state; // No hacer nada, mantener el estado actual
      
    default:
      return state;
  }
}

function HalliGalli({ perfilNino, onScoreUpdate, onClose }) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [showTutorial, setShowTutorial] = useState(true);
  const [frutalInterval, setFrutalInterval] = useState(null);
  const [gameTimer, setGameTimer] = useState(null);
  
  // Obtener configuración del nivel según el perfil
  const getNivelConfig = useCallback(() => {
    const nivelPerfil = perfilNino?.resultadosEvaluacion?.nivelAsignado?.nivel || 'básico';
    const NIVEL_MAPPING = {
      'básico': 'basico',
      'básico-alto': 'basico-alto',
      'intermedio': 'intermedio',
      'avanzado': 'avanzado'
    };
    return NIVELES_CONFIG[NIVEL_MAPPING[nivelPerfil] || 'basico'];
  }, [perfilNino]);
  
  const configNivel = getNivelConfig();
  
  // Referencia a la función finalizarJuego para poder usarla en useEffect
  const finalizarJuego = useCallback(async (victoria = false) => {
    if (frutalInterval) {
      clearInterval(frutalInterval);
      setFrutalInterval(null);
    }
    
    if (gameTimer) {
      clearInterval(gameTimer);
      setGameTimer(null);
    }
    
    dispatch({ type: GAME_ACTIONS.END_GAME });
    
    try {
      const tiempoJugado = configNivel.duracionJuego - (state.tiempoRestante || 0);
      
      // Actualizar estadísticas en la base de datos
      await updateDoc(doc(db, 'childProfiles', perfilNino.id), {
        [`estadisticasJuegos.halliGalli.maxPuntuacion`]: Math.max((perfilNino?.estadisticasJuegos?.halliGalli?.maxPuntuacion || 0), state.puntuacion),
        [`estadisticasJuegos.halliGalli.partidasJugadas`]: increment(1),
        [`estadisticasJuegos.halliGalli.${victoria ? 'victorias' : 'derrotas'}`]: increment(1),
        [`estadisticasJuegos.halliGalli.tiempoTotal`]: increment(tiempoJugado),
        [`tiempoTotal`]: increment(tiempoJugado), // Actualizar tiempo total general
        juegosCompletados: increment(1)
      });
      
      // Actualizar puntos globales
      if (state.puntuacion > 0 && onScoreUpdate) {
        await onScoreUpdate(state.puntuacion);
      }
      
      // Notificación persistente
      if (auth.currentUser) {
        await NotificationService.crearNotificacion({
          tutorId: auth.currentUser.uid,
          profileId: perfilNino.id,
          tipo: 'logro_alcanzado',
          titulo: 'Halli Galli: Juego terminado',
          mensaje: `Puntuación final: ${state.puntuacion}`,
          datos: { puntos: state.puntuacion, victoria },
          prioridad: victoria ? 'alta' : 'normal'
        });
      }
      
      toast.success(`¡Juego terminado! Puntuación final: ${state.puntuacion}`);
    } catch (error) {
      console.error('Error guardando estadísticas:', error);
      toast.error('Error al guardar las estadísticas');
    }
  }, [frutalInterval, gameTimer, perfilNino, state.puntuacion, state.tiempoRestante, onScoreUpdate, configNivel]);
  
  // Generar secuencia de frutas
  const iniciarSecuenciaFrutas = useCallback(() => {
    // Seleccionar frutas según el nivel
    const frutasDisponibles = FRUTAS.slice(0, configNivel.numFrutas);
    
    // Iniciar intervalo para mostrar frutas
    const interval = setInterval(() => {
      // Seleccionar fruta aleatoria
      const frutaAleatoria = frutasDisponibles[Math.floor(Math.random() * frutasDisponibles.length)];
      
      dispatch({
        type: GAME_ACTIONS.SHOW_FRUIT,
        payload: { fruta: frutaAleatoria }
      });
      
    }, configNivel.tiempoEntreFrutas);
    
    setFrutalInterval(interval);
    return interval;
  }, [configNivel]);
  
  // Iniciar el juego
  const iniciarJuego = useCallback(() => {
    // Limpiar intervalos previos si existen
    if (frutalInterval) clearInterval(frutalInterval);
    if (gameTimer) clearInterval(gameTimer);
    
    // Inicializar el estado del juego
    const duracionJuego = configNivel.duracionJuego;
    dispatch({
      type: GAME_ACTIONS.START_GAME,
      payload: { duration: duracionJuego }
    });
    
    // Crear nuevo secuenciador de frutas
    const fruitInterval = iniciarSecuenciaFrutas();
    setFrutalInterval(fruitInterval);
    
    // Usar una variable local para el contador
    let tiempoActual = duracionJuego;
    
    // Iniciar temporizador del juego
    const timer = setInterval(() => {
      tiempoActual -= 1;
      
      dispatch({
        type: GAME_ACTIONS.UPDATE_TIMER,
        payload: { time: tiempoActual }
      });
      
      if (tiempoActual <= 0) {
        clearInterval(timer);
        clearInterval(fruitInterval);
        setTimeout(() => finalizarJuego(state.puntuacion>0), 0);
      }
    }, 1000);
    
    setGameTimer(timer);
    
  }, [configNivel, iniciarSecuenciaFrutas, finalizarJuego]);
  // Eliminamos state.tiempoRestante y finalizarJuego de las dependencias
  
  // Detener todos los intervalos al desmontar
  useEffect(() => {
    return () => {
      if (frutalInterval) clearInterval(frutalInterval);
      if (gameTimer) clearInterval(gameTimer);
    };
  }, [frutalInterval, gameTimer]);
  
  // Observador para el tiempo restante
  useEffect(() => {
    if (state.tiempoRestante !== null && state.tiempoRestante <= 0 && state.juegoIniciado) {
      finalizarJuego(state.puntuacion > 0);  // Añadir esta condición
    }
  }, [state.tiempoRestante, state.juegoIniciado, finalizarJuego]);
  
  // Manejar pulsación del timbre
  const handleBellPress = useCallback(() => {
    dispatch({ type: GAME_ACTIONS.PRESS_BELL });
    
    // Verificar si hay exactamente 5 frutas iguales
    const hayVictoria = Object.values(state.frutasActuales).some(count => count === 5);
    
    if (hayVictoria) {
      // Sumar puntos por acierto
      dispatch({
        type: GAME_ACTIONS.UPDATE_SCORE,
        payload: { points: configNivel.puntosPorAcierto }
      });
      
      toast.success(`¡Halli Galli! +${configNivel.puntosPorAcierto} puntos`, {
        position: "top-center",
        autoClose: 1500
      });
      
      // Resetear conteo de frutas
      dispatch({ type: GAME_ACTIONS.RESET_FRUIT_COUNT });
      
    } else {
      // Penalizar por error
      dispatch({
        type: GAME_ACTIONS.UPDATE_SCORE,
        payload: { points: configNivel.penalizacionError }
      });
      
      toast.error(`¡No hay 5 frutas iguales! ${configNivel.penalizacionError} puntos`, {
        position: "top-center",
        autoClose: 1500
      });
    }
    
    // Habilitar el botón nuevamente después de un breve retraso
    setTimeout(() => {
      dispatch({
        type: GAME_ACTIONS.UPDATE_TIMER,
        payload: { time: state.tiempoRestante }
      });
    }, 1000);
    
  }, [state.frutasActuales, configNivel, state.tiempoRestante]);
  
  // Reiniciar juego
  const reiniciarJuego = () => {
    dispatch({ type: GAME_ACTIONS.RESET_GAME });
    setShowTutorial(true);
  };
  
  // Renderizado del componente
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg">
        {/* Header */}
        <div className="border-b border-orange-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-[var(--interactive-orange)]">
                Halli Galli
              </h2>
              <p className="text-orange-600 mt-1 font-medium">
                {configNivel.descripcion}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowTutorial(true)}
                className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg 
                hover:bg-yellow-200 transition-all flex items-center gap-2"
              >
                <span>❔</span>
                <span>Cómo jugar</span>
              </button>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full
                hover:bg-gray-100 transition-all"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Panel de Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6">
          <div className="bg-gradient-to-r from-orange-100 to-orange-200 rounded-lg p-4">
            <div className="text-sm text-orange-700 font-medium">Puntuación</div>
            <div className="text-2xl font-bold text-orange-800">{state.puntuacion} pts</div>
          </div>

          <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg p-4">
            <div className="text-sm text-yellow-700 font-medium">Tiempo</div>
            <div className="text-2xl font-bold text-yellow-800">
              {state.tiempoRestante !== null ? `${state.tiempoRestante}s` : '--'}
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-100 to-red-200 rounded-lg p-4 md:col-span-1 col-span-2">
            <div className="text-sm text-red-700 font-medium">Frutas</div>
            <div className="flex flex-wrap gap-2 mt-1">
              {Object.entries(state.frutasActuales).map(([id, count]) => {
                const fruta = FRUTAS.find(f => f.id === id);
                return fruta ? (
                  <div key={id} className="flex items-center">
                    <span className="text-xl mr-1">{fruta.imagen}</span>
                    <span className={`text-sm font-bold ${fruta.color}`}>x{count}</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </div>

        {/* Área de Juego */}
        {!state.juegoIniciado && !state.juegoTerminado ? (
          <div className="p-12 text-center">
            <h3 className="text-2xl font-bold text-gray-700 mb-4">
              ¡Prepárate para jugar Halli Galli!
            </h3>
            <p className="text-gray-600 mb-6">
              Presiona el timbre cuando veas exactamente 5 frutas iguales.
            </p>
            <button
              onClick={() => {
                setShowTutorial(false);
                iniciarJuego();
              }}
              className="px-8 py-3 bg-[var(--interactive-orange)] text-white rounded-lg 
              hover:opacity-90 transition-all font-medium text-lg shadow-md"
            >
              ¡Comenzar!
            </button>
          </div>
        ) : (
          <div className="p-6">
            {/* Área de frutas */}
            <div className="bg-gray-50 rounded-lg p-6 shadow-inner min-h-[300px] relative">
              <FrutasDisplay 
                frutasSequencia={state.secuenciaFrutas.slice(-10)} 
                ultimaFruta={state.ultimaFruta}
              />
              
              {/* Botón del timbre */}
              <div className="mt-8 flex justify-center">
                <BotonTimbre 
                  onClick={handleBellPress}
                  disabled={!state.juegoIniciado || state.timbrePresionado}
                  animating={state.timbrePresionado}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tutorial Modal */}
        <TutorialModal 
          isOpen={showTutorial} 
          onClose={() => {
            setShowTutorial(false);
            if (!state.juegoIniciado && !state.juegoTerminado) {
              iniciarJuego();
            }
          }}
          configNivel={configNivel}
        />

        {/* Modal Fin de Juego */}
        {state.juegoTerminado && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl text-center max-w-md animate-fade-in">
              <div className="text-6xl mb-4">
                {state.puntuacion > 0 ? '🎉' : '😓'}
              </div>
              <h3 className="text-2xl font-bold text-[var(--interactive-orange)] mb-4">
                ¡Juego Terminado!
              </h3>
              <div className="bg-orange-50 p-4 rounded-lg mb-6">
                <p className="text-lg mb-2">
                  Puntuación final: <span className="font-bold text-orange-600">{state.puntuacion}</span>
                </p>
              </div>
              <div className="space-y-4">
                <button
                  onClick={iniciarJuego}
                  className="w-full px-6 py-3 bg-[var(--interactive-orange)] text-white rounded-lg 
                  hover:opacity-90 transition-all font-medium"
                >
                  Jugar de nuevo
                </button>
                <button
                  onClick={onClose}
                  className="w-full px-6 py-3 border-2 border-gray-300 rounded-lg 
                  hover:bg-gray-100 transition-all"
                >
                  Salir del juego
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HalliGalli;