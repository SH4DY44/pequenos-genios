const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');
const EmailTemplates = require('./emailTemplates');

class EmailService {
  constructor() {
    this.transporter = null;
    this.templates = new EmailTemplates();
    this.initializeTransporter();
  }

  /**
   * Inicializar el transporter de nodemailer
   */
  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: config.gmail.user,
          pass: config.gmail.password
        },
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        rateLimit: 10 // 10 correos por segundo máximo
      });

      logger.info('Transporter de email inicializado correctamente');
    } catch (error) {
      logger.error('Error inicializando transporter:', error);
      throw error;
    }
  }

  /**
   * Verificar la conexión con Gmail
   */
  async verificarConexion() {
    try {
      await this.transporter.verify();
      logger.info('Conexión con Gmail verificada exitosamente');
      return true;
    } catch (error) {
      logger.error('Error verificando conexión con Gmail:', error);
      return false;
    }
  }

  /**
   * Enviar correo electrónico
   */
  async enviarCorreo(destinatario, tipo, datos) {
    try {
      // Validar parámetros
      if (!destinatario || !tipo || !datos) {
        throw new Error('Parámetros requeridos: destinatario, tipo, datos');
      }

      // Obtener plantilla
      const template = this.templates.obtenerPlantilla(tipo, datos);
      
      if (!template) {
        throw new Error(`Plantilla no encontrada para tipo: ${tipo}`);
      }

      // Configurar opciones del correo
      const mailOptions = {
        from: `"${config.email.fromName}" <${config.email.fromEmail}>`,
        to: destinatario,
        subject: template.subject,
        html: template.html,
        text: template.text || this.htmlToText(template.html)
      };

      // Enviar correo
      const info = await this.transporter.sendMail(mailOptions);
      
      logger.info('Correo enviado exitosamente', {
        destinatario,
        tipo,
        messageId: info.messageId,
        subject: template.subject
      });

      return {
        success: true,
        messageId: info.messageId,
        destinatario,
        tipo,
        subject: template.subject,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error enviando correo:', {
        destinatario,
        tipo,
        error: error.message,
        stack: error.stack
      });
      
      throw new Error(`Error enviando correo: ${error.message}`);
    }
  }

  /**
   * Enviar múltiples correos
   */
  async enviarMultiples(correos) {
    const resultados = [];
    
    for (const correo of correos) {
      try {
        const resultado = await this.enviarCorreo(
          correo.destinatario,
          correo.tipo,
          correo.datos
        );
        resultados.push(resultado);
      } catch (error) {
        resultados.push({
          success: false,
          destinatario: correo.destinatario,
          tipo: correo.tipo,
          error: error.message
        });
      }
    }
    
    return resultados;
  }

  /**
   * Convertir HTML a texto plano básico
   */
  htmlToText(html) {
    return html
      .replace(/<[^>]*>/g, '') // Remover tags HTML
      .replace(/&nbsp;/g, ' ') // Reemplazar espacios HTML
      .replace(/&amp;/g, '&') // Reemplazar &
      .replace(/&lt;/g, '<') // Reemplazar <
      .replace(/&gt;/g, '>') // Reemplazar >
      .trim();
  }

  /**
   * Obtener estadísticas del servicio
   */
  async obtenerEstadisticas() {
    try {
      const conexionOk = await this.verificarConexion();
      
      return {
        servicio: 'Email Service',
        estado: conexionOk ? 'ACTIVO' : 'INACTIVO',
        configuracion: {
          usuario: config.gmail.user,
          servidor: 'Gmail SMTP',
          puerto: 587,
          seguridad: 'TLS'
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error obteniendo estadísticas:', error);
      return {
        servicio: 'Email Service',
        estado: 'ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = new EmailService();
