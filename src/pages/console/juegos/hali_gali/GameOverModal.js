import React from 'react';
import PropTypes from 'prop-types';

function GameOverModal({ isOpen, puntuacion, maxCombo, estadisticas, onRestart, onClose }) {
  if (!isOpen) return null;

  const getPrecisionColor = (precision) => {
    if (precision >= 0.8) return 'text-green-600';
    if (precision >= 0.6) return 'text-blue-600';
    if (precision >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPrecisionEmoji = (precision) => {
    if (precision >= 0.8) return '🎯';
    if (precision >= 0.6) return '👍';
    if (precision >= 0.4) return '😅';
    return '😓';
  };

  const formatPrecision = (precision) => {
    return `${(precision * 100).toFixed(1)}%`;
  };

  const formatTiempo = (tiempo) => {
    return `${(tiempo / 1000).toFixed(2)}s`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl text-center max-w-md w-full mx-4 transform animate-fade-in">
        {/* Emoji y título */}
        <div className="text-6xl mb-4 animate-bounce">
          {getPrecisionEmoji(estadisticas.precision)}
        </div>
        <h3 className="text-2xl font-bold text-[var(--primary-blue)] mb-6">
          ¡Juego Terminado!
        </h3>

        {/* Puntuación final y combo */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <p className="text-gray-600 text-sm">Puntuación</p>
              <p className="text-2xl font-bold text-[var(--primary-blue)]">{puntuacion}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm">Mejor combo</p>
              <p className="text-2xl font-bold text-[var(--primary-blue)]">x{maxCombo}</p>
            </div>
          </div>
          
          {/* Estadísticas detalladas */}
          <div className="space-y-2 text-left">
            <div className="flex justify-between items-center bg-white p-2 rounded">
              <span className="text-gray-600">Precisión</span>
              <span className={`font-bold ${getPrecisionColor(estadisticas.precision)}`}>
                {formatPrecision(estadisticas.precision)}
              </span>
            </div>
            <div className="flex justify-between items-center bg-white p-2 rounded">
              <span className="text-gray-600">Tiempo promedio</span>
              <span className="font-bold text-blue-600">
                {formatTiempo(estadisticas.tiempoPromedio)}
              </span>
            </div>
          </div>
        </div>

        {/* Mensaje motivacional */}
        <p className="text-gray-600 mb-8">
          {estadisticas.precision >= 0.8 
            ? '¡Excelente precisión! ¿Puedes mantener este nivel?' 
            : '¡Sigue practicando! Cada intento te hace mejor.'}
        </p>

        {/* Botones */}
        <div className="space-y-4">
          <button
            onClick={onRestart}
            className="w-full px-6 py-3 bg-[var(--primary-blue)] text-white rounded-lg 
                      hover:opacity-90 transition-all font-medium text-lg shadow-md"
          >
            Jugar de nuevo
          </button>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 border-2 border-gray-300 rounded-lg 
                      hover:bg-gray-100 transition-all text-gray-600"
          >
            Salir del juego
          </button>
        </div>
      </div>
    </div>
  );
}

GameOverModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  puntuacion: PropTypes.number.isRequired,
  maxCombo: PropTypes.number.isRequired,
  estadisticas: PropTypes.shape({
    precision: PropTypes.number.isRequired,
    tiempoPromedio: PropTypes.number.isRequired
  }).isRequired,
  onRestart: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default GameOverModal;