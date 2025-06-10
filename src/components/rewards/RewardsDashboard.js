import React, { useState, useEffect } from 'react';
import { FaTrophy, FaStar, FaCoins, FaGift, FaCrown, FaFire } from 'react-icons/fa';
import { RewardsService } from '../../services/rewardsService';
import { RewardsUtils } from '../../utils/rewards/rewardsTypes';
import AchievementCard from './AchievementCard';
import RewardsStore from './RewardsStore';
import InventoryDisplay from './InventoryDisplay';
import ProgressBars from './ProgressBars';

function RewardsDashboard({ profileId, perfilNino }) {
  const [estadisticas, setEstadisticas] = useState(null);
  const [seccionActiva, setSeccionActiva] = useState('resumen');
  const [cargando, setCargando] = useState(true);
  const [nuevosLogros, setNuevosLogros] = useState([]);

  useEffect(() => {
    cargarEstadisticas();
  }, [profileId]);

  const cargarEstadisticas = async () => {
    if (!profileId) return;
    
    setCargando(true);
    try {
      const stats = await RewardsService.obtenerEstadisticasRecompensas(profileId);
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error cargando estadísticas de recompensas:', error);
    } finally {
      setCargando(false);
    }
  };

  // Verificar logros al montar el componente
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
        // Recargar estadísticas después de nuevos logros
        setTimeout(cargarEstadisticas, 1000);
      }
    } catch (error) {
      console.error('Error verificando logros:', error);
    }
  };

  const secciones = [
    { id: 'resumen', nombre: 'Resumen', icono: FaTrophy },
    { id: 'logros', nombre: 'Logros', icono: FaCrown },
    { id: 'tienda', nombre: 'Tienda', icono: FaGift },
    { id: 'inventario', nombre: 'Inventario', icono: FaCoins }
  ];

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen p-6">
      {/* Header con estadísticas principales */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <FaTrophy className="text-yellow-500 mr-3" />
              Centro de Recompensas
            </h1>
            <p className="text-gray-600 mt-2">
              ¡Descubre todos tus logros y recompensas, {perfilNino?.fullName}!
            </p>
          </div>
          
          {/* Racha actual */}
          {perfilNino?.racha > 0 && (
            <div className="bg-orange-100 border border-orange-200 rounded-lg p-4 flex items-center">
              <FaFire className="text-orange-500 text-2xl mr-3" />
              <div>
                <div className="text-orange-800 font-bold text-lg">{perfilNino.racha} días</div>
                <div className="text-orange-600 text-sm">¡Racha activa!</div>
              </div>
            </div>
          )}
        </div>

        {/* Tarjetas de estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">
                  {RewardsUtils.formatearNumero(estadisticas?.puntosTotales || 0)}
                </div>
                <div className="text-yellow-100 font-medium">Puntos Totales</div>
              </div>
              <FaCoins className="text-4xl text-yellow-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{estadisticas?.estrellas || 0}</div>
                <div className="text-purple-100 font-medium">Estrellas</div>
              </div>
              <FaStar className="text-4xl text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{estadisticas?.totalLogros || 0}</div>
                <div className="text-blue-100 font-medium">Logros</div>
              </div>
              <FaTrophy className="text-4xl text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{estadisticas?.totalItems || 0}</div>
                <div className="text-green-100 font-medium">Items</div>
              </div>
              <FaGift className="text-4xl text-green-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Navegación de secciones */}
      <div className="bg-white rounded-xl shadow-lg mb-8">
        <div className="flex border-b border-gray-200">
          {secciones.map(seccion => (
            <button
              key={seccion.id}
              onClick={() => setSeccionActiva(seccion.id)}
              className={`flex items-center px-6 py-4 font-medium transition-all ${
                seccionActiva === seccion.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-500 hover:bg-gray-50'
              }`}
            >
              <seccion.icono className="mr-2" />
              {seccion.nombre}
            </button>
          ))}
        </div>

        {/* Contenido de la sección activa */}
        <div className="p-6">
          {seccionActiva === 'resumen' && (
            <ResumenRecompensas 
              estadisticas={estadisticas} 
              perfilNino={perfilNino}
              onRecargar={cargarEstadisticas}
            />
          )}
          
          {seccionActiva === 'logros' && (
            <LogrosSection 
              profileId={profileId}
              estadisticas={estadisticas}
              perfilNino={perfilNino}
            />
          )}
          
          {seccionActiva === 'tienda' && (
            <RewardsStore 
              profileId={profileId}
              perfilNino={perfilNino}
              onCompra={cargarEstadisticas}
            />
          )}
          
          {seccionActiva === 'inventario' && (
            <InventoryDisplay 
              profileId={profileId}
              onEquipar={cargarEstadisticas}
            />
          )}
        </div>
      </div>

      {/* Modal de nuevos logros */}
      {nuevosLogros.length > 0 && (
        <NuevosLogrosModal 
          logros={nuevosLogros}
          onClose={() => setNuevosLogros([])}
        />
      )}
    </div>
  );
}

// Componente de resumen
function ResumenRecompensas({ estadisticas, perfilNino, onRecargar }) {
  return (
    <div className="space-y-8">
      {/* Progreso hacia próximos logros */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <FaFire className="text-orange-500 mr-2" />
          Próximos Logros
        </h3>
        
        {estadisticas?.proximosLogros?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {estadisticas.proximosLogros.map(logro => (
              <ProgressBars 
                key={logro.id}
                logro={logro}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-6xl mb-4">🎯</div>
            <h4 className="text-lg font-medium text-gray-700 mb-2">
              ¡Todos los logros desbloqueados!
            </h4>
            <p className="text-gray-500">
              Has completado todos los logros disponibles. ¡Increíble trabajo!
            </p>
          </div>
        )}
      </div>

      {/* Último logro obtenido */}
      {estadisticas?.ultimoLogro && (
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FaTrophy className="text-yellow-500 mr-2" />
            Último Logro Obtenido
          </h3>
          <AchievementCard 
            logro={estadisticas.ultimoLogro}
            reciente={true}
          />
        </div>
      )}

      {/* Distribución de logros por rareza */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Colección de Logros
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(estadisticas?.logrosPorRareza || {}).map(([rareza, cantidad]) => (
            <div 
              key={rareza}
              className="bg-white border rounded-lg p-4 text-center"
              style={{ 
                borderColor: RewardsUtils.getColorRareza(rareza),
                boxShadow: `0 0 10px ${RewardsUtils.getColorRareza(rareza)}20`
              }}
            >
              <div 
                className="text-2xl font-bold"
                style={{ color: RewardsUtils.getColorRareza(rareza) }}
              >
                {cantidad}
              </div>
              <div className="text-sm text-gray-600 capitalize">{rareza}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Componente de sección de logros
function LogrosSection({ profileId, estadisticas, perfilNino }) {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-6">
        Todos tus Logros ({estadisticas?.totalLogros || 0})
      </h3>
      
      {/* Aquí iría la lista completa de logros */}
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <div className="text-6xl mb-4">🏆</div>
        <h4 className="text-lg font-medium text-gray-700 mb-2">
          Sección de Logros
        </h4>
        <p className="text-gray-500">
          Componente de logros detallados en desarrollo...
        </p>
      </div>
    </div>
  );
}

// Modal para mostrar nuevos logros
function NuevosLogrosModal({ logros, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          ¡Nuevo{logros.length > 1 ? 's' : ''} Logro{logros.length > 1 ? 's' : ''}!
        </h2>
        
        <div className="space-y-4 mb-6">
          {logros.map(logro => (
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
        </div>
        
        <button
          onClick={onClose}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-bold hover:from-blue-600 hover:to-purple-700 transition-all"
        >
          ¡Genial!
        </button>
      </div>
    </div>
  );
}

export default RewardsDashboard;