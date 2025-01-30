import React, { useState, useReducer, useCallback, useMemo, useEffect } from 'react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import { toast } from 'react-toastify';
import TutorialModal from './TutorialModal';
import { 
  NIVELES_CONFIG, 
  CATEGORIAS, 
  SONIDOS, 
  ANIMACIONES,
  RECOMPENSAS 
} from './palabras';

// Acciones del juego
const GAME_ACTIONS = {
  START_GAME: 'START_GAME',
  SHOW_SEQUENCE: 'SHOW_SEQUENCE',
  HIDE_SEQUENCE: 'HIDE_SEQUENCE',
  SELECT_WORD: 'SELECT_WORD',
  UPDATE_TIMER: 'UPDATE_TIMER',
  COMPLETE_SEQUENCE: 'COMPLETE_SEQUENCE',
  HANDLE_ERROR: 'HANDLE_ERROR',
  END_GAME: 'END_GAME',
  RESET_GAME: 'RESET_GAME'
};

// Estado inicial del juego
const initialGameState = {
  secuenciaActual: [],
  secuenciaUsuario: [],
  mostrando: false,
  puntuacion: 0,
  comboActual: 1,
  maxCombo: 1,
  nivelActual: 0,
  intentosRestantes: 3,
  tiempoRestante: null,
  juegoIniciado: false,
  juegoTerminado: false,
  cargando: false,
  jugadaActual: {
    indice: 0,
    correcta: true
  }
};

// Reducer para manejar el estado del juego
function gameReducer(state, action) {
  switch (action.type) {
    case GAME_ACTIONS.START_GAME:
      return {
        ...initialGameState,
        juegoIniciado: true,
        intentosRestantes: action.payload.maxAttempts || 3
      };
    
    case GAME_ACTIONS.SHOW_SEQUENCE:
      return {
        ...state,
        secuenciaActual: action.payload.sequence,
        mostrando: true,
        secuenciaUsuario: []
      };

    case GAME_ACTIONS.HIDE_SEQUENCE:
      return {
        ...state,
        mostrando: false,
        tiempoRestante: null
      };

    case GAME_ACTIONS.SELECT_WORD:
      return {
        ...state,
        secuenciaUsuario: [...state.secuenciaUsuario, action.payload.word]
      };

    case GAME_ACTIONS.UPDATE_TIMER:
      return {
        ...state,
        tiempoRestante: action.payload.time
      };

    case GAME_ACTIONS.COMPLETE_SEQUENCE:
      return {
        ...state,
        puntuacion: state.puntuacion + action.payload.points,
        comboActual: state.comboActual + 1,
        maxCombo: Math.max(state.maxCombo, state.comboActual + 1),
        nivelActual: state.nivelActual + 1
      };

    case GAME_ACTIONS.HANDLE_ERROR:
      return {
        ...state,
        comboActual: 1,
        intentosRestantes: state.intentosRestantes - 1,
        secuenciaUsuario: []
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

function SecuenciasPalabras({ perfilNino, onScoreUpdate, onClose }) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [showTutorial, setShowTutorial] = useState(true);
  const [debeIniciarTimer, setDebeIniciarTimer] = useState(false);

  // Obtener configuración del nivel
  const configNivel = useMemo(() => {
    const nivelPerfil = perfilNino?.resultadosEvaluacion?.nivelAsignado?.nivel || 'basico';
    const NIVEL_MAPPING = {
      'básico': 'basico',
      'básico-alto': 'básico-alto',
      'intermedio': 'intermedio',
      'avanzado': 'avanzado'
    };
    const nivelMapeado = NIVEL_MAPPING[nivelPerfil] || 'basico';
    return NIVELES_CONFIG[nivelMapeado] || NIVELES_CONFIG.basico;
  }, [perfilNino]);

  // Iniciar juego
  const iniciarJuego = useCallback(() => {
    dispatch({ 
      type: GAME_ACTIONS.START_GAME, 
      payload: { maxAttempts: configNivel.intentosMaximos || 3 }
    });
    generarNuevaSecuencia();
  }, [configNivel]);

  // Generar nueva secuencia
  const generarNuevaSecuencia = useCallback(() => {
    setDebeIniciarTimer(false);
    dispatch({ type: GAME_ACTIONS.HIDE_SEQUENCE });

    if (!configNivel?.categorias) {
      console.error('Configuración de nivel no válida');
      return;
    }

    const poolPalabras = configNivel.categorias.flatMap(categoria => 
      CATEGORIAS[categoria] ? CATEGORIAS[categoria] : []
    );

    if (poolPalabras.length === 0) {
      console.error('No hay palabras disponibles');
      return;
    }

    const secuencia = [...poolPalabras]
      .sort(() => Math.random() - 0.5)
      .slice(0, configNivel.numPalabras);

    dispatch({
      type: GAME_ACTIONS.SHOW_SEQUENCE,
      payload: { sequence: secuencia }
    });

    mostrarSecuencia(secuencia);
  }, [configNivel]);

  // Mostrar secuencia
  const mostrarSecuencia = async (secuencia) => {
    if (!secuencia || secuencia.length === 0) return;
    
    for (let i = 0; i < secuencia.length; i++) {
      await new Promise(resolve => setTimeout(resolve, configNivel.tiempoMostrarPalabra));
    }
    
    iniciarTimer();
  };

  // Timer del juego
  useEffect(() => {
    if (!state.mostrando || !debeIniciarTimer) return;

    let tiempo = configNivel.tiempoMemorizar;
    dispatch({ 
      type: GAME_ACTIONS.UPDATE_TIMER, 
      payload: { time: tiempo } 
    });

    const timer = setInterval(() => {
      tiempo -= 1;
      if (tiempo <= 0) {
        clearInterval(timer);
        dispatch({ type: GAME_ACTIONS.HIDE_SEQUENCE });
        finalizarJuego(false);
      } else {
        dispatch({ 
          type: GAME_ACTIONS.UPDATE_TIMER, 
          payload: { time: tiempo } 
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [state.mostrando, debeIniciarTimer, configNivel.tiempoMemorizar]);

  // Iniciar timer
  const iniciarTimer = useCallback(() => {
    if (!configNivel.tiempoMemorizar) {
      dispatch({ type: GAME_ACTIONS.HIDE_SEQUENCE });
      return;
    }
    setDebeIniciarTimer(true);
  }, [configNivel.tiempoMemorizar]);

  // Manejar selección de palabra
  const handleWordSelection = useCallback(async (palabra) => {
    if (state.mostrando || state.juegoTerminado) return;

    const nuevaSecuenciaUsuario = [...state.secuenciaUsuario, palabra];
    
    dispatch({
      type: GAME_ACTIONS.SELECT_WORD,
      payload: { word: palabra }
    });

    const indiceActual = state.secuenciaUsuario.length;
    if (palabra.id !== state.secuenciaActual[indiceActual].id) {
      await handleError();
      return;
    }

    if (state.secuenciaUsuario.length + 1 === state.secuenciaActual.length) {
      await handleSequenceComplete();
    }
  }, [state]);

  // Manejar secuencia completada
  const handleSequenceComplete = async () => {
    try {
      const basePoints = configNivel.puntosPorAcierto;
      const multiplier = Math.min(configNivel.maxCombo, state.comboActual);
      const pointsEarned = Math.floor(basePoints * multiplier);

      dispatch({
        type: GAME_ACTIONS.COMPLETE_SEQUENCE,
        payload: { points: pointsEarned }
      });

      if (onScoreUpdate) {
        await onScoreUpdate(pointsEarned);
      }

      if (state.comboActual > 1) {
        toast.success(`¡${state.comboActual}x Combo! +${pointsEarned} puntos`, {
          position: "top-right",
          autoClose: 1500
        });
      }

      // Siguiente nivel o fin del juego
      if (state.nivelActual + 1 >= configNivel.numNiveles) {
        await finalizarJuego(true);
      } else {
        generarNuevaSecuencia();
      }
    } catch (error) {
      console.error('Error en secuencia completa:', error);
      toast.error('Error al procesar la secuencia');
    }
  };

  // Manejar error
  const handleError = async () => {
    dispatch({ type: GAME_ACTIONS.HANDLE_ERROR });

    if (state.intentosRestantes <= 1) {
      dispatch({ type: GAME_ACTIONS.HANDLE_ERROR });

      toast.error('¡Se acabaron los intentos!', {
        position: "top-center",
        autoClose: 2000,
        icon: "💔"
      });
      
      try {
        await updateDoc(doc(db, 'childProfiles', perfilNino.id), {
          [`estadisticasJuegos.secuenciasPalabras.intentosFallidos`]: increment(1)
        });
      } catch (error) {
        console.error('Error guardando estadísticas:', error);
      }
      
      await finalizarJuego(false);
      return;
    }

    toast.error(`¡Secuencia incorrecta! Te quedan ${state.intentosRestantes - 1} ${
      state.intentosRestantes - 1 === 1 ? 'intento' : 'intentos'
    }`, {
      position: "top-center",
      autoClose: 2000,
      icon: "⚠️"
    });
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    generarNuevaSecuencia();
  };

  // Finalizar juego
  const finalizarJuego = async (victoria) => {
    dispatch({ type: GAME_ACTIONS.END_GAME });
    
    try {
      await updateDoc(doc(db, 'childProfiles', perfilNino.id), {
        [`estadisticasJuegos.secuenciasPalabras.${victoria ? 'victoriasConsecutivas' : 'derrotasConsecutivas'}`]: increment(1),
        [`estadisticasJuegos.secuenciasPalabras.maxPuntuacion`]: victoria ? state.puntuacion : increment(0)
      });

      if (victoria) {
        toast.success(`¡Felicitaciones! Completaste el juego con ${state.puntuacion} puntos y un combo máximo de ${state.maxCombo}x`);
      } else {
        toast.info('¡Juego terminado! Inténtalo de nuevo');
      }
    } catch (error) {
      console.error('Error guardando estadísticas finales:', error);
      toast.error('Error al guardar las estadísticas');
    }
  };

  // Iniciar desde el tutorial
  const iniciarJuegoDesdeModal = useCallback(() => {
    setShowTutorial(false);
    setDebeIniciarTimer(false);
    iniciarJuego();
  }, [iniciarJuego]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg">
        {/* Header */}
        <div className="border-b border-blue-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-[var(--primary-blue)]">
                Secuencias de Palabras
              </h2>
              <p className="text-indigo-600 mt-1 font-medium">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
          <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-700 font-medium">Puntuación</div>
            <div className="text-2xl font-bold text-blue-800">{state.puntuacion} pts</div>
          </div>

          <div className="bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg p-4">
            <div className="text-sm text-purple-700 font-medium">Nivel</div>
            <div className="text-2xl font-bold text-purple-800">{state.nivelActual + 1}</div>
          </div>

          {state.comboActual > 1 && (
            <div className="bg-gradient-to-r from-green-100 to-green-200 rounded-lg p-4 animate-pulse">
              <div className="text-sm text-green-700 font-medium">Combo</div>
              <div className="text-2xl font-bold text-green-800">x{state.comboActual}</div>
            </div>
          )}

          <div className="bg-gradient-to-r from-red-100 to-red-200 rounded-lg p-4">
            <div className="text-sm text-red-700 font-medium">Intentos</div>
            <div className="flex items-center space-x-2">
              {[...Array(state.intentosRestantes)].map((_, i) => (
                <span key={i} className="text-2xl">❤️</span>
              ))}
            </div>
          </div>
        </div>

        {/* Temporizador */}
        {state.tiempoRestante !== null && (
          <div className="px-6">
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-4">
              <div className="text-sm text-yellow-700 font-medium">Tiempo Restante</div>
              <div className="text-2xl font-bold text-yellow-800">{state.tiempoRestante}s</div>
            </div>
          </div>
        )}

        {/* Área de Juego */}
        {!state.juegoIniciado ? (
          <div className="p-12 text-center">
            <h3 className="text-2xl font-bold text-gray-700 mb-4">
              ¡Prepárate para empezar!
            </h3>
            <p className="text-gray-600 mb-6">
              Lee las instrucciones y cuando estés listo, presiona el botón "Cómo jugar"
            </p>
          </div>
        ) : (
          <div className="p-6">
            <div className="bg-gray-50 rounded-lg p-6 shadow-inner">
              {state.mostrando ? (
                <div className="flex flex-wrap justify-center gap-6">
                  {state.secuenciaActual.map((palabra, index) => (
                    <div
                      key={index}
                      className="w-28 h-28 flex flex-col items-center justify-center 
                               bg-white rounded-xl shadow-md transform transition-all duration-300
                               animate-bounce"
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      <div className="text-4xl mb-2">{palabra.imagen}</div>
                      <div className="text-sm font-medium">{palabra.palabra}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {configNivel.categorias.flatMap(categoria =>
                    CATEGORIAS[categoria].map(palabra => (
                      <button
                        key={palabra.id}
                        onClick={() => handleWordSelection(palabra)}
                        disabled={state.mostrando || state.juegoTerminado}
                        className={`
                          aspect-square flex flex-col items-center justify-center 
                          bg-white rounded-xl border-2 p-4
                          ${state.secuenciaUsuario.includes(palabra) ? 'border-green-400' : 'border-gray-200'}
                          ${!state.mostrando && !state.juegoTerminado ? 'hover:border-blue-400 hover:shadow-lg' : ''}
                          transition-all duration-300
                        `}
                      >
                        <div className="text-4xl mb-2">{palabra.imagen}</div>
                        <div className="text-sm font-medium">{palabra.palabra}</div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tutorial Modal */}
        <TutorialModal 
          isOpen={showTutorial} 
          onClose={iniciarJuegoDesdeModal}
          configNivel={configNivel}
        />

        {/* Modal de Fin de Juego */}
        {state.juegoTerminado && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl text-center max-w-md animate-fade-in">
              <div className="text-6xl mb-4">
                {state.intentosRestantes > 0 ? '🎉' : '💔'}
              </div>
              <h3 className="text-2xl font-bold text-[var(--primary-blue)] mb-4">
                {state.intentosRestantes > 0 ? '¡Juego Completado!' : '¡Juego Terminado!'}
              </h3>
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-lg mb-2">
                  Puntuación final: <span className="font-bold text-blue-600">{state.puntuacion}</span>
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Combo máximo: {state.maxCombo}x
                </p>
                <p className="text-sm text-gray-600">
                  Intentos restantes: {state.intentosRestantes}
                </p>
              </div>
              <div className="space-y-4">
                <button
                  onClick={iniciarJuego}
                  className="w-full px-6 py-3 bg-[var(--primary-blue)] text-white rounded-lg 
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

export default SecuenciasPalabras;