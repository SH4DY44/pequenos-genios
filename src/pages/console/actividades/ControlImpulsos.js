import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import RewardsService from '../../../services/rewardsService';

const GAME_STATE = {
  TUTORIAL: 'tutorial',
  ESPERANDO_INICIO: 'esperando_inicio',
  ESTIMULO_PRESENTE: 'estimulo_presente',
  SENAL_CORRECTA: 'senal_correcta',
  SENAL_FALSA: 'senal_falsa',
  FEEDBACK: 'feedback',
  COMPLETADO: 'completado'
};

// ✅ CORREGIDO: Configuración usando niveles del sistema adaptativo
const NIVELES_CONFIG = {
  'basico': {
    tiempoEsperaMin: 2000,
    tiempoEsperaMax: 4000,
    duracionSenal: 1500,
    incluirSenalesFalsas: false,
    probabilidadSenalFalsa: 0,
    totalRondas: 8,
    tiempoLimite: null, // Sin límite de tiempo
    puntosBase: 10,
    descripcion: "Nivel básico - Solo señales correctas"
  },
  'basico-alto': {
    tiempoEsperaMin: 1500,
    tiempoEsperaMax: 4000,
    duracionSenal: 1200,
    incluirSenalesFalsas: true,
    probabilidadSenalFalsa: 0.2, // 20% señales falsas
    totalRondas: 10,
    tiempoLimite: 300, // 5 minutos
    puntosBase: 15,
    descripcion: "Nivel básico-alto - Con algunas señales falsas"
  },
  'intermedio': {
    tiempoEsperaMin: 1200,
    tiempoEsperaMax: 3500,
    duracionSenal: 1000,
    incluirSenalesFalsas: true,
    probabilidadSenalFalsa: 0.3, // 30% señales falsas
    totalRondas: 12,
    tiempoLimite: 240, // 4 minutos
    puntosBase: 20,
    descripción: "Nivel intermedio - Mayor desafío"
  },
  'avanzado': {
    tiempoEsperaMin: 1000,
    tiempoEsperaMax: 3000,
    duracionSenal: 800,
    incluirSenalesFalsas: true,
    probabilidadSenalFalsa: 0.4, // 40% señales falsas
    totalRondas: 15,
    tiempoLimite: 180, // 3 minutos
    puntosBase: 25,
    descripcion: "Nivel avanzado - Máximo autocontrol"
  }
};

function ControlImpulsos({ actividad, perfilNino, onComplete, onClose }) {
  const navigate = useNavigate();
  
  // Estados del juego
  const [puntuacion, setPuntuacion] = useState(0);
  const [ronda, setRonda] = useState(0);
  const [respuestasCorrectas, setRespuestasCorrectas] = useState(0);
  const [actividadCompletada, setActividadCompletada] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [gameState, setGameState] = useState(GAME_STATE.TUTORIAL);
  const [timerId, setTimerId] = useState(null);
  const [mensajeFeedback, setMensajeFeedback] = useState('');
  const [tiempoRestante, setTiempoRestante] = useState(null);
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

  // Inicializar juego
  useEffect(() => {
    if (gameState === GAME_STATE.ESPERANDO_INICIO && ronda === 0) {
      setTiempoInicio(Date.now());
      if (config.tiempoLimite) {
        setTiempoRestante(config.tiempoLimite);
      }
    }
  }, [gameState, ronda]);

  // Timer del juego
  useEffect(() => {
    let interval = null;
    if (tiempoRestante > 0 && !actividadCompletada) {
      interval = setInterval(() => {
        setTiempoRestante(tiempo => {
          if (tiempo <= 1) {
            finalizarActividad('Tiempo agotado');
            return 0;
          }
          return tiempo - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [tiempoRestante, actividadCompletada]);

  // ✅ CORREGIDO: Sistema de puntuación y estrellas mejorado
  const finalizarActividad = useCallback(async (razon = 'Completado') => {
    if (actividadCompletada) return;
    setActividadCompletada(true);
    setGameState(GAME_STATE.COMPLETADO);
    setCargando(true);

    try {
      // Calcular métricas reales del rendimiento
      const totalRondasJugadas = Math.max(ronda, 1);
      const porcentajeCorrecto = (respuestasCorrectas / totalRondasJugadas) * 100;
      
      // Tiempo transcurrido
      const tiempoTranscurrido = tiempoInicio ? (Date.now() - tiempoInicio) / 1000 : 0;
      const tiempoObjetivo = config.tiempoLimite || 300; // 5 minutos por defecto si no hay límite
      
      // ✅ Puntuación según especificación del sistema
      let puntosFinales = 0;
      
      if (razon === 'Completado' || respuestasCorrectas >= (config.totalRondas * 0.6)) {
        // Actividad completada exitosamente (60% o más)
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
        `Control de Impulsos - ${razon} - Nivel: ${nivelActual}`
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
          nombreActividad: actividad?.titulo || 'Control de Impulsos',
          porcentajeCompletado: Math.round(porcentajeCorrecto),
          nivel: nivelActual,
          respuestasCorrectas: respuestasCorrectas,
          totalRondas: config.totalRondas,
          tiempoUsado: Math.round(tiempoTranscurrido)
        });
      }

      console.log('✅ Control de Impulsos completado:', {
        puntos: puntosFinales,
        estrellas: recompensa.estrellas,
        porcentaje: porcentajeCorrecto,
        nivel: nivelActual,
        respuestasCorrectas: respuestasCorrectas,
        tiempo: tiempoTranscurrido
      });

    } catch (error) {
      console.error('Error finalizando actividad:', error);
      toast.error('Error al guardar el progreso');
    } finally {
      setCargando(false);
    }
  }, [actividadCompletada, ronda, respuestasCorrectas, config, nivelActual, tiempoInicio, perfilNino, actividad, onComplete]);

  // Funciones del juego
  const pasarSiguienteRonda = useCallback((delay) => {
    const timer = setTimeout(() => {
      setRonda(prev => {
        const nuevaRonda = prev + 1;
        if (nuevaRonda <= config.totalRondas) {
          setGameState(GAME_STATE.ESPERANDO_INICIO);
        } else {
          finalizarActividad('Completado');
        }
        return nuevaRonda;
      });
    }, delay);
    setTimerId(timer);
  }, [config.totalRondas, finalizarActividad]);

  const mostrarSenal = useCallback(() => {
    const esSenalCorrecta = config.incluirSenalesFalsas 
      ? Math.random() >= config.probabilidadSenalFalsa 
      : true;

    setGameState(esSenalCorrecta ? GAME_STATE.SENAL_CORRECTA : GAME_STATE.SENAL_FALSA);

    const timer = setTimeout(() => {
      if (esSenalCorrecta) {
        setMensajeFeedback('¡Tiempo agotado!');
        toast.warn('No respondiste a tiempo');
      } else {
        setMensajeFeedback('¡Bien hecho!');
        setRespuestasCorrectas(prev => prev + 1);
        toast.success('Resististe la tentación');
      }
      setGameState(GAME_STATE.FEEDBACK);
      pasarSiguienteRonda(1500);
    }, config.duracionSenal);
    
    setTimerId(timer);
  }, [config, pasarSiguienteRonda]);

  const generarNuevaRonda = useCallback(() => {
    if (ronda >= config.totalRondas) {
      finalizarActividad();
      return;
    }

    setMensajeFeedback('');
    setGameState(GAME_STATE.ESTIMULO_PRESENTE);

    const tiempoEspera = Math.random() * (config.tiempoEsperaMax - config.tiempoEsperaMin) 
      + config.tiempoEsperaMin;

    const timer = setTimeout(() => {
      mostrarSenal();
    }, tiempoEspera);
    
    setTimerId(timer);
  }, [ronda, config, mostrarSenal, finalizarActividad]);

  const handleInteraction = useCallback(() => {
    if (timerId) clearTimeout(timerId);
    setGameState(GAME_STATE.FEEDBACK);

    let correcto = false;
    switch(gameState) {
      case GAME_STATE.ESTIMULO_PRESENTE:
        setMensajeFeedback('¡Demasiado pronto!');
        toast.warn('Espera la señal');
        break;
      case GAME_STATE.SENAL_CORRECTA:
        correcto = true;
        setRespuestasCorrectas(prev => prev + 1);
        setMensajeFeedback('¡Correcto!');
        toast.success('¡Bien hecho!');
        break;
      case GAME_STATE.SENAL_FALSA:
        setMensajeFeedback('¡Error!');
        toast.error('No debías clickear');
        break;
    }

    pasarSiguienteRonda(1500);
  }, [timerId, gameState, pasarSiguienteRonda]);

  // Efectos
  useEffect(() => {
    if (gameState === GAME_STATE.ESPERANDO_INICIO) {
      generarNuevaRonda();
    }
  }, [gameState, generarNuevaRonda]);

  useEffect(() => {
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [timerId]);

  const formatearTiempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Renderizado
  const renderTutorial = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-lg">
        <div className="text-5xl mb-4">⏱️</div>
        <h3 className="text-xl font-bold mb-4">Control de Impulsos</h3>
        <div className="text-sm bg-gray-100 px-3 py-1 rounded mb-4">
          {config.descripcion}
        </div>
        <p className="mb-6 text-gray-600">
          Haz clic SOLO cuando el círculo se ponga verde. Si se pone rojo, ¡NO hagas clic!
        </p>
        <div className="space-y-2 text-sm text-gray-500 mb-6">
          <p>Rondas: {config.totalRondas}</p>
          <p>Señales falsas: {config.incluirSenalesFalsas ? 'Sí' : 'No'}</p>
          {config.tiempoLimite && <p>Tiempo límite: {formatearTiempo(config.tiempoLimite)}</p>}
          <p>Puntos base: {config.puntosBase}</p>
        </div>
        <button
          onClick={() => setGameState(GAME_STATE.ESPERANDO_INICIO)}
          className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
        >
          ¡Comenzar!
        </button>
      </div>
    </div>
  );

  const getCircleStyle = () => {
    const baseStyle = "w-48 h-48 rounded-full flex items-center justify-center text-white text-xl font-bold transition-all duration-300 shadow-lg";
    
    switch (gameState) {
      case GAME_STATE.ESTIMULO_PRESENTE:
        return `${baseStyle} bg-gray-400 cursor-pointer hover:brightness-110`;
      case GAME_STATE.SENAL_CORRECTA:
        return `${baseStyle} bg-green-500 cursor-pointer hover:brightness-110 animate-pulse`;
      case GAME_STATE.SENAL_FALSA:
        return `${baseStyle} bg-red-500 cursor-pointer hover:brightness-110 animate-pulse`;
      case GAME_STATE.FEEDBACK:
        return `${baseStyle} bg-blue-500`;
      default:
        return `${baseStyle} bg-gray-300`;
    }
  };

  const getCircleText = () => {
    switch (gameState) {
      case GAME_STATE.ESTIMULO_PRESENTE:
        return "Espera...";
      case GAME_STATE.SENAL_CORRECTA:
        return "¡HAZ CLIC!";
      case GAME_STATE.SENAL_FALSA:
        return "¡NO HAGAS CLIC!";
      case GAME_STATE.FEEDBACK:
        return mensajeFeedback;
      default:
        return "Preparado...";
    }
  };

  const renderJuego = () => (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4">
      {/* Header con información */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>
            <h1 className="text-xl font-bold text-gray-800">Control de Impulsos</h1>
            <span className="text-sm bg-gray-100 px-2 py-1 rounded">{config.descripcion}</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-sm text-gray-500">Ronda</div>
              <div className="text-lg font-bold text-blue-600">
                {ronda}/{config.totalRondas}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-gray-500">Correctas</div>
              <div className="text-lg font-bold text-green-600">
                {respuestasCorrectas}
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
        
        {/* Barra de progreso */}
        <div className="mt-4">
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-red-500 rounded-full transition-all"
              style={{ width: `${(ronda / config.totalRondas) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Área de juego */}
      <div className="flex items-center justify-center min-h-96">
        <div
          className={getCircleStyle()}
          onClick={handleInteraction}
        >
          {getCircleText()}
        </div>
      </div>
    </div>
  );

  const renderCompletado = () => {
    const porcentajeLogrado = Math.round((respuestasCorrectas / config.totalRondas) * 100);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-md">
          <div className="text-6xl mb-6">
            {respuestasCorrectas >= (config.totalRondas * 0.8) ? '🎉' : '😊'}
          </div>
          <h3 className="text-2xl font-bold mb-4">¡Juego Completado!</h3>
          
          <div className="space-y-2 text-gray-600 mb-6">
            <p>Respuestas correctas: {respuestasCorrectas}/{config.totalRondas}</p>
            <p>Autocontrol: {porcentajeLogrado}%</p>
            <p>Puntos obtenidos: {puntuacion}</p>
            <p>Nivel: {config.descripcion}</p>
          </div>
          
          <button
            onClick={() => onClose?.() || navigate('/console')}
            className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
            disabled={cargando}
          >
            {cargando ? 'Guardando...' : 'Continuar'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {gameState === GAME_STATE.TUTORIAL && renderTutorial()}
      {gameState === GAME_STATE.COMPLETADO ? renderCompletado() : (
        gameState !== GAME_STATE.TUTORIAL && renderJuego()
      )}

      {cargando && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"/>
            <span>Guardando progreso...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ControlImpulsos;