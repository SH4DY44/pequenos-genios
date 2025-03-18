import React from 'react';
import PropTypes from 'prop-types';
import { FRUTAS } from './constantes';

function TutorialModal({ isOpen, onClose, configNivel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[var(--primary-blue)]">
            ¡Bienvenido a Halli Galli!
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Objetivo del Juego */}
          <section className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4 text-blue-800">¿Cómo jugar?</h3>
            <div className="space-y-4">
              <p className="flex items-start gap-3">
                <span className="text-2xl">🎯</span>
                <span>
                  Toca el timbre cuando veas exactamente {configNivel.cantidadObjetivo} frutas iguales en la mesa.
                </span>
              </p>
              
              {/* Ejemplo con frutas */}
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Ejemplo:</p>
                <div className="flex gap-2 mb-2">
                  {Array(configNivel.cantidadObjetivo).fill(FRUTAS.manzana.emoji).map((emoji, i) => (
                    <span key={i} className="text-2xl">{emoji}</span>
                  ))}
                  <span className="text-green-500 text-xl">✓ ¡Toca el timbre!</span>
                </div>
                <div className="flex gap-2">
                  {Array(configNivel.cantidadObjetivo - 1).fill(FRUTAS.platano.emoji).map((emoji, i) => (
                    <span key={i} className="text-2xl">{emoji}</span>
                  ))}
                  <span className="text-red-500 text-xl">✗ ¡Aún no!</span>
                </div>
              </div>
            </div>
          </section>

          {/* Nivel Actual */}
          <section className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4 text-purple-800">Tu Nivel: {configNivel.nombre}</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span>🎲</span>
                <span>{configNivel.frutasDisponibles} tipos de frutas diferentes</span>
              </li>
              <li className="flex items-center gap-2">
                <span>⚡</span>
                <span>Velocidad: {configNivel.velocidad/1000} segundos entre frutas</span>
              </li>
              <li className="flex items-center gap-2">
                <span>⭐</span>
                <span>{configNivel.puntosPorAcierto} puntos por acierto</span>
              </li>
              {configNivel.ayudaVisual && (
                <li className="flex items-center gap-2">
                  <span>👁️</span>
                  <span>Ayudas visuales activadas</span>
                </li>
              )}
            </ul>
          </section>

          {/* Sistema de Puntos */}
          <section className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4 text-green-800">Sistema de Puntos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-bold text-green-600 flex items-center gap-2">
                  <span>🎯</span> Aciertos
                </h4>
                <p className="text-sm text-gray-600">
                  +{configNivel.puntosPorAcierto} puntos por tocar correctamente
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-bold text-red-600 flex items-center gap-2">
                  <span>❌</span> Errores
                </h4>
                <p className="text-sm text-gray-600">
                  -{configNivel.penalizacionError} puntos por tocar incorrectamente
                </p>
              </div>
            </div>
          </section>

          {/* Tips y Trucos */}
          <section className="bg-yellow-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4 text-yellow-800">Tips para Ganar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-bold text-yellow-700">👁️ Mantén la Atención</h4>
                <p className="text-sm text-gray-600">
                  Enfócate en una fruta y cuenta cuántas hay.
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-bold text-yellow-700">⚡ Sé Rápido</h4>
                <p className="text-sm text-gray-600">
                  Toca el timbre apenas veas {configNivel.cantidadObjetivo} frutas iguales.
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-bold text-yellow-700">🧮 Lleva la Cuenta</h4>
                <p className="text-sm text-gray-600">
                  Intenta recordar cuántas frutas de cada tipo hay.
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-bold text-yellow-700">🎯 Precisión</h4>
                <p className="text-sm text-gray-600">
                  Es mejor esperar que equivocarse. ¡Los errores restan puntos!
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Botón de Inicio */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-[var(--primary-blue)] text-white rounded-lg 
                      hover:opacity-90 transition-all font-medium flex items-center gap-2"
          >
            <span>¡Empezar a jugar!</span>
            <span className="text-xl">🔔</span>
          </button>
        </div>
      </div>
    </div>
  );
}

TutorialModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  configNivel: PropTypes.object.isRequired
};

export default TutorialModal;