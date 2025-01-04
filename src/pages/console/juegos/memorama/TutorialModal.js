
import React from 'react';

function TutorialModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[var(--primary-blue)]">
            ¡Bienvenido al juego del Memorama!
          </h2>
        </div>

        <div className="space-y-6">
          {/* Sección básica */}
          <section className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4">¿Cómo jugar?</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-2xl mr-3">🎴</span>
                <p>Encuentra pares de cartas iguales volteándolas de dos en dos.</p>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">⭐</span>
                <p>Gana puntos por cada par encontrado.</p>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">⏱️</span>
                <p>¡Sé rápido! Algunos niveles tienen límite de tiempo.</p>
              </li>
            </ul>
          </section>

          {/* Sistema de combos */}
          <section className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4">Sistema de Combos</h3>
            <div className="space-y-4">
              <p className="mb-2">¡Encuentra pares consecutivos para multiplicar tus puntos!</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-lg font-bold text-green-600 mb-2">×1.5 Puntos</div>
                  <p className="text-sm">Primer acierto consecutivo</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-lg font-bold text-green-600 mb-2">×2 Puntos</div>
                  <p className="text-sm">Segundo acierto consecutivo</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-lg font-bold text-green-600 mb-2">×2.5 Puntos</div>
                  <p className="text-sm">Tercer acierto consecutivo</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-lg font-bold text-green-600 mb-2">×3 Puntos</div>
                  <p className="text-sm">¡Combo máximo!</p>
                </div>
              </div>
            </div>
          </section>

          {/* Tips */}
          <section className="bg-yellow-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4">Tips para Ganar</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-bold mb-2">👁️ Observa bien</h4>
                <p className="text-sm">Toma unos segundos para memorizar la posición de las cartas al inicio.</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-bold mb-2">🔄 Mantén el combo</h4>
                <p className="text-sm">Intenta recordar la ubicación de las cartas para mantener tu racha.</p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-[var(--primary-blue)] text-white rounded-lg hover:opacity-90 transition-all font-medium"
          >
            ¡Empezar a jugar!
          </button>
        </div>
      </div>
    </div>
  );
}

export default TutorialModal;