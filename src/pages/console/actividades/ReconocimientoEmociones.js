// src/pages/console/actividades/ReconocimientoEmociones.js - VERSIÓN CORREGIDA
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import RewardsService from '../../../services/rewardsService';

const emociones = [
  { id: 'felicidad', nombre: 'Felicidad', emoji: '😀' },
  { id: 'tristeza', nombre: 'Tristeza', emoji: '😢' },
  { id: 'enojo', nombre: 'Enojo', emoji: '😠' },
  { id: 'miedo', nombre: 'Miedo', emoji: '😨' },
  { id: 'sorpresa', nombre: 'Sorpresa', emoji: '😲' },
  { id: 'asco', nombre: 'Asco', emoji: '🤢' }
];

// ✅ CORREGIDO: Configuración usando niveles del sistema adaptativo
const NIVELES_CONFIG = {
  'basico': {
    numOpciones: 3,
    emocionesDisponibles: ['felicidad', 'tristeza', 'enojo'],
    totalRondas: 6,
    tiempoLimite: null, // Sin límite de tiempo
    puntosBase: 10,
    descripcion: "Nivel básico - 3 emociones básicas"
  },
  'basico-alto': {
    numOpciones: 4,
    emocionesDisponibles: ['felicidad', 'tristeza', 'enojo', 'sorpresa'],
    totalRondas: 8,
    tiempoLimite: 240, // 4 minutos
    puntosBase: 15,
    descripcion: "Nivel básico-alto - 4 emociones con tiempo"
  },
  'intermedio': {
    numOpciones: 5,
    emocionesDisponibles: ['felicidad', 'tristeza', 'enojo', 'sorpresa', 'miedo'],
    totalRondas: 10,
    tiempoLimite: 180, // 3 minutos
    puntosBase: 20,
    descripcion: "Nivel intermedio - 5 emociones"
  },
  'avanzado': {
    numOpciones: 6,
    emocionesDisponibles: ['felicidad', 'tristeza', 'enojo', 'sorpresa', 'miedo', 'asco'],
    totalRondas: 12,
    tiempoLimite: 150, // 2.5 minutos
    puntosBase: 25,
    descripcion: "Nivel avanzado - Todas las emociones"
  }
};

function ReconocimientoEmociones({ actividad, perfilNino, onComplete, onClose }) {
  const navigate = useNavigate();
  
  // Estados del juego
  const [emocionActual, setEmocionActual] = useState(null);
  const [opciones, setOpciones] = useState([]);
  const [puntuacion, setPuntuacion] = useState(0);
  const [ronda, setRonda] = useState(0);
  const [respuestasCorrectas, setRespuestasCorrectas] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [actividadCompletada, setActividadCompletada] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(null);
  const [tiempoInicio, setTiempoInicio] = useState(null);
  const [feedback, setFeedback] = useState('');

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
  const emocionesDisponibles = emociones.filter(e => 
    config.emocionesDisponibles.includes(e.id)
  );

  // Inicializar juego
  useEffect(() => {
    if (!showTutorial) {
      generarNuevaRonda();
      setTiempoInicio(Date.now());
      if (config.tiempoLimite) {
        setTiempoRestante(config.tiempoLimite);
      }
    }
  }, [showTutorial]);

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

  // Generar nueva ronda
  const generarNuevaRonda = () => {
    if (actividadCompletada || ronda >= config.totalRondas) {
      return;
    }

    // Seleccionar emoción correcta
    const emocionCorrecta = emocionesDisponibles[Math.floor(Math.random() * emocionesDisponibles.length)];
    
    // Generar opciones (incluyendo la correcta)
    let opcionesRonda = [emocionCorrecta];
    
    // Añadir opciones incorrectas
    while (opcionesRonda.length < config.numOpciones) {
      const emocionAleatoria = emocionesDisponibles[Math.floor(Math.random() * emocionesDisponibles.length)];
      if (!opcionesRonda.find(e => e.id === emocionAleatoria.id)) {
        opcionesRonda.push(emocionAleatoria);
      }
    }
    
    // Mezclar opciones
    opcionesRonda = opcionesRonda.sort(() => Math.random() - 0.5);
    
    setEmocionActual(emocionCorrecta);
    setOpciones(opcionesRonda);
    setRonda(prev => prev + 1);
  };

  // Manejar selección de emoción
  const handleSeleccion = (emocionId) => {
    if (actividadCompletada || cargando) return;

    const esCorrecta = emocionId === emocionActual.id;
    
    if (esCorrecta) {
      setRespuestasCorrectas(prev => prev + 1);
      setFeedback('¡Correcto! 🎉');
      toast.success('¡Excelente! Emoción identificada correctamente');
    } else {
      setFeedback('¡Inténtalo de nuevo! 🤔');
      toast.error(`Incorrecto. Era ${emocionActual.nombre}`);
    }

    // Mostrar feedback y continuar
    setTimeout(() => {
      setFeedback('');
      if (ronda >= config.totalRondas) {
        finalizarActividad('Completado');
      } else {
        generarNuevaRonda();
      }
    }, 1500);
  };

  // ✅ CORREGIDO: Sistema de puntuación y estrellas mejorado
  const finalizarActividad = async (razon) => {
    if (actividadCompletada) return;
    setActividadCompletada(true);
    setCargando(true);

    try {
      // Calcular métricas reales del rendimiento
      const porcentajeCorrecto = (respuestasCorrectas / config.totalRondas) * 100;
      
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
        `Reconocimiento de Emociones - ${razon} - Nivel: ${nivelActual}`
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
          nombreActividad: actividad?.titulo || 'Reconocimiento de Emociones',
          porcentajeCompletado: Math.round(porcentajeCorrecto),
          nivel: nivelActual,
          respuestasCorrectas: respuestasCorrectas,
          totalRondas: config.totalRondas,
          tiempoUsado: Math.round(tiempoTranscurrido),
          esActividad: true
        });
      }

      console.log('✅ Reconocimiento de Emociones completado:', {
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
  };

  const volverAActividades = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/console', { state: { profileId: perfilNino?.id } });
    }
  };

  const formatearTiempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
      {showTutorial ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-lg">
            <div className="text-5xl mb-4">🎭</div>
            <h3 className="text-xl font-bold mb-4">Reconocimiento de Emociones</h3>
            <div className="text-sm bg-gray-100 px-3 py-1 rounded mb-4">
              {config.descripcion}
            </div>
            <p className="mb-6 text-gray-600">
              Verás una imagen que muestra una emoción. Tu tarea es identificar qué emoción 
              representa seleccionando la opción correcta.
            </p>
            <div className="flex justify-center gap-4 mb-8">
              {emocionesDisponibles.slice(0, 4).map(emocion => (
                <div key={emocion.id} className="text-center">
                  <div className="text-4xl mb-2">{emocion.emoji}</div>
                  <div className="text-sm font-medium">{emocion.nombre}</div>
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-500 mb-6 space-y-1">
              <p>Rondas: {config.totalRondas}</p>
              <p>Emociones: {config.emocionesDisponibles.length}</p>
              {config.tiempoLimite && <p>Tiempo límite: {formatearTiempo(config.tiempoLimite)}</p>}
              <p>Puntos base: {config.puntosBase}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowTutorial(false)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                ¡Comenzar!
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header con información */}
          {!actividadCompletada && (
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                  >
                    ✕
                  </button>
                  <h1 className="text-xl font-bold text-gray-800">Reconocimiento de Emociones</h1>
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
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${(ronda / config.totalRondas) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Contenido principal */}
          {emocionActual && !actividadCompletada && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold mb-6 text-center">
                ¿Qué emoción muestra esta imagen?
              </h3>
              
              {/* Imagen de la emoción */}
              <div className="flex justify-center mb-8">
                <div className="w-64 h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-8xl border-4 border-gray-300">
                  {emocionActual.emoji}
                </div>
              </div>
              
              {/* Feedback */}
              {feedback && (
                <div className="text-center mb-6">
                  <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold">
                    {feedback}
                  </div>
                </div>
              )}
              
              {/* Opciones */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {opciones.map(opcion => (
                  <button
                    key={opcion.id}
                    onClick={() => handleSeleccion(opcion.id)}
                    className="p-6 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors border-2 border-blue-200 hover:border-blue-300 min-h-16 flex items-center justify-center"
                    disabled={cargando || feedback}
                  >
                    <div className="font-medium text-lg">{opcion.nombre}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Actividad completada */}
          {actividadCompletada && (
            <div className="min-h-screen flex items-center justify-center">
              <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-md">
                <div className="text-6xl mb-6">
                  {respuestasCorrectas >= (config.totalRondas * 0.8) ? '🎉' : '😊'}
                </div>
                <h3 className="text-2xl font-bold mb-4">¡Actividad Completada!</h3>
                
                <div className="space-y-2 text-gray-600 mb-6">
                  <p>Respuestas correctas: {respuestasCorrectas}/{config.totalRondas}</p>
                  <p>Precisión: {Math.round((respuestasCorrectas / config.totalRondas) * 100)}%</p>
                  <p>Puntos obtenidos: {puntuacion}</p>
                  <p>Nivel: {config.descripcion}</p>
                </div>
                
                <button
                  onClick={volverAActividades}
                  className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                  disabled={cargando}
                >
                  {cargando ? 'Guardando...' : 'Continuar'}
                </button>
              </div>
            </div>
          )}
          
          {/* Indicador de carga */}
          {cargando && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-lg font-medium">Guardando progreso...</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ReconocimientoEmociones;