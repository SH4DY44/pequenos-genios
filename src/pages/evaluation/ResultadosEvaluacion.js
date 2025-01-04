import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaTrophy, FaChartLine, FaLightbulb } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ResultadosEvaluacion() {
  const navigate = useNavigate();
  const location = useLocation();
  const resultados = location.state?.resultados;

  useEffect(() => {
    console.log("Estado recibido:", location.state);
  }, [location.state]);

  // Manejar el caso cuando no hay resultados
  if (!resultados) {
    toast.error("No se encontraron resultados de la evaluación");
    navigate("/profile-selection");
    return null;
  }

  // Función para determinar el color basado en el puntaje
  const getColorPorPuntaje = (puntaje) => {
    if (puntaje >= 0.8) return "bg-green-500";
    if (puntaje >= 0.6) return "bg-blue-500";
    if (puntaje >= 0.4) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Función para obtener la descripción del nivel
  const getDescripcionNivel = (nivel) => {
    switch (nivel) {
      case "avanzado":
        return "Excelente dominio de habilidades con gran potencial para actividades desafiantes.";
      case "intermedio":
        return "Buen desarrollo de habilidades con áreas específicas para fortalecer.";
      case "básico-alto":
        return "Desarrollo adecuado con oportunidades claras de mejora.";
      case "básico":
        return "Necesita apoyo estructurado para desarrollar habilidades fundamentales.";
      default:
        return "Nivel por determinar";
    }
  };

  return (
    <div className="min-h-screen bg-[var(--primary-yellow)] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl w-full">
        {/* Encabezado con animación */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-4">
            <FaTrophy className="text-6xl text-[var(--primary-blue)]" />
          </div>
          <h2 className="text-3xl font-bold text-[var(--primary-blue)] mb-2">
            ¡Evaluación Completada con Éxito!
          </h2>
          <p className="text-gray-600">
            Hemos analizado tus respuestas para crear un plan personalizado de
            aprendizaje
          </p>
        </div>

        {/* Nivel Asignado */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg mb-8 text-center animate-slide-up">
          <h3 className="text-xl font-bold mb-4 flex items-center justify-center gap-2">
            <FaChartLine className="text-[var(--primary-blue)]" />
            Nivel de Aprendizaje
          </h3>
          <div className="text-3xl font-bold text-[var(--primary-blue)] mb-2 capitalize">
            {resultados.nivelAsignado.nivel}
          </div>
          <p className="text-gray-600">
            {getDescripcionNivel(resultados.nivelAsignado.nivel)}
          </p>
        </div>

        {/* Puntuaciones por Área */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {Object.entries(resultados.analisisDetallado).map(
            ([area, datos], index) => (
              <div
                key={area}
                className="bg-gray-50 p-4 rounded-lg animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h4 className="font-bold mb-3 capitalize">
                  {area.replace(/([A-Z])/g, " $1").trim()}
                </h4>
                <div className="space-y-2">
                  {Object.entries(datos.subAreas).map(([subArea, puntaje]) => (
                    <div key={subArea} className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div className="text-sm font-semibold capitalize">
                          {subArea.replace(/([A-Z])/g, " $1").trim()}
                        </div>
                        <div className="text-sm font-semibold">
                          {Math.round(puntaje * 100)}%
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                        <div
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${getColorPorPuntaje(
                            puntaje
                          )}`}
                          style={{ width: `${puntaje * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>

        {/* Recomendaciones */}
        <div className="mb-8 animate-fade-in">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaLightbulb className="text-[var(--primary-blue)]" />
            Recomendaciones Personalizadas
          </h3>
          <div className="space-y-4">
            {resultados.recomendaciones &&
              resultados.recomendaciones.map((recomendacion, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-4 rounded-lg border-l-4 border-[var(--primary-blue)]"
                >
                  {recomendacion}
                </div>
              ))}
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate("/profile-selection")}
            className="px-6 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Volver a Perfiles
          </button>
          <button
            onClick={() =>
              navigate("/console", {
                state: { profileId: location.state.profileId },
              })
            }
            className="px-8 py-3 bg-[var(--primary-blue)] text-white rounded-lg hover:opacity-90 font-bold"
          >
            Comenzar Actividades
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultadosEvaluacion;
