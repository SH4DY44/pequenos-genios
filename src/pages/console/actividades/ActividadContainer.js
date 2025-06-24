// src/pages/console/actividades/ActividadContainer.js - ACTUALIZADO
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { toast } from 'react-toastify';

// Importar componentes de actividades
import ReconocimientoEmociones from './ReconocimientoEmociones';
import ClasificacionFormas from './ClasificacionFormas';  // NUEVA IMPORTACIÓN
import ControlImpulsos from './ControlImpulsos';

// Importar configuración de actividades locales - ACTUALIZADA
const actividadesConfig = {
  'reconocimiento-emociones': {
    id: 'reconocimiento-emociones',
    nombre: 'Reconocimiento de Emociones',
    descripcion: 'Aprende a identificar diferentes emociones en rostros y situaciones',
    categoria: 'habilidades-sociales',
    duracion: 15,
    dificultad: 'Básico',
    componente: 'ReconocimientoEmociones',
    puntosPorActividad: 20
  },
  'clasificacion-formas': {  // NUEVA ACTIVIDAD
    id: 'clasificacion-formas',
    nombre: 'Clasificación de Formas',
    descripcion: 'Arrastra y clasifica diferentes formas geométricas en sus contenedores correctos',
    categoria: 'habilidades-cognitivas',
    duracion: 12,
    dificultad: 'Básico',
    componente: 'ClasificacionFormas',
    puntosPorActividad: 25
  },
  'control-impulsos': {
    id: 'control-impulsos',
    nombre: 'Control de Impulsos',
    descripcion: 'Ejercicios para mejorar el autocontrol y la regulación emocional',
    categoria: 'control-impulsos',
    duracion: 20,
    dificultad: 'Avanzado',
    componente: 'ControlImpulsos',
    puntosPorActividad: 30
  }
};

function ActividadContainer() {
  const { actividadId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [actividad, setActividad] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  // Obtener el perfil del niño del estado de navegación
  const perfilNino = location.state?.perfilNino;
  
  // Depuración - Imprimir información de navegación
  useEffect(() => {
    console.log('ActividadContainer - Estado de navegación:', location.state);
    console.log('ActividadContainer - ID de actividad:', actividadId);
    console.log('ActividadContainer - Perfil del niño:', perfilNino);
  }, [location, actividadId, perfilNino]);
  
  // Verificar si tenemos el perfil del niño
  useEffect(() => {
    if (!perfilNino) {
      console.warn('No se proporcionó el perfil del niño');
      setError('No se proporcionó información del perfil del niño');
      setCargando(false);
      return;
    }
  }, [perfilNino]);
  
  useEffect(() => {
    const cargarActividad = () => {
      if (!actividadId) {
        setError('ID de actividad no proporcionado');
        setCargando(false);
        return;
      }
      
      try {
        console.log('Buscando actividad con ID:', actividadId);
        console.log('Actividades disponibles:', Object.keys(actividadesConfig));
        
        // Buscar la actividad en la configuración local
        const actividadEncontrada = actividadesConfig[actividadId];
        
        if (actividadEncontrada) {
          console.log('Actividad encontrada:', actividadEncontrada);
          setActividad(actividadEncontrada);
          setError(null);
        } else {
          console.error('Actividad no encontrada para ID:', actividadId);
          setError(`Actividad "${actividadId}" no encontrada en la configuración`);
        }
      } catch (err) {
        console.error('Error al cargar la actividad:', err);
        setError('Error al cargar la actividad: ' + err.message);
      } finally {
        setCargando(false);
      }
    };
    
    cargarActividad();
  }, [actividadId]);
  
  // Añadir logs para depuración
  useEffect(() => {
    if (actividad) {
      console.log('Actividad cargada:', actividad);
      console.log('Componente a renderizar:', actividad.componente);
    }
  }, [actividad]);
  
  const finalizarActividad = async (resultado) => {
    if (!perfilNino?.id) {
      toast.error('Error: No se puede guardar el progreso sin perfil del niño');
      return;
    }

    try {
      console.log('Finalizando actividad con resultado:', resultado);
      
      // Actualizar estadísticas del niño
      const perfilRef = doc(db, 'childProfiles', perfilNino.id);
      const updateData = {
        ultimaActividad: new Date(),
        actividadesCompletadas: increment(1)
      };

      // Agregar puntos si están disponibles
      if (resultado.puntuacion !== undefined) {
        updateData.puntosTotales = increment(resultado.puntuacion);
      }

      // Actualizar estadísticas por categoría si existe
      if (actividad?.categoria) {
        updateData[`estadisticasActividades.${actividad.categoria}.completadas`] = increment(1);
        if (resultado.puntuacion !== undefined) {
          updateData[`estadisticasActividades.${actividad.categoria}.puntuacion`] = increment(resultado.puntuacion);
        }
      }

      await updateDoc(perfilRef, updateData);

      toast.success('¡Actividad completada con éxito!');
      
      // Navegar de vuelta a la consola
      navigate('/console', { state: { profileId: perfilNino.id } });
    } catch (error) {
      console.error('Error al finalizar la actividad:', error);
      toast.error('Error al guardar el progreso: ' + error.message);
    }
  };

  // Renderizar el componente correspondiente según el tipo de actividad
  const renderComponenteActividad = () => {
    if (!actividad || !actividad.componente) {
      console.log('No se puede renderizar: actividad o componente no disponible');
      return null;
    }

    const props = {
      actividad,
      perfilNino,
      onComplete: finalizarActividad,
      onClose: () => navigate('/console', { state: { profileId: perfilNino?.id } })
    };

    console.log('Renderizando componente:', actividad.componente);

    switch (actividad.componente) {
      case 'ReconocimientoEmociones':
        return <ReconocimientoEmociones {...props} />;
      case 'ClasificacionFormas':  // NUEVO CASO
        return <ClasificacionFormas {...props} />;
      case 'ControlImpulsos':
        return <ControlImpulsos {...props} />;
      default:
        console.error('Componente no reconocido:', actividad.componente);
        return (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              Componente no encontrado
            </h3>
            <p className="text-gray-500 mb-4">
              El componente "{actividad.componente}" no está disponible.
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Componentes disponibles: ReconocimientoEmociones, ClasificacionFormas, ControlImpulsos
            </p>
            <button
              onClick={() => navigate('/console', { state: { profileId: perfilNino?.id } })}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Volver a la Consola
            </button>
          </div>
        );
    }
  };
  
  if (cargando) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando actividad...</p>
          <p className="text-sm text-gray-400 mt-2">ID: {actividadId}</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <div className="text-5xl mb-4">❌</div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">Error</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          
          {/* Información de depuración */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4 text-left">
            <h4 className="font-semibold text-gray-700 mb-2">Información de depuración:</h4>
            <p className="text-sm text-gray-600">ID solicitado: <code className="bg-gray-200 px-1 rounded">{actividadId}</code></p>
            <p className="text-sm text-gray-600">Actividades disponibles:</p>
            <ul className="text-sm text-gray-600 ml-4">
              {Object.keys(actividadesConfig).map(key => (
                <li key={key}>• <code className="bg-gray-200 px-1 rounded">{key}</code></li>
              ))}
            </ul>
          </div>
          
          <button
            onClick={() => navigate('/console', { state: { profileId: perfilNino?.id } })}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Volver a la Consola
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {renderComponenteActividad()}
    </div>
  );
}

export default ActividadContainer;