// src/utils/reminderProcessor.js
import { ReminderScheduler } from '../services/reminderScheduler';

/**
 * Procesador de recordatorios programados
 * Este archivo debe ejecutarse periódicamente (cada 5 minutos)
 */
export class ReminderProcessor {
  static isRunning = false;
  static intervalId = null;

  /**
   * Iniciar el procesador de recordatorios
   */
  static iniciar(intervaloMinutos = 5) {
    if (this.isRunning) {
      console.log('⚠️ El procesador de recordatorios ya está ejecutándose');
      return;
    }

    console.log(`🚀 Iniciando procesador de recordatorios (cada ${intervaloMinutos} minutos)`);
    
    this.isRunning = true;
    
    // Ejecutar inmediatamente
    this.ejecutarCiclo();
    
    // Programar ejecuciones periódicas
    this.intervalId = setInterval(() => {
      this.ejecutarCiclo();
    }, intervaloMinutos * 60 * 1000);
  }

  /**
   * Detener el procesador de recordatorios
   */
  static detener() {
    if (!this.isRunning) {
      console.log('⚠️ El procesador de recordatorios no está ejecutándose');
      return;
    }

    console.log('⏹️ Deteniendo procesador de recordatorios');
    
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Ejecutar un ciclo completo de procesamiento
   */
  static async ejecutarCiclo() {
    try {
      console.log('🔄 Iniciando ciclo de procesamiento de recordatorios...');
      
      const inicio = Date.now();
      
      // Procesar recordatorios pendientes
      await ReminderScheduler.procesarRecordatoriosPendientes();
      
      // Limpiar recordatorios antiguos (solo una vez al día)
      const ahora = new Date();
      if (ahora.getHours() === 2 && ahora.getMinutes() < 10) {
        await ReminderScheduler.limpiarRecordatoriosAntiguos();
      }
      
      const duracion = Date.now() - inicio;
      console.log(`✅ Ciclo de procesamiento completado en ${duracion}ms`);
      
    } catch (error) {
      console.error('❌ Error en el ciclo de procesamiento de recordatorios:', error);
    }
  }

  /**
   * Obtener estado del procesador
   */
  static obtenerEstado() {
    return {
      ejecutandose: this.isRunning,
      intervalId: this.intervalId !== null,
      ultimaEjecucion: new Date().toISOString()
    };
  }

  /**
   * Ejecutar procesamiento manual (para testing)
   */
  static async ejecutarManual() {
    console.log('🔧 Ejecutando procesamiento manual de recordatorios...');
    await this.ejecutarCiclo();
  }

  /**
   * Obtener estadísticas de recordatorios
   */
  static async obtenerEstadisticas() {
    try {
      const estadisticas = await ReminderScheduler.obtenerEstadisticas();
      return {
        ...estadisticas,
        procesador: this.obtenerEstado()
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return {
        programados: 0,
        enviados: 0,
        fallidos: 0,
        total: 0,
        procesador: this.obtenerEstado()
      };
    }
  }
}

// Auto-iniciar en el navegador (solo en producción)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  // Esperar 30 segundos después de cargar la página
  setTimeout(() => {
    ReminderProcessor.iniciar();
  }, 30000);
}
