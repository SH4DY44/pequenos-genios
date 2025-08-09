/**
 * 🤖 PROCESADOR AUTOMÁTICO DE RECORDATORIOS INTELIGENTES
 * 
 * Este script se ejecuta periódicamente para analizar el comportamiento
 * de los usuarios y disparar recordatorios automáticos cuando sea necesario.
 * 
 * Uso: node processor.js
 * Configurar en cron para ejecución automática cada 2 horas
 */

const AutomaticReminderService = require('./src/services/automaticReminderService');
const logger = require('./src/config/logger');

/**
 * 🔄 Función principal del procesador
 */
async function procesarRecordatoriosAutomaticos() {
  const startTime = new Date();
  logger.info('🤖 Iniciando procesamiento de recordatorios automáticos', {
    timestamp: startTime.toISOString()
  });

  try {
    // Ejecutar análisis y disparo de recordatorios
    const resultado = await AutomaticReminderService.analizarYDispararRecordatorios();

    const endTime = new Date();
    const duration = endTime - startTime;

    // Log de resultados
    logger.info('✅ Procesamiento completado exitosamente', {
      duration: `${duration}ms`,
      ...resultado
    });

    // Si es ejecución desde línea de comandos, mostrar resumen
    if (require.main === module) {
      console.log('\n🤖 RESUMEN DE PROCESAMIENTO AUTOMÁTICO');
      console.log('==========================================');
      console.log(`⏱️  Duración: ${duration}ms`);
      console.log(`👥 Usuarios analizados: ${resultado.usuariosAnalizados}`);
      console.log(`📧 Recordatorios enviados: ${resultado.recordatoriosEnviados}`);
      console.log(`❌ Errores: ${resultado.errores.length}`);
      
      if (resultado.recordatoriosPorTipo) {
        console.log('\n📊 RECORDATORIOS POR TIPO:');
        Object.entries(resultado.recordatoriosPorTipo).forEach(([tipo, cantidad]) => {
          if (cantidad > 0) {
            console.log(`   ${tipo}: ${cantidad}`);
          }
        });
      }

      if (resultado.errores.length > 0) {
        console.log('\n❌ ERRORES ENCONTRADOS:');
        resultado.errores.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error.usuario}: ${error.error}`);
        });
      }

      console.log('\n✅ Procesamiento completado\n');
    }

    return resultado;

  } catch (error) {
    const endTime = new Date();
    const duration = endTime - startTime;

    logger.error('❌ Error en procesamiento automático', {
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`
    });

    if (require.main === module) {
      console.error('\n❌ ERROR EN PROCESAMIENTO AUTOMÁTICO');
      console.error('====================================');
      console.error(`Error: ${error.message}`);
      console.error(`Duración antes del error: ${duration}ms`);
    }

    throw error;
  }
}

/**
 * 📊 Función para obtener estadísticas del sistema
 */
async function obtenerEstadisticas() {
  try {
    logger.info('📊 Generando estadísticas del sistema');
    
    const stats = await AutomaticReminderService.obtenerEstadisticas();
    
    if (require.main === module) {
      console.log('\n📊 ESTADÍSTICAS DEL SISTEMA');
      console.log('===========================');
      console.log(`👥 Total usuarios: ${stats.totalUsuarios}`);
      console.log(`🎯 Usuarios activos (7 días): ${stats.usuariosActivos}`);
      console.log(`😴 Usuarios inactivos (24h+): ${stats.usuariosInactivos}`);
      console.log(`🔥 Rachas perdidas (24h): ${stats.rachasPerdidas}`);
      console.log(`📧 Recordatorios enviados hoy: ${stats.recordatoriosEnviadosHoy}`);
      console.log(`⭐ Promedio estrellas por usuario: ${stats.promedioEstrellas}`);
      
      if (stats.recordatoriosPorTipoHoy) {
        console.log('\n📈 RECORDATORIOS ENVIADOS HOY POR TIPO:');
        Object.entries(stats.recordatoriosPorTipoHoy).forEach(([tipo, cantidad]) => {
          if (cantidad > 0) {
            console.log(`   ${tipo}: ${cantidad}`);
          }
        });
      }
    }

    return stats;

  } catch (error) {
    logger.error('❌ Error obteniendo estadísticas:', error);
    throw error;
  }
}

/**
 * 🧪 Función de prueba para desarrollo
 */
async function ejecutarPrueba() {
  try {
    logger.info('🧪 Ejecutando modo de prueba');
    
    console.log('\n🧪 MODO DE PRUEBA ACTIVADO');
    console.log('==========================');
    console.log('Ejecutando análisis con datos simulados...\n');

    // En un ambiente real, esto requeriría configurar el servicio
    // para usar datos de prueba en lugar de la base de datos real
    
    console.log('✅ Modo de prueba completado');
    console.log('Para pruebas reales, usar: GET /api/email/test-automatic/:tipo');

  } catch (error) {
    logger.error('❌ Error en modo de prueba:', error);
    throw error;
  }
}

// Manejo de argumentos de línea de comandos
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  async function main() {
    try {
      switch (command) {
        case 'stats':
          await obtenerEstadisticas();
          break;
        case 'test':
          await ejecutarPrueba();
          break;
        case 'help':
          console.log('\n🤖 PROCESADOR DE RECORDATORIOS AUTOMÁTICOS');
          console.log('==========================================');
          console.log('Comandos disponibles:');
          console.log('  node processor.js           - Ejecutar procesamiento completo');
          console.log('  node processor.js stats     - Mostrar estadísticas');
          console.log('  node processor.js test      - Ejecutar modo de prueba');
          console.log('  node processor.js help      - Mostrar esta ayuda');
          console.log('\nConfiguración de Cron recomendada:');
          console.log('  # Cada 2 horas');
          console.log('  0 */2 * * * cd /path/to/email-service && node processor.js');
          console.log('\n');
          break;
        default:
          await procesarRecordatoriosAutomaticos();
          break;
      }
      process.exit(0);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  }

  main();
}

module.exports = {
  procesarRecordatoriosAutomaticos,
  obtenerEstadisticas
};
