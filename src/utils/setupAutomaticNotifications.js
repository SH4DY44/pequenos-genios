// src/utils/setupAutomaticNotifications.js
import AutomaticNotificationService from '../services/automaticNotificationService';
import { auth } from '../config/firebase';

class AutomaticNotificationsSetup {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.checkInterval = 30 * 60 * 1000; // 30 minutos por defecto
  }

  /**
   * Iniciar el sistema de notificaciones automáticas
   */
  async start(intervalMinutes = 30) {
    if (this.isRunning) {
      console.log('⚠️ Sistema de notificaciones automáticas ya está ejecutándose');
      return;
    }

    if (!auth.currentUser) {
      console.error('❌ Usuario no autenticado');
      return;
    }

    try {
      this.isRunning = true;
      this.checkInterval = intervalMinutes * 60 * 1000;

      console.log('🚀 Iniciando sistema de notificaciones automáticas...');
      console.log(`⏰ Intervalo de verificación: ${intervalMinutes} minutos`);

      // Ejecutar verificación inicial
      await this.executeCheck();

      // Configurar intervalo periódico
      this.intervalId = setInterval(async () => {
        await this.executeCheck();
      }, this.checkInterval);

      console.log('✅ Sistema de notificaciones automáticas iniciado correctamente');
    } catch (error) {
      console.error('❌ Error iniciando sistema de notificaciones automáticas:', error);
      this.isRunning = false;
      throw error;
    }
  }

  /**
   * Detener el sistema de notificaciones automáticas
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ Sistema de notificaciones automáticas no está ejecutándose');
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    console.log('🛑 Sistema de notificaciones automáticas detenido');
  }

  /**
   * Ejecutar verificación de notificaciones automáticas
   */
  async executeCheck() {
    try {
      console.log('🔍 Ejecutando verificación de notificaciones automáticas...');
      
      const resultados = await AutomaticNotificationService.verificarYEnviarNotificacionesAutomaticas();
      
      const enviados = resultados.filter(r => r.enviado).length;
      const fallidos = resultados.filter(r => !r.enviado).length;
      
      console.log(`📊 Resultados de verificación automática:`);
      console.log(`   ✅ Enviadas: ${enviados}`);
      console.log(`   ⚠️ No enviadas: ${fallidos}`);
      
      if (enviados > 0) {
        console.log('📧 Notificaciones automáticas enviadas correctamente');
      }
      
      if (fallidos > 0) {
        console.warn('⚠️ Algunas notificaciones no se pudieron enviar');
        resultados.filter(r => !r.enviado).forEach(r => {
          console.warn(`   - ${r.nombreNino}: ${r.razon || r.error}`);
        });
      }
      
      return resultados;
    } catch (error) {
      console.error('❌ Error ejecutando verificación automática:', error);
      throw error;
    }
  }

  /**
   * Verificar estado del sistema
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      checkInterval: this.checkInterval,
      intervalMinutes: Math.round(this.checkInterval / (60 * 1000)),
      lastCheck: this.lastCheck
    };
  }

  /**
   * Configurar intervalo de verificación
   */
  setInterval(minutes) {
    if (this.isRunning) {
      console.log('⚠️ No se puede cambiar el intervalo mientras el sistema está ejecutándose');
      return;
    }

    this.checkInterval = minutes * 60 * 1000;
    console.log(`⏰ Intervalo configurado a ${minutes} minutos`);
  }

  /**
   * Ejecutar verificación manual (para testing)
   */
  async manualCheck() {
    console.log('🔧 Ejecutando verificación manual...');
    return await this.executeCheck();
  }
}

// Instancia singleton
const automaticNotificationsSetup = new AutomaticNotificationsSetup();

export default automaticNotificationsSetup; 