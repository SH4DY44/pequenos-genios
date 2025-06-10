import React, { useState, useEffect } from 'react';
import { FaCoins, FaStar, FaLock, FaShoppingCart, FaGift } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { RewardsService } from '../../services/rewardsService';
import { RecompensasEspeciales, TipoRecompensa, RewardsUtils } from '../../utils/rewards/rewardsTypes';

function RewardsStore({ profileId, perfilNino, onCompra }) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('all');
  const [cargando, setCargando] = useState(false);
  const [inventario, setInventario] = useState({});

  useEffect(() => {
    cargarInventario();
  }, [profileId]);

  const cargarInventario = async () => {
    try {
      const inv = await RewardsService.obtenerInventario(profileId);
      setInventario(inv);
    } catch (error) {
      console.error('Error cargando inventario:', error);
    }
  };

  const categorias = [
    { id: 'all', nombre: 'Todo', icono: '🛍️' },
    { id: 'insignias', nombre: 'Insignias', icono: '🏅' },
    { id: 'trofeos', nombre: 'Trofeos', icono: '🏆' },
    { id: 'avatares', nombre: 'Avatares', icono: '👤' },
    { id: 'temas', nombre: 'Temas', icono: '🎨' },
    { id: 'marcos', nombre: 'Marcos', icono: '🖼️' },
    { id: 'efectos', nombre: 'Efectos', icono: '✨' }
  ];

  const obtenerItemsFiltrados = () => {
    let items = [];
    
    Object.entries(RecompensasEspeciales).forEach(([categoria, itemsCategoria]) => {
      if (categoriaSeleccionada === 'all' || categoriaSeleccionada === categoria) {
        Object.entries(itemsCategoria).forEach(([itemId, item]) => {
          items.push({ ...item, categoria });
        });
      }
    });

    return items;
  };

  const manejarCompra = async (item) => {
    setCargando(true);
    try {
      const resultado = await RewardsService.canjearRecompensa(
        profileId, 
        item.id, 
        item.categoria
      );

      if (resultado.exito) {
        toast.success(resultado.mensaje);
        await cargarInventario();
        if (onCompra) onCompra();
      } else {
        toast.error(resultado.error);
      }
    } catch (error) {
      console.error('Error en compra:', error);
      toast.error('Error al realizar la compra');
    } finally {
      setCargando(false);
    }
  };

  const yaComprado = (item) => {
    return inventario[item.tipo]?.[item.id] !== undefined;
  };

  const estaDesbloqueado = (item) => {
    if (!item.desbloqueadoPor) return true;
    return perfilNino?.logros?.[item.desbloqueadoPor] !== undefined;
  };

  const puedeComprar = (item) => {
    if (yaComprado(item)) return false;
    if (!estaDesbloqueado(item)) return false;
    
    const costo = item.costo || {};
    const puntosSuficientes = !costo.puntos || (perfilNino?.puntosTotales || 0) >= costo.puntos;
    const estrellasSuficientes = !costo.estrellas || (perfilNino?.estrellas || 0) >= costo.estrellas;
    
    return puntosSuficientes && estrellasSuficientes;
  };

  return (
    <div className="space-y-6">
      {/* Header de la tienda */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FaShoppingCart className="text-blue-500 mr-3" />
            Tienda de Recompensas
          </h2>
          <p className="text-gray-600 mt-1">
            Canjea tus puntos y estrellas por increíbles recompensas
          </p>
        </div>

        {/* Monedas del jugador */}
        <div className="flex space-x-4">
          <div className="bg-yellow-100 border border-yellow-200 rounded-lg px-4 py-2 flex items-center">
            <FaCoins className="text-yellow-600 mr-2" />
            <span className="font-bold text-yellow-800">
              {RewardsUtils.formatearNumero(perfilNino?.puntosTotales || 0)}
            </span>
          </div>
          <div className="bg-purple-100 border border-purple-200 rounded-lg px-4 py-2 flex items-center">
            <FaStar className="text-purple-600 mr-2" />
            <span className="font-bold text-purple-800">
              {perfilNino?.estrellas || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Filtros de categoría */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Categorías</h3>
        <div className="flex flex-wrap gap-2">
          {categorias.map(categoria => (
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
            </button>
          ))}
        </div>
      </div>

      {/* Grid de items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {obtenerItemsFiltrados().map(item => (
          <ItemCard
            key={item.id}
            item={item}
            yaComprado={yaComprado(item)}
            estaDesbloqueado={estaDesbloqueado(item)}
            puedeComprar={puedeComprar(item)}
            cargando={cargando}
            onCompra={() => manejarCompra(item)}
            perfilNino={perfilNino}
          />
        ))}
      </div>

      {obtenerItemsFiltrados().length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🛍️</div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            No hay items en esta categoría
          </h3>
          <p className="text-gray-500">
            Prueba seleccionando otra categoría
          </p>
        </div>
      )}
    </div>
  );
}

// Componente para cada item de la tienda
function ItemCard({ 
  item, 
  yaComprado, 
  estaDesbloqueado, 
  puedeComprar, 
  cargando, 
  onCompra, 
  perfilNino 
}) {
  const costo = item.costo || {};
  
  const getEstadoCard = () => {
    if (yaComprado) return 'comprado';
    if (!estaDesbloqueado) return 'bloqueado';
    if (!puedeComprar) return 'insuficiente';
    return 'disponible';
  };

  const estado = getEstadoCard();

  const estilosEstado = {
    comprado: 'border-green-500 bg-green-50',
    bloqueado: 'border-gray-300 bg-gray-50',
    insuficiente: 'border-red-300 bg-red-50',
    disponible: 'border-blue-300 bg-blue-50 hover:border-blue-500 hover:shadow-lg'
  };

  return (
    <div 
      className={`
        rounded-xl p-6 border-2 transition-all duration-300 relative overflow-hidden
        ${estilosEstado[estado]}
      `}
      style={{
        boxShadow: estado === 'disponible' 
          ? `0 4px 20px ${RewardsUtils.getColorRareza(item.rareza)}20`
          : 'none'
      }}
    >
      {/* Indicador de rareza */}
      <div 
        className="absolute top-0 right-0 w-0 h-0 border-l-[40px] border-b-[40px]"
        style={{
          borderLeftColor: 'transparent',
          borderBottomColor: RewardsUtils.getColorRareza(item.rareza)
        }}
      />

      {/* Icono principal */}
      <div className="text-center mb-4">
        <div 
          className="text-4xl p-4 rounded-full inline-block relative"
          style={{ 
            backgroundColor: `${RewardsUtils.getColorRareza(item.rareza)}20`,
            boxShadow: estaDesbloqueado ? RewardsUtils.getGlowRareza(item.rareza) : 'none'
          }}
        >
          {estado === 'bloqueado' ? '🔒' : item.icono}
          
          {/* Preview para ciertos tipos */}
          {item.preview && estado !== 'bloqueado' && (
            <div className="absolute -top-2 -right-2 text-lg">
              {typeof item.preview === 'string' && item.preview.includes('linear-gradient') ? (
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
        <div 
          className="inline-block px-2 py-1 rounded-full text-xs font-bold uppercase mb-2"
          style={{ 
            backgroundColor: `${RewardsUtils.getColorRareza(item.rareza)}20`,
            color: RewardsUtils.getColorRareza(item.rareza)
          }}
        >
          {item.rareza}
        </div>
        
        <h3 className="font-bold text-gray-800 mb-2">{item.nombre}</h3>
        <p className="text-sm text-gray-600 mb-4">{item.descripcion}</p>

        {/* Estado específico */}
        {estado === 'comprado' && (
          <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg mb-4 flex items-center justify-center">
            <FaGift className="mr-2" />
            ¡Ya lo tienes!
          </div>
        )}

        {estado === 'bloqueado' && (
          <div className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg mb-4">
            <FaLock className="inline mr-2" />
            {item.desbloqueadoPor ? (
              <span className="text-xs">
                Desbloquear: {item.desbloqueadoPor.replace(/_/g, ' ')}
              </span>
            ) : (
              'Bloqueado'
            )}
          </div>
        )}

        {/* Costo */}
        {costo && Object.keys(costo).length > 0 && estado !== 'comprado' && estado !== 'bloqueado' && (
          <div className="flex justify-center space-x-2 mb-4">
            {costo.puntos && (
              <div className={`flex items-center px-3 py-1 rounded-full ${
                (perfilNino?.puntosTotales || 0) >= costo.puntos 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                <FaCoins className="mr-1 text-xs" />
                <span className="text-sm font-bold">{costo.puntos}</span>
              </div>
            )}
            {costo.estrellas && (
              <div className={`flex items-center px-3 py-1 rounded-full ${
                (perfilNino?.estrellas || 0) >= costo.estrellas 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                <FaStar className="mr-1 text-xs" />
                <span className="text-sm font-bold">{costo.estrellas}</span>
              </div>
            )}
          </div>
        )}

        {/* Botón de acción */}
        {estado === 'disponible' && (
          <button
            onClick={onCompra}
            disabled={cargando}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg font-bold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cargando ? '🔄 Comprando...' : '🛒 Comprar'}
          </button>
        )}

        {estado === 'insuficiente' && (
          <button 
            disabled
            className="w-full bg-gray-300 text-gray-600 py-2 px-4 rounded-lg font-bold cursor-not-allowed"
          >
            💰 Fondos insuficientes
          </button>
        )}
      </div>
    </div>
  );
}

export default RewardsStore;