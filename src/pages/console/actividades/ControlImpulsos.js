import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { RewardsService } from '../../../services/rewardsService';

const GAME_STATE = {
  TUTORIAL: 'tutorial',
  ESPERANDO_INICIO: 'esperando_inicio',
  ESTIMULO_PRESENTE: 'estimulo_presente',
  SENAL_CORRECTA: 'senal_correcta',
  SENAL_FALSA: 'senal_falsa',
  FEEDBACK: 'feedback',
  COMPLETADO: 'completado'
};

function ControlImpulsos({ actividad, perfilNino, onComplete, onClose }) {
  const navigate = useNavigate();
  const [puntuacion, setPuntuacion] = useState(0);
  const [ronda, setRonda] = useState(0);
  const [totalRondas] = useState(10);
  const [actividadCompletada, setActividadCompletada] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [gameState, setGameState] = useState(GAME_STATE.TUTORIAL);
  const [timerId, setTimerId] = useState(null);
  const [mensajeFeedback, setMensajeFeedback] = useState('');

  const nivelActual = perfilNino?.resultadosEvaluacion?.nivelAsignado?.nivel || 'básico';
  const configuracionNiveles = {
    'básico': {
      tiempoEsperaMin: 1500, tiempoEsperaMax: 3000, duracionSenal: 1000,
      incluirSenalesFalsas: false, probabilidadSenalFalsa: 0,
      puntosPorAcierto: 10, penalizacionClickTemprano: 0, penalizacionSenalFalsa: 0,
    },
    'básico-alto': {
      tiempoEsperaMin: 1200, tiempoEsperaMax: 3500, duracionSenal: 800,
      incluirSenalesFalsas: false, probabilidadSenalFalsa: 0,
      puntosPorAcierto: 12, penalizacionClickTemprano: -1, penalizacionSenalFalsa: 0,
    },
    'intermedio': {
      tiempoEsperaMin: 1000, tiempoEsperaMax: 4000, duracionSenal: 700,
      incluirSenalesFalsas: true, probabilidadSenalFalsa: 0.25,
      puntosPorAcierto: 15, penalizacionClickTemprano: -2, penalizacionSenalFalsa: -3,
    },
    'avanzado': {
      tiempoEsperaMin: 800, tiempoEsperaMax: 5000, duracionSenal: 500,
      incluirSenalesFalsas: true, probabilidadSenalFalsa: 0.4,
      puntosPorAcierto: 20, penalizacionClickTemprano: -3, penalizacionSenalFalsa: -5,
    }
  };
  const configActual = configuracionNiveles[nivelActual] || configuracionNiveles['básico'];

  // Funciones Firebase
  const actualizarPuntosEnFirebase = useCallback(async (puntosFinales) => {
    if (!perfilNino?.id || !actividad?.categoria) {
      toast.error("Error en los datos del perfil");
      return false;
    }
    setCargando(true);
    try {
      const perfilRef = doc(db, "childProfiles", perfilNino.id);
      await updateDoc(perfilRef, {
        [`estadisticasActividades.${actividad.categoria}.completadas`]: increment(1),
        [`estadisticasActividades.${actividad.categoria}.puntuacion`]: increment(puntosFinales),
        actividadesCompletadas: increment(1),
        ultimaActividad: new Date()
      });
      toast.success("Progreso guardado");
      return true;
    } catch (error) {
      toast.error("Error al guardar");
      return false;
    } finally {
      setCargando(false);
    }
  }, [perfilNino, actividad]);

  const finalizarActividad = useCallback(async () => {
    setActividadCompletada(true);
    setGameState(GAME_STATE.COMPLETADO);
    
    try {
      // Calcular porcentaje de aciertos
      const porcentajeAciertos = (puntuacion / (totalRondas * configActual.puntosPorAcierto)) * 100;
      
      // Actualizar puntos en Firebase
      await actualizarPuntosEnFirebase(puntuacion);
      
      // Otorgar recompensa de estrellas
      await RewardsService.otorgarRecompensaActividad(
        perfilNino.id,
        actividad.id,
        {
          porcentajeCorrecto: 0,
          tiempo: 0,
          tiempoObjetivo: 0
        }
      );
      
      onComplete?.({ puntuacion, completada: true });
    } catch (error) {
      console.error('Error finalizando actividad:', error);
      toast.error('Error al guardar el progreso');
    }
  }, [actualizarPuntosEnFirebase, onComplete, puntuacion, totalRondas, configActual, perfilNino, actividad]);

  // Funciones del juego (orden corregido)
  const pasarSiguienteRonda = useCallback((delay) => {
    const timer = setTimeout(() => {
      setRonda(prev => {
        const nuevaRonda = prev + 1;
        if (nuevaRonda <= totalRondas) {
          setGameState(GAME_STATE.ESPERANDO_INICIO);
        }
        return nuevaRonda;
      });
    }, delay);
    setTimerId(timer);
  }, [totalRondas]);

  const mostrarSenal = useCallback(() => {
    const esSenalCorrecta = configActual.incluirSenalesFalsas 
      ? Math.random() >= configActual.probabilidadSenalFalsa 
      : true;

    setGameState(esSenalCorrecta ? GAME_STATE.SENAL_CORRECTA : GAME_STATE.SENAL_FALSA);

    const timer = setTimeout(() => {
      if (esSenalCorrecta) {
        setMensajeFeedback('¡Tiempo agotado!');
        setPuntuacion(p => Math.max(0, p - 2));
        toast.warn('No respondiste a tiempo');
      } else {
        setMensajeFeedback('¡Bien hecho!');
        setPuntuacion(p => p + configActual.puntosPorAcierto);
        toast.success('Resististe la tentación');
      }
      setGameState(GAME_STATE.FEEDBACK);
      pasarSiguienteRonda(1500);
    }, configActual.duracionSenal);
    
    setTimerId(timer);
  }, [configActual, pasarSiguienteRonda]);

  const generarNuevaRonda = useCallback(() => {
    if (ronda >= totalRondas) {
      finalizarActividad();
      return;
    }

    setMensajeFeedback('');
    setGameState(GAME_STATE.ESTIMULO_PRESENTE);

    const tiempoEspera = Math.random() * (configActual.tiempoEsperaMax - configActual.tiempoEsperaMin) 
      + configActual.tiempoEsperaMin;

    const timer = setTimeout(() => {
      setGameState(GAME_STATE.ESPERANDO_INICIO);
      mostrarSenal();
    }, 500);
    
    setTimerId(timer);
  }, [ronda, totalRondas, configActual, mostrarSenal, finalizarActividad]);

  const handleInteraction = useCallback(() => {
    if (timerId) clearTimeout(timerId);
    setGameState(GAME_STATE.FEEDBACK);

    let puntos = 0;
    switch(gameState) {
      case GAME_STATE.ESTIMULO_PRESENTE:
        puntos = configActual.penalizacionClickTemprano;
        setMensajeFeedback('¡Demasiado pronto!');
        toast.warn('Espera la señal');
        break;
      case GAME_STATE.SENAL_CORRECTA:
        puntos = configActual.puntosPorAcierto;
        setMensajeFeedback('¡Correcto!');
        toast.success('¡Bien hecho!');
        break;
      case GAME_STATE.SENAL_FALSA:
        puntos = configActual.penalizacionSenalFalsa;
        setMensajeFeedback('¡Error!');
        toast.error('No debías clickear');
        break;
    }

    setPuntuacion(p => Math.max(0, p + puntos));
    pasarSiguienteRonda(1500);
  }, [timerId, gameState, configActual, pasarSiguienteRonda]);

  // Efectos
  useEffect(() => {
    if (gameState === GAME_STATE.ESPERANDO_INICIO) {
      generarNuevaRonda();
    }
  }, [gameState, generarNuevaRonda]);

  useEffect(() => {
    if (ronda >= totalRondas && !actividadCompletada) {
      finalizarActividad();
    }
  }, [ronda, totalRondas, actividadCompletada, finalizarActividad]);

  useEffect(() => {
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [timerId]);

  // Renderizado
  const renderTutorial = () => (
    <div className="bg-white rounded-xl shadow-md p-8 text-center">
      <div className="text-5xl mb-4">⏱️</div>
      <h3 className="text-xl font-bold mb-4">Control de Impulsos</h3>
      <p className="mb-6">
        Haz clic SOLO cuando el círculo se ponga verde.
        {configActual.incluirSenalesFalsas && " ¡Ignora el rojo!"}
      </p>
      <button
        onClick={() => setGameState(GAME_STATE.ESPERANDO_INICIO)}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Comenzar
      </button>
    </div>
  );

  const renderJuego = () => {
    let estilo = {
      bg: 'bg-gray-200',
      texto: 'Espera la señal...',
      clickable: false
    };

    switch(gameState) {
      case GAME_STATE.ESTIMULO_PRESENTE:
        estilo = { bg: 'bg-blue-500', texto: '¡Prepárate!', clickable: false };
        break;
      case GAME_STATE.SENAL_CORRECTA:
        estilo = { bg: 'bg-green-500 animate-pulse', texto: '¡CLIC AHORA!', clickable: true };
        break;
      case GAME_STATE.SENAL_FALSA:
        estilo = { bg: 'bg-red-500 animate-pulse', texto: '¡NO CLICK!', clickable: true };
        break;
      case GAME_STATE.FEEDBACK:
        estilo = { bg: 'bg-gray-400', texto: mensajeFeedback, clickable: false };
        break;
      case GAME_STATE.ESPERANDO_INICIO:
        estilo = { bg: 'bg-gray-300', texto: 'Cargando...', clickable: false };
        break;
    }

    return (
      <>
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex justify-between mb-2">
            <span>Ronda: {ronda + 1}/{totalRondas}</span>
            <span>Puntos: {puntuacion}</span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-500 h-2 transition-all duration-300"
              style={{ width: `${(ronda / totalRondas) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <button
            onClick={handleInteraction}
            disabled={!estilo.clickable}
            className={`w-48 h-48 rounded-full text-2xl font-bold transition-all ${
              estilo.bg
            } ${
              estilo.clickable 
                ? 'cursor-pointer hover:brightness-110' 
                : 'cursor-not-allowed opacity-75'
            }`}
          >
            {estilo.texto}
          </button>
        </div>
      </>
    );
  };

  const renderCompletado = () => (
    <div className="bg-white rounded-xl shadow-md p-8 text-center">
      <div className="text-6xl mb-4">🎉</div>
      <h3 className="text-2xl font-bold mb-4">¡Juego Completado!</h3>
      <p className="text-xl mb-6">Puntuación final: {puntuacion}</p>
      <button
        onClick={() => onClose?.() || navigate('/actividades')}
        className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
      >
        Volver al Menú
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              {actividad?.titulo || "Control de Impulsos"}
            </h1>
            <p className="text-gray-600 mt-2">
              {actividad?.descripcion || "Ejercita tu capacidad de espera"}
            </p>
          </div>
          {gameState === GAME_STATE.TUTORIAL && (
            <button
              onClick={() => window.confirm('¿Salir? Perderás el progreso.') && navigate('/console')}
              className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
            >
              Salir
            </button>
          )}
        </div>
      </div>

      {gameState === GAME_STATE.TUTORIAL && renderTutorial()}
      {gameState === GAME_STATE.COMPLETADO ? renderCompletado() : (
        gameState !== GAME_STATE.TUTORIAL && renderJuego()
      )}

      {cargando && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"/>
            <span>Guardando progreso...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ControlImpulsos;