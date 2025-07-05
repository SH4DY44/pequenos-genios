/**
 * Servicio de Email para el frontend
 * Integra con el backend de correos
 */

class EmailService {
  constructor() {
    this.baseURL = process.env.REACT_APP_EMAIL_SERVICE_URL || 'http://localhost:3001/api/email';
    this.apiKey = process.env.REACT_APP_EMAIL_API_KEY || null;
  }

  /**
   * Headers por defecto para las peticiones
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    return headers;
  }

  /**
   * Realizar petición HTTP
   */
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Error en la petición');
      }

      return data;
    } catch (error) {
      console.error('Error in EmailService request:', error);
      throw error;
    }
  }

  /**
   * Enviar correo electrónico
   */
  async enviarCorreo(destinatario, tipo, datos) {
    try {
      const response = await this.request('/send', {
        method: 'POST',
        body: JSON.stringify({
          destinatario,
          tipo,
          datos: {
            ...datos,
            urlPlataforma: window.location.origin
          }
        })
      });

      return response.data;
    } catch (error) {
      console.error('Error enviando correo:', error);
      throw error;
    }
  }

  /**
   * Enviar múltiples correos
   */
  async enviarMultiples(correos) {
    try {
      const correosConUrl = correos.map(correo => ({
        ...correo,
        datos: {
          ...correo.datos,
          urlPlataforma: window.location.origin
        }
      }));

      const response = await this.request('/send-multiple', {
        method: 'POST',
        body: JSON.stringify({
          correos: correosConUrl
        })
      });

      return response.data;
    } catch (error) {
      console.error('Error enviando múltiples correos:', error);
      throw error;
    }
  }

  /**
   * Verificar estado del servicio
   */
  async verificarEstado() {
    try {
      const response = await this.request('/status');
      return response.data;
    } catch (error) {
      console.error('Error verificando estado del servicio:', error);
      return { 
        estado: 'ERROR', 
        error: error.message 
      };
    }
  }

  /**
   * Obtener plantillas disponibles
   */
  async obtenerPlantillas() {
    try {
      const response = await this.request('/templates');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo plantillas:', error);
      throw error;
    }
  }

  /**
   * Enviar correo de prueba
   */
  async enviarCorreoPrueba(destinatario) {
    try {
      const response = await this.request('/test', {
        method: 'POST',
        body: JSON.stringify({
          destinatario
        })
      });

      return response.data;
    } catch (error) {
      console.error('Error enviando correo de prueba:', error);
      throw error;
    }
  }

  /**
   * Métodos de conveniencia para diferentes tipos de correos
   */

  /**
   * Enviar recordatorio de actividad pendiente
   */
  async recordatorioActividad(destinatario, nombreNino, nombreTutor, horasSinActividad) {
    return this.enviarCorreo(destinatario, 'actividad_pendiente', {
      nombreNino,
      nombreTutor,
      horasSinActividad
    });
  }

  /**
   * Notificar nuevo logro
   */
  async notificarLogro(destinatario, nombreNino, nombreTutor, logro, puntos, descripcion) {
    return this.enviarCorreo(destinatario, 'logro_alcanzado', {
      nombreNino,
      nombreTutor,
      logro,
      puntos,
      descripcion
    });
  }

  /**
   * Enviar resumen semanal
   */
  async resumenSemanal(destinatario, nombreNino, nombreTutor, estadisticas) {
    return this.enviarCorreo(destinatario, 'resumen_semanal', {
      nombreNino,
      nombreTutor,
      ...estadisticas
    });
  }

  /**
   * Enviar correo de bienvenida
   */
  async bienvenida(destinatario, nombreTutor, nombreNino) {
    return this.enviarCorreo(destinatario, 'bienvenida', {
      nombreTutor,
      nombreNino
    });
  }

  /**
   * Notificar recompensa disponible
   */
  async notificarRecompensa(destinatario, nombreNino, nombreTutor, recompensa, puntosRequeridos, puntosActuales) {
    return this.enviarCorreo(destinatario, 'recompensa_disponible', {
      nombreNino,
      nombreTutor,
      recompensa,
      puntosRequeridos,
      puntosActuales
    });
  }

  /**
   * Recordatorio de evaluación
   */
  async recordatorioEvaluacion(destinatario, nombreNino, nombreTutor, tipoEvaluacion, fechaLimite) {
    return this.enviarCorreo(destinatario, 'recordatorio_evaluacion', {
      nombreNino,
      nombreTutor,
      tipoEvaluacion,
      fechaLimite
    });
  }

  /**
   * Notificar sesión completada
   */
  async sesionCompletada(destinatario, nombreNino, nombreTutor, estadisticasSesion) {
    return this.enviarCorreo(destinatario, 'sesion_completada', {
      nombreNino,
      nombreTutor,
      ...estadisticasSesion
    });
  }
}

// Instancia singleton
const emailService = new EmailService();

export default emailService;
