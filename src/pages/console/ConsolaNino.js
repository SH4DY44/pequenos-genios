import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc, updateDoc, increment, Timestamp, onSnapshot } from "firebase/firestore";
import { db } from "../../config/firebase";
import { FaGamepad, FaBook, FaChartBar, FaBell, FaTrophy, FaGift, FaCoins, FaStar } from "react-icons/fa";
import { toast } from "react-toastify";
import Actividades from "./Actividades";
import Memorama from "./juegos/memorama/Memorama";
import Eco from "./juegos/eco/SecuenciasPalabras";
import Halli from "./juegos/halliGalli/HalliGalli";
import Estadisticas from './Estadisticas';
import NotificationCenter from "../../components/notifications/NotificationCenter";
import NotificationIndicator from "../../components/notifications/NotificationIndicator";
import RewardsDashboard from '../../components/rewards/RewardsDashboard';
import { RewardsService } from '../../services/rewardsService';
import { NotificationScheduler } from "../../services/notificationScheduler";

function ConsolaNino() {
  const [perfilNino, setPerfilNino] = useState(null);
  const [seccionActiva, setSeccionActiva] = useState("actividades");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const profileId = location.state?.profileId;
  const [juegoSeleccionado, setJuegoSeleccionado] = useState(null);
  const [nuevosLogros, setNuevosLogros] = useState([]);

  // Inicializar el sistema de recompensas si es necesario
  useEffect(() => {
    const inicializarRecompensas = async () => {
      if (profileId) {
        const perfilRef = doc(db, "childProfiles", profileId);
        const perfilDoc = await getDoc(perfilRef);

        if (!perfilDoc.exists() || perfilDoc.data().puntosTotales === undefined) {
          await RewardsService.inicializarSistemaRecompensas(profileId);
        }
      }
    };
    inicializarRecompensas();
  }, [profileId]);

  // Cargar perfil y establecer listener en tiempo real
  useEffect(() => {
    if (!profileId) {
      navigate("/profile-selection");
      return;
    }

    setLoading(true);
    const perfilRef = doc(db, "childProfiles", profileId); //Apuntamos al documento correcto de firestore

    //Establecemos el listener
    const unsubscribe = onSnapshot(perfilRef, (docSnap) => {
      if (docSnap.exists()) {
        setPerfilNino({ ...docSnap.data(), id: profileId });
      } else {
        console.log("El perfil del niño no existe, redirigiendo...");
        navigate("/profile-selection");
      }
      setLoading(false);
    }, (error) => {
      console.error("Error al escuchar el perfil en tiempo real:", error);
      setLoading(false);
      toast.error("Error al cargar el perfil. Intenta de nuevo.");
    });

    // Limpiar el listener cuando el componente se desmonte
    return () => unsubscribe();
  }, [profileId, navigate]);

  // Verificar logros periódicamente (ahora con el perfil actualizado por onSnapshot)
  useEffect(() => {
    if (perfilNino && profileId) {
      verificarNuevosLogros();
    }
  }, [perfilNino, profileId]);

  const verificarNuevosLogros = async () => {
    try {
      const logros = await RewardsService.verificarYOtorgarLogros(profileId, perfilNino);
      if (logros.length > 0) {
        setNuevosLogros(logros);
        // Ya no es necesario recargar el perfil, onSnapshot se encargará
      }
    } catch (error) {
      console.error('Error verificando logros:', error);
    }
  };

  // Función actualizada para manejar puntuaciones de juegos
  const handleScoreUpdate = async (gameData) => {
    try {
      // Actualizar racha diaria
      await actualizarRachaDiaria();
  
      // Agregar puntos usando el sistema de recompensas
      if (gameData.puntos > 0) {
        await RewardsService.agregarPuntos(
          profileId, 
          gameData.puntos, 
          `${gameData.nombreJuego} - Nivel: ${gameData.nivel || 'básico'}`
        );
      }
  
      // RESTAURADO: Agregar estrellas si las hay
      // Pero solo si NO es una actividad (que ya las procesó directamente)
      if (gameData.estrellas > 0 && !gameData.esActividad) {
        await RewardsService.agregarEstrellas(
          profileId,
          gameData.estrellas,
          `${gameData.nombreJuego || 'Juego'} completado`
        );
      }
  
      // Actualizar estadísticas del juego para detección de logros
      const datosActualizados = {
        ...perfilNino,
        actividadesCompletadas: (perfilNino.actividadesCompletadas || 0) + 1,
        puntosTotales: (perfilNino.puntosTotales || 0) + gameData.puntos,
        [`estadisticasJuegos.${gameData.tipoJuego || 'general'}`]: {
          ...perfilNino.estadisticasJuegos?.[gameData.tipoJuego || 'general'],
          victorias: (perfilNino.estadisticasJuegos?.[gameData.tipoJuego || 'general']?.victorias || 0) + 1,
          puntosTotales: (perfilNino.estadisticasJuegos?.[gameData.tipoJuego || 'general']?.puntosTotales || 0) + gameData.puntos,
          ultimoJuego: Timestamp.now()
        }
      };
  
      // Si fue un juego perfecto, actualizar contador
      if (gameData.perfecto) {
        datosActualizados.actividadesPerfectas = (perfilNino.actividadesPerfectas || 0) + 1;
      }
  
      // Verificar y otorgar nuevos logros
      const nuevosLogros = await RewardsService.verificarYOtorgarLogros(profileId, datosActualizados);
      
      if (nuevosLogros.length > 0) {
        setNuevosLogros(prevLogros => [...prevLogros, ...nuevosLogros]);
        toast.success(`🎉 ¡${nuevosLogros.length} nuevo${nuevosLogros.length > 1 ? 's' : ''} logro${nuevosLogros.length > 1 ? 's' : ''}!`);
      }
  
      // Mostrar resumen de recompensas
      const mensajeRecompensas = [];
      if (gameData.puntos > 0) mensajeRecompensas.push(`+${gameData.puntos} puntos`);
      if (gameData.estrellas > 0) mensajeRecompensas.push(`+${gameData.estrellas} estrella${gameData.estrellas > 1 ? 's' : ''}`);
      
      if (mensajeRecompensas.length > 0) {
        toast.success(`¡Recompensas obtenidas! ${mensajeRecompensas.join(', ')}`);
      }
  
    } catch (error) {
      console.error('Error actualizando puntuación:', error);
      toast.error('Error al guardar el progreso');
    }
  };

  // Función para actualizar la racha diaria
  const actualizarRachaDiaria = async () => {
    try {
      const hoy = new Date().toDateString();
      const perfilRef = doc(db, 'childProfiles', profileId);
      
      const ultimaActividad = perfilNino?.ultimaActividad?.toDate()?.toDateString();
      
      if (ultimaActividad !== hoy) {
        const ayer = new Date();
        ayer.setDate(ayer.getDate() - 1);
        const ayerString = ayer.toDateString();
        
        let nuevaRacha = 1;
        if (ultimaActividad === ayerString) {
          nuevaRacha = (perfilNino.racha || 0) + 1;
        }
        
        await updateDoc(perfilRef, {
          racha: nuevaRacha,
          ultimaActividad: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('Error actualizando racha:', error);
    }
  };

  // Función heredada para compatibilidad con código existente
  const actualizarPuntos = async (puntos) => {
    await handleScoreUpdate({
      puntos,
      nombreJuego: 'Juego',
      tipoJuego: 'general'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-blue)]"></div>
          <p className="mt-4 text-[var(--primary-blue)]">Cargando...</p>
        </div>
      </div>
    );
  }

  const secciones = [
    {
      id: "actividades",
      nombre: "Actividades",
      icono: <FaBook className="text-xl" />,
      color: "bg-green-500",
    },
    {
      id: "juegos",
      nombre: "Juegos",
      icono: <FaGamepad className="text-xl" />,
      color: "bg-blue-500",
    },
    {
      id: "recompensas", // NUEVA SECCIÓN
      nombre: "Recompensas",
      icono: <FaTrophy className="text-xl" />,
      color: "bg-yellow-500",
    },
    {
      id: "estadisticas",
      nombre: "Estadísticas",
      icono: <FaChartBar className="text-xl" />,
      color: "bg-purple-500",
    },
    {
      id: "notificaciones",
      nombre: "Notificaciones",
      icono: <FaBell className="text-xl" />,
      color: "bg-red-500",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--primary-yellow)]">
      {/* Header Mejorado */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Info del niño */}
            <div className="flex items-center space-x-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold border-2 border-white/20"
                style={{
                  backgroundColor: perfilNino?.avatar?.color || "#E5E7EB",
                  color: "#333",
                }}
              >
                {perfilNino?.avatar?.initials || perfilNino?.fullName?.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-bold">{perfilNino?.fullName}</h1>
                <div className="flex items-center space-x-2">
                  <span className="text-sm opacity-90">
                    Nivel: {perfilNino?.resultadosEvaluacion?.nivelAsignado?.nivel || "No evaluado"}
                  </span>
                  {perfilNino?.racha > 0 && (
                    <span className="text-sm opacity-90 bg-orange-500 px-2 py-1 rounded-full">
                      🔥 {perfilNino.racha} días
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Monedas y estadísticas */}
            <div className="flex items-center space-x-4">
              {/* Puntos */}
              <div className="flex items-center bg-white bg-opacity-10 rounded-lg px-4 py-2 hover:bg-opacity-20 transition-all">
                <FaCoins className="text-yellow-300 text-xl mr-2" />
                <div className="text-center">
                  <div className="text-sm font-bold">
                    {(perfilNino?.puntosTotales || 0).toLocaleString()}
                  </div>
                  <div className="text-xs opacity-75">Puntos</div>
                </div>
              </div>

              {/* Estrellas */}
              <div className="flex items-center bg-white bg-opacity-10 rounded-lg px-4 py-2 hover:bg-opacity-20 transition-all">
                <FaStar className="text-purple-300 text-xl mr-2" />
                <div className="text-center">
                  <div className="text-sm font-bold">{perfilNino?.estrellas || 0}</div>
                  <div className="text-xs opacity-75">Estrellas</div>
                </div>
              </div>

              {/* Logros */}
              <div className="flex items-center bg-white bg-opacity-10 rounded-lg px-4 py-2 hover:bg-opacity-20 transition-all">
                <FaTrophy className="text-yellow-400 text-xl mr-2" />
                <div className="text-center">
                  <div className="text-sm font-bold">
                    {Object.keys(perfilNino?.logros || {}).length}
                  </div>
                  <div className="text-xs opacity-75">Logros</div>
                </div>
              </div>

              {/* Actividades completadas */}
              <div className="flex items-center bg-white bg-opacity-10 rounded-lg px-4 py-2 hover:bg-opacity-20 transition-all">
                <FaBook className="text-green-300 text-xl mr-2" />
                <div className="text-center">
                  <div className="text-sm font-bold">{perfilNino?.actividadesCompletadas || 0}</div>
                  <div className="text-xs opacity-75">Completadas</div>
                </div>
              </div>

              {/* Indicador de notificaciones */}
              <NotificationIndicator 
                onOpenCenter={() => setSeccionActiva("notificaciones")}
              />

              {/* Botón para volver */}
              <button
                onClick={() => navigate("/profile-selection")}
                className="bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg px-4 py-2 flex items-center space-x-2 transition-all"
              >
                <span>Cambiar Perfil</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navegación Mejorada */}
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-around">
            {secciones.map((seccion) => (
              <button
                key={seccion.id}
                onClick={() => {
                  setSeccionActiva(seccion.id);
                  setJuegoSeleccionado(null);
                }}
                className={`flex items-center space-x-2 px-6 py-4 transition-all relative font-medium
                  ${seccionActiva === seccion.id
                    ? "text-[var(--primary-blue)] bg-blue-50"
                    : "text-gray-600 hover:text-[var(--primary-blue)] hover:bg-gray-50"
                  }`}
              >
                {seccion.icono}
                <span>{seccion.nombre}</span>
                {seccionActiva === seccion.id && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-[var(--primary-blue)]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Contenedor principal */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg min-h-[600px]">
          {/* Renderizado de contenido según sección activa */}
          {seccionActiva === "actividades" && (
            <div className="p-6">
              <Actividades perfilNino={perfilNino} />
            </div>
          )}

          {seccionActiva === "juegos" && !juegoSeleccionado && (
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-[var(--primary-blue)]">
                  Juegos Disponibles
                </h2>
                <div className="text-sm text-gray-600">
                  ¡Juega y gana puntos y recompensas!
                </div>
              </div>

              {/* Grid de juegos mejorado */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Carta de Memorama */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1">
                  <div className="h-40 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-6xl">
                    🎴
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold">Memorama</h3>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        10-30 pts
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      Encuentra los pares de cartas iguales y mejora tu memoria.
                    </p>
                    <button
                      onClick={() => setJuegoSeleccionado("memorama")}
                      className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium"
                    >
                      🎮 Jugar Ahora
                    </button>
                  </div>
                </div>

                {/* Carta del Juego ECO */}
                <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1">
                  <div className="h-40 bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-6xl">
                    🎯
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold">ECO - Secuencias</h3>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        15-40 pts
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      Repite las palabras en el mismo orden. Entrena tu memoria auditiva.
                    </p>
                    <button
                      onClick={() => setJuegoSeleccionado("eco")}
                      className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg hover:from-green-600 hover:to-teal-700 transition-all font-medium"
                    >
                      🎮 Jugar Ahora
                    </button>
                  </div>
                </div>

                {/* Carta de Halli Galli */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1">
                  <div className="h-40 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-6xl">
                    🔔
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold">Halli Galli</h3>
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                        5-25 pts
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      ¡Toca la campana cuando veas la combinación correcta!
                    </p>
                    <button
                      onClick={() => setJuegoSeleccionado("halligalli")}
                      className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all font-medium"
                    >
                      🎮 Jugar Ahora
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal para juegos */}
          {juegoSeleccionado && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  {juegoSeleccionado === "memorama" && (
                    <Memorama
                      perfilNino={{ ...perfilNino, id: profileId }}
                      onScoreUpdate={handleScoreUpdate}
                      onClose={() => setJuegoSeleccionado(null)}
                    />
                  )}

                  {juegoSeleccionado === "eco" && (
                    <Eco
                      perfilNino={{ ...perfilNino, id: profileId }}
                      onScoreUpdate={handleScoreUpdate}
                      onClose={() => setJuegoSeleccionado(null)}
                    />
                  )}

                  {juegoSeleccionado === "halligalli" && (
                    <Halli
                      perfilNino={{ ...perfilNino, id: profileId }}
                      onScoreUpdate={handleScoreUpdate}
                      onClose={() => setJuegoSeleccionado(null)}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* NUEVA SECCIÓN: Sistema de Recompensas */}
          {seccionActiva === "recompensas" && (
            <RewardsDashboard 
              profileId={profileId}
              perfilNino={perfilNino}
            />
          )}

          {seccionActiva === "estadisticas" && (
            <div className="p-6">
              <Estadisticas profileId={profileId} />
            </div>
          )}

          {seccionActiva === "notificaciones" && (
            <div className="p-6">
              <NotificationCenter profileId={profileId} />
            </div>
          )}
        </div>
      </div>

      {/* Modal de logros */}
      {nuevosLogros.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              ¡Nuevo{nuevosLogros.length > 1 ? 's' : ''} Logro{nuevosLogros.length > 1 ? 's' : ''}!
            </h2>
            
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
              {nuevosLogros.slice(0, 3).map(logro => (
                <div key={logro.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4">
                  <div className="text-3xl mb-2">{logro.icono}</div>
                  <h3 className="font-bold text-gray-800">{logro.nombre}</h3>
                  <p className="text-sm text-gray-600">{logro.descripcion}</p>
                  {logro.recompensa && (
                    <div className="flex justify-center items-center mt-2 space-x-2">
                      {logro.recompensa.puntos > 0 && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                          +{logro.recompensa.puntos} puntos
                        </span>
                      )}
                      {logro.recompensa.estrellas > 0 && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                          +{logro.recompensa.estrellas} estrellas
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {nuevosLogros.length > 3 && (
                <div className="text-sm text-gray-500">
                  Y {nuevosLogros.length - 3} logros más...
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setNuevosLogros([]);
                  setSeccionActiva('recompensas');
                }}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Ver Recompensas
              </button>
              <button
                onClick={() => setNuevosLogros([])}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-all"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConsolaNino;