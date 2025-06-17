import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimes, FaEye, FaCog, FaShirt, FaPalette, FaLock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { RewardsService } from '../../services/rewardsService';
import { TipoRecompensa, RewardsUtils } from '../../utils/rewards/rewardsTypes';
import StarTracker from './StarTracker';

function InventoryDisplay({ profileId, onEquipar }) {
  const [inventario, setInventario] = useState({});
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('all');
  const [cargando, setCargando] = useState(true);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [equipamiento, setEquipamiento] = useState({});

  useEffect(() => {
    cargarInventario();
  }, [profileId]);

  const cargarInventario = async () => {
    if (!profileId) return;
    
    setCargando(true);
    try {
      const inv = await RewardsService.obtenerInventario(profileId);
      setInventario(inv);
      
      // Extraer equipamiento actual
      const equipamientoActual = {};
      Object.entries(inv).forEach(([tipo, items]) => {
        Object.entries(items).forEach(([itemId, itemData]) => {
          if (itemData.equipado) {
            equipamientoActual[tipo] = itemId;
          }
        });
      });
      setEquipamiento(equipamientoActual);
      
    } catch (error) {
      console.error('Error cargando inventario:', error);
      toast.error('Error al cargar el inventario');
    } finally {
      setCargando(false);
    }
  };

  const categorias = [
    { id: 'all', nombre: 'Todo', icono: '📦' },
    { id: TipoRecompensa.INSIGNIA, nombre: 'Insignias', icono: '🏅' },
    { id: TipoRecompensa.TROFEO, nombre: 'Trofeos', icono: '🏆' },
    { id: TipoRecompensa.AVATAR, nombre: 'Avatares', icono: '👤' },
    { id: TipoRecompensa.TEMA, nombre: 'Temas', icono: '🎨' },
    { id: TipoRecompensa.MARCO, nombre: 'Marcos', icono: '🖼️' },
    { id: TipoRecompensa.EFECTO, nombre: 'Efectos', icono: '✨' }
  ];

  const obtenerItemsFiltrados = () => {
    let items = [];
    
    Object.entries(inventario).forEach(([tipo, itemsTipo]) => {
      if (categoriaSeleccionada === 'all' || categoriaSeleccionada === tipo) {
        Object.entries(itemsTipo).forEach(([itemId, itemData]) => {
          items.push({
            ...itemData,
            id: itemId,
            tipo: tipo
          });
        });
      }
    });

    // Ordenar por fecha de obtención (más recientes primero)
    return items.sort((a, b) => {
      const fechaA = a.obtenido?.toDate() || new Date(0);
      const fechaB = b.obtenido?.toDate() || new Date(0);
      return fechaB - fechaA;
    });
  };

  const manejarEquipar = async (item) => {
    try {
      const resultado = await RewardsService.equiparItem(
        profileId, 
        item.tipo, 
        item.equipado ? null : item.id
      );

      if (resultado.exito) {
        const accion = resultado.itemId ? 'equipado' : 'desequipado';
        toast.success(`Item ${accion} correctamente`);
        await cargarInventario();
        if (onEquipar) onEquipar();
      } else {
        toast.error(resultado.error);
      }
    } catch (error) {
      console.error('Error equipando item:', error);
      toast.error('Error al equipar el item');
    }
  };

  const abrirModal = (item) => {
    setItemSeleccionado(item);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setItemSeleccionado(null);
    setMostrarModal(false);
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const itemsFiltrados = obtenerItemsFiltrados();
  const totalItems = Object.values(inventario).reduce((total, tipo) => 
    total + Object.keys(tipo).length, 0
  );

  return (
    <div className="space-y-6">
      {/* Star Tracker */}
      <StarTracker profileId={profileId} />
      
      {/* Header del inventario */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FaCog className="text-blue-500 mr-3" />
            Mi Inventario
          </h2>
          <p className="text-gray-600 mt-1">
            Gestiona y equipa tus recompensas ({totalItems} items)
          </p>
        </div>

        {/* Resumen de equipamiento */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Equipamiento Actual</h3>
          <div className="flex space-x-2">
            {Object.entries(equipamiento).map(([tipo, itemId]) => {
              const item = inventario[tipo]?.[itemId];
              return item ? (
                <div key={tipo} className="text-center">
                  <div className="text-lg">{item.icono}</div>
                  <div className="text-xs text-blue-600 capitalize">{tipo}</div>
                </div>
              ) : null;
            })}
            {Object.keys(equipamiento).length === 0 && (
              <div className="text-blue-600 text-sm">Ningún item equipado</div>
            )}
          </div>
        </div>
      </div>

      {/* Filtros de categoría */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Filtrar por categoría</h3>
        <div className="flex flex-wrap gap-2">
          {categorias.map(categoria => {
            const cantidad = categoria.id === 'all' 
              ? totalItems 
              : Object.keys(inventario[categoria.id] || {}).length;
              
            return (
              <button
                key={categoria.id}
                onClick={() => setCategoriaSeleccionada(categoria.id)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
                  categoriaSeleccionada === categoria.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{categoria.icono}</span>
                {categoria.nombre}
                <span className="ml-2 bg-black bg-opacity-20 text-xs px-2 py-1 rounded-full">
                  {cantidad}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de items */}
      {itemsFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {itemsFiltrados.map(item => (
            <ItemInventoryCard
              key={`${item.tipo}-${item.id}`}
              item={item}
              onEquipar={() => manejarEquipar(item)}
              onDetalles={() => abrirModal(item)}
              equipado={item.equipado}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            {categoriaSeleccionada === 'all' 
              ? 'Tu inventario está vacío' 
              : `No tienes items de tipo ${categorias.find(c => c.id === categoriaSeleccionada)?.nombre}`
            }
          </h3>
          <p className="text-gray-500">
            {categoriaSeleccionada === 'all'
              ? 'Completa actividades y juegos para obtener recompensas'
              : 'Visita la tienda para conseguir más items de esta categoría'
            }
          </p>
        </div>
      )}

      {/* Modal de detalles */}
      {mostrarModal && itemSeleccionado && (
        <ItemDetailsModal
          item={itemSeleccionado}
          onClose={cerrarModal}
          onEquipar={() => {
            manejarEquipar(itemSeleccionado);
            cerrarModal();
          }}
        />
      )}
    </div>
  );
}

// Componente para cada item del inventario
function ItemInventoryCard({ item, onEquipar, onDetalles, equipado }) {
  const fechaObtenido = item.obtenido?.toDate();
  const esReciente = fechaObtenido && (Date.now() - fechaObtenido.getTime()) < 24 * 60 * 60 * 1000;

  return (
    <div 
      className={`
        rounded-xl p-6 border-2 transition-all duration-300 hover:shadow-lg relative overflow-hidden
        ${equipado 
          ? 'border-green-500 bg-green-50 shadow-lg' 
          : 'border-gray-200 bg-white hover:border-blue-300'
        }
      `}
      style={{
        boxShadow: equipado 
          ? `0 4px 20px ${RewardsUtils.getColorRareza(item.rareza)}40`
          : undefined
      }}
    >
      {/* Indicadores superiores */}
      <div className="flex justify-between items-start mb-4">
        <div 
          className="px-2 py-1 rounded-full text-xs font-bold uppercase"
          style={{ 
            backgroundColor: `${RewardsUtils.getColorRareza(item.rareza)}20`,
            color: RewardsUtils.getColorRareza(item.rareza)
          }}
        >
          {item.rareza}
        </div>

        <div className="flex space-x-1">
          {equipado && (
            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              ✓ EQUIPADO
            </div>
          )}
          {esReciente && (
            <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
              ¡NUEVO!
            </div>
          )}
        </div>
      </div>

      {/* Icono principal */}
      <div className="text-center mb-4">
        <div 
          className="text-4xl p-4 rounded-full inline-block relative"
          style={{ 
            backgroundColor: `${RewardsUtils.getColorRareza(item.rareza)}20`,
            boxShadow: equipado ? RewardsUtils.getGlowRareza(item.rareza) : 'none'
          }}
        >
          {item.icono}
          
          {/* Preview para ciertos tipos */}
          {item.preview && (
            <div className="absolute -top-2 -right-2 text-lg">
              {typeof item.preview === 'string' && item.preview.includes('gradient') ? (
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white"
                  style={{ background: item.preview }}
                />
              ) : (
                <span>{item.preview}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Información del item */}
      <div className="text-center">
        <h3 className="font-bold text-gray-800 mb-2">{item.nombre}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.descripcion}</p>

        {/* Información de obtención */}
        <div className="text-xs text-gray-500 mb-4">
          {item.canjeado ? (
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              💰 Canjeado
            </span>
          ) : item.desbloqueadoPor ? (
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              🏆 Por logro
            </span>
          ) : (
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
              🎁 Obtenido
            </span>
          )}
          {fechaObtenido && (
            <div className="mt-1">
              {fechaObtenido.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex space-x-2">
          <button
            onClick={onEquipar}
            className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
              equipado
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {equipado ? (
              <>
                <FaTimes className="inline mr-1" />
                Desequipar
              </>
            ) : (
              <>
                <FaCheckCircle className="inline mr-1" />
                Equipar
              </>
            )}
          </button>
          
          <button
            onClick={onDetalles}
            className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
          >
            <FaEye />
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal para mostrar detalles del item
function ItemDetailsModal({ item, onClose, onEquipar }) {
  const fechaObtenido = item.obtenido?.toDate();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div 
            className="px-3 py-1 rounded-full text-sm font-bold uppercase"
            style={{ 
              backgroundColor: `${RewardsUtils.getColorRareza(item.rareza)}20`,
              color: RewardsUtils.getColorRareza(item.rareza)
            }}
          >
            {item.rareza}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            <FaTimes />
          </button>
        </div>

        {/* Icono principal */}
        <div className="text-center mb-6">
          <div 
            className="text-6xl p-6 rounded-full inline-block"
            style={{ 
              backgroundColor: `${RewardsUtils.getColorRareza(item.rareza)}20`,
              boxShadow: RewardsUtils.getGlowRareza(item.rareza)
            }}
          >
            {item.icono}
          </div>
        </div>

        {/* Información detallada */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">{item.nombre}</h2>
          <p className="text-gray-600 leading-relaxed">{item.descripcion}</p>
        </div>

        {/* Estadísticas */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Tipo:</span>
            <span className="font-medium capitalize">{item.tipo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Rareza:</span>
            <span className="font-medium capitalize">{item.rareza}</span>
          </div>
          {fechaObtenido && (
            <div className="flex justify-between">
              <span className="text-gray-600">Obtenido:</span>
              <span className="font-medium">
                {fechaObtenido.toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
          )}
          {item.desbloqueadoPor && (
            <div className="flex justify-between">
              <span className="text-gray-600">Desbloqueado por:</span>
              <span className="font-medium">{item.desbloqueadoPor.replace(/_/g, ' ')}</span>
            </div>
          )}
          {item.costo && (
            <div className="flex justify-between">
              <span className="text-gray-600">Costo original:</span>
              <div className="flex space-x-2">
                {item.costo.puntos && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                    {item.costo.puntos} puntos
                  </span>
                )}
                {item.costo.estrellas && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                    {item.costo.estrellas} estrellas
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex space-x-3">
          <button
            onClick={onEquipar}
            className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all ${
              item.equipado
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {item.equipado ? 'Desequipar' : 'Equipar'}
          </button>
          
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default InventoryDisplay;