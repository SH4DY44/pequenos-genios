import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import TutorialModal from "./TutorialModal";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../../../config/firebase";
import { NotificationService } from '../../../../services/notificationService';
import { auth } from '../../../../config/firebase';
import { RewardsService } from '../../../../services/rewardsService';

function Memorama({ perfilNino, onScoreUpdate, onClose }) {
  // Estados básicos
  const [cartas, setCartas] = useState([]);
  const [cartasVolteadas, setCartasVolteadas] = useState([]);
  const [cartasEmparejadas, setCartasEmparejadas] = useState([]);
  const [puntuacion, setPuntuacion] = useState(0);
  const [puntuacionBase, setPuntuacionBase] = useState(0);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);

  // Estados del sistema de combo
  const [comboActual, setComboActual] = useState(1);
  const [maxCombo, setMaxCombo] = useState(1);

  // Configuración según nivel
  const configuracionNivel = {
    basico: {
      numPares: 4,
      tiempoLimite: null,
      puntosPorAcierto: 10,
      descripcion: "Nivel Básico - Encuentra los pares a tu ritmo",
    },
    "basico-alto": {
      numPares: 6,
      tiempoLimite: 300,
      puntosPorAcierto: 15,
      descripcion: "Nivel Básico Alto - ¡Vamos mejorando!",
    },
    intermedio: {
      numPares: 10,
      tiempoLimite: 240,
      puntosPorAcierto: 20,
      descripcion: "Nivel Intermedio - ¡A contrarreloj!",
    },
    avanzado: {
      numPares: 18,
      tiempoLimite: 120,
      puntosPorAcierto: 30,
      descripcion: "Nivel Avanzado - ¡Un verdadero reto!",
    },
  };

  // Mapeo de niveles
  const mapeoNiveles = {
    básico: "basico",
    "básico-alto": "basico-alto",
    intermedio: "intermedio",
    avanzado: "avanzado",
  };

  const emojis = [
    "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯",
    "🦁", "🐮", "🐷", "🐸", "🐵", "🦄", "🐙", "🦋"
  ];

  // Obtener configuración actual
  const nivelActual = perfilNino?.resultadosEvaluacion?.nivelAsignado?.nivel || "basico";
  const nivelMapeado = mapeoNiveles[nivelActual] || "basico";
  const configuracionActual = configuracionNivel[nivelMapeado];

  useEffect(() => {
    iniciarJuego();
  }, []);

  useEffect(() => {
    let timer;
    if (configuracionActual.tiempoLimite && !juegoTerminado) {
      timer = setInterval(() => {
        setTiempoTranscurrido((prev) => {
          if (prev + 1 >= configuracionActual.tiempoLimite) {
            finalizarJuego(false);
            return configuracionActual.tiempoLimite;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [juegoTerminado, configuracionActual.tiempoLimite]);

  const iniciarJuego = () => {
    const paresAUsar = emojis.slice(0, configuracionActual.numPares);
    const cartasIniciales = [...paresAUsar, ...paresAUsar]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        contenido: emoji,
        emparejada: false,
        volteada: false,
      }));

    setCartas(cartasIniciales);
    setCartasVolteadas([]);
    setCartasEmparejadas([]);
    setPuntuacion(0);
    setPuntuacionBase(0);
    setTiempoTranscurrido(0);
    setJuegoTerminado(false);
    setComboActual(1);
    setMaxCombo(1);
  };

  const voltearCarta = async (id) => {
    if (
      cartasVolteadas.length === 2 ||
      juegoTerminado ||
      cartas[id].emparejada ||
      cartasVolteadas.includes(id)
    )
      return;

    const nuevasCartas = cartas.map((carta) =>
      carta.id === id ? { ...carta, volteada: true } : carta
    );
    setCartas(nuevasCartas);
    setCartasVolteadas([...cartasVolteadas, id]);

    if (cartasVolteadas.length === 1) {
      const primeraCartaId = cartasVolteadas[0];
      const segundaCartaId = id;

      if (cartas[primeraCartaId].contenido === cartas[segundaCartaId].contenido) {
        await manejarAcierto(primeraCartaId, segundaCartaId);
      } else {
        await manejarFallo(primeraCartaId, segundaCartaId);
      }
    }
  };

  const manejarAcierto = async (carta1Id, carta2Id) => {
    // Aumentar el combo
    const nuevoCombo = comboActual + 1;
    setComboActual(nuevoCombo);
    setMaxCombo(Math.max(maxCombo, nuevoCombo));

    // Calcular puntos con multiplicador
    const puntosPorAcierto = configuracionActual.puntosPorAcierto;
    const multiplicador = Math.min(3, 1 + (comboActual * 0.5));
    const puntosGanados = Math.floor(puntosPorAcierto * multiplicador);

    // Actualizar puntos y sumarlos en la BD
    try {
      if (onScoreUpdate) {
        await onScoreUpdate(puntosGanados);
      }
    } catch (error) {
      console.error("Error al actualizar puntos:", error);
      toast.error("Error al guardar los puntos");
    }

    // Solo actualizamos la puntuación local, ya que onScoreUpdate ya actualiza la BD
    setPuntuacion(prev => prev + puntosGanados);
    setPuntuacionBase(prev => prev + puntosPorAcierto);

    // Mostrar mensaje de combo
    if (comboActual > 1) {
      toast.success(`¡${comboActual}x Combo! +${puntosGanados} puntos`, {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: true,
        className: "bg-green-100"
      });
    }

    setTimeout(() => {
      setCartas(prev => 
        prev.map(carta =>
          carta.id === carta1Id || carta.id === carta2Id
            ? { ...carta, emparejada: true, volteada: false }
            : carta
        )
      );
      setCartasVolteadas([]);
      setCartasEmparejadas(prev => [...prev, carta1Id, carta2Id]);

      const nuevosEmparejados = [...cartasEmparejadas, carta1Id, carta2Id];
      if (nuevosEmparejados.length === cartas.length) {
        finalizarJuego(true);
      }
    }, 1000);
  };

  const manejarFallo = (carta1Id, carta2Id) => {
    // Reiniciar el combo
    if (comboActual > 1) {
      toast.info(`¡Combo perdido!`, {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: true
      });
    }
    setComboActual(1);

    setTimeout(() => {
      setCartas(prev =>
        prev.map(carta =>
          carta.id === carta1Id || carta.id === carta2Id
            ? { ...carta, volteada: false }
            : carta
        )
      );
      setCartasVolteadas([]);
    }, 1000);
  };

  const finalizarJuego = async (victoria = false) => {
    if (!juegoTerminado) {
      setJuegoTerminado(true);
      // Usar la puntuación en pantalla como fuente de verdad
      let puntosFinales = puntuacion;
      let bonificaciones = [];
      
      // Bonificación por tiempo (si hay límite y lo cumplió)
      if (configuracionActual.tiempoLimite && tiempoTranscurrido < configuracionActual.tiempoLimite * 0.7) {
        const bonusVelocidad = Math.floor(puntosFinales * 0.5);
        puntosFinales += bonusVelocidad;
        bonificaciones.push(`⚡ Velocidad: +${bonusVelocidad}`);
      }
      
      // Bonificación por combo perfecto
      if (maxCombo >= 5) {
        const bonusCombo = Math.floor(puntosFinales * 0.3);
        puntosFinales += bonusCombo;
        bonificaciones.push(`🔥 Combo máximo: +${bonusCombo}`);
      }
      
      // Aplicar multiplicador de eventos si existe
      puntosFinales = RewardsService.aplicarMultiplicadorEvento(puntosFinales, 'memorama');
      
      try {
        // Guardar puntos
        await RewardsService.agregarPuntos(
          perfilNino.id,
          puntosFinales,
          `Memorama completado - Nivel: ${configuracionActual.descripcion}`
        );
        // Otorgar estrellas
        const recompensa = await RewardsService.otorgarRecompensaActividad(
          perfilNino.id,
          'memorama',
          {
            porcentajeCorrecto: 0,
            tiempo: 0,
            tiempoObjetivo: 0
          }
        );
        // Notificar a la IU
        if (onScoreUpdate) {
          onScoreUpdate({
            puntos: puntosFinales,
            estrellas: recompensa.estrellas,
            bonificaciones,
            nombreJuego: 'Memorama',
            tipoJuego: 'memorama',
            nivel: perfilNino?.resultadosEvaluacion?.nivelAsignado?.nivel,
            tiempoTranscurrido,
            combo: maxCombo,
            esActividad:true
          });
        }

        // Actualizar estadísticas del juego para logros
        const datosProgreso = {
          ...perfilNino,
          actividadesCompletadas: (perfilNino.actividadesCompletadas || 0) + 1,
          puntosTotales: (perfilNino.puntosTotales || 0) + puntosFinales,
          estadisticasJuegos: {
            ...perfilNino.estadisticasJuegos,
            memorama: {
              ...perfilNino.estadisticasJuegos?.memorama,
              victorias: (perfilNino.estadisticasJuegos?.memorama?.victorias || 0) + 1,
              puntosTotales: (perfilNino.estadisticasJuegos?.memorama?.puntosTotales || 0) + puntosFinales,
              mejorTiempo: Math.min(
                perfilNino.estadisticasJuegos?.memorama?.mejorTiempo || Infinity,
                tiempoTranscurrido
              ),
              maxComboAlcanzado: Math.max(
                perfilNino.estadisticasJuegos?.memorama?.maxComboAlcanzado || 0,
                maxCombo
              )
            }
          }
        };

        // Verificar nuevos logros
        const nuevosLogros = await RewardsService.verificarYOtorgarLogros(
          perfilNino.id,
          datosProgreso
        );

        // Mostrar logros si los hay
        if (nuevosLogros.length > 0) {
          toast.success(`🎉 ¡${nuevosLogros.length} nuevo${nuevosLogros.length > 1 ? 's' : ''} logro${nuevosLogros.length > 1 ? 's' : ''}!`);
        }

        // Actualizar puntuación en la UI
        setPuntuacion(puntosFinales);
        
        // Actualizar juegos completados en la BD
        await updateDoc(doc(db, 'childProfiles', perfilNino.id), {
          juegosCompletados: increment(1)
        });

      } catch (error) {
        console.error('Error finalizando juego:', error);
        toast.error('Error al guardar el progreso');
      }
    }
  };

  const renderTutorialButton = () => {
    <button
      onClick={() => setShowTutorial(true)}
      className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-all flex items-center gap-2"
    >
      <span>❔</span>
      <span>Cómo jugar</span>
    </button>
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-8">
      {/* Header con título y descripción */}
      <div className="border-b border-blue-200 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-[var(--primary-blue)] bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              Memorama
            </h2>
            <p className="text-indigo-600 mt-1 font-medium">{configuracionActual.descripcion}</p>
          </div>
          <button
            onClick={onClose}
            className="text-indigo-500 hover:text-indigo-700 p-2 rounded-full hover:bg-indigo-100 transition-all"
          >
            ✕
          </button>
        </div>
      </div>
  
      {/* Panel de control y estadísticas */}
      <div className="flex flex-wrap gap-4 mb-8">
        {/* Puntuación y combo */}
        <div className="flex-1 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-blue-700 mb-1 font-medium">Puntuación</div>
              <div className="text-2xl font-bold text-blue-800">
                {puntuacion} pts
              </div>
            </div>
            {comboActual > 1 && (
              <div className="bg-gradient-to-r from-green-200 to-emerald-200 px-4 py-2 rounded-lg animate-pulse shadow-sm">
                <div className="text-sm font-medium text-emerald-700">Combo</div>
                <div className="text-xl font-bold text-emerald-800">{comboActual}x</div>
              </div>
            )}
          </div>
        </div>
  
        {/* Tiempo y controles */}
        <div className="flex-1 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between">
            {configuracionActual.tiempoLimite && (
              <div>
                <div className="text-sm text-purple-700 mb-1 font-medium">Tiempo restante</div>
                <div className="text-2xl font-bold text-purple-800">
                  {configuracionActual.tiempoLimite - tiempoTranscurrido}s
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setShowTutorial(true)}
                className="px-4 py-2 bg-gradient-to-r from-amber-200 to-yellow-200 text-amber-800 
                          rounded-lg hover:from-amber-300 hover:to-yellow-300 
                          transition-all flex items-center gap-2 shadow-sm font-medium"
              >
                <span>❔</span>
                <span>Cómo jugar</span>
              </button>
              <button
                onClick={iniciarJuego}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white 
                          rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all shadow-sm font-medium"
              >
                Reiniciar
              </button>
            </div>
          </div>
        </div>
      </div>
  
      {/* Barra de progreso */}
      <div className="w-full h-3 bg-gray-200 rounded-full mb-6 p-0.5">
        <div
          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full 
                     transition-all duration-300 shadow-sm"
          style={{ width: `${(cartasEmparejadas.length / cartas.length) * 100}%` }}
        />
      </div>
  
      {/* Contenedor de cartas con fondo suave */}
      <div className="bg-gradient-to-br from-white/50 to-blue-50/50 rounded-xl p-6 shadow-inner">
        <div
          className={`grid gap-6 ${
            configuracionActual.numPares <= 6
              ? "grid-cols-4 max-w-4xl"
              : configuracionActual.numPares <= 10
              ? "grid-cols-5 max-w-5xl"
              : "grid-cols-6 max-w-6xl"
          } mx-auto`}
        >
          {cartas.map((carta) => (
            <div
              key={carta.id}
              onClick={() => voltearCarta(carta.id)}
              className="relative w-full p-2 cursor-pointer"
            >
              <div className="w-full h-full aspect-square">
                <div
                  className={`w-full h-full bg-gradient-to-br from-blue-100 to-white
                           rounded-xl border-2 ${
                             carta.emparejada
                               ? "border-green-400"
                               : "border-blue-400"
                           } 
                           shadow-lg flex items-center justify-center 
                           ${
                             !carta.emparejada &&
                             "hover:shadow-xl hover:scale-105"
                           } 
                           transition-all duration-300`}
                >
                  <div
                    className={`text-4xl transform transition-all duration-300 
                                ${
                                  !carta.emparejada && !carta.volteada
                                    ? "bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text"
                                    : ""
                                }`}
                  >
                    {carta.volteada || carta.emparejada ? carta.contenido : "?"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
  
      {/* Modal de tutorial */}
      <TutorialModal 
        isOpen={showTutorial} 
        onClose={() => setShowTutorial(false)} 
      />
  
      {/* Modal de fin de juego */}
      {juegoTerminado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl text-center max-w-md shadow-2xl animate-fade-in">
            <div className="text-6xl mb-4 animate-bounce">
              {cartasEmparejadas.length === cartas.length ? "🎉" : "⏰"}
            </div>
            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              {cartasEmparejadas.length === cartas.length
                ? "¡Felicitaciones!"
                : "¡Se acabó el tiempo!"}
            </h3>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg mb-6">
              <p className="text-lg mb-2">
                Puntuación final:{" "}
                <span className="font-bold text-blue-600">
                  {puntuacion} puntos
                </span>
              </p>
              <div className="text-sm text-gray-600">
                <p>Combo máximo: {maxCombo}x</p>
                <p>Puntos base: {puntuacionBase}</p>
                <p>Puntos extra por combos: {puntuacion - puntuacionBase}</p>
              </div>
            </div>
            <div className="space-y-4">
              <button
                onClick={iniciarJuego}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white 
                          rounded-lg hover:opacity-90 font-bold transform transition-all hover:scale-105"
              >
                Jugar de nuevo
              </button>
              <button
                onClick={onClose}
                className="w-full px-6 py-3 border-2 border-gray-300 rounded-lg 
                          hover:bg-gray-100 transition-colors"
              >
                Salir del juego
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Memorama;