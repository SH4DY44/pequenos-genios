// src/services/whatsappService.js

export class WhatsAppService {
  
  // Opción 1: WhatsApp Web (Más fácil - abre WhatsApp)
  static enviarPorWhatsAppWeb(telefono, mensaje) {
    // Limpiar número (solo dígitos)
    const numeroLimpio = telefono.replace(/\D/g, '');
    
    // Crear URL de WhatsApp
    const url = `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
    
    // Abrir WhatsApp Web
    window.open(url, '_blank');
    
    return { success: true, method: 'whatsapp_web' };
  }

  // Crear mensajes personalizados
  static crearMensaje(tipo, datos) {
    const mensajes = {
      actividad_pendiente: `🎯 *Pequeños Genios*\n\nHola! ${datos.nombreNino} no ha realizado actividades en ${datos.horasSinActividad} horas.\n\n¡Es hora de practicar! 🚀\n\nAccede aquí: ${window.location.origin}/console`,
      
      logro_alcanzado: `🏆 *¡Nuevo Logro!*\n\n¡Felicitaciones! ${datos.nombreNino} ha desbloqueado:\n\n*"${datos.logro}"*\n+${datos.puntos} puntos ⭐\n\n¡Sigue así!`,
      
      resumen_semanal: `📊 *Resumen Semanal*\n\nProgreso de ${datos.nombreNino}:\n• ${datos.actividadesCompletadas} actividades\n• ${datos.tiempoTotal} minutos\n• ${datos.puntosTotales} puntos totales\n\n¡Excelente trabajo! 👏`,
      
      recordatorio_uso: `⏰ *Hora de Practicar*\n\nEs momento de que ${datos.nombreNino} practique sus actividades diarias.\n\n¡Solo 15-20 minutos! 💪\n\nAccede: ${window.location.origin}/console`,

      evaluacion_recomendada: `📋 *Evaluación Recomendada*\n\nHola! Recomendamos una nueva evaluación para ${datos.nombreNino}.\n\n${datos.razon}\n\nAccede: ${window.location.origin}/evaluation`
    };
    
    return mensajes[tipo] || `📢 Tienes una nueva notificación de *Pequeños Genios* sobre ${datos.nombreNino}`;
  }

  // Método súper simple - solo abre WhatsApp
  static notificarRapido(telefono, nombreNino, mensaje) {
    const textoCompleto = `🎯 *Pequeños Genios*\n\nHola! Sobre ${nombreNino}:\n\n${mensaje}\n\nAccede a la plataforma: ${window.location.origin}`;
    
    return this.enviarPorWhatsAppWeb(telefono, textoCompleto);
  }

  // Validar número de teléfono
  static validarTelefono(telefono) {
    // Limpiar el número
    const numeroLimpio = telefono.replace(/\D/g, '');
    
    // Validar que tenga al menos 10 dígitos
    if (numeroLimpio.length < 10) {
      return { valido: false, error: 'El número debe tener al menos 10 dígitos' };
    }
    
    // Validar que tenga máximo 15 dígitos (estándar internacional)
    if (numeroLimpio.length > 15) {
      return { valido: false, error: 'El número es demasiado largo' };
    }
    
    return { valido: true, numeroLimpio };
  }

  // Formatear número para mostrar
  static formatearTelefono(telefono) {
    const numeroLimpio = telefono.replace(/\D/g, '');
    
    // Si es número mexicano (10 dígitos), formatearlo
    if (numeroLimpio.length === 10) {
      return `+52 ${numeroLimpio.slice(0, 3)} ${numeroLimpio.slice(3, 6)} ${numeroLimpio.slice(6)}`;
    }
    
    // Si ya tiene código de país, formatearlo básico
    if (numeroLimpio.length > 10) {
      return `+${numeroLimpio}`;
    }
    
    return telefono;
  }

  // Método para notificar con validación
  static async notificarConValidacion(telefono, tipo, datos) {
    try {
      // Validar teléfono
      const validacion = this.validarTelefono(telefono);
      if (!validacion.valido) {
        return { success: false, error: validacion.error };
      }

      // Crear mensaje
      const mensaje = this.crearMensaje(tipo, datos);
      
      // Enviar
      const resultado = this.enviarPorWhatsAppWeb(telefono, mensaje);
      
      return {
        success: true,
        message: 'WhatsApp abierto exitosamente',
        telefono: this.formatearTelefono(telefono),
        ...resultado
      };

    } catch (error) {
      console.error('Error enviando WhatsApp:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener estadísticas de uso (para desarrollo)
  static getStats() {
    return {
      tiposDisponibles: ['actividad_pendiente', 'logro_alcanzado', 'resumen_semanal', 'recordatorio_uso', 'evaluacion_recomendada'],
      metodosEnvio: ['WhatsApp Web'],
      costo: 'Gratis',
      tiempoSetup: '2 minutos',
      facilidad: '⭐⭐⭐⭐⭐'
    };
  }
}