import { addDoc, collection, doc, updateDoc, increment, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Registra una actividad completada por un niño y actualiza sus estadísticas
 * @param {string} profileId - ID del perfil del niño
 * @param {string} tipo - Tipo de actividad ('juego', 'ejercicio', 'lectura', 'video')
 * @param {string} nombre - Nombre específico de la actividad
 * @param {number} resultado - Puntuación o resultado obtenido
 * @param {number} duracion - Duración en segundos
 * @returns {Promise<void>}
 */
export const registrarActividad = async (profileId, tipo, nombre, resultado, duracion) => {
  try {
    // 1. Registrar la actividad individual
    await addDoc(collection(db, 'actividades'), {
      profileId,
      tipo,
      nombre,
      resultado,
      duracion,
      timestamp: new Date()
    });
    
    // 2. Actualizar estadísticas agregadas
    const perfilEstadisticasRef = doc(db, 'childProfiles', profileId, 'estadisticas', 'resumen');
    
    // Verificar si el documento de estadísticas existe
    const estadisticasDoc = await getDoc(perfilEstadisticasRef);
    
    if (estadisticasDoc.exists()) {
      // Actualizar estadísticas existentes
      await updateDoc(perfilEstadisticasRef, {
        totalTiempo: increment(duracion),
        totalActividades: increment(1),
        totalPuntos: increment(resultado),
        ultimaActividad: new Date(),
        [`${tipo}sCompletados`]: increment(1)
      });
    } else {
      // Crear documento de estadísticas si no existe
      await setDoc(perfilEstadisticasRef, {
        totalTiempo: duracion,
        totalActividades: 1,
        totalPuntos: resultado,
        ultimaActividad: new Date(),
        juegosCompletados: tipo === 'juego' ? 1 : 0,
        ejerciciosCompletados: tipo === 'ejercicio' ? 1 : 0,
        lecturasCompletadas: tipo === 'lectura' ? 1 : 0,
        videosCompletados: tipo === 'video' ? 1 : 0
      });
    }
    
    console.log('Actividad registrada y estadísticas actualizadas correctamente');
  } catch (error) {
    console.error('Error al registrar actividad:', error);
    throw error;
  }
};

/**
 * Obtiene las estadísticas resumidas de un perfil
 * @param {string} profileId - ID del perfil del niño
 * @returns {Promise<object|null>} - Objeto con las estadísticas o null si no existen
 */
export const obtenerEstadisticas = async (profileId) => {
  try {
    const estadisticasRef = doc(db, 'childProfiles', profileId, 'estadisticas', 'resumen');
    const estadisticasDoc = await getDoc(estadisticasRef);
    
    if (estadisticasDoc.exists()) {
      return estadisticasDoc.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return null;
  }
};
