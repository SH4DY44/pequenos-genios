import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

function Estadisticas({ profileId }) {
  const [perfilNino, setPerfilNino] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPerfilCompleto = async () => {
      if (!profileId) {
        setError('No se proporcionó un ID de perfil');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // Obtener el documento completo del perfil
        const perfilDoc = await getDoc(doc(db, "childProfiles", profileId));
        
        if (perfilDoc.exists()) {
          console.log('Datos del perfil obtenidos:', perfilDoc.data());
          setPerfilNino(perfilDoc.data());
        } else {
          setError('No se encontró el perfil del niño');
        }
      } catch (error) {
        console.error('Error al cargar el perfil:', error);
        setError(`Error al cargar el perfil: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPerfilCompleto();
  }, [profileId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-blue)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-600 mb-2">Error</h3>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Formatear fecha
  const formatearFecha = (timestamp) => {
    if (!timestamp) return 'No disponible';
    const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return fecha.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Calcular días activos
  const calcularDiasActivos = () => {
    if (!perfilNino.registroActividades) return 0;
    return Object.keys(perfilNino.registroActividades).length;
  };

  // Calcular total de juegos completados
  const totalJuegosCompletados = (perfilNino?.juegosCompletados || 0) + (perfilNino?.estadisticasJuegos ? Object.values(perfilNino.estadisticasJuegos).reduce((acc, juego) => acc + (juego.partidasJugadas || 0), 0) : 0);
  const totalActividades = perfilNino?.actividadesCompletadas || 0;
  const totalCompletados = totalActividades + totalJuegosCompletados;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-[var(--primary-blue)]">Estadísticas de Progreso</h2>
      
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-[var(--primary-blue)]">
          <h3 className="text-sm font-medium text-gray-500">Actividades Completadas</h3>
          <p className="text-2xl font-bold">{totalActividades}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-[var(--primary-green)]">
          <h3 className="text-sm font-medium text-gray-500">Juegos Completados</h3>
          <p className="text-2xl font-bold">{totalJuegosCompletados}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
          <h3 className="text-sm font-medium text-gray-500">Total Combinado</h3>
          <p className="text-2xl font-bold">{totalCompletados}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <h3 className="text-sm font-medium text-gray-500">Días Activos</h3>
          <p className="text-2xl font-bold">{calcularDiasActivos()}</p>
        </div>
      </div>
      
      {/* Información del perfil */}
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <h3 className="text-lg font-semibold mb-4">Información del Perfil</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 mb-2">
              <span className="font-medium">Nombre:</span> {perfilNino?.fullName}
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-medium">Fecha de nacimiento:</span> {perfilNino?.birthDate}
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-medium">Nivel asignado:</span> {perfilNino?.resultadosEvaluacion?.nivelAsignado?.nivel || 'No evaluado'}
            </p>
          </div>
          <div>
            <p className="text-gray-600 mb-2">
              <span className="font-medium">Fecha de creación:</span> {formatearFecha(perfilNino?.createdAt)}
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-medium">Última actividad:</span> {formatearFecha(perfilNino?.ultimaActividad)}
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-medium">Racha actual:</span> {perfilNino?.racha || 0} días
            </p>
          </div>
        </div>
      </div>
      
      {/* Estadísticas de juegos */}
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <h3 className="text-lg font-semibold mb-4">Estadísticas de Juegos</h3>
        
        {perfilNino?.estadisticasJuegos ? (
          <div className="space-y-4">
            {Object.entries(perfilNino.estadisticasJuegos).map(([juego, stats]) => {
              const nombreJuego = juego === 'secuenciasPalabras' ? 'Secuencias de Palabras' : 
                                 juego === 'memorama' ? 'Memorama' : 
                                 juego === 'halliGalli' ? 'Halli Galli' : juego;
              
              const victorias = stats.victorias || 0;
              const derrotas = stats.derrotas || 0;
              const total = victorias + derrotas;
              const porcentajeVictorias = total > 0 ? Math.round((victorias / total) * 100) : 0;
              
              return (
                <div key={juego} className="border-b pb-4">
                  <h4 className="font-medium text-lg mb-2">{nombreJuego}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Partidas jugadas</p>
                      <p className="text-xl font-bold">{total}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Victorias / Derrotas</p>
                      <p className="text-xl font-bold">{victorias} / {derrotas}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Puntuación máxima</p>
                      <p className="text-xl font-bold">{stats.maxPuntuacion || 0}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-500">Tasa de victorias</span>
                      <span className="text-xs text-gray-500">{porcentajeVictorias}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full" 
                        style={{ width: `${porcentajeVictorias}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 italic">No hay estadísticas de juegos disponibles</p>
        )}
      </div>
      
      {/* Actividad reciente */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Actividad Reciente</h3>
        
        {perfilNino?.registroActividades && Object.keys(perfilNino.registroActividades).length > 0 ? (
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, index) => {
              const fecha = new Date();
              fecha.setDate(fecha.getDate() - (6 - index));
              const fechaFormateada = fecha.toISOString().split('T')[0];
              const actividades = perfilNino.registroActividades[fechaFormateada] || 0;
              
              let altura = 'h-4';
              if (actividades > 0) altura = actividades < 3 ? 'h-8' : actividades < 5 ? 'h-12' : 'h-16';
              
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className={`w-full bg-blue-100 rounded-t-md ${altura} ${actividades > 0 ? 'bg-blue-500' : ''}`}></div>
                  <div className="text-xs text-gray-500 mt-1">
                    {fecha.toLocaleDateString('es-ES', { weekday: 'short' })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 italic">No hay registro de actividades disponible</p>
        )}
      </div>
    </div>
  );
}

export default Estadisticas;