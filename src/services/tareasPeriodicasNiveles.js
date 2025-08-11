import { SistemaPromocionNiveles } from '../utils/nivelesProgresion/SistemaPromocionNiveles';

/**
 * Servicio para ejecutar tareas periódicas relacionadas con la promoción de niveles
 */
export class TareasPeriodicasNiveles {

  /**
   * Ejecutar verificación automática de promociones
   * Esta función se puede llamar desde un cron job o timer
   */
  static async ejecutarVerificacionAutomatica() {
    try {
      console.log('🔄 Iniciando verificación automática de promociones...');
      
      const promocionesRealizadas = await SistemaPromocionNiveles.verificarPromocionesAutomaticas();
      
      console.log(`✅ Verificación completada. ${promocionesRealizadas} promociones realizadas.`);
      
      return {
        exito: true,
        promocionesRealizadas,
        fecha: new Date()
      };
      
    } catch (error) {
      console.error('❌ Error en verificación automática:', error);
      return {
        exito: false,
        error: error.message,
        fecha: new Date()
      };
    }
  }

  /**
   * Configurar verificación automática cada cierto tiempo
   * @param {number} intervalMinutos - Intervalo en minutos para la verificación
   */
  static configurarVerificacionPeriodica(intervalMinutos = 60) {
    console.log(`⏰ Configurando verificación automática cada ${intervalMinutos} minutos`);
    
    // Ejecutar inmediatamente
    this.ejecutarVerificacionAutomatica();
    
    // Configurar intervalo
    const intervalo = setInterval(() => {
      this.ejecutarVerificacionAutomatica();
    }, intervalMinutos * 60 * 1000);
    
    return intervalo;
  }

  /**
   * Función para evaluar manualmente un perfil específico
   * @param {string} profileId - ID del perfil a evaluar
   */
  static async evaluarPerfilManualmente(profileId) {
    try {
      console.log(`🎯 Evaluando manualmente perfil: ${profileId}`);
      
      const evaluacion = await SistemaPromocionNiveles.evaluarPromocion(profileId);
      
      console.log('📊 Resultado de evaluación:', evaluacion);
      
      return evaluacion;
      
    } catch (error) {
      console.error('❌ Error en evaluación manual:', error);
      return {
        puedePromoverse: false,
        error: error.message
      };
    }
  }

  /**
   * Función para promover manualmente un perfil
   * @param {string} profileId - ID del perfil a promover
   */
  static async promoverPerfilManualmente(profileId) {
    try {
      console.log(`🎓 Promoviendo manualmente perfil: ${profileId}`);
      
      const exito = await SistemaPromocionNiveles.promoverNivel(profileId);
      
      if (exito) {
        console.log('✅ Promoción manual exitosa');
      } else {
        console.log('❌ No se pudo promover el perfil');
      }
      
      return exito;
      
    } catch (error) {
      console.error('❌ Error en promoción manual:', error);
      return false;
    }
  }
}

export default TareasPeriodicasNiveles;
