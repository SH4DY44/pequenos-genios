import { doc, getDoc, updateDoc, Timestamp, arrayUnion } from 'firebase/firestore';
import { db } from '../config/firebase';
import { RewardsService } from './rewardsService';

export class DailyRewardsService {
  static async verificarRecompensaDiaria(profileId) {
    try {
      const perfilRef = doc(db, 'childProfiles', profileId);
      const perfilDoc = await getDoc(perfilRef);
      
      if (!perfilDoc.exists()) {
        throw new Error('Perfil no encontrado');
      }
      
      const perfilData = perfilDoc.data();
      const ultimaRecompensa = perfilData.ultimaRecompensaDiaria?.toDate() || null;
      const ahora = new Date();
      
      // Verificar si ya recibió recompensa hoy
      if (ultimaRecompensa && 
          ultimaRecompensa.getDate() === ahora.getDate() &&
          ultimaRecompensa.getMonth() === ahora.getMonth() &&
          ultimaRecompensa.getFullYear() === ahora.getFullYear()) {
        return {
          disponible: false,
          mensaje: 'Ya recibiste tu recompensa diaria hoy'
        };
      }
      
      // Calcular recompensa basada en racha
      const racha = perfilData.racha || 0;
      const recompensa = this.calcularRecompensaDiaria(racha);
      
      // Actualizar perfil
      await updateDoc(perfilRef, {
        ultimaRecompensaDiaria: Timestamp.now(),
        [`historicoRecompensasDiarias`]: arrayUnion({
          fecha: Timestamp.now(),
          recompensa
        })
      });
      
      // Otorgar recompensa
      if (recompensa.estrellas) {
        await RewardsService.agregarEstrellas(
          profileId,
          recompensa.estrellas,
          'Recompensa diaria'
        );
      }
      
      if (recompensa.puntos) {
        await RewardsService.agregarPuntos(
          profileId,
          recompensa.puntos,
          'Recompensa diaria'
        );
      }
      
      return {
        disponible: true,
        recompensa,
        mensaje: '¡Recompensa diaria obtenida!'
      };
    } catch (error) {
      console.error('Error verificando recompensa diaria:', error);
      throw error;
    }
  }
  
  static calcularRecompensaDiaria(racha) {
    // Recompensa base
    const recompensa = {
      puntos: 50,
      estrellas: 1
    };
    
    // Bonificaciones por racha
    if (racha >= 7) {
      recompensa.estrellas += 1;
      recompensa.puntos += 50;
    }
    
    if (racha >= 30) {
      recompensa.estrellas += 2;
      recompensa.puntos += 100;
    }
    
    return recompensa;
  }
} 