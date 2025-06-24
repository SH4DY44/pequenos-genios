// src/pages/console/juegos/halliGalli/TutorialModal.js - ACTUALIZADO
import React from 'react';
import { FRUTAS } from './frutas';

function TutorialModal({ isOpen, onClose, configNivel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-orange-600">
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
          {/* Reglas Básicas */}
          <section className="bg-orange-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4 text-orange-800">¿Cómo jugar?</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-2xl mr-3">👁️</span>
                <p>Observa las frutas que van apareciendo en la pantalla.</p>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">🧮</span>
                <p>Cuenta cuántas frutas hay de cada tipo.</p>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">🔔</span>
                <p><strong>¡Presiona el timbre cuando veas 5 o más frutas iguales!</strong></p>
              </li>
            </ul>
          </section>

          {/* Ejemplos ACTUALIZADOS */}
          <section className="bg-yellow-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4 text-yellow-800">Ejemplos:</h3>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                <h4 className="font-bold text-green-600 mb-2">✅ Ejemplo Correcto - Exactamente 5:</h4>
                <div className="flex flex-wrap gap-2 justify-center mb-2">
                  {Array(5).fill().map((_, i) => (
                    <span key={i} className="text-3xl">🍎</span>
                  ))}
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Hay exactamente 5 manzanas. ¡Presiona el timbre!
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                <h4 className="font-bold text-green-600 mb-2">✅ Ejemplo Correcto - Más de 5:</h4>
                <div className="flex flex-wrap gap-2 justify-center mb-2">
                  {Array(7).fill().map((_, i) => (
                    <span key={i} className="text-3xl">🍌</span>
                  ))}
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Hay 7 plátanos (5 o más). ¡También debes presionar el timbre!
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg border-2 border-red-200">
                <h4 className="font-bold text-red-600 mb-2">❌ Ejemplo Incorrecto:</h4>
                <div className="flex flex-wrap gap-2 justify-center mb-2">
                  <span className="text-3xl">🍎</span>
                  <span className="text-3xl">🍎</span>
                  <span className="text-3xl">🍎</span>
                  <span className="text-3xl">🍌</span>
                  <span className="text-3xl">🍊</span>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Solo hay 3 manzanas, 1 plátano y 1 naranja. ¡No presiones el timbre!
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                <h4 className="font-bold text-blue-600 mb-2">🤔 Ejemplo Confuso:</h4>
                <div className="flex flex-wrap gap-2 justify-center mb-2">
                  <span className="text-3xl">🍎</span>
                  <span className="text-3xl">🍎</span>
                  <span className="text-3xl">🍎</span>
                  <span className="text-3xl">🍎</span>
                  <span className="text-3xl">🍌</span>
                  <span className="text-3xl">🍌</span>
                  <span className="text-3xl">🍌</span>
                  <span className="text-3xl">🍌</span>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  4 manzanas + 4 plátanos = ¡No hay 5 o más de la misma fruta!
                </p>
              </div>
            </div>
          </section>

          {/* Niveles de Dificultad */}
          <section className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4 text-green-800">Tu nivel: {configNivel?.descripcion || 'Básico'}</h3>
            
            <div className="space-y-2">
              <p><strong>Velocidad:</strong> {configNivel?.tiempoEntreFrutas / 1000 || 2} segundos entre cada fruta</p>
              <p><strong>Tipos de frutas:</strong> {configNivel?.numFrutas || 3} diferentes</p>
              <p><strong>Duración del juego:</strong> {configNivel?.duracionJuego || 60} segundos</p>
              <p><strong>Puntos por acierto:</strong> +{configNivel?.puntosPorAcierto || 10}</p>
              <p><strong>Penalización por error:</strong> {configNivel?.penalizacionError || -5} puntos</p>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium mb-2">Frutas en este nivel:</h4>
              <div className="flex flex-wrap gap-3">
                {FRUTAS.slice(0, configNivel?.numFrutas || 3).map(fruta => (
                  <div key={fruta.id} className="flex flex-col items-center">
                    <span className="text-3xl">{fruta.imagen}</span>
                    <span className="text-xs mt-1">{fruta.nombre}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Tips ACTUALIZADOS */}
          <section className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4 text-blue-800">Consejos actualizados:</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-xl mr-2">💡</span>
                <p>Mantén la calma y concéntrate en contar cada tipo de fruta.</p>
              </li>
              <li className="flex items-start">
                <span className="text-xl mr-2">💡</span>
                <p><strong>¡NUEVO!</strong> Presiona cuando veas 5 O MÁS frutas iguales, no solo exactamente 5.</p>
              </li>
              <li className="flex items-start">
                <span className="text-xl mr-2">💡</span>
                <p>Observa el panel "Conteo Actual" - las frutas con 5+ se mostrarán en verde.</p>
              </li>
              <li className="flex items-start">
                <span className="text-xl mr-2">💡</span>
                <p>Los errores restan puntos, así que asegúrate antes de tocar el timbre.</p>
              </li>
              <li className="flex items-start">
                <span className="text-xl mr-2">🚨</span>
                <p><strong>¡Atención!</strong> Aparecerá un aviso verde cuando hay 5+ frutas iguales.</p>
              </li>
            </ul>
          </section>
        </div>

        {/* Botón de Inicio */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-orange-500 text-white rounded-lg 
                      hover:opacity-90 transition-all font-medium text-lg shadow-md"
          >
            ¡Empezar a jugar!
          </button>
        </div>
      </div>
    </div>
  );
}

export default TutorialModal;