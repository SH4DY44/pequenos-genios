// src/pages/console/juegos/halliGalli/HalliGalli.js - VERSIÓN DEFINITIVA CORREGIDA
import React, { useState, useEffect, useReducer, useCallback, useRef } from 'react';
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
        puntuacion: Math.max(0, state.puntuacion + action.payload.points)
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
      
    default:
      return state;
  }
}

function HalliGalli({ perfilNino, onScoreUpdate, onClose }) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [showTutorial, setShowTutorial] = useState(true);
  const [frutalInterval, setFrutalInterval] = useState(null);
  const [gameTimer, setGameTimer] = useState(null);
  
  // 🔥 REF para obtener el estado más actual en callbacks
  const estadoActualRef = useRef(state);
  estadoActualRef.current = state;
  
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
  
  // 🔥 FUNCIÓN CORREGIDA: Verificar si hay 5 O MÁS frutas iguales
  const verificarCincoOMasFrutasIguales = useCallback((frutasContadas) => {
    console.log('🔍 Verificando frutas:', frutasContadas);
    
    // ✅ CORREGIDO: Verificar si hay 5 O MÁS frutas de algún tipo
    const frutasCon5OMas = Object.entries(frutasContadas).filter(([id, count]) => count >= 5);
    
    console.log('🎯 Frutas con 5 o más:', frutasCon5OMas);
    
    // Devolver información detallada
    return {
      hayVictoria: frutasCon5OMas.length > 0,
      frutasGanadoras: frutasCon5OMas,
      conteoTotal: Object.values(frutasContadas).reduce((sum, count) => sum + count, 0)
    };
  }, []);
  
  // Finalizar juego con mejor manejo de puntaje
  const finalizarJuego = useCallback(async (victoria = false) => {
    console.log('🏁 Finalizando juego. Victoria:', victoria, 'Puntuación:', estadoActualRef.current.puntuacion);
    
    // Limpiar intervalos
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
      const estadoFinal = estadoActualRef.current;
      const tiempoJugado = configNivel.duracionJuego - (estadoFinal.tiempoRestante || 0);
      const puntajeFinal = Math.max(0, estadoFinal.puntuacion);
      
      console.log('💾 Guardando estadísticas:', {
        puntajeFinal,
        tiempoJugado,
        victoria
      });
      
      // Actualizar estadísticas en la base de datos
      const updateData = {
        [`estadisticasJuegos.halliGalli.maxPuntuacion`]: Math.max(
          (perfilNino?.estadisticasJuegos?.halliGalli?.maxPuntuacion || 0), 
          puntajeFinal
        ),
        [`estadisticasJuegos.halliGalli.partidasJugadas`]: increment(1),
        [`estadisticasJuegos.halliGalli.${victoria ? 'victorias' : 'derrotas'}`]: increment(1),
        [`estadisticasJuegos.halliGalli.tiempoTotal`]: increment(tiempoJugado),
        [`tiempoTotal`]: increment(tiempoJugado),
        juegosCompletados: increment(1)
      };

      // Actualizar puntos totales solo si hay puntuación positiva
      if (puntajeFinal > 0) {
        updateData.puntosTotales = increment(puntajeFinal);
      }

      await updateDoc(doc(db, 'childProfiles', perfilNino.id), updateData);
      
      // Llamar onScoreUpdate si existe y hay puntos
      if (puntajeFinal > 0 && typeof onScoreUpdate === 'function') {
        console.log('📈 Actualizando score global:', puntajeFinal);
        await onScoreUpdate(puntajeFinal);
      }
      
      // Notificación
      if (auth.currentUser) {
        await NotificationService.crearNotificacion({
          tutorId: auth.currentUser.uid,
          profileId: perfilNino.id,
          tipo: 'logro_alcanzado',
          titulo: 'Halli Galli: Juego terminado',
          mensaje: `Puntuación final: ${puntajeFinal} puntos`,
          datos: { puntos: puntajeFinal, victoria },
          prioridad: victoria ? 'alta' : 'normal'
        });
      }
      
      toast.success(`🎉 ¡Juego terminado! Puntuación: ${puntajeFinal} puntos`);
      
    } catch (error) {
      console.error('❌ Error guardando estadísticas:', error);
      toast.error('Error al guardar las estadísticas');
    }
  }, [frutalInterval, gameTimer, perfilNino, onScoreUpdate, configNivel]);
  
  // Generar secuencia de frutas
  const iniciarSecuenciaFrutas = useCallback(() => {
    const frutasDisponibles = FRUTAS.slice(0, configNivel.numFrutas);
    
    const interval = setInterval(() => {
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
    console.log('🎮 Iniciando juego con configuración:', configNivel);
    
    // Limpiar intervalos previos
    if (frutalInterval) clearInterval(frutalInterval);
    if (gameTimer) clearInterval(gameTimer);
    
    // Inicializar el estado del juego
    const duracionJuego = configNivel.duracionJuego;
    dispatch({
      type: GAME_ACTIONS.START_GAME,
      payload: { duration: duracionJuego }
    });
    
    // Crear secuenciador de frutas
    const fruitInterval = iniciarSecuenciaFrutas();
    setFrutalInterval(fruitInterval);
    
    // Timer del juego
    let tiempoActual = duracionJuego;
    const timer = setInterval(() => {
      tiempoActual -= 1;
      
      dispatch({
        type: GAME_ACTIONS.UPDATE_TIMER,
        payload: { time: tiempoActual }
      });
      
      if (tiempoActual <= 0) {
        clearInterval(timer);
        clearInterval(fruitInterval);
        setTimeout(() => finalizarJuego(false), 100);
      }
    }, 1000);
    
    setGameTimer(timer);
    
  }, [configNivel, iniciarSecuenciaFrutas, finalizarJuego]);
  
  // 🔥 FUNCIÓN CORREGIDA: Manejar pulsación del timbre
  const handleBellPress = useCallback(() => {
    // Obtener el estado más actual
    const estadoActual = estadoActualRef.current;
    
    if (!estadoActual.juegoIniciado || estadoActual.timbrePresionado || estadoActual.juegoTerminado) {
      console.log('⏸️ Timbre bloqueado - Estado del juego:', {
        juegoIniciado: estadoActual.juegoIniciado,
        timbrePresionado: estadoActual.timbrePresionado,
        juegoTerminado: estadoActual.juegoTerminado
      });
      return;
    }

    console.log('🔔 ¡TIMBRE PRESIONADO!');
    console.log('📊 Estado actual de frutas:', estadoActual.frutasActuales);
    
    dispatch({ type: GAME_ACTIONS.PRESS_BELL });
    
    // 🔥 LÓGICA CORREGIDA: Verificar si hay 5 O MÁS frutas iguales
    const resultado = verificarCincoOMasFrutasIguales(estadoActual.frutasActuales);
    
    console.log('🎯 Resultado de verificación:', resultado);
    
    if (resultado.hayVictoria) {
      // ✅ ACIERTO: Sumar puntos
      console.log(`✅ ¡ACIERTO! +${configNivel.puntosPorAcierto} puntos`);
      
      dispatch({
        type: GAME_ACTIONS.UPDATE_SCORE,
        payload: { points: configNivel.puntosPorAcierto }
      });
      
      // Mostrar información de las frutas ganadoras
      const frutasGanadoras = resultado.frutasGanadoras.map(([id, count]) => {
        const fruta = FRUTAS.find(f => f.id === id);
        return `${fruta?.imagen || '?'} x${count}`;
      }).join(', ');
      
      toast.success(`🎉 ¡Halli Galli! ${frutasGanadoras} = +${configNivel.puntosPorAcierto} puntos`, {
        position: "top-center",
        autoClose: 2000
      });
      
      // 🔥 CORREGIDO: Resetear inmediatamente sin setTimeout
      dispatch({ type: GAME_ACTIONS.RESET_FRUIT_COUNT });
      
    } else {
      // ❌ ERROR: Restar puntos
      console.log(`❌ ERROR: ${configNivel.penalizacionError} puntos`);
      
      dispatch({
        type: GAME_ACTIONS.UPDATE_SCORE,
        payload: { points: configNivel.penalizacionError }
      });
      
      toast.error(`❌ ¡No hay 5 frutas iguales! ${configNivel.penalizacionError} puntos`, {
        position: "top-center",
        autoClose: 1500
      });
    }
    
    // Rehabilitar el timbre después de un breve retraso
    setTimeout(() => {
      dispatch({
        type: GAME_ACTIONS.UPDATE_TIMER,
        payload: { time: estadoActualRef.current.tiempoRestante }
      });
    }, 1000);
    
  }, [configNivel, verificarCincoOMasFrutasIguales]);
  
  // Detener intervalos al desmontar
  useEffect(() => {
    return () => {
      if (frutalInterval) clearInterval(frutalInterval);
      if (gameTimer) clearInterval(gameTimer);
    };
  }, [frutalInterval, gameTimer]);
  
  // Debug: Mostrar estado actual en consola
  useEffect(() => {
    if (state.juegoIniciado && !state.juegoTerminado) {
      console.log('🔄 Estado actual:', {
        frutas: state.frutasActuales,
        puntuacion: state.puntuacion,
        tiempo: state.tiempoRestante
      });
      
      // 🔥 NUEVO: Detectar automáticamente cuando hay 5+ frutas
      const resultado = verificarCincoOMasFrutasIguales(state.frutasActuales);
      if (resultado.hayVictoria) {
        console.log('🚨 ¡HAY 5+ FRUTAS IGUALES! Presiona el timbre:', resultado.frutasGanadoras);
      }
    }
  }, [state.frutasActuales, state.puntuacion, state.tiempoRestante, state.juegoIniciado, state.juegoTerminado, verificarCincoOMasFrutasIguales]);
  
  // Renderizado del componente
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg">
        {/* Header */}
        <div className="border-b border-orange-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-orange-600">
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

        {/* Panel de Estadísticas MEJORADO */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
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

          <div className="bg-gradient-to-r from-green-100 to-green-200 rounded-lg p-4">
            <div className="text-sm text-green-700 font-medium">Frutas Totales</div>
            <div className="text-2xl font-bold text-green-800">
              {Object.values(state.frutasActuales).reduce((sum, count) => sum + count, 0)}
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-100 to-red-200 rounded-lg p-4">
            <div className="text-sm text-red-700 font-medium">Conteo Actual</div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(state.frutasActuales).map(([id, count]) => {
                const fruta = FRUTAS.find(f => f.id === id);
                return fruta ? (
                  <div key={id} className="flex items-center bg-white rounded px-1">
                    <span className="text-lg">{fruta.imagen}</span>
                    <span className={`text-sm font-bold ml-1 ${
                      count >= 5 ? 'text-green-600 animate-pulse' : count >= 3 ? 'text-yellow-600' : 'text-gray-600'
                    }`}>
                      {count}
                    </span>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </div>

        {/* 🔥 NUEVO: Indicador visual cuando hay 5+ frutas */}
        {(() => {
          const resultado = verificarCincoOMasFrutasIguales(state.frutasActuales);
          return resultado.hayVictoria && state.juegoIniciado ? (
            <div className="mx-6 mb-4 bg-green-100 border-l-4 border-green-500 p-4 rounded animate-pulse">
              <div className="flex items-center">
                <span className="text-2xl mr-2">🚨</span>
                <div>
                  <p className="text-green-800 font-bold">¡HAY 5+ FRUTAS IGUALES!</p>
                  <p className="text-green-700 text-sm">
                    {resultado.frutasGanadoras.map(([id, count]) => {
                      const fruta = FRUTAS.find(f => f.id === id);
                      return `${fruta?.imagen || '?'} x${count}`;
                    }).join(', ')} - ¡Presiona el timbre!
                  </p>
                </div>
              </div>
            </div>
          ) : null;
        })()}

        {/* Área de Juego */}
        {!state.juegoIniciado && !state.juegoTerminado ? (
          <div className="p-12 text-center">
            <h3 className="text-2xl font-bold text-gray-700 mb-4">
              ¡Prepárate para jugar Halli Galli!
            </h3>
            <p className="text-gray-600 mb-6">
              Presiona el timbre cuando veas 5 o más frutas iguales.
            </p>
            <button
              onClick={() => {
                setShowTutorial(false);
                iniciarJuego();
              }}
              className="px-8 py-3 bg-orange-500 text-white rounded-lg 
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
                {state.puntuacion > 0 ? '🎉' : '😊'}
              </div>
              <h3 className="text-2xl font-bold text-orange-600 mb-4">
                ¡Juego Terminado!
              </h3>
              <p className="text-gray-600 mb-2">
                <strong>Puntuación final:</strong> {state.puntuacion} puntos
              </p>
              <p className="text-gray-600 mb-6">
                <strong>Tiempo jugado:</strong> {configNivel.duracionJuego - (state.tiempoRestante || 0)} segundos
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    dispatch({ type: GAME_ACTIONS.RESET_GAME });
                    setShowTutorial(true);
                  }}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg 
                  hover:bg-orange-600 transition-all"
                >
                  Jugar de Nuevo
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg 
                  hover:bg-gray-600 transition-all"
                >
                  Salir
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