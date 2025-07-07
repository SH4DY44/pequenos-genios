const logger = require('../config/logger');

class EmailTemplates {
  constructor() {
    this.baseStyles = this.getBaseStyles();
  }

  /**
   * Obtener estilos base para todas las plantillas
   */
  getBaseStyles() {
    return `
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 30px 20px;
        }
        .content h2 {
          color: #2c3e50;
          margin-top: 0;
          font-size: 24px;
        }
        .content p {
          font-size: 16px;
          margin-bottom: 15px;
        }
        .button {
          display: inline-block;
          background: #4A90E2;
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: 600;
          margin: 20px 0;
          transition: background 0.3s;
        }
        .button:hover {
          background: #357ABD;
        }
        .stats-card {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .stats-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #e9ecef;
        }
        .stats-item:last-child {
          border-bottom: none;
        }
        .emoji {
          font-size: 20px;
          margin-right: 10px;
        }
        .footer {
          background: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: #6c757d;
        }
        .highlight {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 5px;
          padding: 15px;
          margin: 20px 0;
        }
        @media (max-width: 600px) {
          .container {
            margin: 0;
            border-radius: 0;
          }
          .content {
            padding: 20px 15px;
          }
          .header {
            padding: 20px 15px;
          }
        }
      </style>
    `;
  }

  /**
   * Obtener plantilla por tipo
   */
  obtenerPlantilla(tipo, datos) {
    const plantillas = {
      actividad_pendiente: this.actividadPendiente(datos),
      logro_alcanzado: this.logroAlcanzado(datos),
      resumen_semanal: this.resumenSemanal(datos),
      bienvenida: this.bienvenida(datos),
      recompensa_disponible: this.recompensaDisponible(datos),
      recordatorio_evaluacion: this.recordatorioEvaluacion(datos),
      sesion_completada: this.sesionCompletada(datos)
    };

    const plantilla = plantillas[tipo];
    
    if (!plantilla) {
      logger.warn(`Plantilla no encontrada para tipo: ${tipo}`);
      return null;
    }

    return plantilla;
  }

  /**
   * Plantilla: Actividad Pendiente
   */
  actividadPendiente(datos) {
    const {
      nombreNino = 'el niño',
      nombreTutor = 'Papá/Mamá',
      horasSinActividad = 24,
      urlPlataforma = 'https://pequenosgenios.com'
    } = datos;

    return {
      subject: `🎯 ${nombreNino} - Recordatorio de actividad`,
      html: `
        ${this.baseStyles}
        <div class="container">
          <div class="header">
            <h1>🎯 Pequeños Genios</h1>
            <p>Recordatorio de Actividad</p>
          </div>
          <div class="content">
            <h2>¡Hola ${nombreTutor}!</h2>
            <p>Notamos que <strong>${nombreNino}</strong> no ha realizado actividades en las últimas <strong>${horasSinActividad} horas</strong>.</p>
            
            <div class="highlight">
              <p><strong>💡 Recuerda:</strong> La práctica constante es clave para el desarrollo de habilidades cognitivas en los niños.</p>
            </div>
            
            <p>¡Es hora de que ${nombreNino} continúe con su aventura de aprendizaje! 🚀</p>
            
            <div style="text-align: center;">
              <a href="${urlPlataforma}/console" class="button">
                Acceder a la Plataforma
              </a>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 Pequeños Genios - Desarrollando mentes brillantes</p>
          </div>
        </div>
      `
    };
  }

  /**
   * Plantilla: Logro Alcanzado
   */
  logroAlcanzado(datos) {
    const {
      nombreNino = 'el niño',
      nombreTutor = 'Papá/Mamá',
      logro = 'Nuevo Logro',
      puntos = 0,
      descripcion = 'Ha alcanzado un nuevo logro'
    } = datos;

    return {
      subject: `🏆 ${nombreNino} - ¡Nuevo Logro Desbloqueado!`,
      html: `
        ${this.baseStyles}
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #333;">
            <h1>🏆 ¡Nuevo Logro!</h1>
            <p>¡Felicitaciones!</p>
          </div>
          <div class="content">
            <h2>¡Excelente trabajo ${nombreTutor}!</h2>
            <p><strong>${nombreNino}</strong> ha alcanzado un nuevo hito en su aprendizaje:</p>
            
            <div class="stats-card">
              <div style="text-align: center;">
                <h3 style="color: #4A90E2; margin: 0 0 10px 0;">"${logro}"</h3>
                <p style="font-size: 18px; margin: 0;"><span class="emoji">⭐</span> +${puntos} puntos</p>
                ${descripcion ? `<p style="margin-top: 15px; font-style: italic;">${descripcion}</p>` : ''}
              </div>
            </div>
            
            <p>Los logros como este demuestran el progreso constante y la dedicación de ${nombreNino}. ¡Sigue así!</p>
            
            <div style="text-align: center;">
              <a href="${datos.urlPlataforma}/console/estadisticas" class="button">
                Ver Más Estadísticas
              </a>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 Pequeños Genios - Celebrando cada logro</p>
          </div>
        </div>
      `
    };
  }

  /**
   * Plantilla: Resumen Semanal
   */
  resumenSemanal(datos) {
    const {
      nombreNino = 'el niño',
      nombreTutor = 'Papá/Mamá',
      actividadesCompletadas = 0,
      tiempoTotal = 0,
      puntosTotales = 0,
      racha = 0,
      semana = 'esta semana'
    } = datos;

    return {
      subject: `📊 Resumen semanal de ${nombreNino}`,
      html: `
        ${this.baseStyles}
        <div class="container">
          <div class="header">
            <h1>📊 Resumen Semanal</h1>
            <p>Progreso de ${nombreNino}</p>
          </div>
          <div class="content">
            <h2>¡Hola ${nombreTutor}!</h2>
            <p>Aquí tienes el resumen del progreso de <strong>${nombreNino}</strong> durante ${semana}:</p>
            
            <div class="stats-card">
              <div class="stats-item">
                <span><span class="emoji">📚</span> Actividades completadas</span>
                <strong>${actividadesCompletadas}</strong>
              </div>
              <div class="stats-item">
                <span><span class="emoji">⏰</span> Tiempo total de práctica</span>
                <strong>${tiempoTotal} minutos</strong>
              </div>
              <div class="stats-item">
                <span><span class="emoji">⭐</span> Puntos totales</span>
                <strong>${puntosTotales}</strong>
              </div>
              <div class="stats-item">
                <span><span class="emoji">🔥</span> Racha actual</span>
                <strong>${racha} días</strong>
              </div>
            </div>
            
            <div class="highlight">
              <p><strong>¡Excelente trabajo!</strong> ${nombreNino} está desarrollando habilidades importantes de manera constante. 👏</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${datos.urlPlataforma}/console/estadisticas" class="button">
                Ver Estadísticas Completas
              </a>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 Pequeños Genios - Midiendo el progreso</p>
          </div>
        </div>
      `
    };
  }

  /**
   * Plantilla: Bienvenida
   */
  bienvenida(datos) {
    const {
      nombreTutor = 'Papá/Mamá',
      nombreNino = 'el niño',
      urlPlataforma = 'https://pequenosgenios.com'
    } = datos;

    return {
      subject: `🎉 ¡Bienvenido a Pequeños Genios!`,
      html: `
        ${this.baseStyles}
        <div class="container">
          <div class="header">
            <h1>🎉 ¡Bienvenido!</h1>
            <p>Tu aventura de aprendizaje comienza aquí</p>
          </div>
          <div class="content">
            <h2>¡Hola ${nombreTutor}!</h2>
            <p>Nos emociona tenerte en <strong>Pequeños Genios</strong>, la plataforma educativa que ayudará a <strong>${nombreNino}</strong> a desarrollar habilidades cognitivas importantes.</p>
            
            <div class="stats-card">
              <h3 style="color: #4A90E2; margin-top: 0;">¿Qué puedes hacer?</h3>
              <div class="stats-item">
                <span><span class="emoji">🎯</span> Actividades personalizadas</span>
                <span>Adaptadas a la edad y nivel</span>
              </div>
              <div class="stats-item">
                <span><span class="emoji">📊</span> Seguimiento de progreso</span>
                <span>Estadísticas detalladas</span>
              </div>
              <div class="stats-item">
                <span><span class="emoji">🏆</span> Sistema de recompensas</span>
                <span>Logros y reconocimientos</span>
              </div>
              <div class="stats-item">
                <span><span class="emoji">🔔</span> Recordatorios automáticos</span>
                <span>Nunca olvides una sesión</span>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="${urlPlataforma}/console" class="button">
                Comenzar Ahora
              </a>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 Pequeños Genios - Construyendo el futuro, un niño a la vez</p>
          </div>
        </div>
      `
    };
  }

  /**
   * Plantilla: Recompensa Disponible
   */
  recompensaDisponible(datos) {
    const {
      nombreNino = 'el niño',
      nombreTutor = 'Papá/Mamá',
      recompensa = 'Nueva Recompensa',
      puntosRequeridos = 0,
      puntosActuales = 0
    } = datos;

    return {
      subject: `🎁 ${nombreNino} - ¡Recompensa Disponible!`,
      html: `
        ${this.baseStyles}
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);">
            <h1>🎁 ¡Recompensa Lista!</h1>
            <p>¡${nombreNino} puede reclamar una recompensa!</p>
          </div>
          <div class="content">
            <h2>¡Felicitaciones ${nombreTutor}!</h2>
            <p><strong>${nombreNino}</strong> ha acumulado suficientes puntos para desbloquear una nueva recompensa:</p>
            
            <div class="stats-card">
              <div style="text-align: center;">
                <h3 style="color: #9b59b6; margin: 0 0 15px 0;">${recompensa}</h3>
                <p><span class="emoji">⭐</span> ${puntosActuales} / ${puntosRequeridos} puntos</p>
                <div style="background: #e8f5e8; border-radius: 10px; padding: 5px; margin: 10px 0;">
                  <div style="background: #4CAF50; height: 20px; border-radius: 10px; width: ${(puntosActuales / puntosRequeridos) * 100}%;"></div>
                </div>
              </div>
            </div>
            
            <p>¡Es hora de celebrar este logro! Las recompensas motivan a ${nombreNino} a seguir aprendiendo.</p>
            
            <div style="text-align: center;">
              <a href="${datos.urlPlataforma}/console/recompensas" class="button">
                Ver Recompensas
              </a>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 Pequeños Genios - Recompensando el esfuerzo</p>
          </div>
        </div>
      `
    };
  }

  /**
   * Plantilla: Recordatorio de Evaluación
   */
  recordatorioEvaluacion(datos) {
    const {
      nombreNino = 'el niño',
      nombreTutor = 'Papá/Mamá',
      tipoEvaluacion = 'evaluación',
      fechaLimite = ''
    } = datos;

    return {
      subject: `📋 ${nombreNino} - Recordatorio de Evaluación`,
      html: `
        ${this.baseStyles}
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);">
            <h1>📋 Recordatorio</h1>
            <p>Evaluación Pendiente</p>
          </div>
          <div class="content">
            <h2>¡Hola ${nombreTutor}!</h2>
            <p>Recordamos que <strong>${nombreNino}</strong> tiene una <strong>${tipoEvaluacion}</strong> pendiente.</p>
            
            ${fechaLimite ? `
              <div class="highlight">
                <p><strong>📅 Fecha límite:</strong> ${fechaLimite}</p>
              </div>
            ` : ''}
            
            <p>Las evaluaciones nos ayudan a:</p>
            <ul>
              <li>Medir el progreso de ${nombreNino}</li>
              <li>Adaptar las actividades a su nivel</li>
              <li>Identificar áreas de mejora</li>
              <li>Celebrar los logros alcanzados</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${datos.urlPlataforma}/evaluation" class="button">
                Realizar Evaluación
              </a>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 Pequeños Genios - Evaluando el progreso</p>
          </div>
        </div>
      `
    };
  }

  /**
   * Plantilla: Sesión Completada
   */
  sesionCompletada(datos) {
    const {
      nombreNino = 'el niño',
      nombreTutor = 'Papá/Mamá',
      duracion = 0,
      actividades = 0,
      puntos = 0,
      precision = 0
    } = datos;

    return {
      subject: `✅ ${nombreNino} - Sesión Completada`,
      html: `
        ${this.baseStyles}
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #27ae60 0%, #229954 100%);">
            <h1>✅ ¡Sesión Completada!</h1>
            <p>Excelente trabajo</p>
          </div>
          <div class="content">
            <h2>¡Muy bien ${nombreTutor}!</h2>
            <p><strong>${nombreNino}</strong> acaba de completar una sesión de práctica. Aquí está el resumen:</p>
            
            <div class="stats-card">
              <div class="stats-item">
                <span><span class="emoji">⏱️</span> Duración</span>
                <strong>${duracion} minutos</strong>
              </div>
              <div class="stats-item">
                <span><span class="emoji">🎯</span> Actividades</span>
                <strong>${actividades}</strong>
              </div>
              <div class="stats-item">
                <span><span class="emoji">⭐</span> Puntos ganados</span>
                <strong>+${puntos}</strong>
              </div>
              <div class="stats-item">
                <span><span class="emoji">🎯</span> Precisión</span>
                <strong>${precision}%</strong>
              </div>
            </div>
            
            <p>¡Cada sesión es un paso hacia el desarrollo de habilidades importantes! 🚀</p>
            
            <div style="text-align: center;">
              <a href="${datos.urlPlataforma}/console/estadisticas" class="button">
                Ver Progreso Completo
              </a>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 Pequeños Genios - Cada sesión cuenta</p>
          </div>
        </div>
      `
    };
  }
}

module.exports = EmailTemplates;
