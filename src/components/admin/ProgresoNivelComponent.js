import React from 'react';
import { 
  FaLevelUpAlt, 
  FaTrophy, 
  FaStar, 
  FaChartLine, 
  FaBullseye,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';

/**
 * Componente que muestra el progreso hacia el siguiente nivel
 */
function ProgresoNivelComponent({ 
  evaluacionActual, 
  promocionDisponible, 
  cargandoEvaluacion, 
  onPromover,
  porcentajeCumplimiento,
  criteriosCumplidos,
  totalCriterios 
}) {

  if (cargandoEvaluacion) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Evaluando progreso...</span>
        </div>
      </div>
    );
  }

  if (!evaluacionActual) {
    return null;
  }

  const nivelActual = evaluacionActual.nivelActual || 'básico';
  const nivelSiguiente = evaluacionActual.nivelSiguiente;

  // Si ya está en el nivel máximo
  if (nivelActual === 'avanzado') {
    return (
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaTrophy className="text-3xl text-yellow-500 mr-4" />
            <div>
              <h3 className="text-xl font-bold text-yellow-800">¡Nivel Máximo Alcanzado!</h3>
              <p className="text-yellow-700">Has llegado al nivel AVANZADO. ¡Sigue practicando para mantener tu excelencia!</p>
            </div>
          </div>
          <FaStar className="text-3xl text-yellow-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FaLevelUpAlt className="text-2xl text-purple-600 mr-3" />
          <div>
            <h3 className="text-lg font-bold text-purple-800">
              Progreso hacia {nivelSiguiente?.toUpperCase()}
            </h3>
            <p className="text-purple-600 text-sm">
              Nivel actual: {nivelActual.toUpperCase()}
            </p>
          </div>
        </div>
        
        {promocionDisponible && (
          <button
            onClick={onPromover}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
          >
            <FaTrophy className="mr-2" />
            ¡Promover Nivel!
          </button>
        )}
      </div>

      {/* Barra de progreso general */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progreso General: {criteriosCumplidos}/{totalCriterios} criterios
          </span>
          <span className="text-sm font-bold text-purple-600">
            {porcentajeCumplimiento}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              promocionDisponible 
                ? 'bg-gradient-to-r from-green-400 to-green-600' 
                : 'bg-gradient-to-r from-purple-400 to-blue-500'
            }`}
            style={{ width: `${porcentajeCumplimiento}%` }}
          ></div>
        </div>
      </div>

      {/* Lista de criterios */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-800 flex items-center">
          <FaBullseye className="mr-2 text-purple-600" />
          Criterios de Promoción
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {evaluacionActual.evaluacionCriterios?.map((criterio, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${
                criterio.cumple 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {criterio.criterio}
                </span>
                {criterio.cumple ? (
                  <FaCheckCircle className="text-green-500" />
                ) : (
                  <FaTimesCircle className="text-gray-400" />
                )}
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{criterio.actual} / {criterio.requerido}</span>
                <span className={criterio.cumple ? 'text-green-600 font-bold' : 'text-gray-500'}>
                  {Math.round(criterio.progreso)}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    criterio.cumple ? 'bg-green-500' : 'bg-purple-400'
                  }`}
                  style={{ width: `${Math.min(criterio.progreso, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sugerencias */}
      {evaluacionActual.sugerencias && evaluacionActual.sugerencias.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
            <FaChartLine className="mr-2" />
            Sugerencias para avanzar
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            {evaluacionActual.sugerencias.slice(0, 3).map((sugerencia, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{sugerencia}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Mensaje de felicitación si está listo */}
      {promocionDisponible && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center">
            <FaTrophy className="text-green-500 mr-3 text-xl" />
            <div>
              <p className="text-green-800 font-semibold">
                ¡Felicidades! Has cumplido todos los criterios.
              </p>
              <p className="text-green-700 text-sm">
                Estás listo para avanzar al nivel {nivelSiguiente?.toUpperCase()}.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProgresoNivelComponent;
