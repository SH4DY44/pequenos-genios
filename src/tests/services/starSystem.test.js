import { DailyRewardsService } from '../../services/dailyRewardsService';
import { RewardsService } from '../../services/rewardsService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

jest.mock('firebase/firestore');
jest.mock('../../config/firebase');

describe('Sistema de Estrellas', () => {
  const profileId = 'test-profile';
  let mockPerfilRef;
  
  beforeEach(() => {
    mockPerfilRef = {
      id: profileId,
      data: () => ({
        estrellas: 0,
        estrellasGanadasHoy: 0,
        racha: 0,
        ultimaRecompensaDiaria: null
      })
    };
    
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => mockPerfilRef.data()
    });
  });
  
  describe('Recompensas Diarias', () => {
    test('debe otorgar recompensa diaria básica', async () => {
      const resultado = await DailyRewardsService.verificarRecompensaDiaria(profileId);
      
      expect(resultado.disponible).toBe(true);
      expect(resultado.recompensa.estrellas).toBe(1);
      expect(resultado.recompensa.puntos).toBe(50);
    });
    
    test('debe otorgar bonificación por racha de 7 días', async () => {
      mockPerfilRef.data = () => ({
        ...mockPerfilRef.data(),
        racha: 7
      });
      
      const resultado = await DailyRewardsService.verificarRecompensaDiaria(profileId);
      
      expect(resultado.recompensa.estrellas).toBe(2);
      expect(resultado.recompensa.puntos).toBe(100);
    });
    
    test('no debe otorgar recompensa si ya se recibió hoy', async () => {
      const hoy = new Date();
      mockPerfilRef.data = () => ({
        ...mockPerfilRef.data(),
        ultimaRecompensaDiaria: {
          toDate: () => hoy
        }
      });
      
      const resultado = await DailyRewardsService.verificarRecompensaDiaria(profileId);
      
      expect(resultado.disponible).toBe(false);
    });
  });
  
  describe('Recompensas por Actividad', () => {
    test('debe otorgar estrella por completar actividad', async () => {
      const resultado = {
        porcentajeCorrecto: 80,
        tiempo: 120,
        tiempoObjetivo: 180
      };
      
      const recompensa = await RewardsService.otorgarRecompensaActividad(
        profileId,
        'act-123',
        resultado
      );
      
      expect(recompensa.estrellas).toBe(1);
    });
    
    test('debe otorgar estrella extra por actividad perfecta', async () => {
      const resultado = {
        porcentajeCorrecto: 100,
        tiempo: 120,
        tiempoObjetivo: 180
      };
      
      const recompensa = await RewardsService.otorgarRecompensaActividad(
        profileId,
        'act-123',
        resultado
      );
      
      expect(recompensa.estrellas).toBe(2);
    });
    
    test('debe otorgar estrella extra por completar rápido', async () => {
      const resultado = {
        porcentajeCorrecto: 80,
        tiempo: 60,
        tiempoObjetivo: 180
      };
      
      const recompensa = await RewardsService.otorgarRecompensaActividad(
        profileId,
        'act-123',
        resultado
      );
      
      expect(recompensa.estrellas).toBe(2);
    });
    
    test('debe otorgar todas las estrellas por actividad perfecta y rápida', async () => {
      const resultado = {
        porcentajeCorrecto: 100,
        tiempo: 60,
        tiempoObjetivo: 180
      };
      
      const recompensa = await RewardsService.otorgarRecompensaActividad(
        profileId,
        'act-123',
        resultado
      );
      
      expect(recompensa.estrellas).toBe(3);
    });
  });
}); 