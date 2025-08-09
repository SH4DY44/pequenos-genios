/**
 * Servicio de Email para el frontend
 * Integra con el backend de correos
 */

import { auth } from '../config/firebase';

class EmailService {
  constructor() {
    // URL del servicio de email (ajusta según tu configuración)
    this.baseURL = process.env.REACT_APP_EMAIL_SERVICE_URL || 'http://localhost:3002/api/email';
    this.apiKey = process.env.REACT_APP_EMAIL_API_KEY || '';
  }

  /**
   * Obtener headers para las peticiones
   */
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey || 'your-secure-api-key-here',
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

      return await this.enviarRecordatorioAutomatico(emailTutor, tipo, datos);
    } catch (error) {
      console.error('Error enviando notificación automática:', error);
      throw error;
    }
  }

  /**
   * 🚀 NUEVO: Enviar recordatorio automático usando el endpoint optimizado
   */
  async enviarRecordatorioAutomatico(email, tipo, datos) {
    try {
      const response = await fetch(`${this.baseURL}/automatic`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          email,
          tipo,
          ...datos
        })
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.error || 'Error enviando recordatorio automático');
      }

      return resultado;
    } catch (error) {
      console.error('Error enviando recordatorio automático:', error);
      throw new Error(`Error enviando recordatorio automático: ${error.message}`);
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
      let tipoPlantilla = 'recordatorio_general'; // Default
      
      switch (datos.tipoRecordatorio) {
        case 'medicamento':
          tipoPlantilla = 'recordatorio_medicamento';
          break;
        case 'cita_especialista':
        case 'cita_medica':
          tipoPlantilla = 'recordatorio_cita_medica';
          break;
        case 'tarea_especial':
        case 'tarea_escolar':
          tipoPlantilla = 'recordatorio_tarea_escolar';
          break;
        case 'recordatorio_manual':
        case 'general':
        default:
          tipoPlantilla = 'recordatorio_general';
          break;
      }

      // Crear datos para el email con todos los campos específicos
      const datosEmail = {
        nombreNino: datos.nombreNino,
        nombreTutor: auth.currentUser?.displayName || 'Tutor',
        titulo: datos.titulo || 'Recordatorio importante',
        mensaje: datos.mensaje || '',
        fechaCreacion: new Date().toISOString(),
        urlPlataforma: window.location.origin,
        
        // Campos específicos para cada tipo
        ...(tipoPlantilla === 'recordatorio_medicamento' && {
          medicamento: datos.medicamento || datos.titulo,
          dosis: datos.dosis || '',
          hora: datos.hora || ''
        }),
        
        ...(tipoPlantilla === 'recordatorio_cita_medica' && {
          especialista: datos.especialista || datos.medicamento || 'Especialista',
          fechaCita: datos.fechaCita || datos.fecha || '',
          hora: datos.hora || '',
          lugar: datos.lugar || ''
        }),
        
        ...(tipoPlantilla === 'recordatorio_tarea_escolar' && {
          materia: datos.materia || datos.especialista || 'Materia',
          fechaEntrega: datos.fechaEntrega || datos.fechaCita || datos.fecha || '',
          descripcion: datos.descripcion || datos.mensaje || ''
        })
      };

      console.log('Enviando recordatorio con:', { tipo: tipoPlantilla, datos: datosEmail });
      
      return await this.enviarCorreo(emailTutor, tipoPlantilla, datosEmail);
    } catch (error) {
      console.error('Error enviando recordatorio personalizado:', error);
      throw error;
    }
  }
}

const emailService = new EmailService();
export default emailService;
