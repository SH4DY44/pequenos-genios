// Servicio para envío de notificaciones por email
// Integra con el sistema de email existente en email-service/

export const enviarNotificacionConfiguracion = async (config, perfilNino, tutorData) => {
  try {
    const emailData = {
      destinatario: tutorData.email,
      tipo: 'recordatorio_general',
      datos: {
        nombreTutor: tutorData.fullName || tutorData.displayName || tutorData.email,
        nombreNino: perfilNino.fullName,
        titulo: 'Configuración de horarios actualizada',
        mensaje: `Se ha actualizado la configuración de horarios para ${perfilNino.fullName}. Horario principal: ${config.recordatorios.horaEstudio}, ${config.recordatorios.diasSemana.length} días por semana.`,
        urlPlataforma: 'https://pequenosgenios.com',
        // Datos adicionales para referencia
        scheduleTime: config.recordatorios.horaEstudio,
        duration: config.metas.tiempoEstudioDiario,
        days: config.recordatorios.diasSemana,
        totalWeeklyHours: Math.round(config.metas.tiempoEstudioDiario * config.recordatorios.diasSemana.length / 60 * 10) / 10,
        activeDays: config.recordatorios.diasSemana.length,
        emailNotifications: config.recordatorios.notificacionesEmail,
        mobileNotifications: config.recordatorios.recordatoriosMovil
      }
    };

    // Intentar envío real siempre, con fallback a simulación
    try {
      const response = await fetch('http://localhost:3001/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'your-secure-api-key-here'
        },
        body: JSON.stringify(emailData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Notificación por email enviada exitosamente');
        return { success: true, data: result };
      } else {
        throw new Error(`Error del servicio de email: ${response.status}`);
      }
    } catch (fetchError) {
      console.warn('⚠️ Servicio de email no disponible, simulando envío:', fetchError.message);
      
      // En desarrollo, simular el envío como fallback
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Simulando envío de email (fallback):', emailData);
        
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return { success: true, message: 'Email simulado enviado correctamente (fallback)' };
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('❌ Error enviando notificación por email:', error);
    return { success: false, error: error.message };
  }
};

export const enviarRecordatorioRutina = async (rutina, perfilNino, tutorData) => {
  try {
    const emailData = {
      destinatario: tutorData.email,
      tipo: 'recordatorio_general',
      datos: {
        nombreTutor: tutorData.fullName || tutorData.displayName || tutorData.email,
        nombreNino: perfilNino.fullName,
        titulo: `Recordatorio: ${rutina.nombre}`,
        mensaje: `Es hora de la rutina "${rutina.nombre}" para ${perfilNino.fullName}. Programada para las ${rutina.hora} con duración de ${rutina.duracion} minutos.`,
        urlPlataforma: 'https://pequenosgenios.com',
        // Datos adicionales para referencia
        routineName: rutina.nombre,
        routineDescription: rutina.descripcion,
        scheduleTime: rutina.hora,
        duration: rutina.duracion,
        today: new Date().toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
    };

    // En desarrollo, simular el envío
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Simulando recordatorio por email:', emailData);
      return { success: true, message: 'Recordatorio simulado enviado correctamente' };
    }

    // En producción, hacer petición real
    const response = await fetch('http://localhost:3001/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'your-secure-api-key-here'
      },
      body: JSON.stringify(emailData)
    });

    if (response.ok) {
      console.log('✅ Recordatorio de rutina enviado exitosamente');
      return { success: true };
    } else {
      throw new Error('Error enviando recordatorio');
    }
  } catch (error) {
    console.error('❌ Error enviando recordatorio de rutina:', error);
    return { success: false, error: error.message };
  }
};

export const enviarResumenSemanal = async (estadisticas, perfilNino, tutorData) => {
  try {
    const emailData = {
      destinatario: tutorData.email,
      tipo: 'resumen_semanal',
      datos: {
        nombreTutor: tutorData.fullName || tutorData.displayName || tutorData.email,
        nombreNino: perfilNino.fullName,
        actividadesCompletadas: estadisticas.actividadesCompletadas || 0,
        tiempoTotal: estadisticas.tiempoEstudioSemanal || '0h',
        puntosTotales: estadisticas.puntosTotales || 0,
        racha: estadisticas.racha || 0,
        // Datos adicionales para referencia
        weekStats: {
          completedActivities: estadisticas.actividadesCompletadas,
          totalPoints: estadisticas.puntosTotales,
          stars: estadisticas.estrellas,
          achievements: estadisticas.logros,
          streak: estadisticas.racha,
          weeklyAverage: estadisticas.promedioSemanal,
          studyTime: estadisticas.tiempoEstudioSemanal,
          goalCompletion: estadisticas.metaCumplimiento
        },
        weekPeriod: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES'),
          end: new Date().toLocaleDateString('es-ES')
        }
      }
    };

    // En desarrollo, simular el envío
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Simulando resumen semanal por email:', emailData);
      return { success: true, message: 'Resumen semanal simulado enviado correctamente' };
    }

    // En producción, hacer petición real
    const response = await fetch('http://localhost:3001/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'your-secure-api-key-here'
      },
      body: JSON.stringify(emailData)
    });

    if (response.ok) {
      console.log('✅ Resumen semanal enviado exitosamente');
      return { success: true };
    } else {
      throw new Error('Error enviando resumen semanal');
    }
  } catch (error) {
    console.error('❌ Error enviando resumen semanal:', error);
    return { success: false, error: error.message };
  }
};
