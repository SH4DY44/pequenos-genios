import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../config/firebase";
import { FaGamepad, FaBook, FaChartBar, FaBell } from "react-icons/fa";
import { toast } from "react-toastify";
import Actividades from "./Actividades";
import Memorama from "./juegos/memorama/Memorama";
import Eco from "./juegos/eco/SecuenciasPalabras";
import Halli from "./juegos/halliGalli/HalliGalli";
import Estadisticas from './Estadisticas'
import NotificationCenter from "../../components/notifications/NotificationCenter";
import NotificationIndicator from "../../components/notifications/NotificationIndicator";
import { NotificationScheduler } from "../../services/notificationScheduler";


function ConsolaNino() {
  const [perfilNino, setPerfilNino] = useState(null);
  const [seccionActiva, setSeccionActiva] = useState("actividades");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const profileId = location.state?.profileId;
  const [juegoSeleccionado, setJuegoSeleccionado] = useState(null);

  const fetchPerfilNino = async () => {
    if (!profileId) {
      navigate("/profile-selection");
      return;
    }

    try {
      const perfilDoc = await getDoc(doc(db, "childProfiles", profileId));
      if (perfilDoc.exists()) {
        setPerfilNino({ ...perfilDoc.data(), id: profileId });
      } else {
        navigate("/profile-selection");
      }
    } catch (error) {
      console.error("Error al cargar el perfil:", error);
    }
  };

  useEffect(() => {
    const cargarPerfil = async () => {
      await fetchPerfilNino();
      setLoading(false);
    };
    cargarPerfil();
  }, [profileId, navigate]);

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

  const actualizarPuntos = async (puntos) => {
    try {
      // Obtener fecha actual para registro de actividad
      const fechaActual = new Date();
      const fechaFormateada = fechaActual.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      
      await updateDoc(doc(db, "childProfiles", profileId), {
        puntosTotales: increment(puntos),
        ultimaActividad: fechaActual,
        [`registroActividades.${fechaFormateada}`]: increment(1),
        actividadesCompletadas: increment(1)
      });
      
      // Actualizar el estado local
      await fetchPerfilNino();
      toast.success(`¡Ganaste ${puntos} puntos!`);
      
      // Verificar logros después de actualizar puntos
      const perfilActualizado = await getDoc(doc(db, "childProfiles", profileId));
      if (perfilActualizado.exists()) {
        await NotificationScheduler.verificarLogros(profileId, perfilActualizado.data());
      }
    } catch (error) {
      console.error("Error actualizando puntos:", error);
      toast.error("Error al actualizar los puntos");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--primary-yellow)]">
      {/* Header */}
      <header className="bg-[var(--primary-blue)] text-white">
        <div className="p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Info del niño */}
            <div className="flex items-center space-x-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
                style={{
                  backgroundColor: perfilNino?.avatar?.color || "#E5E7EB",
                  color: "#333",
                }}
              >
                {perfilNino?.avatar?.initials}
              </div>
              <div>
                <h1 className="text-xl font-bold">{perfilNino?.fullName}</h1>
                <div className="flex items-center space-x-2">
                  <span className="text-sm opacity-90">
                    Nivel:{" "}
                    {perfilNino?.resultadosEvaluacion?.nivelAsignado?.nivel ||
                      "No evaluado"}
                  </span>
                  <span className="text-sm opacity-90">
                    | Puntos: {perfilNino?.puntosTotales || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="flex items-center space-x-4">
              {/* Sistema de puntos/logros */}
              <div className="flex items-center bg-white bg-opacity-10 rounded-lg px-4 py-2">
                <div className="text-center mr-4">
                  <div className="text-xl font-bold">🏆</div>
                  <div className="text-xs">Logros</div>
                  <div className="text-sm font-bold">
                    {Object.keys(perfilNino?.logros || {}).length}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">⭐</div>
                  <div className="text-xs">Estrellas</div>
                  <div className="text-sm font-bold">
                    {perfilNino?.estrellas || 0}
                  </div>
                </div>
              </div>

              {/* Streak de días */}
              <div className="bg-white bg-opacity-10 rounded-lg px-4 py-2 text-center">
                <div className="text-xl font-bold">🔥</div>
                <div className="text-xs">Racha</div>
                <div className="text-sm font-bold">
                  {perfilNino?.racha || 0} días
                </div>
              </div>

              {/* Tiempo de sesión */}
              <div className="bg-white bg-opacity-10 rounded-lg px-4 py-2 text-center">
                <div className="text-xl font-bold">⏱️</div>
                <div className="text-xs">Tiempo hoy</div>
                <div className="text-sm font-bold">
                  {Math.round((perfilNino?.tiempoTotal || 0) / 60)} min
                </div>
              </div>

              {/* Indicador de notificaciones */}
              <NotificationIndicator 
                onOpenCenter={() => setSeccionActiva("notificaciones")}
              />

              {/* Botón para volver */}
              <button
                onClick={() => navigate("/profile-selection")}
                className="bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg px-4 py-2 flex items-center space-x-2 transition-colors"
              >
                <span>Cambiar Perfil</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navegación */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-around">
            {secciones.map((seccion) => (
              <button
                key={seccion.id}
                onClick={() => setSeccionActiva(seccion.id)}
                className={`flex items-center space-x-2 px-4 py-3 transition-colors relative
                                    ${
                                      seccionActiva === seccion.id
                                        ? "text-[var(--primary-blue)]"
                                        : "text-gray-600 hover:text-[var(--primary-blue)]"
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
        <div className="bg-white rounded-xl shadow-lg p-6">
          {seccionActiva === "actividades" && (
            <Actividades perfilNino={perfilNino} />
          )}

          {seccionActiva === "juegos" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-[var(--primary-blue)]">
                  Juegos Disponibles
                </h2>
              </div>

              {/* Grid de juegos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Carta de Memorama */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all">
                  <div className="h-40 bg-gray-50 flex items-center justify-center text-6xl">
                    🎴
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-2">Memorama</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Encuentra los pares de cartas iguales y mejora tu memoria.
                    </p>
                    <button
                      onClick={() => setJuegoSeleccionado("memorama")}
                      className="w-full px-4 py-2 bg-[var(--primary-blue)] text-white rounded-lg hover:opacity-90"
                    >
                      Jugar
                    </button>
                  </div>
                </div>

                {/* Carta del Juego de Sílabas */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all">
                  <div className="h-40 bg-gray-50 flex items-center justify-center text-6xl">
                    🎯
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-2">
                      Secuencias de Palabras
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Repite las palabras en el mismo orden. Aprende mientras
                      juegas.
                    </p>
                    <button
                      onClick={() => setJuegoSeleccionado("eco")}
                      className="w-full px-4 py-2 bg-[var(--primary-blue)] text-white rounded-lg hover:opacity-90"
                    >
                      Jugar
                    </button>
                  </div>
                </div>

                {/* Carta de Halli Galli */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all">
                  <div className="h-40 bg-gray-50 flex items-center justify-center text-6xl">
                    🔔
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-2">Halli Galli</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      ¡Toca la campana cuando veas la combinación correcta de
                      frutas!
                    </p>
                    <button
                      onClick={() => setJuegoSeleccionado("halligalli")}
                      className="w-full px-4 py-2 bg-[var(--primary-blue)] text-white rounded-lg hover:opacity-90"
                    >
                      Jugar
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal para el juego seleccionado */}
              {juegoSeleccionado && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-4"></div>

                    {juegoSeleccionado === "memorama" && (
                      <Memorama
                        perfilNino={{
                          ...perfilNino,
                          id: profileId,
                        }}
                        onScoreUpdate={actualizarPuntos}
                        onClose={() => setJuegoSeleccionado(null)}
                      />
                    )}

                    {juegoSeleccionado === "eco" && (
                      <Eco
                        perfilNino={{
                          ...perfilNino,
                          id: profileId,
                        }}
                        onScoreUpdate={actualizarPuntos}
                        onClose={() => setJuegoSeleccionado(null)}
                      />
                    )}
                    {juegoSeleccionado === "halligalli" && (
                      <Halli
                        perfilNino={{
                          ...perfilNino,
                          id: profileId,
                        }}
                        onScoreUpdate={actualizarPuntos}
                        onClose={() => setJuegoSeleccionado(null)}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {seccionActiva === "estadisticas" && (
            <Estadisticas profileId={profileId} />
          )}

          {seccionActiva === "notificaciones" && (
            <NotificationCenter />
          )}
        </div>
      </div>
    </div>
  );
}

export default ConsolaNino;