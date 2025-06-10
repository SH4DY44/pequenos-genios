import React from 'react';
import { RewardsUtils, RarezaRecompensa } from '../../utils/rewards/rewardsTypes';

function AchievementCard({ logro, reciente = false, size = 'normal', onClick = null }) {
  const esSize = {
    small: 'p-3',
    normal: 'p-4',
    large: 'p-6'
  };

  const iconSize = {
    small: 'text-2xl',
    normal: 'text-3xl',
    large: 'text-4xl'
  };

  const titleSize = {
    small: 'text-sm',
    normal: 'text-base',
    large: 'text-lg'
  };

  const fechaFormateada = logro.fechaObtenido 
    ? new Date(logro.fechaObtenido.toDate()).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : '';

  return (
    <div 
      className={`
        bg-white rounded-xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl
        ${reciente ? 'animate-pulse' : ''}
        ${onClick ? 'cursor-pointer hover:scale-105' : ''}
        ${esSize[size]}
      `}
      style={{ 
        borderColor: RewardsUtils.getColorRareza(logro.rareza),
        boxShadow: `0 4px 20px ${RewardsUtils.getColorRareza(logro.rareza)}20`
      }}
      onClick={onClick}
    >
      {/* Header con rareza */}
      <div className="flex items-center justify-between mb-3">
        <div 
          className="px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
          style={{ 
            backgroundColor: `${RewardsUtils.getColorRareza(logro.rareza)}20`,
            color: RewardsUtils.getColorRareza(logro.rareza)
          }}
        >
          {logro.rareza}
        </div>
        
        {reciente && (
          <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-bounce">
            ¡NUEVO!
          </div>
        )}
        
        {logro.nuevo && (
          <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            ✨ RECIENTE
          </div>
        )}
      </div>

      {/* Icono principal con efecto de rareza */}
      <div className="text-center mb-4">
        <div 
          className={`${iconSize[size]} inline-block p-4 rounded-full relative`}
          style={{ 
            backgroundColor: `${RewardsUtils.getColorRareza(logro.rareza)}15`,
            boxShadow: RewardsUtils.getGlowRareza(logro.rareza)
          }}
        >
          {logro.icono}
          
          {/* Efecto de partículas para logros legendarios */}
          {logro.rareza === RarezaRecompensa.LEGENDARIO && (
            <div className="absolute inset-0 rounded-full">
              <div className="absolute top-1 left-2 w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
              <div className="absolute top-3 right-1 w-1 h-1 bg-yellow-300 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute bottom-2 left-1 w-1 h-1 bg-yellow-500 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
              <div className="absolute bottom-1 right-3 w-1 h-1 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
            </div>
          )}
        </div>
      </div>

      {/* Información del logro */}
      <div className="text-center">
        <h3 className={`font-bold text-gray-800 mb-2 ${titleSize[size]}`}>
          {logro.nombre}
        </h3>
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
          {logro.descripcion}
        </p>

        {/* Recompensas */}
        {logro.recompensa && (
          <div className="flex justify-center space-x-2 mb-3">
            {logro.recompensa.puntos > 0 && (
              <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full flex items-center space-x-1">
                <span className="text-sm">🪙</span>
                <span className="text-xs font-bold">+{logro.recompensa.puntos}</span>
              </div>
            )}
            {logro.recompensa.estrellas > 0 && (
              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full flex items-center space-x-1">
                <span className="text-sm">⭐</span>
                <span className="text-xs font-bold">+{logro.recompensa.estrellas}</span>
              </div>
            )}
            {logro.recompensa.recompensaEspecial && (
              <div className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full">
                <span className="text-xs font-bold">🎁 Especial</span>
              </div>
            )}
          </div>
        )}

        {/* Fecha de obtención */}
        {fechaFormateada && (
          <div className="text-xs text-gray-500 border-t border-gray-100 pt-3">
            Obtenido el {fechaFormateada}
          </div>
        )}

        {/* Categoría */}
        <div className="text-xs text-gray-400 mt-1 uppercase tracking-wide">
          {logro.categoria}
        </div>
      </div>

      {/* Efecto de brillo para logros épicos y legendarios */}
      {(logro.rareza === RarezaRecompensa.EPICO || logro.rareza === RarezaRecompensa.LEGENDARIO) && (
        <div 
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background: `linear-gradient(45deg, transparent 40%, ${RewardsUtils.getColorRareza(logro.rareza)}10 50%, transparent 60%)`,
            animation: 'shimmer-card 3s infinite'
          }}
        />
      )}

      <style jsx>{`
        @keyframes shimmer-card {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(300%) translateY(300%) rotate(45deg); }
        }
      `}</style>
    </div>
  );
}

// Componente para mostrar logros bloqueados
export function LockedAchievementCard({ logro, progreso = 0 }) {
  return (
    <div className="bg-gray-100 rounded-xl p-4 border-2 border-gray-300 relative overflow-hidden">
      {/* Overlay de bloqueo */}
      <div className="absolute inset-0 bg-gray-200 bg-opacity-80 flex items-center justify-center z-10">
        <div className="text-center">
          <div className="text-3xl mb-2">🔒</div>
          <div className="text-sm font-bold text-gray-600">Bloqueado</div>
          {progreso > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              {Math.round(progreso)}% completado
            </div>
          )}
        </div>
      </div>

      {/* Contenido del logro (difuminado) */}
      <div className="filter blur-sm">
        <div className="text-center mb-4">
          <div className="text-3xl p-4 rounded-full bg-gray-200 inline-block">
            {logro.icono}
          </div>
        </div>
        
        <div className="text-center">
          <h3 className="font-bold text-gray-600 mb-2">
            {logro.nombre}
          </h3>
          <p className="text-gray-500 text-sm">
            {logro.descripcion}
          </p>
        </div>
      </div>

      {/* Barra de progreso en la parte inferior */}
      {progreso > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-300">
          <div 
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${progreso}%` }}
          />
        </div>
      )}
    </div>
  );
}

// Componente para grid de logros
export function AchievementsGrid({ logros, onLogroClick = null, showLocked = false }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {logros.map(logro => (
        <AchievementCard
          key={logro.id}
          logro={logro}
          onClick={onLogroClick ? () => onLogroClick(logro) : null}
        />
      ))}
    </div>
  );
}

export default AchievementCard;