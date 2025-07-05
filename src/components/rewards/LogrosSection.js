import React, { useState, useEffect } from 'react';
import { FaTrophy, FaLock, FaFire, FaSearch, FaFilter, FaStar, FaCoins } from 'react-icons/fa';
import { LogrosDisponibles, CategoriaLogro, RarezaRecompensa, LogroCondiciones } from '../../utils/rewards/rewardsTypes';
import AchievementCard from './AchievementCard';

function LogrosSection({ profileId, estadisticas, perfilNino }) {
    const [filtroCategoria, setFiltroCategoria] = useState('todas');
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [filtroRareza, setFiltroRareza] = useState('todas');
    const [busqueda, setBusqueda] = useState('');
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
  
    // Obtener todos los logros con su estado
    const logrosConEstado = Object.values(LogrosDisponibles).map(logro => {
      const desbloqueado = perfilNino?.logros?.[logro.id] ? true : false;
      const progreso = calcularProgreso(logro, perfilNino);
      
      return {
        ...logro,
        desbloqueado,
        progreso,
        fechaObtenido: perfilNino?.logros?.[logro.id]?.fechaObtenido
      };
    });
  
    // Función para calcular progreso hacia un logro
    function calcularProgreso(logro, perfilData) {
      if (!perfilData || !LogroCondiciones[logro.id]) return 0;
      
      try {
        const condicion = LogroCondiciones[logro.id];
        
        // Calculamos el progreso basado en el tipo de logro
        switch (logro.id) {
          case 'primera_actividad':
          case 'diez_actividades':
          case 'cincuenta_actividades':
            const meta = logro.id === 'primera_actividad' ? 1 : 
                        logro.id === 'diez_actividades' ? 10 : 50;
            const actual = perfilData.actividadesCompletadas || 0;
            return Math.min((actual / meta) * 100, 100);
            
          case 'cien_puntos':
          case 'mil_puntos':
            const metaPuntos = logro.id === 'cien_puntos' ? 100 : 1000;
            const actualPuntos = perfilData.puntosTotales || 0;
            return Math.min((actualPuntos / metaPuntos) * 100, 100);
            
          case 'primera_semana':
          case 'un_mes_consistente':
            const metaDias = logro.id === 'primera_semana' ? 7 : 30;
            const actualDias = perfilData.racha || 0;
            return Math.min((actualDias / metaDias) * 100, 100);
            
          case 'memorama_master':
            const victoriasMemorama = perfilData.estadisticasJuegos?.memorama?.victorias || 0;
            return Math.min((victoriasMemorama / 10) * 100, 100);
            
          case 'velocista_eco':
            const tiemposRecord = perfilData.estadisticasJuegos?.eco?.tiemposRecord || 0;
            return Math.min((tiemposRecord / 5) * 100, 100);
            
          case 'perfeccionista':
            const actividadesPerfectas = perfilData.actividadesPerfectas || 0;
            return Math.min((actividadesPerfectas / 5) * 100, 100);
            
          case 'explorador':
            const categoriasExploradas = Object.keys(perfilData.estadisticasCategorias || {}).length;
            return Math.min((categoriasExploradas / 5) * 100, 100);
            
          default:
            return condicion(perfilData) ? 100 : 0;
        }
      } catch (error) {
        console.error('Error calculando progreso del logro:', logro.id, error);
        return 0;
      }
    }
  
    // Filtrar logros
    const logrosFiltrados = logrosConEstado.filter(logro => {
      // Filtro por búsqueda
      if (busqueda && !logro.nombre.toLowerCase().includes(busqueda.toLowerCase()) && 
          !logro.descripcion.toLowerCase().includes(busqueda.toLowerCase())) {
        return false;
      }
      
      // Filtro por categoría
      if (filtroCategoria !== 'todas' && logro.categoria !== filtroCategoria) {
        return false;
      }
      
      // Filtro por estado
      if (filtroEstado === 'desbloqueados' && !logro.desbloqueado) {
        return false;
      }
      if (filtroEstado === 'bloqueados' && logro.desbloqueado) {
        return false;
      }
      if (filtroEstado === 'proximos' && (logro.desbloqueado || logro.progreso < 50)) {
        return false;
      }
      
      // Filtro por rareza
      if (filtroRareza !== 'todas' && logro.rareza !== filtroRareza) {
        return false;
      }
      
      return true;
    });
  
    // Agrupar logros por categoría
    const logrosAgrupados = logrosFiltrados.reduce((grupos, logro) => {
      const categoria = logro.categoria;
      if (!grupos[categoria]) {
        grupos[categoria] = [];
      }
      grupos[categoria].push(logro);
      return grupos;
    }, {});
  
    const categorias = Object.values(CategoriaLogro);
    const rarezas = Object.values(RarezaRecompensa);
  
    // Obtener estadísticas de logros
    const estadisticasLogros = {
      total: logrosConEstado.length,
      desbloqueados: logrosConEstado.filter(l => l.desbloqueado).length,
      proximos: logrosConEstado.filter(l => !l.desbloqueado && l.progreso >= 50).length
    };
  
    return (
      <div className="space-y-6">
        {/* Header con estadísticas */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center">
              <FaTrophy className="mr-3" />
              Tus Logros
            </h2>
            <div className="text-right">
              <div className="text-3xl font-bold">{estadisticasLogros.desbloqueados}</div>
              <div className="text-sm opacity-90">de {estadisticasLogros.total}</div>
            </div>
          </div>
          
          {/* Barra de progreso general */}
          <div className="bg-white bg-opacity-20 rounded-full h-3 mb-4">
            <div 
              className="bg-yellow-400 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(estadisticasLogros.desbloqueados / estadisticasLogros.total) * 100}%` }}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-bold">{estadisticasLogros.desbloqueados}</div>
              <div className="text-sm opacity-90">Desbloqueados</div>
            </div>
            <div>
              <div className="text-xl font-bold">{estadisticasLogros.proximos}</div>
              <div className="text-sm opacity-90">Próximos</div>
            </div>
            <div>
              <div className="text-xl font-bold">
                {Math.round((estadisticasLogros.desbloqueados / estadisticasLogros.total) * 100)}%
              </div>
              <div className="text-sm opacity-90">Completado</div>
            </div>
          </div>
        </div>
  
        {/* Controles de búsqueda y filtros */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar logros..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Botón de filtros */}
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
                mostrarFiltros 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaFilter className="mr-2" />
              Filtros
            </button>
          </div>
  
          {/* Panel de filtros expandible */}
          {mostrarFiltros && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Filtro por estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <select 
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todos">Todos</option>
                    <option value="desbloqueados">Desbloqueados</option>
                    <option value="bloqueados">Bloqueados</option>
                    <option value="proximos">Próximos (50%+)</option>
                  </select>
                </div>
                
                {/* Filtro por categoría */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                  <select 
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todas">Todas</option>
                    {categorias.map(categoria => (
                      <option key={categoria} value={categoria}>
                        {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Filtro por rareza */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rareza</label>
                  <select 
                    value={filtroRareza}
                    onChange={(e) => setFiltroRareza(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todas">Todas</option>
                    {rarezas.map(rareza => (
                      <option key={rareza} value={rareza}>
                        {rareza.charAt(0).toUpperCase() + rareza.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Botón para limpiar filtros */}
              <div className="mt-4">
                <button
                  onClick={() => {
                    setFiltroCategoria('todas');
                    setFiltroEstado('todos');
                    setFiltroRareza('todas');
                    setBusqueda('');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}
        </div>
  
        {/* Resultados de filtros */}
        <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
          <span>
            Mostrando {logrosFiltrados.length} de {logrosConEstado.length} logros
          </span>
          {(busqueda || filtroCategoria !== 'todas' || filtroEstado !== 'todos' || filtroRareza !== 'todas') && (
            <span className="text-blue-600">Filtros activos</span>
          )}
        </div>
  
        {/* Grid de logros */}
        {logrosFiltrados.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <FaTrophy className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              No se encontraron logros
            </h3>
            <p className="text-gray-500">
              Intenta cambiar los filtros o buscar con otros términos
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(logrosAgrupados).map(([categoria, logros]) => (
              <div key={categoria} className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="capitalize">
                    {categoria.replace('-', ' ')}
                  </span>
                  <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                    {logros.length}
                  </span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {logros.map(logro => (
                    <LogroCard 
                      key={logro.id} 
                      logro={logro} 
                      perfilNino={perfilNino}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  
  // Componente individual para cada logro
  function LogroCard({ logro, perfilNino }) {
    const getColorRareza = (rareza) => {
      const colores = {
        comun: 'border-gray-300 bg-gray-50',
        raro: 'border-blue-300 bg-blue-50',
        epico: 'border-purple-300 bg-purple-50',
        legendario: 'border-yellow-300 bg-yellow-50'
      };
      return colores[rareza] || colores.comun;
    };
  
    const getIconoEstado = () => {
      if (logro.desbloqueado) {
        return <FaTrophy className="text-yellow-500" />;
      } else if (logro.progreso >= 50) {
        return <FaFire className="text-orange-500" />;
      } else {
        return <FaLock className="text-gray-400" />;
      }
    };
  
    return (
      <div className={`
        relative p-4 rounded-xl border-2 transition-all hover:shadow-md
        ${logro.desbloqueado ? 'shadow-md' : 'opacity-75'}
        ${getColorRareza(logro.rareza)}
      `}>
        {/* Badge de nuevo logro */}
        {logro.desbloqueado && perfilNino?.logros?.[logro.id]?.nuevo && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
            ¡NUEVO!
          </div>
        )}
        
        {/* Header del logro */}
        <div className="flex items-start justify-between mb-3">
          <div className="text-3xl">{logro.icono}</div>
          <div className="flex flex-col items-end">
            {getIconoEstado()}
            <span className="text-xs text-gray-500 capitalize mt-1">
              {logro.rareza}
            </span>
          </div>
        </div>
        
        {/* Información del logro */}
        <h4 className={`font-bold mb-2 ${logro.desbloqueado ? 'text-gray-800' : 'text-gray-600'}`}>
          {logro.nombre}
        </h4>
        
        <p className={`text-sm mb-3 ${logro.desbloqueado ? 'text-gray-600' : 'text-gray-500'}`}>
          {logro.descripcion}
        </p>
        
        {/* Barra de progreso */}
        {!logro.desbloqueado && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progreso</span>
              <span>{Math.round(logro.progreso)}%</span>
            </div>
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${logro.progreso}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Recompensas */}
        {logro.recompensa && (
          <div className="flex items-center space-x-2 text-xs">
            {logro.recompensa.puntos > 0 && (
              <div className="flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                <FaCoins className="mr-1" />
                {logro.recompensa.puntos}
              </div>
            )}
            {logro.recompensa.estrellas > 0 && (
              <div className="flex items-center bg-purple-100 text-purple-800 px-2 py-1 rounded">
                <FaStar className="mr-1" />
                {logro.recompensa.estrellas}
              </div>
            )}
            {logro.recompensa.recompensaEspecial && (
              <div className="bg-gradient-to-r from-pink-100 to-purple-100 text-purple-800 px-2 py-1 rounded">
                🎁 Especial
              </div>
            )}
          </div>
        )}
        
        {/* Fecha de obtención */}
        {logro.desbloqueado && logro.fechaObtenido && (
          <div className="mt-2 text-xs text-gray-500">
            Obtenido: {logro.fechaObtenido.toDate().toLocaleDateString()}
          </div>
        )}
      </div>
    );
  }
  
  export default LogrosSection;