import React from 'react';

function BusquedaDiferencias({ actividad, perfilNino, onComplete, onClose }) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-[var(--primary-blue)]">
              {actividad?.titulo || "Búsqueda de Diferencias"}
            </h2>
            <p className="text-gray-600">{actividad?.descripcion || "Encuentra las diferencias entre las imágenes"}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="p-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h3 className="text-xl font-bold mb-4">Búsqueda de Diferencias</h3>
        <p className="mb-6">
          Este componente está en desarrollo. Pronto podrás disfrutar de esta actividad.
        </p>
        <button
          onClick={() => onComplete({ puntuacion: 0, completada: false })}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
        >
          Volver
        </button>
      </div>
    </div>
  );
}

export default BusquedaDiferencias;