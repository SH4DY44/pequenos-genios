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
      'X-API-Key': this.apiKey || 'your-secure-api-key-here',
      'X-User-ID': auth.currentUser?.uid || ''
    };
  }

  /**
   * Enviar correo electrónico
   */
  async enviarCorreo(destinatario, tipo, datos) {
    try {
      console.log('🔍 [EmailService.enviarCorreo] Iniciando envío');
      console.log('🔍 [EmailService.enviarCorreo] Destinatario:', destinatario);
      console.log('🔍 [EmailService.enviarCorreo] Tipo:', tipo);
      console.log('🔍 [EmailService.enviarCorreo] Datos:', datos);
      console.log('🔍 [EmailService.enviarCorreo] URL completa:', `${this.baseURL}/send`);
      
      const payload = {
        destinatario,
        tipo,
        datos
      };
      
      console.log('🔍 [EmailService.enviarCorreo] Payload final:', payload);
      
      const response = await fetch(`${this.baseURL}/send`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });

      console.log('🔍 [EmailService.enviarCorreo] Response status:', response.status);
      console.log('🔍 [EmailService.enviarCorreo] Response ok:', response.ok);

      const resultado = await response.json();
      console.log('🔍 [EmailService.enviarCorreo] Resultado del servidor:', resultado);

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
   * Verificar si el servicio de email está disponible
   */
  async verificarEmailService() {
    try {
      console.log('🔍 [EmailService] Verificando servicio en:', `${this.baseURL}/api/email/status`);
      
      const response = await fetch(`${this.baseURL}/api/email/status`, {
        method: 'GET',
        headers: this.getHeaders(),
        mode: 'cors'
      });

      console.log('🔍 [EmailService] Response status:', response.status);
      console.log('🔍 [EmailService] Response headers:', response.headers);
      
      const resultado = await response.json();
      console.log('🔍 [EmailService] Resultado verificación:', resultado);
      
      if (!response.ok) {
        console.error('❌ [EmailService] Error en verificación:', resultado);
        return false;
      }

      // Si el servicio responde OK, consideramos que está disponible
      // Incluso si auth.currentUser es null, el servicio backend está funcionando
      return true;
      
    } catch (error) {
      console.error('❌ [EmailService] Error al verificar servicio:', error);
      console.error('❌ [EmailService] Stack trace:', error.stack);
      
      // En caso de error de red, asumimos que el servicio no está disponible
      return false;
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
      console.log('🔍 [EmailService] Iniciando enviarRecordatorioPersonalizado');
      console.log('🔍 [EmailService] Datos recibidos:', datos);
      console.log('🔍 [EmailService] auth.currentUser:', auth.currentUser);
      
      // TEMPORAL: Para debug, usar email fijo si no hay usuario autenticado
      let emailTutor = auth.currentUser?.email;
      
      if (!emailTutor) {
        console.warn('⚠️ [EmailService] No hay usuario autenticado, usando email de debug');
        emailTutor = 'vazquezhector645@gmail.com'; // Email de debug temporal
      }
      
      console.log('🔍 [EmailService] Email del tutor (final):', emailTutor);

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

      console.log('🔍 [EmailService] Tipo de plantilla seleccionada:', tipoPlantilla);

      // Crear datos para el email con todos los campos específicos
      const datosEmail = {
        nombreNino: datos.nombreNino,
        nombreTutor: auth.currentUser?.displayName || datos.nombreTutor || 'Tutor',
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

      console.log('🔍 [EmailService] Datos finales del email:', datosEmail);
      console.log('🔍 [EmailService] URL del servicio:', this.baseURL);
      console.log('🔍 [EmailService] Headers:', this.getHeaders());
      
      const resultado = await this.enviarCorreo(emailTutor, tipoPlantilla, datosEmail);
      console.log('🔍 [EmailService] Resultado del envío:', resultado);
      
      return resultado;
    } catch (error) {
      console.error('Error enviando recordatorio personalizado:', error);
      throw error;
    }
  }
}

const emailService = new EmailService();
export default emailService;
