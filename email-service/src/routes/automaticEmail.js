/**
 * 🤖 RUTAS PARA CORREOS AUTOMÁTICOS INTELIGENTES
 * 
 * Esta ruta maneja el envío de recordatorios automáticos basados en 
 * análisis de comportamiento del usuario en tiempo real.
 */

const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');
const logger = require('../config/logger');

/**
 * 🤖 POST /automatic - Envío de recordatorio automático
 * 
 * Recibe datos de análisis de comportamiento y envía 
 * el recordatorio automático correspondiente.
 */
router.post('/automatic', async (req, res) => {
  try {
    const { 
      tipo, 
      email, 
      nombreNino, 
      nombreTutor,
      ...datosAdicionales 
    } = req.body;

    // Validaciones básicas
    if (!tipo || !email || !nombreNino) {
      return res.status(400).json({
        success: false,
        error: 'Faltan parámetros requeridos: tipo, email, nombreNino'
      });
    }

    // Tipos de recordatorios automáticos válidos
    const tiposValidos = [
      'recordatorio_inactividad',
      'recordatorio_racha_perdida', 
      'recordatorio_meta_semanal',
      'recordatorio_actividad_favorita',
      'recordatorio_area_rezagada',
      'recordatorio_cerca_logro',
      'recordatorio_estrellas_acumuladas',
      'recordatorio_rutina_diaria',
      'recordatorio_fin_semana',
      'felicitacion_progreso'
    ];

    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({
        success: false,
        error: `Tipo de recordatorio no válido. Tipos permitidos: ${tiposValidos.join(', ')}`
      });
    }

    // Preparar datos para el template
    const datosTemplate = {
      tipo,
      nombreNino,
      nombreTutor: nombreTutor || 'Tutor',
      ...datosAdicionales
    };

    // Log del recordatorio automático
    logger.info(`📤 Enviando recordatorio automático`, {
      tipo,
      email,
      nombreNino,
      timestamp: new Date().toISOString()
    });

    // Enviar email usando el tipo específico directamente
    const resultado = await emailService.enviarCorreo(
      email,
      tipo,
      datosTemplate
    );

    if (resultado.success) {
      logger.info(`✅ Recordatorio automático enviado exitosamente`, {
        tipo,
        email,
        nombreNino,
        messageId: resultado.messageId
      });

      res.json({
        success: true,
        message: 'Recordatorio automático enviado exitosamente',
        tipo,
        messageId: resultado.messageId
      });
    } else {
      logger.error(`❌ Error al enviar recordatorio automático`, {
        tipo,
        email,
        error: resultado.error
      });

      res.status(500).json({
        success: false,
        error: 'Error al enviar el recordatorio automático',
        details: resultado.error
      });
    }

  } catch (error) {
    logger.error('❌ Error en endpoint de recordatorio automático:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

/**
 * 📊 POST /bulk-automatic - Envío masivo de recordatorios automáticos
 * 
 * Para procesamiento por lotes desde el servicio automático
 */
router.post('/bulk-automatic', async (req, res) => {
  try {
    const { recordatorios } = req.body;

    if (!Array.isArray(recordatorios) || recordatorios.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere un array de recordatorios'
      });
    }

    logger.info(`📦 Procesando lote de ${recordatorios.length} recordatorios automáticos`);

    const resultados = [];

    for (const recordatorio of recordatorios) {
      try {
        const { 
          tipo, 
          email, 
          nombreNino, 
          nombreTutor,
          ...datosAdicionales 
        } = recordatorio;

        const datosTemplate = {
          tipo,
          nombreNino,
          nombreTutor: nombreTutor || 'Tutor',
          ...datosAdicionales
        };

        const resultado = await emailService.enviarCorreo(
          email,
          tipo,
          datosTemplate
        );

        resultados.push({
          email,
          tipo,
          nombreNino,
          success: resultado.success,
          messageId: resultado.messageId || null,
          error: resultado.error || null
        });

        // Pequeña pausa entre envíos para no sobrecargar
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        logger.error(`Error procesando recordatorio para ${recordatorio.email}:`, error);
        resultados.push({
          email: recordatorio.email,
          tipo: recordatorio.tipo,
          nombreNino: recordatorio.nombreNino,
          success: false,
          error: error.message
        });
      }
    }

    const exitosos = resultados.filter(r => r.success).length;
    const fallidos = resultados.filter(r => !r.success).length;

    logger.info(`📊 Lote completado: ${exitosos} exitosos, ${fallidos} fallidos`);

    res.json({
      success: true,
      message: `Lote procesado: ${exitosos} exitosos, ${fallidos} fallidos`,
      total: recordatorios.length,
      exitosos,
      fallidos,
      resultados
    });

  } catch (error) {
    logger.error('❌ Error en endpoint bulk-automatic:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

/**
 * 🔍 GET /test-automatic/:tipo - Endpoint de prueba para recordatorios automáticos
 * 
 * Para testing y desarrollo de nuevos tipos de recordatorios
 */
router.get('/test-automatic/:tipo', async (req, res) => {
  try {
    const { tipo } = req.params;
    const { email = 'test@pequenosgenios.com' } = req.query;

    // Datos de prueba según el tipo
    const datosPrueba = {
      recordatorio_inactividad: {
        nombreNino: 'Sofía',
        nombreTutor: 'María',
        horasSinActividad: 36
      },
      recordatorio_racha_perdida: {
        nombreNino: 'Carlos',
        nombreTutor: 'Ana',
        diasRacha: 7
      },
      recordatorio_meta_semanal: {
        nombreNino: 'Diego',
        nombreTutor: 'Luis',
        actividadesCompletadas: 8,
        metaSemanal: 12,
        actividadesFaltantes: 4
      },
      recordatorio_actividad_favorita: {
        nombreNino: 'Isabella',
        nombreTutor: 'Carmen',
        actividadFavorita: 'Matemáticas',
        diasSinActividad: 5
      },
      recordatorio_area_rezagada: {
        nombreNino: 'Mateo',
        nombreTutor: 'Roberto',
        areaRezagada: 'Ciencias',
        diasSinPracticar: 8,
        otrasAreas: 'Matemáticas y Lenguaje'
      },
      recordatorio_cerca_logro: {
        nombreNino: 'Valentina',
        nombreTutor: 'Patricia',
        logro: 'Explorador de Números',
        progresoActual: 18,
        progresoTotal: 20,
        faltante: '2 actividades más'
      },
      recordatorio_estrellas_acumuladas: {
        nombreNino: 'Sebastián',
        nombreTutor: 'Gabriel',
        estrellasActuales: 45,
        proximaRecompensa: 'Avatar Especial',
        estrellasNecesarias: 5
      },
      recordatorio_rutina_diaria: {
        nombreNino: 'Camila',
        nombreTutor: 'Monica',
        horarioHabitual: '4:00 PM',
        actividad: 'Práctica de Lectura'
      },
      recordatorio_fin_semana: {
        nombreNino: 'Alejandro',
        nombreTutor: 'Fernando',
        resumenSemana: '✅ 10 actividades completadas<br>⭐ 25 estrellas ganadas<br>🏆 2 logros desbloqueados',
        planFinSemana: [
          'Explorar nuevas actividades de Arte',
          'Completar meta semanal de Matemáticas', 
          'Revisar progreso en Ciencias'
        ]
      },
      felicitacion_progreso: {
        nombreNino: 'Lucía',
        nombreTutor: 'Sandra',
        logrosRecientes: [
          'Maestro de Sumas completado',
          'Racha de 5 días consecutivos',
          '50 estrellas acumuladas'
        ],
        motivacion: 'Tu constancia y dedicación son ejemplares. Cada día demuestras que con esfuerzo se pueden alcanzar todas las metas.'
      }
    };

    const datos = datosPrueba[tipo];
    if (!datos) {
      return res.status(400).json({
        success: false,
        error: `Tipo de prueba no disponible: ${tipo}`
      });
    }

    const datosTemplate = {
      tipo,
      ...datos
    };

    const resultado = await emailService.enviarCorreo(
      email,
      'recordatorio_automatico',
      datosTemplate
    );

    res.json({
      success: true,
      message: `Email de prueba enviado para tipo: ${tipo}`,
      email,
      datos: datosTemplate,
      resultado
    });

  } catch (error) {
    logger.error('❌ Error en test automático:', error);
    res.status(500).json({
      success: false,
      error: 'Error al enviar email de prueba',
      details: error.message
    });
  }
});

module.exports = router;
