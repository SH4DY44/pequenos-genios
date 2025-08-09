/**
 * 🤖 SERVICIO DE RECORDATORIOS AUTOMÁTICOS INTELIGENTES
 * 
 * Este servicio analiza el comportamiento de los usuarios y dispara
 * recordatorios automáticos basados en patrones de actividad.
 * 
 * Versión CommonJS para compatibilidad con Node.js processor
 */

const axios = require('axios');
const logger = require('../config/logger');

class AutomaticReminderService {
  
  constructor() {
    this.emailServiceUrl = process.env.EMAIL_SERVICE_URL || 'http://localhost:3002';
    this.apiKey = process.env.EMAIL_API_KEY || 'your-secure-api-key-here';
  }

  /**
   * 🔍 Analizar actividad del usuario y disparar recordatorios automáticos
   */
  async analizarYDispararRecordatorios() {
    logger.info('🤖 Iniciando análisis automático de usuarios');

    const resultado = {
      usuariosAnalizados: 0,
      recordatoriosEnviados: 0,
      recordatoriosPorTipo: {},
      errores: []
    };

    try {
      // En un entorno real, esto se conectaría a Firebase/Firestore
      // Por ahora, simularemos el análisis
      
      logger.info('📊 Simulando análisis de usuarios...');
      
      // Simular usuarios para demostración
      const usuariosSimulados = this._generarUsuariosSimulados();
      
      for (const usuario of usuariosSimulados) {
        try {
          resultado.usuariosAnalizados++;
          
          const analisis = await this._analizarUsuario(usuario);
          
          if (analisis.requiereRecordatorio) {
            const enviado = await this._enviarRecordatorioAutomatico(
              usuario,
              analisis.tipo,
              analisis.datos
            );
            
            if (enviado) {
              resultado.recordatoriosEnviados++;
              resultado.recordatoriosPorTipo[analisis.tipo] = 
                (resultado.recordatoriosPorTipo[analisis.tipo] || 0) + 1;
                
              logger.info(`✅ Recordatorio enviado: ${analisis.tipo} para ${usuario.nombreNino}`);
            }
          }
          
        } catch (error) {
          resultado.errores.push({
            usuario: usuario.nombreNino,
            error: error.message
          });
          logger.error(`❌ Error procesando usuario ${usuario.nombreNino}:`, error);
        }
      }

      logger.info('🎉 Análisis automático completado', resultado);
      return resultado;

    } catch (error) {
      logger.error('❌ Error en análisis automático:', error);
      throw error;
    }
  }

  /**
   * 🔍 Analizar un usuario específico
   */
  async _analizarUsuario(usuario) {
    const ahora = new Date();
    const ultimaActividad = new Date(usuario.ultimaActividad);
    const horasSinActividad = (ahora - ultimaActividad) / (1000 * 60 * 60);

    // 1. 🎮 Inactividad (24h+)
    if (horasSinActividad >= 24 && horasSinActividad < 48) {
      return {
        requiereRecordatorio: true,
        tipo: 'recordatorio_inactividad',
        datos: {
          horasSinActividad: Math.round(horasSinActividad)
        }
      };
    }

    // 2. 📈 Racha perdida
    if (usuario.rachaActual > 0 && horasSinActividad > 24) {
      return {
        requiereRecordatorio: true,
        tipo: 'recordatorio_racha_perdida',
        datos: {
          diasRacha: usuario.rachaActual
        }
      };
    }

    // 3. 🎯 Meta semanal (viernes/sábado)
    const diaSemana = ahora.getDay();
    if ((diaSemana === 5 || diaSemana === 6) && usuario.metaSemanal) {
      const faltante = usuario.metaSemanal - usuario.actividadesSemana;
      if (faltante > 0 && faltante <= 5) {
        return {
          requiereRecordatorio: true,
          tipo: 'recordatorio_meta_semanal',
          datos: {
            actividadesCompletadas: usuario.actividadesSemana,
            metaSemanal: usuario.metaSemanal,
            actividadesFaltantes: faltante
          }
        };
      }
    }

    // 4. 🌟 Actividad favorita abandonada (3+ días)
    if (usuario.actividadFavorita && usuario.diasSinActividadFavorita >= 3) {
      return {
        requiereRecordatorio: true,
        tipo: 'recordatorio_actividad_favorita',
        datos: {
          actividadFavorita: usuario.actividadFavorita,
          diasSinActividad: usuario.diasSinActividadFavorita
        }
      };
    }

    // 5. ⭐ Estrellas acumuladas (50+)
    if (usuario.estrellas >= 50) {
      return {
        requiereRecordatorio: true,
        tipo: 'recordatorio_estrellas_acumuladas',
        datos: {
          estrellasActuales: usuario.estrellas,
          proximaRecompensa: 'Avatar Especial',
          estrellasNecesarias: 100 - usuario.estrellas
        }
      };
    }

    return {
      requiereRecordatorio: false,
      tipo: null,
      datos: null
    };
  }

  /**
   * 📧 Enviar recordatorio automático
   */
  async _enviarRecordatorioAutomatico(usuario, tipo, datos) {
    try {
      const payload = {
        tipo,
        email: usuario.email,
        nombreNino: usuario.nombreNino,
        nombreTutor: usuario.nombreTutor,
        ...datos
      };

      const response = await axios.post(
        `${this.emailServiceUrl}/api/email/automatic`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey
          },
          timeout: 10000
        }
      );

      return response.data.success;

    } catch (error) {
      logger.error(`❌ Error enviando recordatorio automático:`, error.message);
      return false;
    }
  }

  /**
   * 📊 Obtener estadísticas del sistema
   */
  async obtenerEstadisticas() {
    try {
      // En un entorno real, esto consultaría la base de datos
      // Por ahora, devolvemos estadísticas simuladas
      
      const stats = {
        totalUsuarios: 150,
        usuariosActivos: 89,
        usuariosInactivos: 23,
        rachasPerdidas: 8,
        recordatoriosEnviadosHoy: 15,
        promedioEstrellas: 34,
        recordatoriosPorTipoHoy: {
          recordatorio_inactividad: 8,
          recordatorio_racha_perdida: 3,
          recordatorio_meta_semanal: 2,
          recordatorio_estrellas_acumuladas: 2
        }
      };

      logger.info('📊 Estadísticas generadas', stats);
      return stats;

    } catch (error) {
      logger.error('❌ Error generando estadísticas:', error);
      throw error;
    }
  }

  /**
   * 🧪 Generar usuarios simulados para testing
   */
  _generarUsuariosSimulados() {
    const ahora = new Date();
    
    return [
      {
        id: 'sim-1',
        email: 'maria.lopez@email.com',
        nombreNino: 'Sofia',
        nombreTutor: 'María López',
        ultimaActividad: new Date(ahora - 26 * 60 * 60 * 1000), // 26 horas
        rachaActual: 5,
        metaSemanal: 10,
        actividadesSemana: 6,
        actividadFavorita: 'Matemáticas',
        diasSinActividadFavorita: 4,
        estrellas: 45
      },
      {
        id: 'sim-2',
        email: 'carlos.rodriguez@email.com',
        nombreNino: 'Diego',
        nombreTutor: 'Carlos Rodríguez',
        ultimaActividad: new Date(ahora - 30 * 60 * 60 * 1000), // 30 horas
        rachaActual: 8,
        metaSemanal: 12,
        actividadesSemana: 9,
        actividadFavorita: 'Ciencias',
        diasSinActividadFavorita: 1,
        estrellas: 67
      },
      {
        id: 'sim-3',
        email: 'ana.martinez@email.com',
        nombreNino: 'Isabella',
        nombreTutor: 'Ana Martínez',
        ultimaActividad: new Date(ahora - 12 * 60 * 60 * 1000), // 12 horas
        rachaActual: 12,
        metaSemanal: 8,
        actividadesSemana: 8,
        actividadFavorita: 'Arte',
        diasSinActividadFavorita: 0,
        estrellas: 23
      }
    ];
  }
}

module.exports = new AutomaticReminderService();
