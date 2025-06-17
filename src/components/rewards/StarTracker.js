import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { DailyRewardsService } from '../../services/dailyRewardsService';
import { toast } from 'react-toastify';

function StarTracker({ profileId }) {
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    ganadasHoy: 0,
    proximaRecompensa: null,
    racha: 0
  });
  
  const [cargando, setCargando] = useState(true);
  
  useEffect(() => {
    cargarEstadisticas();
  }, [profileId]);
  
  const cargarEstadisticas = async () => {
    try {
      const perfilDoc = await getDoc(doc(db, 'childProfiles', profileId));
      const data = perfilDoc.data();
      
      setEstadisticas({
        total: data.estrellas || 0,
        ganadasHoy: data.estrellasGanadasHoy || 0,
        proximaRecompensa: calcularProximaRecompensa(data.estrellas || 0),
        racha: data.racha || 0
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      toast.error('Error al cargar estadísticas');
    } finally {
      setCargando(false);
    }
  };
  
  const reclamarRecompensaDiaria = async () => {
    try {
      setCargando(true);
      const resultado = await DailyRewardsService.verificarRecompensaDiaria(profileId);
      
      if (resultado.disponible) {
        toast.success(`¡Obtuviste ${resultado.recompensa.estrellas} estrellas!`);
        await cargarEstadisticas();
      } else {
        toast.info(resultado.mensaje);
      }
    } catch (error) {
      console.error('Error reclamando recompensa:', error);
      toast.error('Error al reclamar recompensa');
    } finally {
      setCargando(false);
    }
  };
  
  const calcularProximaRecompensa = (estrellasActuales) => {
    // Definir recompensas disponibles
    const recompensas = [
      { nombre: 'Insignia Básica', estrellas: 3 },
      { nombre: 'Avatar Especial', estrellas: 5 },
      { nombre: 'Tema Premium', estrellas: 8 }
    ];
    
    // Encontrar la próxima recompensa alcanzable
    return recompensas.find(r => r.estrellas > estrellasActuales) || null;
  };
  
  if (cargando) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Mis Estrellas</h3>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {estadisticas.total}
          </div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {estadisticas.ganadasHoy}
          </div>
          <div className="text-sm text-gray-600">Ganadas Hoy</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {estadisticas.racha}
          </div>
          <div className="text-sm text-gray-600">Días Consecutivos</div>
        </div>
      </div>
      
      {estadisticas.proximaRecompensa && (
        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          <div className="text-sm text-blue-800">
            Próxima recompensa: {estadisticas.proximaRecompensa.nombre}
          </div>
          <div className="text-xs text-blue-600">
            Necesitas {estadisticas.proximaRecompensa.estrellas - estadisticas.total} estrellas más
          </div>
        </div>
      )}
      
      <button
        onClick={reclamarRecompensaDiaria}
        className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition-colors"
      >
        Reclamar Recompensa Diaria
      </button>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Gana estrellas completando actividades, logros y recompensas diarias.</p>
        <ul className="list-disc list-inside mt-2">
          <li>1 estrella por actividad completada</li>
          <li>1 estrella extra por actividad perfecta</li>
          <li>1 estrella extra por completar rápido</li>
          <li>1 estrella diaria por recompensa diaria</li>
        </ul>
      </div>
    </div>
  );
}

export default StarTracker; 