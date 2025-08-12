import React from 'react';
import PropTypes from 'prop-types';

function TutorialModal({ isOpen, onClose, configNivel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[var(--primary-blue)]">
            ¡Bienvenido a Secuencias de Palabras!
          </h2>
        </div>

        <div className="space-y-6">
          {/* Reglas Básicas */}
          <section className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4 text-blue-800">¿Cómo jugar?</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-2xl mr-3">👀</span>
                <p>Observa atentamente la secuencia de palabras e imágenes que aparecerán.</p>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">🧠</span>
                <p>Memoriza el orden en que aparecen.</p>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">🎯</span>
                <p>Reproduce la secuencia haciendo clic en las palabras en el mismo orden.</p>
              </li>
            </ul>
          </section>

          {/* Sistema de Intentos */}
          <section className="bg-red-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4 text-red-800">Sistema de Vidas</h3>
            <div className="flex items-center gap-2 mb-4">
              <div className="text-2xl">❤️ ❤️ ❤️</div>
              <span className="text-gray-600">= 3 intentos por nivel</span>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>• Cada error te hará perder una vida</li>
              <li>• Si pierdes todas las vidas, el juego terminará</li>
              <li>• ¡Las vidas se restauran al iniciar un nuevo juego!</li>
            </ul>
          </section>

          {/* Sistema de Puntos y Combos */}
          <section className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4 text-green-800">Puntuación y Combos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-bold text-green-600">Puntos Base</h4>
                <p className="text-sm text-gray-600">Gana puntos por cada secuencia completada correctamente.</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-bold text-green-600">Sistema de Combo</h4>
                <p className="text-sm text-gray-600">¡Aciertos consecutivos multiplican tus puntos! No pierdas la racha.</p>
              </div>
            </div>
          </section>

          {/* Niveles de Dificultad */}
          <section className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4 text-purple-800">Niveles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-bold text-purple-600">Básico</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• 2 elementos por secuencia</li>
                  <li>• Sin límite de tiempo</li>
                  <li>• Categorías simples</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-bold text-purple-600">Básico Alto</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• 3 elementos por secuencia</li>
                  <li>• 30 segundos por nivel</li>
                  <li>• Más categorías</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-bold text-purple-600">Intermedio</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• 4-5 elementos por secuencia</li>
                  <li>• 20 segundos por nivel</li>
                  <li>• Categorías mezcladas</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-bold text-purple-600">Avanzado</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• 6+ elementos por secuencia</li>
                  <li>• 15 segundos por nivel</li>
                  <li>• Todas las categorías</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Tips y Trucos */}
          <section className="bg-yellow-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4 text-yellow-800">Tips para Ganar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-bold text-yellow-700">👁️ Técnica Visual</h4>
                <p className="text-sm text-gray-600">Agrupa los elementos en patrones para recordarlos mejor.</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-bold text-yellow-700">🎵 Ritmo</h4>
                <p className="text-sm text-gray-600">Crea un ritmo o historia con las imágenes para memorizarlas.</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-bold text-yellow-700">⏰ Tiempo</h4>
                <p className="text-sm text-gray-600">No te apresures, usa todo el tiempo disponible para memorizar.</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-bold text-yellow-700">💪 Práctica</h4>
                <p className="text-sm text-gray-600">Cada intento te ayuda a mejorar tu memoria visual.</p>
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
            <span className="text-xl">🎮</span>
          </button>
        </div>
      </div>
    </div>
  );
}

TutorialModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  configNivel: PropTypes.object
};

export default TutorialModal;