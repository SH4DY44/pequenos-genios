/**
 * Servicio de Email para el frontend
 * Integra con el backend de correos
 */

import { auth } from '../config/firebase';

class EmailService {
  constructor() {
    // URL del servicio de email (ajusta según tu configuración)
    this.baseURL = process.env.REACT_APP_EMAIL_SERVICE_URL || 'http://localhost:3001/api/email';
    this.apiKey = process.env.REACT_APP_EMAIL_API_KEY || '';
  }

  /**
   * Obtener headers para las peticiones
   */
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'X-User-ID': auth.currentUser?.uid || ''
    };
  }

  /**
   * Enviar correo electrónico
   */
  async enviarCorreo(destinatario, tipo, datos) {
    try {
      const response = await fetch(`${this.baseURL}/send`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          destinatario,
          tipo,
          datos
        })
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.message || 'Error enviando correo');
      }

      return resultado;
    } catch (error) {
      console.error('Error enviando correo:', error);
      throw new Error(`Error enviando correo: ${error.message}`);
    }
  }

  /**
   * Enviar múltiples correos
   */
  async enviarMultiples(correos) {
    try {
      const response = await fetch(`${this.baseURL}/send-multiple`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ correos })
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.message || 'Error enviando correos');
      }

      return resultado;
    } catch (error) {
      console.error('Error enviando múltiples correos:', error);
      throw new Error(`Error enviando correos: ${error.message}`);
    }
  }

  /**
   * Verificar estado del servicio
   */
  async verificarEstado() {
    try {
      const response = await fetch(`${this.baseURL}/status`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.message || 'Error verificando estado');
      }

      return resultado;
    } catch (error) {
      console.error('Error verificando estado del servicio:', error);
      throw new Error(`Error verificando estado: ${error.message}`);
    }
  }

  /**
   * Obtener plantillas disponibles
   */
  async obtenerPlantillas() {
    try {
      const response = await fetch(`${this.baseURL}/templates`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.message || 'Error obteniendo plantillas');
      }

      return resultado;
    } catch (error) {
      console.error('Error obteniendo plantillas:', error);
      throw new Error(`Error obteniendo plantillas: ${error.message}`);
    }
  }

  /**
   * Enviar correo de prueba
   */
  async enviarPrueba(destinatario) {
    try {
      const response = await fetch(`${this.baseURL}/test`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ destinatario })
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.message || 'Error enviando correo de prueba');
      }

      return resultado;
    } catch (error) {
      console.error('Error enviando correo de prueba:', error);
      throw new Error(`Error enviando correo de prueba: ${error.message}`);
    }
  }

  /**
   * Enviar notificación automática
   */
  async enviarNotificacionAutomatica(tipo, datos) {
    try {
      // Obtener el email del tutor actual
      const emailTutor = auth.currentUser?.email;
      
      if (!emailTutor) {
        throw new Error('No se pudo obtener el email del tutor');
      }

      return await this.enviarCorreo(emailTutor, tipo, datos);
    } catch (error) {
      console.error('Error enviando notificación automática:', error);
      throw error;
    }
  }

  /**
   * Enviar recordatorio personalizado
   */
  async enviarRecordatorioPersonalizado(datos) {
    try {
      const emailTutor = auth.currentUser?.email;
      
      if (!emailTutor) {
        throw new Error('No se pudo obtener el email del tutor');
      }

      // Mapeo de tipos personalizados a tipos válidos del backend
      const tipoMap = {
        recordatorio_manual: 'actividad_pendiente',
        cita_especialista: 'actividad_pendiente',
        medicamento: 'actividad_pendiente',
        tarea_especial: 'actividad_pendiente'
      };
      const tipoPlantilla = tipoMap[datos.tipoRecordatorio] || 'actividad_pendiente';

      // Personalización de título y mensaje según tipo
      let titulo = datos.titulo;
      let mensaje = datos.mensaje;
      switch (datos.tipoRecordatorio) {
        case 'medicamento':
          titulo = `💊 Recordatorio de Medicamento para ${datos.nombreNino || ''}`;
          mensaje = `Es hora de tomar: ${datos.medicamento || ''}.\nDosis: ${datos.dosis || ''}.\n${datos.mensaje || ''}`;
          break;
        case 'cita_especialista':
          titulo = `🏥 Cita médica para ${datos.nombreNino || ''}`;
          mensaje = `Especialista: ${datos.especialista || ''}.\nFecha: ${datos.fechaCita || ''}.\n${datos.mensaje || ''}`;
          break;
        case 'tarea_especial':
          titulo = `📚 Tarea escolar para ${datos.nombreNino || ''}`;
          mensaje = `Materia: ${datos.materia || ''}.\nFecha de entrega: ${datos.fechaEntrega || ''}.\n${datos.mensaje || ''}`;
          break;
        case 'recordatorio_manual':
        default:
          titulo = `🔔 Recordatorio para ${datos.nombreNino || ''}`;
          mensaje = datos.mensaje || '';
          break;
      }

      // Crear datos para el email
      const datosEmail = {
        nombreNino: datos.nombreNino,
        nombreTutor: auth.currentUser?.displayName || 'Tutor',
        tipoRecordatorio: datos.tipoRecordatorio,
        mensaje,
        titulo,
        fechaCreacion: new Date().toISOString(),
        urlPlataforma: window.location.origin,
        fechaCita: datos.fechaCita || undefined,
        fechaEntrega: datos.fechaEntrega || undefined,
        hora: datos.hora || undefined,
        dosis: datos.dosis || undefined,
        especialista: datos.especialista || undefined,
        medicamento: datos.medicamento || undefined,
        materia: datos.materia || undefined
      };

      return await this.enviarCorreo(emailTutor, tipoPlantilla, datosEmail);
    } catch (error) {
      console.error('Error enviando recordatorio personalizado:', error);
      throw error;
    }
  }
}

const emailService = new EmailService();
export default emailService;
