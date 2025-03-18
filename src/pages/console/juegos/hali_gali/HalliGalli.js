import React, { useState, useEffect, useCallback, useMemo } from "react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../../../config/firebase";
import { toast } from "react-toastify";
import {
  FRUTAS,
  CONFIGURACION_NIVELES,
  SONIDOS,
  SISTEMA_PUNTOS,
} from "./constantes";
import TutorialModal from "./TutorialModal";
import GameOverModal from "./GameOverModal";
import SistemaAdaptativo from "../../../../utils/adaptativo/SistemaAdaptativo";

function HalliGalli({ perfilNino, onScoreUpdate, onClose }) {
  // Estados básicos del juego
  const [frutasEnMesa, setFrutasEnMesa] = useState([]);
  const [contadorFrutas, setContadorFrutas] = useState({});
  const [puntuacion, setPuntuacion] = useState(0);
  const [comboActual, setComboActual] = useState(1);
  const [maxCombo, setMaxCombo] = useState(1);
  const [juegoActivo, setJuegoActivo] = useState(false);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [tiempoRestante, setTiempoRestante] = useState(null);

  // Estados para el sistema adaptativo
  const [sistemaAdaptativo, setSistemaAdaptativo] = useState(null);
  const [sesionActual, setSesionActual] = useState({
    respuestasCorrectas: 0,
    intentosTotales: 0,
    tiempoRespuesta: 0,
    precisionPatrones: [],
    tasaCompletado: 0,
  });

  // Obtener configuración del nivel
  const configNivel = useMemo(() => {
    const nivelPerfil =
      perfilNino?.resultadosEvaluacion?.nivelAsignado?.nivel || "basico";
    const NIVEL_MAPPING = {
      básico: "basico",
      "básico-alto": "basico-alto",
      intermedio: "intermedio",
      avanzado: "avanzado",
    };
    const nivelMapeado = NIVEL_MAPPING[nivelPerfil] || "basico";
    return CONFIGURACION_NIVELES[nivelMapeado];
  }, [perfilNino]);

  // Inicializar sistema adaptativo
  useEffect(() => {
    const inicializarSistemaAdaptativo = async () => {
      const sistema = new SistemaAdaptativo(perfilNino.id);
      await sistema.inicializar();
      setSistemaAdaptativo(sistema);
    };

    inicializarSistemaAdaptativo();
  }, [perfilNino.id]);

  // Función para reproducir sonidos
  const playSound = useCallback((soundName) => {
    const audio = new Audio(SONIDOS[soundName]);
    audio.volume = 0.3;
    audio.play().catch(() => {});
  }, []);

  // Calcular puntos
  const calcularPuntos = (esAcierto) => {
    if (!esAcierto) return 0;

    let puntos = configNivel.puntosPorAcierto;

    // Aplicar multiplicador de combo
    const multiplicadorCombo = Math.min(
      SISTEMA_PUNTOS.comboMax,
      1 + (comboActual - 1) * SISTEMA_PUNTOS.comboBase
    );
    puntos *= multiplicadorCombo;

    // Aplicar bonus por velocidad si corresponde
    if (sesionActual.tiempoRespuesta < configNivel.tiempoRespuesta / 2) {
      puntos *= SISTEMA_PUNTOS.bonusVelocidad;
    }

    return Math.round(puntos);
  };

  // Generar nueva fruta
  const generarNuevaFruta = useCallback(() => {
    // Obtener frutas disponibles según el nivel
    const frutasDisponibles = Object.values(FRUTAS).slice(
      0,
      configNivel.frutasDisponibles
    );
    const frutaAleatoria =
      frutasDisponibles[Math.floor(Math.random() * frutasDisponibles.length)];

    // Actualizar estado
    setFrutasEnMesa((prev) => [...prev, frutaAleatoria]);
    setContadorFrutas((prev) => ({
      ...prev,
      [frutaAleatoria.id]: (prev[frutaAleatoria.id] || 0) + 1,
    }));

    playSound("nuevaFruta");

    return frutaAleatoria;
  }, [configNivel, playSound]);

  // Continuar juego
  const continuarJuego = useCallback(() => {
    if (!juegoActivo) return;

    const interval = setInterval(() => {
      generarNuevaFruta();
    }, configNivel.velocidad);

    return () => clearInterval(interval);
  }, [juegoActivo, configNivel.velocidad, generarNuevaFruta]);

  // Manejar clic en el timbre
  const manejarTimbre = useCallback(async () => {
    if (!juegoActivo) return;

    // Registrar intento
    setSesionActual((prev) => ({
      ...prev,
      intentosTotales: prev.intentosTotales + 1,
    }));

    // Verificar si hay 5 frutas iguales
    const hayGanador = Object.values(contadorFrutas).some(
      (count) => count >= configNivel.cantidadObjetivo
    );

    if (hayGanador) {
      // Acierto
      playSound("acierto");
      const puntosGanados = calcularPuntos(true);
      setPuntuacion((prev) => prev + puntosGanados);

      // Actualizar combo
      const nuevoCombo = comboActual + 1;
      setComboActual(nuevoCombo);
      setMaxCombo(Math.max(maxCombo, nuevoCombo));

      // Actualizar estadísticas
      setSesionActual((prev) => ({
        ...prev,
        respuestasCorrectas: prev.respuestasCorrectas + 1,
        precisionPatrones: [...prev.precisionPatrones, 1],
      }));

      toast.success(`¡Correcto! +${puntosGanados} puntos`);
    } else {
      // Error
      playSound("error");
      const puntosPerdidos = configNivel.penalizacionError;
      setPuntuacion((prev) => Math.max(0, prev - puntosPerdidos));
      setComboActual(1);

      // Actualizar estadísticas
      setSesionActual((prev) => ({
        ...prev,
        precisionPatrones: [...prev.precisionPatrones, 0],
      }));

      toast.error(`¡Incorrecto! -${puntosPerdidos} puntos`);
    }

    // Actualizar sistema adaptativo
    if (sistemaAdaptativo) {
      const ajustes = await sistemaAdaptativo.analizarRendimiento(sesionActual);
      await sistemaAdaptativo.actualizarEstadisticas();
    }

    // Limpiar mesa
    setFrutasEnMesa([]);
    setContadorFrutas({});

    // Continuar juego
    continuarJuego();
  }, [juegoActivo, contadorFrutas, configNivel, sistemaAdaptativo, sesionActual, calcularPuntos, maxCombo, playSound, continuarJuego]);

  // Iniciar juego
  const iniciarJuego = useCallback(async () => {
    // Reiniciar estados
    setFrutasEnMesa([]);
    setContadorFrutas({});
    setPuntuacion(0);
    setComboActual(1);
    setMaxCombo(1);
    setJuegoTerminado(false);

    // Reiniciar sesión
    setSesionActual({
      respuestasCorrectas: 0,
      intentosTotales: 0,
      tiempoRespuesta: 0,
      precisionPatrones: [],
      tasaCompletado: 0,
    });

    // Obtener configuración adaptativa si está disponible
    if (sistemaAdaptativo) {
      const { parametrosJuego } = await sistemaAdaptativo.determinarAjustes();
      // Aplicar ajustes si es necesario
    }

    setJuegoActivo(true);
    continuarJuego();
  }, [sistemaAdaptativo, continuarJuego]);

  // Finalizar juego
  const finalizarJuego = async () => {
    setJuegoActivo(false);
    setJuegoTerminado(true);

    // Actualizar sistema adaptativo con resultados finales
    if (sistemaAdaptativo) {
      await sistemaAdaptativo.analizarRendimiento({
        ...sesionActual,
        tasaCompletado:
          sesionActual.respuestasCorrectas / sesionActual.intentosTotales,
      });
      await sistemaAdaptativo.actualizarEstadisticas();
    }

    // Guardar estadísticas
    try {
      await updateDoc(doc(db, "childProfiles", perfilNino.id), {
        "estadisticasJuegos.halliGalli.maxPuntuacion": Math.max(
          perfilNino.estadisticasJuegos?.halliGalli?.maxPuntuacion || 0,
          puntuacion
        ),
        "estadisticasJuegos.halliGalli.partidasJugadas": increment(1),
      });

      if (onScoreUpdate) {
        await onScoreUpdate(puntuacion);
      }
    } catch (error) {
      console.error("Error guardando estadísticas:", error);
      toast.error("Error al guardar las estadísticas");
    }
  };

  // Efecto para limpiar al desmontar
  useEffect(() => {
    return () => {
      setJuegoActivo(false);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg">
        {/* Header */}
        <div className="border-b border-blue-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-[var(--primary-blue)]">
                Halli Galli
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
          {/* Puntuación */}
          <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-700 font-medium">Puntuación</div>
            <div className="text-2xl font-bold text-blue-800">
              {puntuacion} pts
            </div>
          </div>

          {/* Combo */}
          {comboActual > 1 && (
            <div className="bg-gradient-to-r from-green-100 to-green-200 rounded-lg p-4 animate-pulse">
              <div className="text-sm text-green-700 font-medium">Combo</div>
              <div className="text-2xl font-bold text-green-800">
                x{comboActual}
              </div>
            </div>
          )}

          {/* Nivel y Velocidad */}
          <div className="bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg p-4">
            <div className="text-sm text-purple-700 font-medium">Velocidad</div>
            <div className="text-xl font-bold text-purple-800">
              {(configNivel.velocidad / 1000).toFixed(1)}s
            </div>
          </div>

          {/* Objetivo */}
          <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg p-4">
            <div className="text-sm text-yellow-700 font-medium">Objetivo</div>
            <div className="text-xl font-bold text-yellow-800">
              {configNivel.cantidadObjetivo} frutas iguales
            </div>
          </div>
        </div>

        {/* Área de Juego */}
        <div className="p-6">
          <div className="bg-gradient-to-br from-white/50 to-blue-50/50 rounded-xl p-8 shadow-inner">
            {/* Mesa de Juego */}
            <div className="relative mb-8">
              {/* Frutas en mesa */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {frutasEnMesa.map((fruta, index) => (
                  <div
                    key={index}
                    className="w-20 h-20 flex items-center justify-center bg-white 
                                 rounded-lg shadow-md transform transition-all duration-300
                                 hover:scale-105"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: "bounce 0.5s ease-in-out",
                    }}
                  >
                    <span className="text-4xl">{fruta.emoji}</span>
                  </div>
                ))}
              </div>

              {/* Contadores de frutas (si está habilitado) */}
              {configNivel.contadorVisible && (
                <div className="flex justify-center gap-4 mb-4">
                  {Object.entries(contadorFrutas).map(([frutaId, cantidad]) => {
                    const fruta = Object.values(FRUTAS).find(
                      (f) => f.id === frutaId
                    );
                    return (
                      <div
                        key={frutaId}
                        className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm"
                      >
                        <span>{fruta.emoji}</span>
                        <span className="font-bold">{cantidad}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Botón del Timbre */}
              <div className="flex justify-center">
                <button
                  onClick={manejarTimbre}
                  disabled={!juegoActivo}
                  className={`
                        w-32 h-32 rounded-full shadow-lg transform transition-all duration-150
                        flex items-center justify-center text-4xl
                        ${
                          juegoActivo
                            ? "bg-red-500 hover:bg-red-600 active:scale-95 cursor-pointer"
                            : "bg-gray-300 cursor-not-allowed"
                        }
                      `}
                >
                  🔔
                </button>
              </div>
            </div>

            {/* Controles del Juego */}
            {!juegoActivo && !juegoTerminado && (
              <div className="text-center">
                <button
                  onClick={iniciarJuego}
                  className="px-8 py-3 bg-[var(--primary-blue)] text-white rounded-lg 
                               hover:opacity-90 font-bold text-lg shadow-md"
                >
                  ¡Comenzar!
                </button>
              </div>
            )}

            {/* Ayudas visuales (si están habilitadas) */}
            {configNivel.ayudaVisual && juegoActivo && (
              <div className="mt-8 text-center text-gray-600">
                <p>
                  Toca el timbre cuando veas {configNivel.cantidadObjetivo}{" "}
                  frutas iguales
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modales */}
        <TutorialModal
          isOpen={showTutorial}
          onClose={() => setShowTutorial(false)}
          configNivel={configNivel}
        />

        <GameOverModal
          isOpen={juegoTerminado}
          puntuacion={puntuacion}
          maxCombo={maxCombo}
          estadisticas={{
            precision:
              sesionActual.respuestasCorrectas / sesionActual.intentosTotales,
            tiempoPromedio:
              sesionActual.tiempoRespuesta / sesionActual.intentosTotales,
          }}
          onRestart={iniciarJuego}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

export default HalliGalli;