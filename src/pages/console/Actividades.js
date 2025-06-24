// src/pages/console/Actividades.js - Versión actualizada con imágenes
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getActivityAsset, CATEGORY_COLORS, ActivityIllustrationWrapper } from '../../config/activityAssets';

function Actividades({ perfilNino }) {
  const [actividades, setActividades] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas');
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  const categorias = [
    { id: 'todas', nombre: 'Todas las actividades', icon: '🎯' },
    { id: 'habilidades-sociales', nombre: 'Habilidades Sociales', icon: '👥' },
    { id: 'atencion-concentracion', nombre: 'Atención y Concentración', icon: '🎯' },
    { id: 'control-impulsos', nombre: 'Control de Impulsos', icon: '🧠' },
    { id: 'habilidades-motoras', nombre: 'Habilidades Motoras', icon: '🤸' },
    { id: 'habilidades-cognitivas', nombre: 'Habilidades Cognitivas', icon: '🧩' }
  ];

  // Mapeo de actividades con sus configuraciones visuales
  const actividadesConfig = {
    'reconocimiento-emociones': {
      nombre: 'Reconocimiento de Emociones',
      descripcion: 'Aprende a identificar diferentes emociones en rostros y situaciones',
      categoria: 'habilidades-sociales',
      duracion: 15,
      dificultad: 'Básico',
      componente: 'ReconocimientoEmociones',
      puntosPorActividad: 20,
      visualKey: 'reconocimiento-emociones'
    },
    'clasificacion-formas': { 
      nombre: 'Clasificación de Formas',
      descripcion: 'Arrastra y clasifica diferentes formas geométricas en sus contenedores correctos',
      categoria: 'habilidades-cognitivas',
      duracion: 12,
      dificultad: 'Básico',
      componente: 'ClasificacionFormas',
      puntosPorActividad: 25,
      visualKey: 'clasificacion-formas'
    },
    'control-impulsos': {
      nombre: 'Control de Impulsos',
      descripcion: 'Ejercicios para mejorar el autocontrol y la regulación emocional',
      categoria: 'control-impulsos',
      duracion: 20,
      dificultad: 'Avanzado',
      componente: 'ControlImpulsos',
      puntosPorActividad: 30,
      visualKey: 'control-impulsos'
    }
  };

  useEffect(() => {
    const cargarActividades = async () => {
      setCargando(true);
      try {
        let actividadesArray = [];

        if (categoriaSeleccionada === 'todas') {
          // Cargar todas las actividades
          actividadesArray = Object.entries(actividadesConfig).map(([id, config]) => ({
            id,
            ...config
          }));
        } else {
          // Filtrar por categoría
          actividadesArray = Object.entries(actividadesConfig)
            .filter(([id, config]) => config.categoria === categoriaSeleccionada)
            .map(([id, config]) => ({ id, ...config }));
        }

        setActividades(actividadesArray);
      } catch (error) {
        console.error('Error cargando actividades:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarActividades();
  }, [categoriaSeleccionada, perfilNino]);

  const iniciarActividad = (actividadId, componente) => {
    console.log('Iniciando actividad:', actividadId);
    console.log('Perfil del niño:', perfilNino);
    
    navigate(`/console/actividad/${actividadId}`, { 
      state: { 
        perfilNino,
        componente 
      },
      replace: false
    });
  };

  const getDificultadColor = (dificultad) => {
    switch (dificultad.toLowerCase()) {
      case 'básico':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermedio':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'avanzado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const ActividadCard = ({ actividad }) => {
    const asset = getActivityAsset(actividad.visualKey);
    const categoryColors = CATEGORY_COLORS[actividad.categoria] || CATEGORY_COLORS['habilidades-sociales'];

    return (
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
        {/* Header con ilustración */}
        <div className={`relative h-40 overflow-hidden`}>
          <ActivityIllustrationWrapper activityKey={actividad.visualKey} />
          
          {/* Badge de categoría */}
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors.secondary} ${categoryColors.text} border ${categoryColors.border}`}>
              {categorias.find(c => c.id === actividad.categoria)?.nombre || 'General'}
            </span>
          </div>

          {/* Badge de dificultad */}
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDificultadColor(actividad.dificultad)}`}>
              {actividad.dificultad}
            </span>
          </div>
        </div>

        {/* Contenido de la card */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
              {actividad.nombre}
            </h3>
            <div className="text-2xl ml-2">
              {asset.emoji}
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {actividad.descripcion}
          </p>

          {/* Información adicional */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
                {actividad.duracion} min
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                {actividad.puntosPorActividad} pts
              </span>
            </div>
          </div>

          {/* Botón de acción */}
          <button
            onClick={() => iniciarActividad(actividad.id, actividad.componente)}
            className={`w-full bg-gradient-to-r ${asset.gradient} hover:opacity-90 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform group-hover:scale-105`}
          >
            <span className="flex items-center justify-center">
              <span className="mr-2">🚀</span>
              Comenzar
            </span>
          </button>
        </div>

        {/* Decoración inferior */}
        <div className={`h-1 bg-gradient-to-r ${asset.gradient}`}></div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Actividades Educativas
          </h2>
          <p className="text-gray-600">
            Selecciona una actividad para desarrollar nuevas habilidades
          </p>
        </div>
        <div className="text-4xl">
          🎓
        </div>
      </div>
      
      {/* Filtro de categorías */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Filtrar por categoría:</h3>
        <div className="overflow-x-auto">
          <div className="flex space-x-3 pb-2 min-w-max">
            {categorias.map(categoria => {
              const isSelected = categoriaSeleccionada === categoria.id;
              const categoryColors = CATEGORY_COLORS[categoria.id] || { primary: 'bg-gray-500', secondary: 'bg-gray-100', text: 'text-gray-800' };
              
              return (
                <button
                  key={categoria.id}
                  onClick={() => setCategoriaSeleccionada(categoria.id)}
                  className={`flex items-center px-4 py-3 rounded-xl whitespace-nowrap transition-all duration-300 ${
                    isSelected
                      ? `${categoryColors.primary} text-white shadow-lg transform scale-105`
                      : `${categoryColors.secondary} ${categoryColors.text} hover:${categoryColors.primary} hover:text-white hover:shadow-md`
                  }`}
                >
                  <span className="text-lg mr-2">{categoria.icon}</span>
                  <span className="font-medium">{categoria.nombre}</span>
                  {isSelected && (
                    <span className="ml-2 bg-white bg-opacity-20 rounded-full px-2 py-1 text-xs">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Lista de actividades */}
      {cargando ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
              <div className="h-40 bg-gray-200"></div>
              <div className="p-5">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : actividades.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {actividades.map(actividad => (
            <ActividadCard key={actividad.id} actividad={actividad} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            No hay actividades en esta categoría
          </h3>
          <p className="text-gray-500 mb-6">
            Prueba seleccionando una categoría diferente
          </p>
          <button
            onClick={() => setCategoriaSeleccionada('todas')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Ver todas las actividades
          </button>
        </div>
      )}

      {/* Footer informativo */}
      {actividades.length > 0 && (
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">
                💡 ¿Sabías que...?
              </h4>
              <p className="text-gray-600 text-sm">
                Completar actividades regularmente ayuda a desarrollar habilidades importantes y ganar puntos para desbloquear recompensas.
              </p>
            </div>
            <div className="text-4xl">
              🌟
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Actividades;