import React, { useState, useEffect, useCallback, useMemo, useReducer } from 'react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import { toast } from 'react-toastify';
import TutorialModal from './TutorialModal';
import GameOverModal from './GameOverModal';
import { NIVELES_CONFIG, CATEGORIAS, SONIDOS, ANIMACIONES } from './palabras';

// Acciones del juego
const GAME_ACTIONS = {
  INIT_GAME: 'INIT_GAME',
  START_SEQUENCE: 'START_SEQUENCE',
  SHOW_SEQUENCE: 'SHOW_SEQUENCE',
  HIDE_SEQUENCE: 'HIDE_SEQUENCE',
  SELECT_WORD: 'SELECT_WORD',
  UPDATE_TIMER: 'UPDATE_TIMER',
  COMPLETE_SEQUENCE: 'COMPLETE_SEQUENCE',
  HANDLE_ERROR: 'HANDLE_ERROR',
  END_GAME: 'END_GAME',
  RESET_GAME: 'RESET_GAME'
};

// Estado inicial
const initialState = {
  secuenciaActual: [],
  secuenciaUsuario: [],
  mostrando: false,
  puntuacion: 0,
  comboActual: 1,
  maxCombo: 1,
  nivelActual: 0,
  intentosRestantes: 3,
  tiempoRestante: null,
  juegoActivo: false,
  juegoTerminado: false,
  secuenciaCompletada: 0,
  mostrandoSecuencia: false,
  seleccionandoSecuencia: false
};

function gameReducer(state, action) {
  switch (action.type) {
    case GAME_ACTIONS.INIT_GAME:
      return {
        ...initialState,
        juegoActivo: true,
        intentosRestantes: action.payload.intentosMaximos || 3
      };

    case GAME_ACTIONS.START_SEQUENCE:
      return {
        ...state,
        secuenciaActual: action.payload.secuencia,
        secuenciaUsuario: [],
        mostrandoSecuencia: true,
        seleccionandoSecuencia: false,
        tiempoRestante: null
      };

    case GAME_ACTIONS.SHOW_SEQUENCE:
      return {
        ...state,
        mostrando: true,
        mostrandoSecuencia: true,
        seleccionandoSecuencia: false,
        tiempoRestante: action.payload.tiempo || null
      };

    case GAME_ACTIONS.HIDE_SEQUENCE:
      return {
        ...state,
        mostrando: false,
        mostrandoSecuencia: false,
        seleccionandoSecuencia: true,
        tiempoRestante: action.payload.tiempo || null
      };

    case GAME_ACTIONS.SELECT_WORD:
      return {
        ...state,
        secuenciaUsuario: [...state.secuenciaUsuario, action.payload.palabra]
      };

    case GAME_ACTIONS.UPDATE_TIMER:
      return {
        ...state,
        tiempoRestante: action.payload.tiempo
      };

    case GAME_ACTIONS.COMPLETE_SEQUENCE:
      return {
        ...state,
        puntuacion: state.puntuacion + action.payload.puntos,
        comboActual: state.comboActual + 1,
        maxCombo: Math.max(state.maxCombo, state.comboActual + 1),
        secuenciaCompletada: state.secuenciaCompletada + 1,
        mostrandoSecuencia: false,
        seleccionandoSecuencia: false,
        tiempoRestante: null
      };

    case GAME_ACTIONS.HANDLE_ERROR:
      return {
        ...state,
        comboActual: 1,
        intentosRestantes: state.intentosRestantes - 1,
        mostrandoSecuencia: false,
        seleccionandoSecuencia: false,
        tiempoRestante: null
      };

    case GAME_ACTIONS.END_GAME:
      return {
        ...state,
        juegoActivo: false,
        juegoTerminado: true,
        mostrandoSecuencia: false,
        seleccionandoSecuencia: false,
        tiempoRestante: null
      };

    case GAME_ACTIONS.RESET_GAME:
      return initialState;

    default:
      return state;
  }
}

function SecuenciasPalabras({ perfilNino, onScoreUpdate, onClose }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [showTutorial, setShowTutorial] = useState(true);

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

  // Reproducir sonidos
  const playSound = useCallback((soundName) => {
    const audio = new Audio(SONIDOS[soundName]);
    audio.volume = 0.3;
    audio.play().catch(() => {});
  }, []);

  // Función para generar nueva secuencia
  const generarSecuencia = useCallback(() => {
    const categoriasDisponibles = configNivel.categorias;
    const poolPalabras = categoriasDisponibles.flatMap(categoria => 
      CATEGORIAS[categoria] ? CATEGORIAS[categoria] : []
    );

    const secuencia = [];
    for (let i = 0; i < configNivel.numElementos; i++) {
      const randomIndex = Math.floor(Math.random() * poolPalabras.length);
      secuencia.push(poolPalabras[randomIndex]);
    }

    dispatch({
      type: GAME_ACTIONS.START_SEQUENCE,
      payload: { secuencia }
    });

    mostrarSecuencia(secuencia);
  }, [configNivel]);

  // Mostrar secuencia
  const mostrarSecuencia = async (secuencia) => {
    if (!secuencia || !secuencia.length) return;
    
    dispatch({ 
      type: GAME_ACTIONS.SHOW_SEQUENCE,
      payload: { 
        tiempo: configNivel.tiempoVisualizacion * secuencia.length / 1000 
      }
    });
  
    // Mostrar cada elemento con delay
    for (let i = 0; i < secuencia.length; i++) {
      await new Promise(resolve => setTimeout(resolve, configNivel.tiempoVisualizacion));
    }
  
    dispatch({ 
      type: GAME_ACTIONS.HIDE_SEQUENCE,
      payload: { 
        tiempo: configNivel.tiempoMemorizar
      }
    });
  };

  // Manejar selección de palabra
  const handleWordSelection = useCallback(async (palabra) => {
    if (state.mostrandoSecuencia || state.juegoTerminado) return;

    dispatch({
      type: GAME_ACTIONS.SELECT_WORD,
      payload: { palabra }
    });

    const indiceActual = state.secuenciaUsuario.length;
    if (palabra.id !== state.secuenciaActual[indiceActual].id) {
      playSound('error');
      await handleError();
      return;
    }

    playSound('acierto');

    if (state.secuenciaUsuario.length + 1 === state.secuenciaActual.length) {
      await handleSequenceComplete();
    }
  }, [state, playSound]);

  // Manejar secuencia completada
  const handleSequenceComplete = async () => {
    const puntosPorAcierto = configNivel.puntosBase;
    const multiplicador = Math.min(configNivel.maxCombo, state.comboActual);
    const puntosGanados = Math.floor(puntosPorAcierto * multiplicador);
  
    // Primero actualizamos el contador de secuencias
    const nuevaSecuenciaCompletada = state.secuenciaCompletada + 1;
  
    dispatch({
      type: GAME_ACTIONS.COMPLETE_SEQUENCE,
      payload: { 
        puntos: puntosGanados,
        secuenciaCompletada: nuevaSecuenciaCompletada
      }
    });
  
    if (onScoreUpdate) {
      await onScoreUpdate(puntosGanados);
    }
  
    if (state.comboActual > 1) {
      playSound('combo');
      toast.success(`¡${state.comboActual}x Combo! +${puntosGanados} puntos`);
    }
  
    // Comparamos con el número exacto de secuencias
    if (nuevaSecuenciaCompletada === configNivel.numSecuencias) {
      playSound('nivelCompletado');
      await finalizarJuego(true);
    } else {
      setTimeout(() => generarSecuencia(), 1000);
    }
  };

  // Manejar error
  const handleError = async () => {
    dispatch({ type: GAME_ACTIONS.HANDLE_ERROR });

    if (state.intentosRestantes <= 1) {
      toast.error('¡Se acabaron los intentos!');
      await finalizarJuego(false);
      return;
    }

    toast.warning(`¡Secuencia incorrecta! Te quedan ${state.intentosRestantes - 1} intentos`);
    setTimeout(() => generarSecuencia(), 1500);
  };

  // Iniciar juego
  const iniciarJuego = useCallback(() => {
    dispatch({
      type: GAME_ACTIONS.INIT_GAME,
      payload: { intentosMaximos: configNivel.intentosMaximos }
    });
    generarSecuencia();
  }, [configNivel, generarSecuencia]);

  // Finalizar juego
  const finalizarJuego = async (victoria) => {
    dispatch({ type: GAME_ACTIONS.END_GAME });
    
    try {
      await updateDoc(doc(db, 'childProfiles', perfilNino.id), {
        [`estadisticasJuegos.secuenciasPalabras.${victoria ? 'victorias' : 'derrotas'}`]: increment(1),
        'estadisticasJuegos.secuenciasPalabras.maxPuntuacion': victoria ? 
          Math.max((perfilNino.estadisticasJuegos?.secuenciasPalabras?.maxPuntuacion || 0), state.puntuacion) :
          increment(0)
      });

      playSound(victoria ? 'juegoCompletado' : 'error');
      
      if (victoria) {
        toast.success('¡Felicitaciones! Has completado el nivel');
      } else {
        toast.error('¡Juego terminado! Inténtalo de nuevo');
      }
    } catch (error) {
      console.error('Error guardando estadísticas:', error);
      toast.error('Error al guardar las estadísticas');
    }
  };

  useEffect(() => {

    if (!state.tiempoRestante) return;
    
    const timer = setInterval(() => {
      if (state.tiempoRestante <= 1) {
        clearInterval(timer);
        // Si estamos mostrando secuencia, pasamos a selección
        if (state.mostrandoSecuencia) {
          dispatch({ 
            type: GAME_ACTIONS.HIDE_SEQUENCE,
            payload: { 
              tiempo: configNivel.tiempoMemorizar
            }
          });
        } else if (state.seleccionandoSecuencia) {
          handleError();
        }
      } else {
        dispatch({
          type: GAME_ACTIONS.UPDATE_TIMER,
          payload: { tiempo: state.tiempoRestante - 1 }
        });
      }
    }, 1000);
  
    return () => clearInterval(timer);
  }, [state.tiempoRestante]);


  // 11. Renderizado
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
            <div className="text-sm text-purple-700 font-medium">
              Secuencia {state.secuenciaCompletada+1} / {configNivel.numSecuencias+1}
            </div>
            <div className="w-full bg-purple-200 rounded-full h-2.5 mt-2">
              <div 
                className="bg-purple-600 h-2.5 rounded-full transition-all"
                style={{ width: `${(state.secuenciaCompletada / configNivel.numSecuencias) * 100}%` }}
              ></div>
            </div>
          </div>
  
          {state.comboActual > 1 && (
            <div className="bg-gradient-to-r from-green-100 to-green-200 rounded-lg p-4 animate-pulse">
              <div className="text-sm text-green-700 font-medium">Combo</div>
              <div className="text-2xl font-bold text-green-800">x{state.comboActual}</div>
            </div>
          )}
  
          <div className="bg-gradient-to-r from-red-100 to-red-200 rounded-lg p-4">
            <div className="text-sm text-red-700 font-medium">Vidas</div>
            <div className="flex items-center space-x-2">
              {Array(state.intentosRestantes).fill('❤️').map((heart, index) => (
                <span key={index} className="text-2xl">{heart}</span>
              ))}
            </div>
          </div>
        </div>
  
        {/* Timer */}
        {state.tiempoRestante !== null && (
          <div className="px-6 mb-4">
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-4">
              <div className="text-sm text-yellow-700 font-medium">Tiempo Restante</div>
              <div className="text-2xl font-bold text-yellow-800">{state.tiempoRestante}s</div>
            </div>
          </div>
        )}
  
        {/* Área de Juego */}
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
              <div className="space-y-8">
                {configNivel.categorias.map(categoria => (
                  <div key={categoria}>
                    <h3 className="text-lg font-semibold mb-4 text-gray-700 capitalize">
                      {categoria}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {CATEGORIAS[categoria].map(palabra => (
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
                            disabled:opacity-50 disabled:cursor-not-allowed
                          `}
                        >
                          <div className="text-4xl mb-2">{palabra.imagen}</div>
                          <div className="text-sm font-medium">{palabra.palabra}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
  
        {/* Modales */}
        <TutorialModal 
          isOpen={showTutorial} 
          onClose={() => {
            setShowTutorial(false);
            if (!state.juegoActivo) {
              iniciarJuego();
            }
          }}
          configNivel={configNivel}
        />
  
        <GameOverModal 
          isOpen={state.juegoTerminado}
          victoria={state.secuenciaCompletada === configNivel.numSecuencias}
          puntuacion={state.puntuacion}
          maxCombo={state.maxCombo}
          onRestart={() => {
            iniciarJuego();
          }}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default SecuenciasPalabras;