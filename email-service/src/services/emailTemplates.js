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
      sesion_completada: this.sesionCompletada(datos),
      // Nuevas plantillas para recordatorios específicos
      recordatorio_general: this.recordatorioGeneral(datos),
      recordatorio_medicamento: this.recordatorioMedicamento(datos),
      recordatorio_cita_medica: this.recordatorioCitaMedica(datos),
      recordatorio_tarea_escolar: this.recordatorioTareaEscolar(datos),
      // 🤖 Nuevas plantillas automáticas inteligentes
      recordatorio_automatico: this.recordatorioAutomatico(datos),
      recordatorio_inactividad: this.recordatorioInactividad(datos),
      recordatorio_racha_perdida: this.recordatorioRachaPerdida(datos),
      recordatorio_meta_semanal: this.recordatorioMetaSemanal(datos),
      recordatorio_actividad_favorita: this.recordatorioActividadFavorita(datos),
      recordatorio_area_rezagada: this.recordatorioAreaRezagada(datos),
      recordatorio_cerca_logro: this.recordatorioCercaLogro(datos),
      recordatorio_estrellas_acumuladas: this.recordatorioEstrellasAcumuladas(datos),
      recordatorio_rutina_diaria: this.recordatorioRutinaDiaria(datos),
      recordatorio_fin_semana: this.recordatorioFinSemana(datos),
      felicitacion_progreso: this.felicitacionProgreso(datos)
    };

    const plantilla = plantillas[tipo];
    
    if (!plantilla) {
      logger.warn(`Plantilla no encontrada para tipo: ${tipo}`);
      return null;
    }

    return plantilla;
  }

  /**
   * 🤖 Recordatorio Automático - Wrapper principal
   */
  recordatorioAutomatico(datos) {
    const { tipo } = datos;
    
    switch (tipo) {
      case 'recordatorio_inactividad':
        return this.recordatorioInactividad(datos);
      case 'recordatorio_racha_perdida':
        return this.recordatorioRachaPerdida(datos);
      case 'recordatorio_meta_semanal':
        return this.recordatorioMetaSemanal(datos);
      case 'recordatorio_actividad_favorita':
        return this.recordatorioActividadFavorita(datos);
      case 'recordatorio_area_rezagada':
        return this.recordatorioAreaRezagada(datos);
      case 'recordatorio_cerca_logro':
        return this.recordatorioCercaLogro(datos);
      case 'recordatorio_estrellas_acumuladas':
        return this.recordatorioEstrellasAcumuladas(datos);
      case 'recordatorio_rutina_diaria':
        return this.recordatorioRutinaDiaria(datos);
      case 'recordatorio_fin_semana':
        return this.recordatorioFinSemana(datos);
      case 'felicitacion_progreso':
        return this.felicitacionProgreso(datos);
      default:
        return this.recordatorioGeneral(datos);
    }
  }

  /**
   * 🎮 Recordatorio por Inactividad (24h)
   */
  recordatorioInactividad(datos) {
    const { nombreNino, nombreTutor, horasSinActividad } = datos;

    return {
      subject: `👋 ¡${nombreNino} te extraña en Pequeños Genios!`,
      html: `
        ${this.baseStyles}
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);">
            <h1>🎮 ¡Hora de Aprender!</h1>
            <p style="font-size: 18px; margin: 10px 0 0 0; opacity: 0.9;">
              ${nombreNino} te está esperando
            </p>
          </div>
          
          <div class="content">
            <h2>¡Hola ${nombreTutor}! 👋</h2>
            
            <p>Hemos notado que <strong>${nombreNino}</strong> no ha hecho actividades en Pequeños Genios en las últimas ${horasSinActividad} horas.</p>
            
            <div style="background: #f8f9ff; border-left: 4px solid #4A90E2; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #4A90E2;">🎯 Recuerda que cada día cuenta para el aprendizaje</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Solo 10-15 minutos pueden marcar la diferencia</li>
                <li>${nombreNino} puede continuar donde se quedó</li>
                <li>Hay nuevas actividades esperándolo</li>
              </ul>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0;"><strong>🌟 ¿Sabías que?</strong> Los niños que practican a diario mejoran 3x más rápido.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://pequenosgenios.com" style="background: #4A90E2; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block;">
                👆 ¡Ingresa ahora y continúa la aventura!
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>Con cariño,<br>El equipo de Pequeños Genios 💙</p>
          </div>
        </div>
      `
    };
  }

  /**
   * 📈 Recordatorio Racha Perdida
   */
  recordatorioRachaPerdida(datos) {
    const { nombreNino, nombreTutor, diasRacha } = datos;

    return {
      subject: `😔 ${nombreNino} perdió su racha de ${diasRacha} días`,
      html: `
        ${this.baseStyles}
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);">
            <h1>😔 ¡Oh no!</h1>
            <p style="font-size: 18px; margin: 10px 0 0 0; opacity: 0.9;">
              Pero no todo está perdido
            </p>
          </div>
          
          <div class="content">
            <h2>¡Hola ${nombreTutor}!</h2>
            
            <p><strong>${nombreNino}</strong> tenía una increíble racha de <strong>${diasRacha} días consecutivos</strong> practicando, pero se rompió ayer.</p>
            
            <div style="background: #fff5f5; border-left: 4px solid #e74c3c; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #e74c3c;">🔥 ¡Pero no todo está perdido!</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Las rachas se pueden recuperar</li>
                <li>Cada día es una nueva oportunidad</li>
                <li>${nombreNino} ya demostró que puede hacerlo</li>
              </ul>
            </div>
            
            <div style="background: #f0f8ff; border: 1px solid #74b9ff; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0;"><strong>🎯 Consejo:</strong> Empezar con solo 5 minutos hoy puede reactivar la motivación.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://pequenosgenios.com" style="background: #e74c3c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block;">
                💪 ¡Vamos ${nombreNino}, a comenzar una nueva racha!
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>¡Tú puedes! 🌟<br>Pequeños Genios</p>
          </div>
        </div>
      `
    };
  }

  /**
   * 🎯 Recordatorio Meta Semanal
   */
  recordatorioMetaSemanal(datos) {
    const { nombreNino, nombreTutor, actividadesCompletadas, metaSemanal, actividadesFaltantes } = datos;

    return {
      subject: `🎉 ¡Fin de semana! ${nombreNino} puede completar su meta`,
      html: `
        ${this.baseStyles}
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);">
            <h1>🎉 ¡Fin de semana a la vista!</h1>
            <p style="font-size: 18px; margin: 10px 0 0 0; opacity: 0.9;">
              Tiempo perfecto para completar la meta
            </p>
          </div>
          
          <div class="content">
            <h2>¡Hola ${nombreTutor}!</h2>
            
            <p><strong>${nombreNino}</strong> hizo <strong>${actividadesCompletadas} de ${metaSemanal}</strong> actividades esta semana.</p>
            
            <div style="background: #fef9e7; border-left: 4px solid #f39c12; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #f39c12;">📊 Estado actual</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Completadas: <strong>${actividadesCompletadas}</strong></li>
                <li>Faltan: <strong>${actividadesFaltantes}</strong></li>
                <li>Tiempo restante: <strong>Fin de semana</strong></li>
              </ul>
            </div>
            
            <div style="background: #f0f8ff; border-left: 4px solid #74b9ff; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #74b9ff;">🚀 ¡Aún hay tiempo!</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>El fin de semana es perfecto para ponerse al día</li>
                <li>Actividades cortas de 10 minutos cuentan</li>
                <li>Cada actividad suma al progreso</li>
              </ul>
            </div>
            
            <div style="background: #e8f5e8; border: 1px solid #4ade80; padding: 15px; border-radius: 4px; margin: 20px 0; text-align: center;">
              <p style="margin: 0;"><strong>🎁 Recompensa especial</strong> si completa la meta antes del domingo.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://pequenosgenios.com" style="background: #f39c12; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block;">
                🎯 ¡A por esa meta!
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>¡A por esa meta! 💪<br>Pequeños Genios</p>
          </div>
        </div>
      `
    };
  }

  /**
   * 🌟 Recordatorio Actividad Favorita Abandonada
   */
  recordatorioActividadFavorita(datos) {
    const { nombreNino, nombreTutor, actividadFavorita, diasSinActividad } = datos;

    return {
      subject: `💙 ¡Extrañamos a ${nombreNino} en ${actividadFavorita}!`,
      html: `
        ${this.baseStyles}
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);">
            <h1>🌟 ¡Te extrañamos!</h1>
            <p style="font-size: 18px; margin: 10px 0 0 0; opacity: 0.9;">
              En ${actividadFavorita}
            </p>
          </div>
          
          <div class="content">
            <h2>¡Hola ${nombreTutor}! 👋</h2>
            
            <p>Extrañamos verte en ${actividadFavorita} 💙</p>
            
            <p>Hace <strong>${diasSinActividad} días</strong> que <strong>${nombreNino}</strong> no practica <strong>${actividadFavorita}</strong>, que era su actividad favorita.</p>
            
            <div style="background: #f4f0ff; border-left: 4px solid #9b59b6; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #9b59b6;">🎮 ¿Qué pasó?</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>¿Necesita un nuevo desafío?</li>
                <li>¿Prefiere explorar otras áreas?</li>
                <li>¿Perdió el interés temporal?</li>
              </ul>
            </div>
            
            <div style="background: #fff7ed; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #f59e0b;">✨ Tenemos novedades</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Nuevos niveles en ${actividadFavorita}</li>
                <li>Desafíos más divertidos</li>
                <li>Recompensas especiales</li>
              </ul>
            </div>
            
            <div style="background: #f0f8ff; border: 1px solid #74b9ff; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0;"><strong>🎯 Sugerencia:</strong> Prueba solo 5 minutos hoy, ¡te sorprenderás!</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://pequenosgenios.com" style="background: #9b59b6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block;">
                🎮 ¡Regresa a ${actividadFavorita}!
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>Te esperamos de vuelta 🌟<br>Pequeños Genios</p>
          </div>
        </div>
      `
    };
  }

  /**
   * 📚 Recordatorio Área Rezagada
   */
  recordatorioAreaRezagada(datos) {
    const { nombreNino, nombreTutor, areaRezagada, diasSinPracticar, otrasAreas } = datos;

    return {
      subject: `📚 ¡${areaRezagada} necesita un poco de amor!`,
      html: `
        ${this.baseStyles}
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);">
            <h1>📚 ¡Tiempo de equilibrio!</h1>
            <p style="font-size: 18px; margin: 10px 0 0 0; opacity: 0.9;">
              Todas las áreas son importantes
            </p>
          </div>
          
          <div class="content">
            <h2>¡Hola ${nombreTutor}! 👋</h2>
            
            <p><strong>${nombreNino}</strong> ha estado enfocado en ${otrasAreas}, pero hace <strong>${diasSinPracticar} días</strong> que no practica <strong>${areaRezagada}</strong>.</p>
            
            <div style="background: #fff5f5; border-left: 4px solid #e67e22; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #e67e22;">⚖️ La importancia del equilibrio</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Cada área desarrolla habilidades únicas</li>
                <li>La variedad mantiene la motivación</li>
                <li>Un aprendizaje completo es más efectivo</li>
              </ul>
            </div>
            
            <div style="background: #f0f8ff; border-left: 4px solid #74b9ff; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #74b9ff;">🎯 Sugerencias para ${areaRezagada}</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Comenzar con ejercicios cortos y divertidos</li>
                <li>Alternar entre áreas favoritas y ${areaRezagada}</li>
                <li>Celebrar cada pequeño progreso</li>
              </ul>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0;"><strong>💡 Tip:</strong> ¡Dedica solo 10 minutos a ${areaRezagada} hoy!</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://pequenosgenios.com" style="background: #e67e22; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block;">
                📚 ¡Vamos a ${areaRezagada}!
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>¡Aprendizaje equilibrado! 📚<br>Pequeños Genios</p>
          </div>
        </div>
      `
    };
  }

  /**
   * 🏆 Recordatorio Cerca de Logro
   */
  recordatorioCercaLogro(datos) {
    const { nombreNino, nombreTutor, logro, progresoActual, progresoTotal, faltante } = datos;

    return {
      subject: `🏆 ¡${nombreNino} está cerca del logro ${logro}!`,
      html: `
        ${this.baseStyles}
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #f1c40f 0%, #f39c12 100%);">
            <h1>🏆 ¡Casi lo logras!</h1>
            <p style="font-size: 18px; margin: 10px 0 0 0; opacity: 0.9;">
              ${logro} está muy cerca
            </p>
          </div>
          
          <div class="content">
            <h2>¡Hola ${nombreTutor}! 🎉</h2>
            
            <p><strong>${nombreNino}</strong> está muy cerca de conseguir el logro <strong>"${logro}"</strong>!</p>
            
            <div style="background: #fffbf0; border-left: 4px solid #f1c40f; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #f39c12;">📊 Progreso actual</h3>
              <div style="background: #fff; border-radius: 8px; padding: 15px; margin: 10px 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span><strong>${progresoActual} de ${progresoTotal}</strong></span>
                  <span><strong>${Math.round((progresoActual/progresoTotal)*100)}%</strong></span>
                </div>
                <div style="background: #f5f5f5; height: 8px; border-radius: 4px; overflow: hidden;">
                  <div style="background: linear-gradient(90deg, #f1c40f, #f39c12); height: 100%; width: ${(progresoActual/progresoTotal)*100}%; transition: width 0.3s ease;"></div>
                </div>
              </div>
              <p style="margin: 10px 0 0 0;">Solo faltan <strong>${faltante}</strong> para conseguirlo!</p>
            </div>
            
            <div style="background: #f0f8ff; border-left: 4px solid #74b9ff; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #74b9ff;">🚀 ¡El éxito está cerca!</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Cada actividad cuenta para el logro</li>
                <li>Los logros desbloquean recompensas especiales</li>
                <li>¡Es el momento perfecto para el sprint final!</li>
              </ul>
            </div>
            
            <div style="background: #e8f5e8; border: 1px solid #4ade80; padding: 15px; border-radius: 4px; margin: 20px 0; text-align: center;">
              <p style="margin: 0;"><strong>🎁 Recompensa especial</strong> esperando al completar este logro!</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://pequenosgenios.com" style="background: #f1c40f; color: #333; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block;">
                🏆 ¡A por ese logro!
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>¡El éxito te espera! 🌟<br>Pequeños Genios</p>
          </div>
        </div>
      `
    };
  }

  /**
   * ⭐ Recordatorio Estrellas Acumuladas
   */
  recordatorioEstrellasAcumuladas(datos) {
    const { nombreNino, nombreTutor, estrellasActuales = 0, proximaRecompensa = 'Recompensa especial', estrellasNecesarias = 10 } = datos;

    return {
      subject: `⭐ ¡${nombreNino} puede canjear ${estrellasActuales} estrellas!`,
      html: `
        ${this.baseStyles}
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%);">
            <h1>⭐ ¡Tienda de Recompensas!</h1>
            <p style="font-size: 18px; margin: 10px 0 0 0; opacity: 0.9;">
              Tus estrellas te están esperando
            </p>
          </div>
          
          <div class="content">
            <h2>¡Hola ${nombreTutor}! ✨</h2>
            
            <p><strong>${nombreNino}</strong> ha acumulado <strong>${estrellasActuales} estrellas</strong> y puede canjearlas por recompensas increíbles!</p>
            
            <div style="background: #f4f0ff; border-left: 4px solid #8e44ad; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #8e44ad;">💰 Tu tesoro actual</h3>
              <div style="text-align: center; margin: 15px 0;">
                <div style="background: linear-gradient(135deg, #ffd700, #ffed4e); color: #333; padding: 20px; border-radius: 50%; display: inline-block; font-size: 24px; font-weight: 700; min-width: 80px;">
                  ⭐ ${estrellasActuales}
                </div>
              </div>
              <p style="text-align: center; margin: 0;"><strong>¡Estrellas listas para canjear!</strong></p>
            </div>
            
            <div style="background: #fff7ed; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #f59e0b;">🎁 Próxima recompensa</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li><strong>${proximaRecompensa}</strong></li>
                <li>Solo necesitas ${estrellasNecesarias} estrellas más</li>
                <li>¡Está al alcance de tus manos!</li>
              </ul>
            </div>
            
            <div style="background: #f0f8ff; border: 1px solid #74b9ff; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0;"><strong>💡 Tip:</strong> ¡No olvides visitar la tienda regularmente para nuevas recompensas!</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://pequenosgenios.com/tienda" style="background: #8e44ad; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block;">
                🛒 ¡Ir a la Tienda!
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>¡Disfruta tus recompensas! ⭐<br>Pequeños Genios</p>
          </div>
        </div>
      `
    };
  }

  /**
   * 🕐 Recordatorio Rutina Diaria
   */
  recordatorioRutinaDiaria(datos) {
    const { nombreNino, nombreTutor, horarioHabitual, actividad } = datos;

    return {
      subject: `🕐 ¡Es la hora de ${nombreNino}!`,
      html: `
        ${this.baseStyles}
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #16a085 0%, #1abc9c 100%);">
            <h1>🕐 ¡Hora de la rutina!</h1>
            <p style="font-size: 18px; margin: 10px 0 0 0; opacity: 0.9;">
              ${horarioHabitual} - Momento de aprender
            </p>
          </div>
          
          <div class="content">
            <h2>¡Hola ${nombreTutor}! 🌟</h2>
            
            <p>Es la <strong>${horarioHabitual}</strong>, el momento habitual en que <strong>${nombreNino}</strong> suele hacer <strong>${actividad}</strong>.</p>
            
            <div style="background: #f0fffe; border-left: 4px solid #16a085; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #16a085;">⏰ Rutinas saludables</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Las rutinas crean hábitos positivos</li>
                <li>Ayudan a la disciplina y constancia</li>
                <li>Hacen el aprendizaje más natural</li>
              </ul>
            </div>
            
            <div style="background: #fff3cd; border-left: 4px solid #f39c12; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #f39c12;">📝 Actividad sugerida</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li><strong>${actividad}</strong></li>
                <li>Duración: 15-20 minutos</li>
                <li>Perfecto para este horario</li>
              </ul>
            </div>
            
            <div style="background: #e8f5e8; border: 1px solid #4ade80; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0;"><strong>🎯 Recuerda:</strong> ¡La consistencia es clave para el éxito!</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://pequenosgenios.com" style="background: #16a085; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block;">
                ⏰ ¡Hora de ${actividad}!
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>¡Rutinas que transforman! 🕐<br>Pequeños Genios</p>
          </div>
        </div>
      `
    };
  }

  /**
   * 🎉 Recordatorio Fin de Semana
   */
  recordatorioFinSemana(datos) {
    const { nombreNino, nombreTutor, resumenSemana, planFinSemana } = datos;

    return {
      subject: `🎉 ¡Gran semana ${nombreNino}! Planes para el fin de semana`,
      html: `
        ${this.baseStyles}
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);">
            <h1>🎉 ¡Fin de semana!</h1>
            <p style="font-size: 18px; margin: 10px 0 0 0; opacity: 0.9;">
              Tiempo para celebrar y planificar
            </p>
          </div>
          
          <div class="content">
            <h2>¡Hola ${nombreTutor}! 🌟</h2>
            
            <p><strong>${nombreNino}</strong> ha tenido una gran semana de aprendizaje. ¡Es momento de celebrar y planificar!</p>
            
            <div style="background: #fff5f5; border-left: 4px solid #e74c3c; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #e74c3c;">📊 Resumen de la semana</h3>
              <div style="background: #fff; border-radius: 8px; padding: 15px; margin: 10px 0;">
                ${resumenSemana}
              </div>
            </div>
            
            <div style="background: #f0f8ff; border-left: 4px solid #74b9ff; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #74b9ff;">🗓️ Plan para el fin de semana</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                ${Array.isArray(planFinSemana) ? planFinSemana.map(item => `<li>${item}</li>`).join('') : `<li>${planFinSemana}</li>`}
              </ul>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0;"><strong>🎯 Tip:</strong> ¡Los fines de semana son perfectos para explorar nuevas actividades!</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://pequenosgenios.com" style="background: #e74c3c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block;">
                🎮 ¡Comencemos el fin de semana!
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>¡Feliz fin de semana! 🎉<br>Pequeños Genios</p>
          </div>
        </div>
      `
    };
  }

  /**
   * 🎊 Felicitación por Progreso
   */
  felicitacionProgreso(datos) {
    const { nombreNino, nombreTutor, logrosRecientes, motivacion } = datos;

    return {
      subject: `🎊 ¡Felicitaciones ${nombreNino}! Progreso increíble`,
      html: `
        ${this.baseStyles}
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);">
            <h1>🎊 ¡Felicitaciones!</h1>
            <p style="font-size: 18px; margin: 10px 0 0 0; opacity: 0.9;">
              Tu progreso es increíble
            </p>
          </div>
          
          <div class="content">
            <h2>¡Hola ${nombreTutor}! 🌟</h2>
            
            <p><strong>${nombreNino}</strong> ha demostrado un progreso increíble recientemente. ¡Merece ser celebrado!</p>
            
            <div style="background: #f0fff4; border-left: 4px solid #27ae60; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #27ae60;">🏆 Logros recientes</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                ${Array.isArray(logrosRecientes) ? logrosRecientes.map(logro => `<li><strong>${logro}</strong></li>`).join('') : `<li><strong>${logrosRecientes}</strong></li>`}
              </ul>
            </div>
            
            <div style="background: #fff7ed; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #f59e0b;">💪 Motivación</h3>
              <p style="margin: 10px 0;">${motivacion}</p>
            </div>
            
            <div style="background: #f0f8ff; border: 1px solid #74b9ff; padding: 15px; border-radius: 4px; margin: 20px 0; text-align: center;">
              <p style="margin: 0;"><strong>🌟 ¡Sigue así!</strong> Tu esfuerzo y dedicación son inspiradores.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://pequenosgenios.com" style="background: #27ae60; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block;">
                🚀 ¡Continúa brillando!
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>¡Orgullosos de ti! 🎊<br>Pequeños Genios</p>
          </div>
        </div>
      `
    };
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

  /**
   * Plantilla: Recordatorio General
   */
  recordatorioGeneral(datos) {
    const {
      nombreNino = 'el niño',
      nombreTutor = 'Papá/Mamá',
      titulo = 'Recordatorio',
      mensaje = 'Tienes un recordatorio pendiente',
      urlPlataforma = 'https://pequenosgenios.com'
    } = datos;

    return {
      subject: `🔔 ${titulo}`,
      html: `
        ${this.baseStyles}
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #6c5ce7 0%, #5a4fcf 100%);">
            <h1>🔔 Recordatorio</h1>
            <p>Mensaje importante para ti</p>
          </div>
          <div class="content">
            <h2>¡Hola ${nombreTutor}!</h2>
            <p>Tienes un recordatorio importante sobre <strong>${nombreNino}</strong>:</p>
            
            <div class="highlight">
              <h3 style="color: #6c5ce7; margin-top: 0;">${titulo}</h3>
              <p style="margin: 10px 0; font-size: 16px;">${mensaje}</p>
            </div>
            
            <p>No olvides revisar los detalles y tomar las acciones necesarias.</p>
            
            <div style="text-align: center;">
              <a href="${urlPlataforma}/notifications" class="button" style="background: #6c5ce7;">
                Ver Recordatorios
              </a>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 Pequeños Genios - Recordándote lo importante</p>
          </div>
        </div>
      `
    };
  }

  /**
   * Plantilla: Recordatorio de Medicamento
   */
  recordatorioMedicamento(datos) {
    const {
      nombreNino = 'el niño',
      nombreTutor = 'Papá/Mamá',
      medicamento = 'medicamento',
      dosis = '',
      hora = '',
      mensaje = '',
      urlPlataforma = 'https://pequenosgenios.com'
    } = datos;

    return {
      subject: `💊 Hora del medicamento - ${nombreNino}`,
      html: `
        ${this.baseStyles}
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);">
            <h1>💊 Recordatorio de Medicamento</h1>
            <p>Es importante no olvidarlo</p>
          </div>
          <div class="content">
            <h2>¡Hola ${nombreTutor}!</h2>
            <p>Es hora de darle el medicamento a <strong>${nombreNino}</strong>:</p>
            
            <div class="stats-card" style="background: #ffebee; border: 1px solid #ffcdd2;">
              <div class="stats-item">
                <span><span class="emoji">💊</span> Medicamento</span>
                <strong>${medicamento}</strong>
              </div>
              ${dosis ? `
                <div class="stats-item">
                  <span><span class="emoji">⚖️</span> Dosis</span>
                  <strong>${dosis}</strong>
                </div>
              ` : ''}
              ${hora ? `
                <div class="stats-item">
                  <span><span class="emoji">⏰</span> Hora</span>
                  <strong>${hora}</strong>
                </div>
              ` : ''}
            </div>
            
            ${mensaje ? `
              <div class="highlight">
                <p><strong>Nota adicional:</strong> ${mensaje}</p>
              </div>
            ` : ''}
            
            <p><strong>⚠️ Importante:</strong> Sigue las indicaciones médicas y no olvides registrar la toma.</p>
            
            <div style="text-align: center;">
              <a href="${urlPlataforma}/notifications" class="button" style="background: #e74c3c;">
                Marcar como Administrado
              </a>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 Pequeños Genios - Cuidando su salud</p>
          </div>
        </div>
      `
    };
  }

  /**
   * Plantilla: Recordatorio de Cita Médica
   */
  recordatorioCitaMedica(datos) {
    const {
      nombreNino = 'el niño',
      nombreTutor = 'Papá/Mamá',
      especialista = 'doctor',
      fechaCita = '',
      hora = '',
      lugar = '',
      mensaje = '',
      urlPlataforma = 'https://pequenosgenios.com'
    } = datos;

    return {
      subject: `🏥 Cita médica - ${nombreNino}`,
      html: `
        ${this.baseStyles}
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);">
            <h1>🏥 Recordatorio de Cita Médica</h1>
            <p>No olvides la cita</p>
          </div>
          <div class="content">
            <h2>¡Hola ${nombreTutor}!</h2>
            <p>Recordatorio de la cita médica de <strong>${nombreNino}</strong>:</p>
            
            <div class="stats-card" style="background: #e8f5e8; border: 1px solid #c8e6c9;">
              <div class="stats-item">
                <span><span class="emoji">👨‍⚕️</span> Especialista</span>
                <strong>${especialista}</strong>
              </div>
              ${fechaCita ? `
                <div class="stats-item">
                  <span><span class="emoji">📅</span> Fecha</span>
                  <strong>${fechaCita}</strong>
                </div>
              ` : ''}
              ${hora ? `
                <div class="stats-item">
                  <span><span class="emoji">⏰</span> Hora</span>
                  <strong>${hora}</strong>
                </div>
              ` : ''}
              ${lugar ? `
                <div class="stats-item">
                  <span><span class="emoji">📍</span> Lugar</span>
                  <strong>${lugar}</strong>
                </div>
              ` : ''}
            </div>
            
            ${mensaje ? `
              <div class="highlight">
                <p><strong>Nota adicional:</strong> ${mensaje}</p>
              </div>
            ` : ''}
            
            <div class="highlight">
              <p><strong>💡 Recuerda llevar:</strong></p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Documentos de identidad</li>
                <li>Historial médico de ${nombreNino}</li>
                <li>Lista de medicamentos actuales</li>
                <li>Preguntas que quieras hacer al doctor</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="${urlPlataforma}/notifications" class="button" style="background: #2ecc71;">
                Ver Detalles de la Cita
              </a>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 Pequeños Genios - Cuidando su bienestar</p>
          </div>
        </div>
      `
    };
  }

  /**
   * Plantilla: Recordatorio de Tarea Escolar
   */
  recordatorioTareaEscolar(datos) {
    const {
      nombreNino = 'el niño',
      nombreTutor = 'Papá/Mamá',
      materia = 'tarea',
      fechaEntrega = '',
      descripcion = '',
      mensaje = '',
      urlPlataforma = 'https://pequenosgenios.com'
    } = datos;

    return {
      subject: `📚 Tarea pendiente - ${nombreNino}`,
      html: `
        ${this.baseStyles}
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);">
            <h1>📚 Recordatorio de Tarea</h1>
            <p>¡A estudiar se ha dicho!</p>
          </div>
          <div class="content">
            <h2>¡Hola ${nombreTutor}!</h2>
            <p><strong>${nombreNino}</strong> tiene una tarea pendiente que requiere atención:</p>
            
            <div class="stats-card" style="background: #fef9e7; border: 1px solid #f4d03f;">
              <div class="stats-item">
                <span><span class="emoji">📖</span> Materia</span>
                <strong>${materia}</strong>
              </div>
              ${fechaEntrega ? `
                <div class="stats-item">
                  <span><span class="emoji">📅</span> Fecha de entrega</span>
                  <strong>${fechaEntrega}</strong>
                </div>
              ` : ''}
              ${descripcion ? `
                <div class="stats-item">
                  <span><span class="emoji">📝</span> Descripción</span>
                  <strong>${descripcion}</strong>
                </div>
              ` : ''}
            </div>
            
            ${mensaje ? `
              <div class="highlight">
                <p><strong>Nota adicional:</strong> ${mensaje}</p>
              </div>
            ` : ''}
            
            <div class="highlight">
              <p><strong>💡 Consejos para el éxito:</strong></p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Busca un lugar tranquilo para estudiar</li>
                <li>Organiza el material necesario</li>
                <li>Toma descansos regulares</li>
                <li>Pide ayuda si es necesario</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="${urlPlataforma}/console" class="button" style="background: #f39c12;">
                Ir a Estudiar
              </a>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 Pequeños Genios - Apoyando su educación</p>
          </div>
        </div>
      `
    };
  }
}

module.exports = EmailTemplates;
