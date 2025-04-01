import React from 'react';

function FrutasDisplay({ frutasSequencia, ultimaFruta }) {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {frutasSequencia.map((fruta, index) => (
        <div 
          key={`${fruta.id}-${index}`}
          className={`
            text-4xl md:text-5xl 
            ${index === frutasSequencia.length - 1 ? 'animate-bounce' : ''}
          `}
        >
          {fruta.imagen}
        </div>
      ))}
      
      {/* Muestra la última fruta con animación si existe */}
      {ultimaFruta && frutasSequencia.length === 0 && (
        <div className="text-5xl animate-bounce">
          {ultimaFruta.imagen}
        </div>
      )}
      
      {/* Mensaje cuando no hay frutas */}
      {frutasSequencia.length === 0 && !ultimaFruta && (
        <div className="text-gray-500 text-center py-12">
          <p className="text-xl">Las frutas aparecerán aquí...</p>
          <p className="mt-4">¡Prepárate para presionar el timbre cuando veas 5 frutas iguales!</p>
        </div>
      )}
    </div>
  );
}

export default FrutasDisplay;