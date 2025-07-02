import React, { useState, useEffect, useCallback, useMemo, useReducer, useRef } from 'react';
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
      const nuevaSecuenciaCompletada = state.secuenciaCompletada + 1;
      return {
        ...state,
        puntuacion: state.puntuacion + action.payload.puntos,
        comboActual: state.comboActual + 1,
        maxCombo: Math.max(state.maxCombo, state.comboActual + 1),
        secuenciaCompletada: nuevaSecuenciaCompletada,
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
        tiempoRestante: null,
        ...action.payload
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
  const [tiempoInicio, setTiempoInicio] = useState(null);
  
  // REF PARA CONTROLAR FINALIZACIÓN INMEDIATA
  const juegoFinalizandose = useRef(false);

  // Obtener configuración del nivel
  const configNivel = useMemo(() => {
    const nivelPerfil = perfilNino?.resultadosEvaluacion?.nivelAsignado?.nivel || 'básico';
    console.log('Nivel perfil detectado:', nivelPerfil);
    const NIVEL_MAPPING = {
      'básico': 'basico',
      'basico': 'basico',
      'básico-alto': 'básico-alto',
      'basico-alto': 'básico-alto',
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

  const manejarFinJuego = async (estadoFinal) => {
    try {
      const totalSecuenciasEsperadas = configNivel.numSecuencias;
      const secuenciasCompletadas = estadoFinal.secuenciaCompletada || 0;
      const porcentajeCorrecto = (secuenciasCompletadas / totalSecuenciasEsperadas) * 100;
      const tiempoTranscurrido = tiempoInicio ? (Date.now() - tiempoInicio) / 1000 : 0;
      const nivelActual = perfilNino?.resultadosEvaluacion?.nivelAsignado?.nivel || 'básico';
      const NIVEL_MAPPING = {
        'básico': 'basico',
        'basico': 'basico',
        'básico-alto': 'básico-alto',
        'basico-alto': 'básico-alto',
        'intermedio': 'intermedio',
        'avanzado': 'avanzado'
      };
      const nivelMapeado = NIVEL_MAPPING[nivelActual] || 'basico';

      // PUNTAJE BASE
      let puntosBase = estadoFinal.puntuacion || 0;
      let bonificacion = 0;
      let estrellas = 0;
      let victoria = false;

      // LÓGICA DE VICTORIA Y BONIFICACIÓN
      if (secuenciasCompletadas >= totalSecuenciasEsperadas) {
        victoria = true;
        bonificacion = nivelMapeado === 'avanzado' ? 15 : 10;
        estrellas = 3;
      } else if (secuenciasCompletadas >= (totalSecuenciasEsperadas * 0.6)) {
        victoria = true;
        bonificacion = nivelMapeado === 'avanzado' ? 8 : 5;
        estrellas = 2;
      } else {
        victoria = false;
        bonificacion = 0;
        estrellas = 0;
      }

      let puntosFinales = Math.max(puntosBase + bonificacion, 5);

      // LOGS PARA DEBUG
      console.log('📊 PUNTAJE FINAL (solo para mostrar, NO se suma aquí):', {
        puntosBase,
        bonificacion,
        puntosFinales,
        estrellas,
        secuenciasCompletadas,
        porcentaje: porcentajeCorrecto,
        victoria
      });

      // NO sumar puntos ni estrellas aquí. Solo actualizar estadísticas y notificar.
      await updateDoc(doc(db, 'childProfiles', perfilNino.id), {
        juegosCompletados: increment(1),
        [`estadisticasJuegos.secuenciasPalabras.partidasJugadas`]: increment(1),
        [`estadisticasJuegos.secuenciasPalabras.${victoria ? 'victorias' : 'derrotas'}`]: increment(1),
        [`estadisticasJuegos.secuenciasPalabras.maxPuntuacion`]: Math.max(
          (perfilNino?.estadisticasJuegos?.secuenciasPalabras?.maxPuntuacion || 0), 
          puntosFinales
        ),
        actividadesCompletadas: increment(1)
      });

      if (auth.currentUser) {
        await NotificationService.crearNotificacion({
          tutorId: auth.currentUser.uid,
          profileId: perfilNino.id,
          tipo: 'logro_alcanzado',
          titulo: 'ECO: Juego terminado',
          mensaje: `Puntuación final: ${puntosFinales} puntos`,
          datos: { 
            puntos: puntosFinales, 
            estrellas: estrellas,
            secuenciasCompletadas,
            porcentaje: Math.round(porcentajeCorrecto)
          },
          prioridad: victoria ? 'alta' : 'normal'
        });
      }

      if (onScoreUpdate) {
        onScoreUpdate({
          puntos: puntosFinales,
          estrellas: estrellas,
          nombreJuego: 'ECO - Secuencias de Palabras',
          tipoJuego: 'eco',
          nivel: nivelActual,
          secuenciasCompletadas: secuenciasCompletadas,
          totalSecuencias: totalSecuenciasEsperadas,
          combo: estadoFinal.maxCombo,
          porcentajeCompletado: Math.round(porcentajeCorrecto),
          tiempoUsado: Math.round(tiempoTranscurrido),
          perfecto: secuenciasCompletadas === totalSecuenciasEsperadas,
          esActividad:true,
          victoria: victoria
        });
      }

      // ACTUALIZAR EL ESTADO FINAL CON LOS DATOS COMPLETOS
      dispatch({ 
        type: GAME_ACTIONS.END_GAME, 
        payload: { 
          puntuacionBase: puntosBase,
          bonificacion,
          puntuacionFinal: puntosFinales,
          estrellas,
          victoria,
          secuenciasCompletadas: secuenciasCompletadas,
          totalSecuencias: totalSecuenciasEsperadas,
          porcentajeCorrecto: Math.round(porcentajeCorrecto)
        } 
      });

      toast.success(`¡Juego terminado! Puntuación final: ${puntosFinales} puntos`);
    } catch (error) {
      console.error('Error finalizando juego ECO:', error);
      toast.error('Error al guardar el progreso');
    }
  };

  const finalizarJuego = async (victoria = false) => {
    if (juegoFinalizandose.current) {
      console.log('⛔ BLOQUEO: Ya se está finalizando');
      return;
    }
    
    console.log('🚨 FINALIZANDO JUEGO - Victoria:', victoria);
    juegoFinalizandose.current = true;
    
    await manejarFinJuego({
      ...state,
      victoria,
      secuenciaCompletada: state.secuenciaCompletada,
      maxCombo: state.maxCombo,
      puntuacion: state.puntuacion
    });
  };

  // Función para generar nueva secuencia
  const generarSecuencia = useCallback(() => {
    if (juegoFinalizandose.current || state.juegoTerminado || state.secuenciaCompletada >= configNivel.numSecuencias) {
      console.log('⛔ BLOQUEO generarSecuencia: Juego finalizándose, terminado o máximo alcanzado');
      return;
    }

    console.log('🎮 Generando nueva secuencia...');
    
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
  }, [configNivel, state.juegoTerminado, state.secuenciaCompletada]);

  // Mostrar secuencia
  const mostrarSecuencia = async (secuencia) => {
    if (!secuencia || !secuencia.length || juegoFinalizandose.current || state.juegoTerminado) return;
    
    dispatch({ 
      type: GAME_ACTIONS.SHOW_SEQUENCE,
      payload: { 
        tiempo: configNivel.tiempoVisualizacion * secuencia.length / 1000 
      }
    });
  
    for (let i = 0; i < secuencia.length; i++) {
      if (juegoFinalizandose.current || state.juegoTerminado) break;
      await new Promise(resolve => setTimeout(resolve, configNivel.tiempoVisualizacion));
    }
  
    if (!juegoFinalizandose.current && !state.juegoTerminado) {
      dispatch({ 
        type: GAME_ACTIONS.HIDE_SEQUENCE,
        payload: { 
          tiempo: configNivel.tiempoMemorizar
        }
      });
    }
  };

  const handleError = useCallback(async () => {
    if (juegoFinalizandose.current || state.juegoTerminado) return;

    dispatch({ type: GAME_ACTIONS.HANDLE_ERROR });

    if (state.intentosRestantes <= 1) {
      toast.error('¡Se acabaron los intentos!');
      await finalizarJuego(false);
      return;
    }

    toast.warning(`¡Secuencia incorrecta! Te quedan ${state.intentosRestantes - 1} intentos`);
    setTimeout(() => {
      if (!juegoFinalizandose.current && !state.juegoTerminado) {
        generarSecuencia();
      }
    }, 1500);
  }, [state.intentosRestantes, state.juegoTerminado, finalizarJuego, generarSecuencia]);

  const handleSequenceComplete = useCallback(async () => {
    if (juegoFinalizandose.current) {
      console.log('⛔ BLOQUEO handleSequenceComplete: Juego finalizándose');
      return;
    }

    console.log('🎯 SECUENCIA COMPLETADA!');
    
    const puntosPorAcierto = configNivel.puntosBase;
    const multiplicador = Math.min(configNivel.maxCombo, state.comboActual);
    const puntosGanados = Math.floor(puntosPorAcierto * multiplicador);

    // CALCULAR SECUENCIAS COMPLETADAS ANTES DEL DISPATCH
    const secuenciasCompletadas = state.secuenciaCompletada + 1;
    
    console.log('📊 CÁLCULO DE PUNTUACIÓN:', {
      puntosPorAcierto,
      comboActual: state.comboActual,
      multiplicador,
      puntosGanados,
      puntuacionActual: state.puntuacion,
      puntuacionDespues: state.puntuacion + puntosGanados,
      secuenciasCompletadas,
      totalRequeridas: configNivel.numSecuencias,
      debeTerminar: secuenciasCompletadas >= configNivel.numSecuencias
    });

    // DISPATCH PARA ACTUALIZAR EL ESTADO
    dispatch({
      type: GAME_ACTIONS.COMPLETE_SEQUENCE,
      payload: { 
        puntos: puntosGanados
      }
    });

    if (state.comboActual > 1) {
      playSound('combo');
      toast.success(`¡${state.comboActual}x Combo! +${puntosGanados} puntos`);
    } else {
      toast.success(`¡Secuencia correcta! +${puntosGanados} puntos`);
    }

    // VERIFICAR SI EL JUEGO DEBE TERMINAR
    if (secuenciasCompletadas >= configNivel.numSecuencias) {
      console.log('🎉 ¡JUEGO COMPLETADO! Terminando...');
      playSound('nivelCompletado');
      await finalizarJuego(true);
    } else {
      console.log(`➡️ Continuando... ${secuenciasCompletadas}/${configNivel.numSecuencias}`);
      // USAR setTimeout CON VERIFICACIÓN ADICIONAL
      setTimeout(() => {
        if (!juegoFinalizandose.current) {
          generarSecuencia();
        }
      }, 1000);
    }
  }, [state.comboActual, state.secuenciaCompletada, state.puntuacion, configNivel, playSound, finalizarJuego, generarSecuencia]);

  const handleWordSelection = useCallback(async (palabra) => {
    if (state.mostrandoSecuencia || juegoFinalizandose.current || state.juegoTerminado) return;

    // VERIFICAR SI LA SECUENCIA ESTÁ COMPLETA ANTES DE AGREGAR LA PALABRA
    const secuenciaCompleta = state.secuenciaUsuario.length + 1 === state.secuenciaActual.length;
    
    console.log('🎯 SELECCIONANDO PALABRA:', {
      palabra: palabra.palabra,
      secuenciaUsuarioActual: state.secuenciaUsuario.length,
      secuenciaActualTotal: state.secuenciaActual.length,
      secuenciaCompleta: secuenciaCompleta
    });
    
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

    // VERIFICAR SI LA SECUENCIA ESTÁ COMPLETA DESPUÉS DE AGREGAR LA PALABRA
    if (secuenciaCompleta) {
      console.log('✅ SECUENCIA COMPLETA - LLAMANDO handleSequenceComplete');
      await handleSequenceComplete();
    }
  }, [state.secuenciaUsuario.length, state.secuenciaActual, state.mostrandoSecuencia, state.juegoTerminado, playSound, handleError, handleSequenceComplete]);

  const iniciarJuego = useCallback(() => {
    console.log('🔄 REINICIANDO JUEGO...');
    juegoFinalizandose.current = false; // RESETEAR FLAG
    setShowTutorial(false); // RESETEAR TUTORIAL
    setTiempoInicio(Date.now());
    
    // RESETEAR COMPLETAMENTE EL ESTADO
    dispatch({
      type: GAME_ACTIONS.RESET_GAME
    });
    
    // INICIALIZAR EL NUEVO JUEGO
    dispatch({
      type: GAME_ACTIONS.INIT_GAME,
      payload: { intentosMaximos: configNivel.intentosMaximos }
    });
    
    console.log('🚀 JUEGO INICIADO - Configuración:', {
      numSecuencias: configNivel.numSecuencias,
      numElementos: configNivel.numElementos,
      nivel: configNivel.descripcion
    });
  }, [configNivel, generarSecuencia]);

  // --- FIX: Generar la primera secuencia tras reinicio ---
  useEffect(() => {
    if (
      state.juegoActivo &&
      !state.juegoTerminado &&
      state.secuenciaCompletada === 0 &&
      !state.mostrandoSecuencia &&
      !state.seleccionandoSecuencia &&
      !juegoFinalizandose.current
    ) {
      generarSecuencia();
    }
    // eslint-disable-next-line
  }, [state.juegoActivo, state.juegoTerminado, state.secuenciaCompletada]);

  useEffect(() => {
    if (!state.tiempoRestante || juegoFinalizandose.current || state.juegoTerminado) return;
    
    const timer = setInterval(() => {
      if (juegoFinalizandose.current || state.juegoTerminado) {
        clearInterval(timer);
        return;
      }
      
      if (state.tiempoRestante <= 1) {
        clearInterval(timer);
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
  }, [state.tiempoRestante, configNivel.tiempoMemorizar, state.juegoTerminado]);

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
        victoria={state.victoria || false}
        puntuacionBase={state.puntuacionBase}
        bonificacion={state.bonificacion}
        puntuacion={state.puntuacionFinal}
        maxCombo={state.maxCombo}
        secuenciasCompletadas={state.secuenciasCompletadas || state.secuenciaCompletada}
        totalSecuencias={state.totalSecuencias || configNivel.numSecuencias}
        porcentajeCorrecto={state.porcentajeCorrecto || 0}
        estrellas={state.estrellas}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
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
                {state.secuenciaCompletada}/{configNivel.numSecuencias}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-gray-500">Correctas</div>
              <div className="text-lg font-bold text-green-600">
                {state.secuenciaCompletada}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-gray-500">Combo</div>
              <div className="text-lg font-bold text-purple-600">
                {state.comboActual}x
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
        
        <div className="mt-4">
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${(state.secuenciaCompletada / configNivel.numSecuencias) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        {state.mostrandoSecuencia && !state.juegoTerminado && (
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

        {state.seleccionandoSecuencia && !state.juegoTerminado && (
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">
              Repite la secuencia ({state.secuenciaUsuario.length + 1}/{state.secuenciaActual.length}):
            </h3>
            
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

        {!state.mostrandoSecuencia && !state.seleccionandoSecuencia && state.juegoActivo && !state.juegoTerminado && (
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