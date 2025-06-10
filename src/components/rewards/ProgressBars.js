import React from 'react';
import { RewardsUtils } from '../../utils/rewards/rewardsTypes';

function ProgressBars({ logro, className = '' }) {
    const porcentaje = Math.min(logro.progreso || 0, 100);
    
    return (
      <div className={`${className}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div 
              className="text-2xl mr-3 p-2 rounded-full"
              style={{ 
                backgroundColor: `${RewardsUtils.getColorRareza(logro.rareza)}20`,
                color: RewardsUtils.getColorRareza(logro.rareza)
              }}
            >
              {logro.icono}
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-sm">{logro.nombre}</h4>
              <p className="text-xs text-gray-600">{logro.descripcion}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-bold text-gray-700">
              {logro.valorActual || 0} / {logro.objetivo}
            </div>
            <div className="text-xs text-gray-500">
              {Math.round(porcentaje)}%
            </div>
          </div>
        </div>
        
        {/* Barra de progreso */}
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out relative"
              style={{ 
                width: `${porcentaje}%`,
                background: `linear-gradient(90deg, ${RewardsUtils.getColorRareza(logro.rareza)}, ${RewardsUtils.getColorRareza(logro.rareza)}90)`
              }}
            >
              {/* Efecto de brillo */}
              <div 
                className="absolute inset-0 rounded-full"
                style={{ 
                  background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
                  animation: porcentaje > 0 ? 'shimmer 2s infinite' : 'none'
                }}
              />
            </div>
          </div>
          
          {/* Indicador de progreso */}
          {porcentaje > 10 && (
            <div 
              className="absolute top-0 h-full flex items-center text-xs font-bold text-white px-2"
              style={{ width: `${porcentaje}%` }}
            >
              <span className="ml-auto">{Math.round(porcentaje)}%</span>
            </div>
          )}
        </div>
        
        {/* Recompensa */}
        {logro.recompensa && (
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
            <span className="text-xs text-gray-500 font-medium">Recompensa:</span>
            <div className="flex space-x-2">
              {logro.recompensa.puntos > 0 && (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
                  +{logro.recompensa.puntos} pts
                </span>
              )}
              {logro.recompensa.estrellas > 0 && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-bold">
                  +{logro.recompensa.estrellas} ⭐
                </span>
              )}
            </div>
          </div>
        )}
        
        <style jsx>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }
  
export default ProgressBars;