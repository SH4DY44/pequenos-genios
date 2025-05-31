// src/services/whatsappService.js

export class WhatsAppService {
  
  // ✅ MEJORADO: WhatsApp Web con mejor manejo de URLs
  static enviarPorWhatsAppWeb(telefono, mensaje) {
    try {
      // Limpiar número (solo dígitos)
      const numeroLimpio = telefono.replace(/\D/g, '');
      
      // Validar número antes de enviar
      const validacion = this.validarTelefono(numeroLimpio);
      if (!validacion.valido) {
        throw new Error(validacion.error);
      }
      
      // Crear URL de WhatsApp
      const url = `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
      
      // Abrir WhatsApp Web
      window.open(url, '_blank');
      
      return { 
        success: true, 
        method: 'whatsapp_web', 
        url: url,
        numeroEnviado: this.formatearTelefono(numeroLimpio)
      };
    } catch (error) {
      console.error('Error enviando WhatsApp:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // ✅ MEJORADO: Crear mensajes personalizados con URLs más robustas
  static crearMensaje(tipo, datos) {
    // ✅ CORREGIDO: URL más robusta que funciona en SSR
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'https://pequenos-genios.app'; // URL de producción como fallback

    const mensajes = {
      actividad_pendiente: `🎯 *Pequeños Genios*\n\nHola! ${datos.nombreNino} no ha realizado actividades en ${datos.horasSinActividad} horas.\n\n¡Es hora de practicar! 🚀\n\nAccede aquí: ${baseUrl}/console`,
      
      logro_alcanzado: `🏆 *¡Nuevo Logro!*\n\n¡Felicitaciones! ${datos.nombreNino} ha desbloqueado:\n\n*"${datos.logro}"*\n+${datos.puntos} puntos ⭐\n\n¡Sigue así!`,
      
      resumen_semanal: `📊 *Resumen Semanal*\n\nProgreso de ${datos.nombreNino}:\n• ${datos.actividadesCompletadas} actividades\n• ${datos.tiempoTotal} minutos\n• ${datos.puntosTotales} puntos totales\n• Racha: ${datos.racha} días\n\n¡Excelente trabajo! 👏`,
      
      recordatorio_uso: `⏰ *Hora de Practicar*\n\nEs momento de que ${datos.nombreNino} practique sus actividades diarias.\n\n¡Solo 15-20 minutos! 💪\n\nAccede: ${baseUrl}/console`,

      evaluacion_recomendada: `📋 *Evaluación Recomendada*\n\nHola! Recomendamos una nueva evaluación para ${datos.nombreNino}.\n\n${datos.razon}\n\nAccede: ${baseUrl}/evaluation`
    };
    
    return mensajes[tipo] || `📢 Tienes una nueva notificación de *Pequeños Genios* sobre ${datos.nombreNino}`;
  }

  // ✅ MEJORADO: Método súper simple con mejor URL handling
  static notificarRapido(telefono, nombreNino, mensaje) {
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'https://pequenos-genios.app';
      
    const textoCompleto = `🎯 *Pequeños Genios*\n\nHola! Sobre ${nombreNino}:\n\n${mensaje}\n\nAccede a la plataforma: ${baseUrl}`;
    
    return this.enviarPorWhatsAppWeb(telefono, textoCompleto);
  }

  // ✅ MEJORADO: Validar número de teléfono con más países
  static validarTelefono(telefono) {
    // Limpiar el número
    const numeroLimpio = telefono.replace(/\D/g, '');
    
    // Validar que no esté vacío
    if (!numeroLimpio) {
      return { valido: false, error: 'El número de teléfono es requerido' };
    }
    
    // Validar que tenga al menos 7 dígitos (números locales cortos)
    if (numeroLimpio.length < 7) {
      return { valido: false, error: 'El número debe tener al menos 7 dígitos' };
    }
    
    // Validar que tenga máximo 15 dígitos (estándar internacional E.164)
    if (numeroLimpio.length > 15) {
      return { valido: false, error: 'El número es demasiado largo (máximo 15 dígitos)' };
    }

    // ✅ AGREGADO: Validaciones específicas por longitud
    if (numeroLimpio.length === 10) {
      // Número mexicano o estadounidense
      return { valido: true, numeroLimpio, pais: 'mx_us' };
    } else if (numeroLimpio.length === 11 && numeroLimpio.startsWith('1')) {
      // Número estadounidense con código de país
      return { valido: true, numeroLimpio, pais: 'us' };
    } else if (numeroLimpio.length === 12 && numeroLimpio.startsWith('52')) {
      // Número mexicano con código de país
      return { valido: true, numeroLimpio, pais: 'mx' };
    } else if (numeroLimpio.length >= 7 && numeroLimpio.length <= 15) {
      // Otros países - formato internacional
      return { valido: true, numeroLimpio, pais: 'internacional' };
    }
    
    return { valido: true, numeroLimpio, pais: 'desconocido' };
  }

  // ✅ MEJORADO: Formatear número para mostrar con mejor detección de países
  static formatearTelefono(telefono) {
    const numeroLimpio = telefono.replace(/\D/g, '');
    
    // Número mexicano sin código de país (10 dígitos)
    if (numeroLimpio.length === 10 && !numeroLimpio.startsWith('1')) {
      return `+52 ${numeroLimpio.slice(0, 3)} ${numeroLimpio.slice(3, 6)} ${numeroLimpio.slice(6)}`;
    }
    
    // Número estadounidense sin código de país (10 dígitos que empiezan con área válida)
    if (numeroLimpio.length === 10 && numeroLimpio.charAt(0) >= '2') {
      return `+1 ${numeroLimpio.slice(0, 3)} ${numeroLimpio.slice(3, 6)} ${numeroLimpio.slice(6)}`;
    }
    
    // Número con código de país mexicano (+52)
    if (numeroLimpio.length === 12 && numeroLimpio.startsWith('52')) {
      const numero = numeroLimpio.slice(2);
      return `+52 ${numero.slice(0, 3)} ${numero.slice(3, 6)} ${numero.slice(6)}`;
    }
    
    // Número con código de país estadounidense (+1)
    if (numeroLimpio.length === 11 && numeroLimpio.startsWith('1')) {
      const numero = numeroLimpio.slice(1);
      return `+1 ${numero.slice(0, 3)} ${numero.slice(3, 6)} ${numero.slice(6)}`;
    }
    
    // Otros números internacionales - formato básico
    if (numeroLimpio.length > 10) {
      return `+${numeroLimpio}`;
    }
    
    // Formato por defecto
    return telefono;
  }

  // ✅ MEJORADO: Método para notificar con validación completa
  static async notificarConValidacion(telefono, tipo, datos) {
    try {
      // Validar teléfono
      const validacion = this.validarTelefono(telefono);
      if (!validacion.valido) {
        return { success: false, error: validacion.error };
      }

      // Validar datos requeridos
      if (!datos.nombreNino) {
        return { success: false, error: 'El nombre del niño es requerido' };
      }

      // Crear mensaje
      const mensaje = this.crearMensaje(tipo, datos);
      
      // Enviar
      const resultado = this.enviarPorWhatsAppWeb(validacion.numeroLimpio, mensaje);
      
      if (resultado.success) {
        return {
          success: true,
          message: 'WhatsApp abierto exitosamente',
          telefono: this.formatearTelefono(validacion.numeroLimpio),
          tipo: tipo,
          pais: validacion.pais,
          ...resultado
        };
      } else {
        return resultado;
      }

    } catch (error) {
      console.error('Error enviando WhatsApp:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ✅ AGREGADO: Método para detectar automáticamente el país
  static detectarPais(telefono) {
    const numeroLimpio = telefono.replace(/\D/g, '');
    
    const paises = {
      '1': { nombre: 'Estados Unidos/Canadá', codigo: 'US/CA', formato: '+1 XXX XXX XXXX' },
      '52': { nombre: 'México', codigo: 'MX', formato: '+52 XXX XXX XXXX' },
      '34': { nombre: 'España', codigo: 'ES', formato: '+34 XXX XXX XXX' },
      '54': { nombre: 'Argentina', codigo: 'AR', formato: '+54 XXX XXX XXXX' },
      '57': { nombre: 'Colombia', codigo: 'CO', formato: '+57 XXX XXX XXXX' },
    };

    // Detectar por código de país
    for (const [codigo, info] of Object.entries(paises)) {
      if (numeroLimpio.startsWith(codigo)) {
        return { 
          detectado: true, 
          codigo: codigo, 
          ...info,
          numeroCompleto: numeroLimpio
        };
      }
    }

    // Detectar por longitud sin código de país
    if (numeroLimpio.length === 10) {
      return {
        detectado: false,
        posibles: ['México (+52)', 'Estados Unidos (+1)'],
        numeroCompleto: numeroLimpio,
        recomendacion: 'Agregar código de país para mayor precisión'
      };
    }

    return {
      detectado: false,
      numeroCompleto: numeroLimpio,
      recomendacion: 'Formato no reconocido'
    };
  }

  // ✅ AGREGADO: Método para obtener ejemplos de formato
  static obtenerEjemplosFormato() {
    return {
      mexico: {
        sinCodigo: '5551234567',
        conCodigo: '+525551234567',
        formatted: '+52 555 123 4567'
      },
      estadosUnidos: {
        sinCodigo: '5551234567',
        conCodigo: '+15551234567',
        formatted: '+1 555 123 4567'
      },
      internacional: {
        ejemplo: '+34612345678',
        formato: '+[código país][número]'
      }
    };
  }

  // ✅ MEJORADO: Obtener estadísticas de uso más completas
  static getStats() {
    return {
      tiposDisponibles: [
        'actividad_pendiente', 
        'logro_alcanzado', 
        'resumen_semanal', 
        'recordatorio_uso', 
        'evaluacion_recomendada'
      ],
      metodosEnvio: ['WhatsApp Web'],
      paisesCompatibles: ['México', 'Estados Unidos', 'Internacional'],
      caracteristicas: {
        costo: 'Gratis',
        tiempoSetup: '2 minutos',
        facilidad: '⭐⭐⭐⭐⭐',
        compatibilidad: 'Todos los navegadores',
        limitaciones: 'Requiere WhatsApp instalado'
      },
      formatosAceptados: this.obtenerEjemplosFormato()
    };
  }

  // ✅ AGREGADO: Método para testing en desarrollo
  static async probarEnvio(telefono, mensaje = 'Mensaje de prueba desde Pequeños Genios') {
    if (process.env.NODE_ENV !== 'development') {
      return { success: false, error: 'Solo disponible en desarrollo' };
    }

    return this.notificarRapido(telefono, 'Niño de Prueba', mensaje);
  }

  // ✅ AGREGADO: Validador de mensajes
  static validarMensaje(mensaje) {
    if (!mensaje || typeof mensaje !== 'string') {
      return { valido: false, error: 'El mensaje es requerido' };
    }

    if (mensaje.length > 4096) {
      return { valido: false, error: 'El mensaje es demasiado largo (máximo 4096 caracteres)' };
    }

    if (mensaje.trim().length === 0) {
      return { valido: false, error: 'El mensaje no puede estar vacío' };
    }

    return { valido: true };
  }

  // ✅ AGREGADO: Método para envío masivo (si se necesita en el futuro)
  static async enviarMasivo(contactos, tipo, datos) {
    const resultados = [];
    
    for (const contacto of contactos) {
      try {
        const resultado = await this.notificarConValidacion(
          contacto.telefono, 
          tipo, 
          { ...datos, nombreNino: contacto.nombreNino }
        );
        
        resultados.push({
          contacto: contacto.nombreNino,
          telefono: contacto.telefono,
          ...resultado
        });
        
        // Pequeña pausa para no saturar
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        resultados.push({
          contacto: contacto.nombreNino,
          telefono: contacto.telefono,
          success: false,
          error: error.message
        });
      }
    }
    
    return {
      total: contactos.length,
      exitosos: resultados.filter(r => r.success).length,
      fallidos: resultados.filter(r => !r.success).length,
      resultados
    };
  }
}