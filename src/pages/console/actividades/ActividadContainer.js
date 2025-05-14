import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { toast } from 'react-toastify';

// Importar componentes de actividades
import ReconocimientoEmociones from './ReconocimientoEmociones';
import BusquedaDiferencias from './BusquedaDiferencias';
import ControlImpulsos from './ControlImpulsos';
// Importar más componentes según se vayan creando

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
      // Opcionalmente, puedes redirigir o mostrar un error
    }
  }, [perfilNino]);
  
  useEffect(() => {
    const cargarActividad = async () => {
      if (!actividadId) {
        setError('ID de actividad no proporcionado');
        setCargando(false);
        return;
      }
      
      try {
        const docRef = doc(db, 'actividades', actividadId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setActividad({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError('Actividad no encontrada');
        }
      } catch (err) {
        console.error('Error al cargar la actividad:', err);
        setError('Error al cargar la actividad');
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
    try {
      // Actualizar estadísticas del niño
      await updateDoc(doc(db, 'childProfiles', perfilNino.id), {
        [`estadisticasActividades.${actividad.categoria}.completadas`]: increment(1),
        [`estadisticasActividades.${actividad.categoria}.puntuacion`]: increment(resultado.puntuacion || 0),
        'actividadesCompletadas': increment(1)
      });

      toast.success('¡Actividad completada con éxito!');
      // Modificación: Navegar a /console en lugar de /console/actividades
      navigate('/console', { state: { profileId: perfilNino?.id } });
    } catch (error) {
      console.error('Error al finalizar la actividad:', error);
      toast.error('Error al guardar el progreso');
    }
  };

  // Renderizar el componente correspondiente según el tipo de actividad
  const renderComponenteActividad = () => {
    if (!actividad || !actividad.componente) return null;

    const props = {
      actividad,
      perfilNino,
      onComplete: finalizarActividad,
      // Modificación: Navegar a /console en lugar de /console/actividades
      onClose: () => navigate('/console', { state: { profileId: perfilNino?.id } })
    };

    switch (actividad.componente) {
      case 'ReconocimientoEmociones':
        return <ReconocimientoEmociones {...props} />;
      case 'BusquedaDiferencias':
        return <BusquedaDiferencias {...props} />;
      case 'ControlImpulsos':
        return <ControlImpulsos {...props} />;
      default:
        return (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              Componente no encontrado
            </h3>
            <p className="text-gray-500">
              El componente "{actividad.componente}" no está disponible.
            </p>
          </div>
        );
    }
  };
  
  if (cargando) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">❌</div>
        <h3 className="text-xl font-medium text-gray-700 mb-2">Error</h3>
        <p className="text-gray-500">{error}</p>
        <button
          // Modificación: Navegar a /console en lugar de /console/actividades
          onClick={() => navigate('/console', { state: { profileId: perfilNino?.id } })}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Volver a la Consola
        </button>
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