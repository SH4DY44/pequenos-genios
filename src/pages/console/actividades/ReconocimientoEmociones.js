import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';

const emociones = [
  { id: 'felicidad', nombre: 'Felicidad', emoji: '😀' },
  { id: 'tristeza', nombre: 'Tristeza', emoji: '😢' },
  { id: 'enojo', nombre: 'Enojo', emoji: '😠' },
  { id: 'miedo', nombre: 'Miedo', emoji: '😨' },
  { id: 'sorpresa', nombre: 'Sorpresa', emoji: '😲' },
  { id: 'asco', nombre: 'Asco', emoji: '🤢' }
];

function ReconocimientoEmociones({ actividad, perfilNino, onComplete, onClose, rutaRetorno }) {
  
  const navigate = useNavigate();
  const [emocionActual, setEmocionActual] = useState(null);
  const [opciones, setOpciones] = useState([]);
  const [puntuacion, setPuntuacion] = useState(0);
  const [ronda, setRonda] = useState(0);
  const [totalRondas] = useState(10); 
  const [showTutorial, setShowTutorial] = useState(true);
  const [actividadCompletada, setActividadCompletada] = useState(false);
  const [cargando, setCargando] = useState(false);
  
  // Depuración
  useEffect(() => {
    console.log("Perfil del niño:", perfilNino);
    console.log("Actividad:", actividad);
    console.log("Ruta de retorno:", rutaRetorno);
    console.log("onComplete disponible:", !!onComplete);
    console.log("onClose disponible:", !!onClose);
    
    // Log para identificar en qué página estamos actualmente
    console.log("Ruta actual:", window.location.pathname);
    console.log("URL completa:", window.location.href);
  }, [perfilNino, actividad, rutaRetorno, onComplete, onClose]);
  
  // Configuración según nivel
  const nivelActual = perfilNino?.resultadosEvaluacion?.nivelAsignado?.nivel || 'básico';
  const configuracion = {
    'básico': {
      numOpciones: 3,
      emocionesDisponibles: ['felicidad', 'tristeza', 'enojo']
    },
    'básico-alto': {
      numOpciones: 4,
      emocionesDisponibles: ['felicidad', 'tristeza', 'enojo', 'sorpresa']
    },
    'intermedio': {
      numOpciones: 5,
      emocionesDisponibles: ['felicidad', 'tristeza', 'enojo', 'sorpresa', 'miedo']
    },
    'avanzado': {
      numOpciones: 6,
      emocionesDisponibles: ['felicidad', 'tristeza', 'enojo', 'sorpresa', 'miedo', 'asco']
    }
  };
  
  const configActual = configuracion[nivelActual] || configuracion['básico'];
  
  // Generar nueva ronda
  const generarNuevaRonda = () => {
    // Verificar si ya se completó la actividad
    if (actividadCompletada) {
      return;
    }
    
    // Seleccionar emoción correcta
    const emocionesDisponibles = emociones.filter(e => 
      configActual.emocionesDisponibles.includes(e.id)
    );
    const emocionCorrecta = emocionesDisponibles[Math.floor(Math.random() * emocionesDisponibles.length)];
    
    // Generar opciones (incluyendo la correcta)
    let opcionesRonda = [emocionCorrecta];
    
    // Añadir opciones incorrectas
    while (opcionesRonda.length < configActual.numOpciones) {
      const emocionAleatoria = emocionesDisponibles[Math.floor(Math.random() * emocionesDisponibles.length)];
      if (!opcionesRonda.find(e => e.id === emocionAleatoria.id)) {
        opcionesRonda.push(emocionAleatoria);
      }
    }
    
    // Mezclar opciones
    opcionesRonda = opcionesRonda.sort(() => Math.random() - 0.5);
    
    setEmocionActual(emocionCorrecta);
    setOpciones(opcionesRonda);
  };
  
  // Iniciar actividad
  useEffect(() => {
    if (!showTutorial) {
      generarNuevaRonda();
    }
  }, [showTutorial]);
  
  // Actualizar puntos en Firebase
  const actualizarPuntosEnFirebase = async (puntosGanados) => {
    if (!perfilNino || !perfilNino.id) {
      console.error("No se puede actualizar puntos: perfil de niño no disponible");
      return false;
    }
    
    setCargando(true);
    
    try {
      // Verificar si el documento existe y tiene la estructura necesaria
      const perfilRef = doc(db, "childProfiles", perfilNino.id);
      const perfilDoc = await getDoc(perfilRef);
      
      if (!perfilDoc.exists()) {
        console.error("El perfil del niño no existe en la base de datos");
        return false;
      }
      
      // Obtener fecha actual para registro de actividad
      const fechaActual = new Date();
      const fechaFormateada = fechaActual.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      
      // Preparar datos para actualizar
      const datosActualizacion = {
        ultimaActividad: fechaActual,
        actividadesCompletadas: increment(1)
      };
      
      // Añadir puntos totales si existe el campo
      if (perfilDoc.data().puntosTotales !== undefined) {
        datosActualizacion.puntosTotales = increment(puntosGanados);
      } else {
        datosActualizacion.puntosTotales = puntosGanados;
      }
      
      // Añadir registro de actividades si existe la estructura
      if (perfilDoc.data().registroActividades) {
        datosActualizacion[`registroActividades.${fechaFormateada}`] = increment(1);
      } else {
        datosActualizacion.registroActividades = { [fechaFormateada]: 1 };
      }
      
      // Añadir estadísticas de actividades si existe la estructura
      const categoria = actividad?.categoria || 'habilidades-sociales';
      
      if (perfilDoc.data().estadisticasActividades && 
          perfilDoc.data().estadisticasActividades[categoria]) {
        datosActualizacion[`estadisticasActividades.${categoria}.completadas`] = increment(1);
        datosActualizacion[`estadisticasActividades.${categoria}.puntuacion`] = increment(puntosGanados);
      } else {
        // Crear estructura si no existe
        datosActualizacion.estadisticasActividades = {
          ...perfilDoc.data().estadisticasActividades,
          [categoria]: {
            completadas: 1,
            puntuacion: puntosGanados
          }
        };
      }
      
      // Actualizar el documento
      await updateDoc(perfilRef, datosActualizacion);
      
      console.log('Puntos actualizados en Firebase:', puntosGanados);
      return true;
    } catch (error) {
      console.error("Error actualizando puntos:", error);
      return false;
    } finally {
      setCargando(false);
    }
  };
  
  // Función para finalizar la actividad y redirigir
  const finalizarActividad = (puntuacionFinal) => {
    try {
      // Intentar usar onComplete si está disponible
      if (typeof onComplete === 'function') {
        console.log("Llamando a onComplete con puntuación:", puntuacionFinal);
        onComplete({ 
          puntuacion: puntuacionFinal,
          completada: true
        });
      } else {
        console.log("onComplete no disponible, usando navegación directa");
        // Si no hay onComplete, intentar usar onClose
        if (typeof onClose === 'function') {
          onClose();
        } else {
          // Si no hay onClose, navegar directamente a /console
          navigate('/console', { 
            state: { profileId: perfilNino?.id } 
          });
        }
      }
    } catch (error) {
      console.error("Error al finalizar actividad:", error);
      // En caso de error, intentar navegar directamente a /console
      try {
        navigate('/console', { 
          state: { profileId: perfilNino?.id } 
        });
      } catch (navError) {
        console.error("Error al navegar:", navError);
        // Último recurso: recargar la página
        window.location.href = '/console';
      }
    }
  };
  
  // Función para volver a la sección de actividades
  const volverAActividades = () => {
    console.log("Intentando volver a la consola principal");
    
    // Verificar si existe onClose primero (forma prevista de salir)
    if (typeof onClose === 'function') {
      console.log("Cerrando con onClose");
      try {
        onClose();
      } catch (error) {
        console.error("Error al ejecutar onClose:", error);
        // Si falla onClose, navegar directamente a /console
        navigate('/console', { 
          state: { profileId: perfilNino?.id } 
        });
      }
      return; // Salir después de ejecutar onClose
    }
    
    // Si hay una ruta de retorno específica, usarla
    if (rutaRetorno) {
      console.log("Navegando a ruta de retorno:", rutaRetorno);
      navigate(rutaRetorno, { 
        state: { profileId: perfilNino?.id } 
      });
      return;
    }
    
    // Navegar directamente a la consola principal
    console.log("Navegando directamente a /console");
    
    // Intentar usar window.history.back() primero
    try {
      console.log("Intentando volver con window.history.back()");
      window.history.back();
    } catch (error) {
      console.error("Error al usar history.back():", error);
      // Si falla, usar navigate como respaldo
      navigate('/console', { 
        state: { profileId: perfilNino?.id, fromActivity: true } 
      });
    }
  };
  
  // Manejar selección
  const handleSeleccion = async (emocionId) => {
    // Prevenir acciones si ya está completada o cargando
    if (cargando || actividadCompletada) return;
    
    const esCorrecta = emocionId === emocionActual.id;
    let puntuacionActualizada = puntuacion;
    let retrasoNuevaRonda = 1000; // Retraso por defecto

    if (esCorrecta) {
      puntuacionActualizada = puntuacion + 10;
      setPuntuacion(puntuacionActualizada);
      toast.success('¡Correcto!', { autoClose: 1000 });
    } else {
      toast.error(`¡Ups! La emoción correcta era ${emocionActual.nombre}. ¡Sigue intentando!`, { autoClose: 2000 });
      retrasoNuevaRonda = 2000; // Aumentar el retraso si la respuesta es incorrecta
    }

    // Pasar a la siguiente ronda
    const nuevaRonda = ronda + 1;
    setRonda(nuevaRonda);

    if (nuevaRonda >= totalRondas) {
      // Marcar actividad como completada primero
      setActividadCompletada(true);
      
      // Actualizar puntos en Firebase
      setCargando(true);
      const actualizacionExitosa = await actualizarPuntosEnFirebase(puntuacionActualizada);
      setCargando(false);
      
      if (actualizacionExitosa) {
        toast.success('¡Felicidades! Has completado la actividad con éxito.', {
          autoClose: 2000
        });
      } else {
        toast.error('Hubo un problema al guardar tu progreso, pero has completado la actividad.', {
          autoClose: 2000
        });
      }
      
      // Almacenar la información de navegación en sessionStorage para debuggear
      try {
        const navInfo = {
          onCompleteAvailable: typeof onComplete === 'function',
          onCloseAvailable: typeof onClose === 'function',
          currentPath: window.location.pathname
        };
        sessionStorage.setItem('navDebugInfo', JSON.stringify(navInfo));
        console.log("Información de navegación almacenada:", navInfo);
      } catch (e) {
        console.error("Error al almacenar info de navegación:", e);
      }
      
      // --- ELIMINAR ESTA LÍNEA ---
      // finalizarActividad(puntuacionActualizada);
      // --------------------------
      
    } else {
      // Generar nueva ronda después de un breve retraso
      setTimeout(generarNuevaRonda, retrasoNuevaRonda);
    }
  };
  
  // Manejar el botón de regresar
  const handleRegresar = () => {
    // Si la actividad no está completada y ya se avanzó, mostrar confirmación
    if (!actividadCompletada && ronda > 0) {
      if (window.confirm('Si sales ahora, perderás tu progreso y no ganarás puntos. ¿Estás seguro?')) {
        volverAActividades();
      }
    } else {
      volverAActividades();
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-[var(--primary-blue)]">
              {actividad?.titulo || "Reconocimiento de Emociones"}
            </h2>
            <p className="text-gray-600">{actividad?.descripcion || "Aprende a identificar diferentes emociones"}</p>
          </div>
          {/* --- MODIFICACIÓN: Ocultar botones si la actividad está completada --- */}
          {!actividadCompletada && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowTutorial(true)}
                className="p-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200"
              >
                Tutorial
              </button>
              <button
                onClick={handleRegresar}
                className="p-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
              >
                Regresar
              </button>
            </div>
          )}
          {/* --- FIN DE LA MODIFICACIÓN --- */}
        </div>
      </div>

      {/* Tutorial */}
      {showTutorial ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="text-5xl mb-4">🎯</div>
          <h3 className="text-xl font-bold mb-4">Reconocimiento de Emociones</h3>
          <p className="mb-6">
            En esta actividad verás una imagen que muestra una emoción. 
            Tu tarea es identificar qué emoción representa seleccionando la opción correcta.
          </p>
          <div className="flex justify-center gap-4 mb-8">
            {emociones.slice(0, 4).map(emocion => (
              <div key={emocion.id} className="text-center">
                <div className="text-4xl mb-2">{emocion.emoji}</div>
                <div className="text-sm font-medium">{emocion.nombre}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowTutorial(false)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
          >
            ¡Comenzar!
          </button>
        </div>
      ) : (
        <>
          {/* Progreso */}
          {/* --- MODIFICACIÓN: Ocultar progreso si la actividad está completada --- */}
          {!actividadCompletada && (
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium">Progreso: {ronda}/{totalRondas}</div>
                <div className="font-medium">Puntuación: {puntuacion}</div>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${(ronda / totalRondas) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
          {/* --- FIN DE LA MODIFICACIÓN --- */}

          {/* Contenido principal */}
          {emocionActual && !actividadCompletada && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold mb-4 text-center">
                ¿Qué emoción muestra esta imagen?
              </h3>
              
              {/* Imagen de la emoción */}
              <div className="flex justify-center mb-8">
                <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center text-8xl">
                  {emocionActual.emoji}
                </div>
              </div>
              
              {/* Opciones */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {opciones.map(opcion => (
                  <button
                    key={opcion.id}
                    onClick={() => handleSeleccion(opcion.id)}
                    className="p-4 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                    disabled={cargando}
                  >
                    <div className="text-3xl mb-2">{opcion.emoji}</div>
                    <div className="font-medium">{opcion.nombre}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Actividad completada */}
          {actividadCompletada && (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="text-6xl mb-6">🎉</div>
              <h3 className="text-2xl font-bold mb-4">¡Actividad Completada!</h3>
              <p className="text-lg mb-4">
                Has terminado la actividad con {puntuacion} puntos.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={volverAActividades}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                >
                  Volver a Actividades
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