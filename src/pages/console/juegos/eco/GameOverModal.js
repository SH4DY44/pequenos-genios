import React from 'react';
import PropTypes from 'prop-types';

function GameOverModal({ isOpen, victoria, puntuacion, maxCombo, onRestart, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl text-center max-w-md w-full mx-4 transform animate-fade-in">
        {/* Emoji y título */}
        <div className="text-6xl mb-4 animate-bounce">
          {victoria ? '🎉' : '💔'}
        </div>
        <h3 className="text-2xl font-bold text-[var(--primary-blue)] mb-6">
          {victoria ? '¡Felicitaciones!' : '¡Juego Terminado!'}
        </h3>

        {/* Estadísticas */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-gray-600 text-sm">Puntuación final</p>
              <p className="text-2xl font-bold text-[var(--primary-blue)]">{puntuacion}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm">Combo máximo</p>
              <p className="text-2xl font-bold text-[var(--primary-blue)]">x{maxCombo}</p>
            </div>
          </div>
        </div>

        {/* Mensaje motivacional */}
        <p className="text-gray-600 mb-8">
          {victoria 
            ? '¡Has demostrado una excelente memoria! ¿Quieres intentar superar tu puntuación?' 
            : '¡No te rindas! Cada intento te ayuda a mejorar. ¿Quieres intentarlo de nuevo?'}
        </p>

        {/* Botones */}
        <div className="space-y-4">
          <button
            onClick={onRestart}
            className="w-full px-6 py-3 bg-[var(--primary-blue)] text-white rounded-lg 
                      hover:opacity-90 transition-all font-medium text-lg shadow-md"
          >
            {victoria ? 'Jugar de nuevo' : 'Reintentar'}
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
  victoria: PropTypes.bool.isRequired,
  puntuacion: PropTypes.number.isRequired,
  maxCombo: PropTypes.number.isRequired,
  onRestart: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default GameOverModal;