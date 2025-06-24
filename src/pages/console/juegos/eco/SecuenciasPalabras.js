// src/pages/console/juegos/eco/SecuenciasPalabras.js - VERSIÓN CORREGIDA
import React, { useState, useEffect, useCallback, useMemo, useReducer } from 'react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import { toast } from 'react-toastify';
import TutorialModal from './TutorialModal';
import GameOverModal from './GameOverModal';
import { NIVELES_CONFIG, CATEGORIAS, SONIDOS, ANIMACIONES } from './palabras';
import { NotificationService } from '../../../../services/notificationService';
import { auth } from '../../../../config/firebase';
import RewardsService from '../../../../services/rewardsService';

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
  secuenciasCorrectas: 0, // ✅ AGREGADO: Contador de secuencias correctas
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
        secuenciasCorrectas: state.secuenciasCorrectas + 1, // ✅ AGREGADO
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
  const [tiempoInicio, setTiempoInicio] = useState(null); // ✅ AGREGADO: Para medir tiempo total

  // Obtener configuración del nivel
  const configNivel = useMemo(() => {
    const nivelPerfil = perfilNino?.resultadosEvaluacion?.nivelAsignado?.nivel || 'básico';
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

  // ✅ CORREGIDO: Sistema de finalización con puntuación estándar
  const manejarFinJuego = async (estadoFinal) => {
    try {
      // Calcular métricas reales del rendimiento
      const totalSecuenciasEsperadas = configNivel.numSecuencias;
      const secuenciasCompletadas = estadoFinal.secuenciasCorrectas || 0;
      const porcentajeCorrecto = (secuenciasCompletadas / totalSecuenciasEsperadas) * 100;
      
      // Tiempo transcurrido
      const tiempoTranscurrido = tiempoInicio ? (Date.now() - tiempoInicio) / 1000 : 0;
      
      // Calcular tiempo objetivo basado en configuración del nivel
      const tiempoObjetivo = configNivel.numSecuencias * (
        (configNivel.tiempoVisualizacion * configNivel.numElementos / 1000) + 
        (configNivel.tiempoMemorizar || 30)
      );
      
      // ✅ Puntuación según especificación del sistema
      const nivelActual = perfilNino?.resultadosEvaluacion?.nivelAsignado?.nivel || 'básico';
      const NIVEL_MAPPING = {
        'básico': 'basico',
        'básico-alto': 'basico-alto',
        'intermedio': 'intermedio',
        'avanzado': 'avanzado'
      };
      const nivelMapeado = NIVEL_MAPPING[nivelActual] || 'basico';
      
      let puntosFinales = 0;
      
      if (secuenciasCompletadas >= (totalSecuenciasEsperadas * 0.6)) {
        // Juego completado exitosamente (60% o más)
        if (nivelMapeado === 'avanzado') {
          puntosFinales = 20; // Nivel difícil = 20 pts
        } else {
          puntosFinales = 10; // Completar juego = 10 pts
        }
        
        // Bonificación por tiempo récord (si completó rápido)
        if (tiempoTranscurrido < (tiempoObjetivo * 0.7)) {
          puntosFinales += 5; // 5 pts adicionales por tiempo récord
        }
      } else {
        // Juego incompleto - puntos proporcionales mínimos
        puntosFinales = Math.max(5, Math.floor((configNivel.puntosBase * porcentajeCorrecto) / 100));
      }

      // Agregar puntos
      await RewardsService.agregarPuntos(
        perfilNino.id,
        puntosFinales,
        `ECO completado - Nivel: ${nivelActual} - Secuencias: ${secuenciasCompletadas}/${totalSecuenciasEsperadas}`
      );

      // ✅ CORREGIDO: Calcular estrellas con métricas reales
      const recompensa = await RewardsService.otorgarRecompensaActividad(
        perfilNino.id,
        'eco',
        {
          porcentajeCorrecto: Math.round(porcentajeCorrecto),
          tiempo: Math.round(tiempoTranscurrido),
          tiempoObjetivo: Math.round(tiempoObjetivo)
        }
      );

      // Actualizar estadísticas del juego
      await updateDoc(doc(db, 'childProfiles', perfilNino.id), {
        juegosCompletados: increment(1),
        [`estadisticasJuegos.secuenciasPalabras.partidasJugadas`]: increment(1),
        [`estadisticasJuegos.secuenciasPalabras.${secuenciasCompletadas >= totalSecuenciasEsperadas ? 'victorias' : 'derrotas'}`]: increment(1),
        [`estadisticasJuegos.secuenciasPalabras.maxPuntuacion`]: Math.max(
          (perfilNino?.estadisticasJuegos?.secuenciasPalabras?.maxPuntuacion || 0), 
          puntosFinales
        ),
        actividadesCompletadas: increment(1)
      });

      // Notificación persistente
      if (auth.currentUser) {
        await NotificationService.crearNotificacion({
          tutorId: auth.currentUser.uid,
          profileId: perfilNino.id,
          tipo: 'logro_alcanzado',
          titulo: 'ECO: Juego terminado',
          mensaje: `Puntuación final: ${puntosFinales} puntos`,
          datos: { 
            puntos: puntosFinales, 
            estrellas: recompensa.estrellas,
            secuenciasCompletadas,
            porcentaje: Math.round(porcentajeCorrecto)
          },
          prioridad: secuenciasCompletadas >= totalSecuenciasEsperadas ? 'alta' : 'normal'
        });
      }

      // Notificar a la IU
      if (onScoreUpdate) {
        onScoreUpdate({
          puntos: puntosFinales,
          estrellas: recompensa.estrellas,
          nombreJuego: 'ECO - Secuencias de Palabras',
          tipoJuego: 'eco',
          nivel: nivelActual,
          secuenciasCompletadas: secuenciasCompletadas,
          totalSecuencias: totalSecuenciasEsperadas,
          combo: estadoFinal.maxCombo,
          porcentajeCompletado: Math.round(porcentajeCorrecto),
          tiempoUsado: Math.round(tiempoTranscurrido),
          perfecto: secuenciasCompletadas === totalSecuenciasEsperadas
        });
      }

      // Actualizar el estado del juego
      dispatch({ 
        type: GAME_ACTIONS.END_GAME, 
        payload: { 
          ...estadoFinal, 
          puntuacionFinal: puntosFinales,
          estrellas: recompensa.estrellas
        } 
      });

      console.log('✅ ECO completado:', {
        puntos: puntosFinales,
        estrellas: recompensa.estrellas,
        porcentaje: porcentajeCorrecto,
        nivel: nivelActual,
        secuenciasCompletadas: secuenciasCompletadas,
        tiempo: tiempoTranscurrido
      });

      toast.success(`¡Juego terminado! Puntuación final: ${puntosFinales} puntos`);

    } catch (error) {
      console.error('Error finalizando juego ECO:', error);
      toast.error('Error al guardar el progreso');
    }
  };

  // ✅ CORREGIDO: Finalizar juego con estado actual
  const finalizarJuego = async (victoria = false) => {
    await manejarFinJuego({
      ...state,
      victoria,
      secuenciaCompletada: state.secuenciaCompletada,
      secuenciasCorrectas: state.secuenciasCorrectas,
      maxCombo: state.maxCombo,
      puntuacion: state.puntuacion
    });
  };

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
  
    // Actualizar contador de secuencias
    const nuevaSecuenciaCompletada = state.secuenciaCompletada + 1;
  
    dispatch({
      type: GAME_ACTIONS.COMPLETE_SEQUENCE,
      payload: { 
        puntos: puntosGanados,
        secuenciaCompletada: nuevaSecuenciaCompletada
      }
    });
  
    if (state.comboActual > 1) {
      playSound('combo');
      toast.success(`¡${state.comboActual}x Combo! +${puntosGanados} puntos`);
    }
  
    // Verificar si se completó el juego
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
    setTiempoInicio(Date.now()); // ✅ AGREGADO: Iniciar medición de tiempo
    dispatch({
      type: GAME_ACTIONS.INIT_GAME,
      payload: { intentosMaximos: configNivel.intentosMaximos }
    });
    generarSecuencia();
  }, [configNivel, generarSecuencia]);

  // Timer del juego
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
  }, [state.tiempoRestante, configNivel.tiempoMemorizar]);

  // Obtener opciones de palabras disponibles
  const getOpcionesPalabras = () => {
    const categoriasDisponibles = configNivel.categorias;
    return categoriasDisponibles.flatMap(categoria => 
      CATEGORIAS[categoria] ? CATEGORIAS[categoria] : []
    );
  };

  if (showTutorial) {
    return (
      <TutorialModal
        isOpen={showTutorial}
        onClose={() => {
          setShowTutorial(false);
          iniciarJuego();
        }}
        configNivel={configNivel}
      />
    );
  }

  if (state.juegoTerminado) {
    return (
      <GameOverModal
        isOpen={true}
        onClose={onClose}
        onRestart={iniciarJuego}
        estado={state}
        configNivel={configNivel}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      {/* Header del juego */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>
            <h1 className="text-xl font-bold text-gray-800">ECO - Secuencias de Palabras</h1>
            <span className="text-sm bg-gray-100 px-2 py-1 rounded">{configNivel.descripcion}</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-sm text-gray-500">Secuencia</div>
              <div className="text-lg font-bold text-blue-600">
                {state.secuenciaCompletada + 1}/{configNivel.numSecuencias}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-gray-500">Correctas</div>
              <div className="text-lg font-bold text-green-600">
                {state.secuenciasCorrectas}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-gray-500">Combo</div>
              <div className="text-lg font-bold text-purple-600">
                {state.comboActual}x
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-gray-500">Puntos</div>
              <div className="text-lg font-bold text-yellow-600">
                {state.puntuacion}
              </div>
            </div>
            
            {state.tiempoRestante !== null && (
              <div className="text-center">
                <div className="text-sm text-gray-500">Tiempo</div>
                <div className={`text-lg font-bold ${state.tiempoRestante < 10 ? 
                  'text-red-600' : 'text-gray-800'}`}>
                  {state.tiempoRestante}s
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Barra de progreso */}
        <div className="mt-4">
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${(state.secuenciaCompletada / configNivel.numSecuencias) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Área del juego */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Área de secuencia */}
        {state.mostrandoSecuencia && (
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold mb-4">Memoriza esta secuencia:</h3>
            <div className="flex justify-center space-x-4">
              {state.secuenciaActual.map((palabra, index) => (
                <div
                  key={`${palabra.id}-${index}`}
                  className="bg-blue-100 p-4 rounded-lg text-center"
                >
                  <div className="text-3xl mb-2">{palabra.imagen}</div>
                  <div className="font-medium">{palabra.palabra}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Área de selección */}
        {state.seleccionandoSecuencia && (
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">
              Repite la secuencia ({state.secuenciaUsuario.length + 1}/{state.secuenciaActual.length}):
            </h3>
            
            {/* Secuencia del usuario */}
            <div className="flex justify-center space-x-2 mb-6">
              {state.secuenciaUsuario.map((palabra, index) => (
                <div
                  key={`selected-${index}`}
                  className="bg-green-100 p-2 rounded-lg text-center"
                >
                  <div className="text-2xl">{palabra.imagen}</div>
                </div>
              ))}
              {Array.from({ length: state.secuenciaActual.length - state.secuenciaUsuario.length }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="bg-gray-100 p-2 rounded-lg w-16 h-16 flex items-center justify-center"
                >
                  <span className="text-gray-400">?</span>
                </div>
              ))}
            </div>

            {/* Opciones disponibles */}
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
              {getOpcionesPalabras().map((palabra) => (
                <button
                  key={palabra.id}
                  onClick={() => handleWordSelection(palabra)}
                  className="bg-gray-100 hover:bg-gray-200 p-3 rounded-lg transition-colors text-center"
                >
                  <div className="text-2xl mb-1">{palabra.imagen}</div>
                  <div className="text-xs">{palabra.palabra}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Estado de espera */}
        {!state.mostrandoSecuencia && !state.seleccionandoSecuencia && state.juegoActivo && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-gray-700">
              Preparando siguiente secuencia...
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}

export default SecuenciasPalabras;