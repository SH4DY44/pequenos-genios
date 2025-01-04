import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { toast } from "react-toastify";

function InitialEvaluation() {
    const [seccionActual, setSeccionActual] = useState(0);
    const [respuestas, setRespuestas] = useState({});
    const [todasRespondidas, setTodasRespondidas] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const profileId = location.state?.profileId;
    const questionContainerRef = useRef(null);

    // Calcula el progreso
    const progreso = ((seccionActual + 1) / 4) * 100;
  

    const secciones=[
        {
            titulo:"Atención y Concentración",
            descripcion: "Evaluaremos cómo el niño mantiene su atención y se organiza en diferentes actividades.",

            preguntas:[
                {
                    id: "atencion_1",
                    pregunta: "1. ¿Cuánto tiempo puede mantener la atención en una actividad que le interesa?",
                    opciones: [
                        { value: 1, label: "Menos de 5 minutos" },
                        { value: 2, label: "Entre 5 y 15 minutos" },
                        { value: 3, label: "Entre 15 y 30 minutos" },
                        { value: 4, label: "Entre 30 minutos y 1 hora" },
                        { value: 5, label: "Más de 1 hora" }
                    ]
                },  
                {
                    id: "atencion_2",
                    pregunta: "2. ¿Con qué frecuencia necesita que se le repitan las instrucciones?",
                    opciones:[
                      {value:1, label:"Casi siempre (más de 3 veces"},
                      { valor: 2, texto: "Frecuentemente (2-3 veces)" },
                      { valor: 3, texto: "Ocasionalmente (2 veces)" },
                      { valor: 4, texto: "Raramente (1 vez)" },
                      { valor: 5, texto: "Casi nunca (entiende a la primera)" }
                    ]
                },
                {
                    id: "atencion_3",
                    pregunta:"3. ¿Cómo responde ante las distracciones del entorno?",
                    opciones:[
                      {value:1, label:"Se distrae muy facilmente con cualquier estímulo."},
                      { valor: 2, texto: "Se distrae con frecuencia." },
                      { valor: 3, texto: "Se distrae ocasionalmente." }, 
                      { valor: 4, texto: "Mantiene la atencion la mayoria del tiempo." },
                      { valor: 5, texto: "Mantiene la atencion incluso con distracciones." }
                    ]
                },
                {
                    id: "atencion_4",
                    pregunta:"4. ¿Cómo es su capacidad para organizar tareas y actividades?",
                    opciones:[
                      {value:1, label:"Necesita ayuda consntante para organizarse."},
                      { valor: 2, texto: "Requiere bastante apoyo en la concentración." },
                      { valor: 3, texto: "Puede organizarse con algo de ayuda." },
                      { valor: 4, texto: "Se organiza bien con mínima ayuda." },
                      { valor: 5, texto: "Se organiza de manera independiente." }
                    ]
                },

                {
                    id: "atencion_5",
                    pregunta:"5. ¿Con qué frecuencia completa las actividades que inicia?",
                    opciones: [
                        { value: 1, label: "Casi nunca termina lo que empieza." },
                        { value: 2, label: "Termina menos de la mitad de las actividades." },
                        { value: 3, label: "Termina aproximadamente la mitad." },
                        { value: 4, label: "Termina la mayoria de las actividades." },
                        { value: 5, label: "Casi siempre termina lo que inicia." }
                    ]

                },
                {
                    id: "atencion_6",
                    pregunta:" 6. ¿Cómo maneja la transición entre diferentes actividades?",
                    opciones:[
                      {value:1, label:"Mucha dificultad, requiere apoyo constante."},
                      { value: 2, label: "Necesita bastante yiempo y apoyo." },
                      { value: 3, label: "Puede hacerlo con algo de apoyo." },
                      { value: 4, label: "Maneja bien los cambios con mínimo apoyo." },
                      { value: 5, label: "Transiciona mejor de manera indpendiente." }
                    ]
                }

            ]
        },
        {
            titulo:"Habilidades Sociales y Comunicación",
            descripcion: "Vamos a explorar cómo el niño interactúa y se comunica con los demás.",
            preguntas: [
              {
                id: "social_1",
                pregunta: "1. ¿Cómo interactúa con otros niños de su edad?",
                opciones: [
                  { valor: 1, texto: "Evita completamente la interacción" },
                  { valor: 2, texto: "Interactúa solo cuando otros inician" },
                  { valor: 3, texto: "Interactúa ocasionalmente por iniciativa propia" },
                  { valor: 4, texto: "Interactúa frecuentemente" },
                  { valor: 5, texto: "Interactúa de manera natural y espontánea" }
                ]
              },
              {
                id: "social_2",
                pregunta: "2. ¿Cómo expresa sus necesidades o deseos?",
                opciones: [
                  { valor: 1, texto: "No expresa sus necesidades" },
                  { valor: 2, texto: "Las expresa con mucha dificultad" },
                  { valor: 3, texto: "Las expresa con algo de ayuda" },
                  { valor: 4, texto: "Las expresa bastante bien" },
                  { valor: 5, texto: "Las expresa clara y efectivamente" }
                ]
              },
              {
                id: "social_3",
                pregunta: "3. ¿Cómo comprende las emociones de los demás?",
                opciones: [
                  { valor: 1, texto: "No reconoce las emociones de otros" },
                  { valor: 2, texto: "Reconoce emociones básicas con ayuda" },
                  { valor: 3, texto: "Reconoce emociones básicas por sí mismo" },
                  { valor: 4, texto: "Comprende la mayoría de las emociones" },
                  { valor: 5, texto: "Comprende y responde apropiadamente a las emociones" }
                ]
              },
              {
                id: "social_4",
                pregunta: "4. ¿Cómo maneja los conflictos o desacuerdos?",
                opciones: [
                  { valor: 1, texto: "Reacciona de manera muy negativa" },
                  { valor: 2, texto: "Le cuesta mucho manejarlos" },
                  { valor: 3, texto: "Los maneja con apoyo directo" },
                  { valor: 4, texto: "Los maneja con mínima ayuda" },
                  { valor: 5, texto: "Los maneja de manera apropiada" }
                ]
              },
              {
                id: "social_5",
                pregunta: "5. ¿Cómo responde cuando alguien le habla?",
                opciones: [
                  { valor: 1, texto: "No responde a la comunicación" },
                  { valor: 2, texto: "Responde mínimamente" },
                  { valor: 3, texto: "Responde de manera inconsistente" },
                  { valor: 4, texto: "Responde la mayoría de las veces" },
                  { valor: 5, texto: "Mantiene una conversación fluida" }
                ]
              },
              {
                id: "social_6",
                pregunta: "6. ¿Cómo interpreta el lenguaje no verbal (gestos, expresiones)?",
                opciones: [
                  { valor: 1, texto: "No interpreta señales no verbales" },
                  { valor: 2, texto: "Interpreta muy pocas señales" },
                  { valor: 3, texto: "Interpreta señales básicas" },
                  { valor: 4, texto: "Interpreta la mayoría de las señales" },
                  { valor: 5, texto: "Interpreta señales sutiles con facilidad" }
                ]
              }
            ]
        },
        {
            título: "Habilidades Cognitivas",
            descripcion:"Evalusaremos las capacidades de pensamiento, memoria y resolución de problemas",
            preguntas: [
              {
                id: "cognitivo_1",
                pregunta: "1. ¿Cómo es su capacidad para recordar instrucciones o información reciente?",
                opciones: [
                  { valor: 1, texto: "Olvida la información inmediatamente" },
                  { valor: 2, texto: "Recuerda muy poca información" },
                  { valor: 3, texto: "Recuerda información básica" },
                  { valor: 4, texto: "Recuerda la mayoría de la información" },
                  { valor: 5, texto: "Excelente memoria para detalles recientes" }
                ]
              },
              {
                id: "cognitivo_2",
                pregunta: "2. ¿Cómo resuelve problemas o situaciones nuevas?",
                opciones: [
                  { valor: 1, texto: "Se frustra y abandona rápidamente" },
                  { valor: 2, texto: "Necesita ayuda constante" },
                  { valor: 3, texto: "Intenta con algo de apoyo" },
                  { valor: 4, texto: "Busca soluciones por sí mismo" },
                  { valor: 5, texto: "Encuentra soluciones creativas" }
                ]
              },
              {
                id: "cognitivo_3",
                pregunta: "3. ¿Cómo maneja secuencias o pasos en una actividad?",
                opciones: [
                  { valor: 1, texto: "No puede seguir secuencias" },
                  { valor: 2, texto: "Sigue secuencias muy simples con ayuda" },
                  { valor: 3, texto: "Sigue secuencias básicas" },
                  { valor: 4, texto: "Maneja bien la mayoría de secuencias" },
                  { valor: 5, texto: "Excelente manejo de secuencias complejas" }
                ]
              },
              {
                id: "cognitivo_4",
                pregunta: "4. ¿Cómo es su capacidad de planificación?",
                opciones: [
                  { valor: 1, texto: "No muestra capacidad de planificación" },
                  { valor: 2, texto: "Planifica con mucha ayuda" },
                  { valor: 3, texto: "Planifica tareas simples" },
                  { valor: 4, texto: "Planifica bien la mayoría de tareas" },
                  { valor: 5, texto: "Planifica efectivamente tareas complejas" }
                ]
              },
              {
                id: "cognitivo_5",
                pregunta: "5. ¿Cómo relaciona conceptos o ideas?",
                opciones: [
                  { valor: 1, texto: "No establece relaciones" },
                  { valor: 2, texto: "Relaciona conceptos muy básicos" },
                  { valor: 3, texto: "Establece algunas relaciones" },
                  { valor: 4, texto: "Relaciona bien la mayoría de conceptos" },
                  { valor: 5, texto: "Establece relaciones complejas" }
                ]
              },
              {
                id: "cognitivo_6",
                pregunta: "6. ¿Cómo es su capacidad de adaptación a cambios en rutinas o actividades?",
                opciones: [
                  { valor: 1, texto: "Mucha dificultad con cualquier cambio" },
                  { valor: 2, texto: "Se adapta con mucho apoyo" },
                  { valor: 3, texto: "Se adapta a cambios pequeños" },
                  { valor: 4, texto: "Se adapta bien a la mayoría de cambios" },
                  { valor: 5, texto: "Se adapta fácilmente a cualquier cambio" }
                ]
              }
            ]
        },

        {
            título: "Preferencias de Aprendizaje",
            descripcion:"Indentificaremos la manera en que mejor aprende y se desarrolla.",
            preguntas: [
              {
                id: "aprendizaje_1",
                pregunta: "1. ¿Cómo responde mejor a la información nueva?",
                opciones: [
                  { valor: 1, texto: "Con imágenes y elementos visuales" },
                  { valor: 2, texto: "Escuchando explicaciones" },
                  { valor: 3, texto: "Haciendo la actividad directamente" },
                  { valor: 4, texto: "Combinando visual y auditivo" },
                  { valor: 5, texto: "Con todos los sentidos por igual" }
                ]
              },
              {
                id: "aprendizaje_2",
                pregunta: "2. ¿Qué tipo de actividades prefiere?",
                opciones: [
                  { valor: 1, texto: "Actividades tranquilas y estructuradas" },
                  { valor: 2, texto: "Actividades con movimiento" },
                  { valor: 3, texto: "Actividades creativas" },
                  { valor: 4, texto: "Actividades tecnológicas" },
                  { valor: 5, texto: "Actividades de resolución de problemas" }
                ]
              },
              {
                id: "aprendizaje_3",
                pregunta: "3. ¿Qué le motiva más a aprender?",
                opciones: [
                  { valor: 1, texto: "Reconocimiento y elogios" },
                  { valor: 2, texto: "Recompensas tangibles" },
                  { valor: 3, texto: "Logros y metas cumplidas" },
                  { valor: 4, texto: "Interés en el tema" },
                  { valor: 5, texto: "Competencia y desafíos" }
                ]
              },
              {
                id: "aprendizaje_4",
                pregunta: "4. ¿En qué entorno aprende mejor?",
                opciones: [
                  { valor: 1, texto: "Ambiente muy silencioso" },
                  { valor: 2, texto: "Con algo de ruido de fondo" },
                  { valor: 3, texto: "En espacios abiertos" },
                  { valor: 4, texto: "En grupos pequeños" },
                  { valor: 5, texto: "En cualquier ambiente" }
                ]
              },
              {
                id: "aprendizaje_5",
                pregunta: "5. ¿Qué duración de actividad es más efectiva?",
                opciones: [
                  { valor: 1, texto: "Sesiones muy cortas (5-10 min)" },
                  { valor: 2, texto: "Sesiones cortas (10-20 min)" },
                  { valor: 3, texto: "Sesiones medias (20-30 min)" },
                  { valor: 4, texto: "Sesiones largas (30-45 min)" },
                  { valor: 5, texto: "Sesiones muy largas (45+ min)" }
                ]
              },
              {
                id: "aprendizaje_6",
                pregunta: "6. ¿Cómo prefiere recibir instrucciones?",
                opciones: [
                  { valor: 1, texto: "Instrucciones muy detalladas" },
                  { valor: 2, texto: "Instrucciones paso a paso" },
                  { valor: 3, texto: "Instrucciones con ejemplos" },
                  { valor: 4, texto: "Instrucciones breves" },
                  { valor: 5, texto: "Descubrir por sí mismo" }
                ]
              }
            ]
      },
    ];

    useEffect(() => {
      const preguntasSeccionActual = secciones[seccionActual].preguntas;
      const todasContestadas = preguntasSeccionActual.every(pregunta => 
          respuestas[pregunta.id] !== undefined
      );
      setTodasRespondidas(todasContestadas);
  }, [respuestas, seccionActual]);


  const manejarRespuesta = (idPregunta, valor) => {
      setRespuestas(prev => ({
          ...prev,
          [idPregunta]: valor
      }));
  };


    const calcularNivel = (respuestas) => {
      // Definimos perfiles de desarrollo
      const perfiles = {
          atencion: {
              peso: 0.30,
              subAreas: {
                  sostenida: ['atencion_1', 'atencion_5'],
                  selectiva: ['atencion_3'],
                  ejecutiva: ['atencion_2', 'atencion_4', 'atencion_6']
              }
          },
          social: {
              peso: 0.25,
              subAreas: {
                  interaccion: ['social_1', 'social_5'],
                  comunicacion: ['social_2'],
                  empatiaCognitiva: ['social_3', 'social_6'],
                  regulacionSocial: ['social_4']
              }
          },
          cognitivo: {
              peso: 0.25,
              subAreas: {
                  memoria: ['cognitivo_1'],
                  resolucionProblemas: ['cognitivo_2'],
                  secuenciacion: ['cognitivo_3'],
                  funcionEjecutiva: ['cognitivo_4', 'cognitivo_5', 'cognitivo_6']
              }
          },
          aprendizaje: {
              peso: 0.20,
              subAreas: {
                  estiloAprendizaje: ['aprendizaje_1'],
                  tipoActividad: ['aprendizaje_2'],
                  motivacion: ['aprendizaje_3'],
                  entorno: ['aprendizaje_4', 'aprendizaje_5'],
                  instrucciones: ['aprendizaje_6']
              }
          }
      };

      // Calculamos puntajes por subárea
      const calcularPuntajeSubAreas = (respuestas, perfil) => {
          const puntajesSubAreas = {};
          
          Object.entries(perfil.subAreas).forEach(([subArea, preguntas]) => {
              const puntajeTotal = preguntas.reduce((sum, preguntaId) => {
                  return sum + (respuestas[preguntaId] || 0);
              }, 0);
              puntajesSubAreas[subArea] = puntajeTotal / (preguntas.length * 5);
          });
          
          return puntajesSubAreas;
      };

      // Analizamos cada perfil
      const analisisFinal = {};
      let puntajePonderadoTotal = 0;

      Object.entries(perfiles).forEach(([area, perfil]) => {
          const puntajesSubAreas = calcularPuntajeSubAreas(respuestas, perfil);
          
          const puntajeArea = Object.values(puntajesSubAreas).reduce((sum, p) => sum + p, 0) / 
                             Object.keys(puntajesSubAreas).length;
          
          puntajePonderadoTotal += puntajeArea * perfil.peso;
          
          analisisFinal[area] = {
              puntajeGeneral: puntajeArea,
              subAreas: puntajesSubAreas
          };
      });

      const determinarNivel = (puntaje) => {
          if (puntaje >= 0.8) {
              return {
                  nivel: "avanzado",
                  descripcion: "Alta capacidad de autonomía y aprendizaje",
                  recomendaciones: "Enfocarse en retos y proyectos complejos"
              };
          } else if (puntaje >= 0.6) {
              return {
                  nivel: "intermedio",
                  descripcion: "Buena base con áreas de oportunidad",
                  recomendaciones: "Fortalecer áreas específicas mientras se mantiene el interés"
              };
          } else if (puntaje >= 0.4) {
              return {
                  nivel: "básico-alto",
                  descripcion: "Necesita apoyo estructurado",
                  recomendaciones: "Comenzar con actividades básicas y aumentar gradualmente"
              };
          } else {
              return {
                  nivel: "básico",
                  descripcion: "Requiere apoyo significativo",
                  recomendaciones: "Enfoque en habilidades fundamentales con mucho apoyo"
              };
          }
      };

      const nivelFinal = determinarNivel(puntajePonderadoTotal);

      return {
          nivelAsignado: nivelFinal,
          puntajeGlobal: puntajePonderadoTotal,
          analisisDetallado: analisisFinal
      };
  };

  // Navegar entre secciones
  const siguiente = () => {
      if (seccionActual < secciones.length - 1) {
          setSeccionActual(prev => prev + 1);
          // Hacer scroll al inicio cuando cambia la sección
          if (questionContainerRef.current) {
              questionContainerRef.current.scrollTop = 0;
          }
      } else {
          finalizarEvaluacion();
      }
  };

  const anterior = () => {
      if (seccionActual > 0) {
          setSeccionActual(prev => prev - 1);
          // Hacer scroll al inicio cuando cambia la sección
          if (questionContainerRef.current) {
              questionContainerRef.current.scrollTop = 0;
          }
      }
  };

  // Finalizar la evaluación
  const finalizarEvaluacion = async () => {
      try {
          const resultadosEvaluacion = calcularNivel(respuestas);
          console.log("Resultados calculados:", resultadosEvaluacion); // Para debug

          // Guardar en Firebase
          await updateDoc(doc(db, 'childProfiles', profileId), {
              evaluacionRespuestas: respuestas,
              resultadosEvaluacion: resultadosEvaluacion,
              evaluacionFinalizada: true,
              fechaEvaluacion: new Date()
          });

          toast.success('Evaluación completada exitosamente');

          // Verificar si tenemos resultados antes de navegar
          if (resultadosEvaluacion) {
              navigate('/evaluation/resultados', { 
                  state: { 
                      resultados: resultadosEvaluacion,
                      profileId: profileId
                  },
                  replace: true  // Esto evita que el usuario pueda volver a la evaluación con el botón de atrás
              });
          } else {
              console.error("No se generaron resultados de la evaluación");
              toast.error('Error al procesar los resultados');
          }

      } catch (error) {
          console.error('Error saving evaluation:', error);
          toast.error('Error al guardar la evaluación');
      }
  };


  return (
    <div className="min-h-screen bg-[var(--primary-yellow)]">
        {/* Barra de progreso general */}
        <div className="fixed top-0 left-0 w-full h-2 bg-gray-200">
            <div 
                className="h-full bg-[var(--primary-blue)] transition-all duration-300"
                style={{ width: `${progreso}%` }}
            />
        </div>

        <div className="max-w-4xl mx-auto p-8">
            {/* Encabezado de la sección */}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-[var(--primary-blue)] mb-2">
                    {secciones[seccionActual].titulo}
                </h2>
                <p className="text-gray-600">
                    {secciones[seccionActual].descripcion}
                </p>
                <div className="flex justify-center gap-2 mt-4">
                    {secciones.map((_, index) => (
                        <div 
                            key={index}
                            className={`h-2 w-16 rounded-full ${
                                index === seccionActual ? 'bg-[var(--primary-blue)]' : 
                                index < seccionActual ? 'bg-green-500' : 'bg-gray-200'
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Contenido de la evaluación */}
            <div className="bg-white rounded-xl shadow-lg p-8">
                <div 
                    ref={questionContainerRef}
                    className="animate-fade-in max-h-[60vh] overflow-y-auto pr-4"
                >
                    {secciones[seccionActual].preguntas.map((pregunta) => (
                        <div key={pregunta.id} className="mb-8 last:mb-0">
                            <h3 className="text-lg font-medium mb-4">{pregunta.pregunta}</h3>
                            <div className="space-y-3">
                                {pregunta.opciones.map((opcion) => (
                                    <label
                                        key={opcion.valor || opcion.value}
                                        className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all
                                            ${respuestas[pregunta.id] === (opcion.valor || opcion.value) 
                                                ? 'border-blue-500 bg-blue-50' 
                                                : 'border-gray-200 hover:border-blue-200'}`}
                                    >
                                        <input
                                            type="radio"
                                            name={pregunta.id}
                                            value={opcion.valor || opcion.value}
                                            checked={respuestas[pregunta.id] === (opcion.valor || opcion.value)}
                                            onChange={() => manejarRespuesta(pregunta.id, opcion.valor || opcion.value)}
                                            className="hidden"
                                        />
                                        <span>{opcion.texto || opcion.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Botones de navegación */}
            <div className="flex justify-between mt-8">
                <button
                    onClick={anterior}
                    disabled={seccionActual === 0}
                    className="px-6 py-2 rounded-lg border-2 border-gray-300 
                            disabled:opacity-50 hover:bg-gray-50"
                >
                    Anterior
                </button>
                
                <div className="flex items-center gap-2">
                    <span className="text-gray-600">
                        Sección {seccionActual + 1} de {secciones.length}
                    </span>
                </div>

                <button
                    onClick={siguiente}
                    disabled={!todasRespondidas}
                    className="px-6 py-2 bg-[var(--primary-blue)] text-white rounded-lg 
                            hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {seccionActual === secciones.length - 1 ? 'Finalizar' : 'Siguiente'}
                </button>
            </div>
        </div>
    </div>
);
}

export default InitialEvaluation;