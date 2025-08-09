const express = require('express');
const router = express.Router();
const Joi = require('joi');
const emailService = require('../services/emailService');
const logger = require('../config/logger');

// Esquemas de validación
const enviarCorreoSchema = Joi.object({
  destinatario: Joi.string().email().required(),
  tipo: Joi.string().valid(
    'actividad_pendiente',
    'logro_alcanzado',
    'resumen_semanal',
    'bienvenida',
    'recompensa_disponible',
    'recordatorio_evaluacion',
    'sesion_completada',
    'recordatorio_general',
    'recordatorio_medicamento',
    'recordatorio_cita_medica',
    'recordatorio_tarea_escolar',
    // 🤖 Nuevos recordatorios automáticos inteligentes
    'recordatorio_automatico',
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
  ).required(),
  datos: Joi.object().required()
});

const enviarMultiplesSchema = Joi.object({
  correos: Joi.array().items(
    Joi.object({
      destinatario: Joi.string().email().required(),
      tipo: Joi.string().valid(
        'actividad_pendiente',
        'logro_alcanzado',
        'resumen_semanal',
        'bienvenida',
        'recompensa_disponible',
        'recordatorio_evaluacion',
        'sesion_completada',
        'recordatorio_general',
        'recordatorio_medicamento',
        'recordatorio_cita_medica',
        'recordatorio_tarea_escolar',
        // 🤖 Nuevos recordatorios automáticos inteligentes
        'recordatorio_automatico',
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
      ).required(),
      datos: Joi.object().required()
    })
  ).min(1).max(10).required()
});

/**
 * Middleware de validación
 */
const validarDatos = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      logger.warn('Datos inválidos en request:', {
        error: error.details[0].message,
        path: error.details[0].path,
        body: req.body
      });
      
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        detalles: error.details[0].message
      });
    }
    
    next();
  };
};

/**
 * POST /api/email/send
 * Enviar un correo electrónico
 */
router.post('/send', validarDatos(enviarCorreoSchema), async (req, res) => {
  try {
    const { destinatario, tipo, datos } = req.body;
    
    logger.info('Enviando correo:', {
      destinatario,
      tipo,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    const resultado = await emailService.enviarCorreo(destinatario, tipo, datos);
    
    res.json({
      success: true,
      message: 'Correo enviado exitosamente',
      data: resultado
    });
    
  } catch (error) {
    logger.error('Error enviando correo:', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

/**
 * POST /api/email/send-multiple
 * Enviar múltiples correos electrónicos
 */
router.post('/send-multiple', validarDatos(enviarMultiplesSchema), async (req, res) => {
  try {
    const { correos } = req.body;
    
    logger.info('Enviando múltiples correos:', {
      cantidad: correos.length,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    const resultados = await emailService.enviarMultiples(correos);
    
    const exitosos = resultados.filter(r => r.success).length;
    const fallidos = resultados.filter(r => !r.success).length;
    
    res.json({
      success: true,
      message: `${exitosos} correos enviados exitosamente, ${fallidos} fallidos`,
      data: {
        exitosos,
        fallidos,
        total: resultados.length,
        resultados
      }
    });
    
  } catch (error) {
    logger.error('Error enviando múltiples correos:', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

/**
 * GET /api/email/status
 * Verificar estado del servicio de correos
 */
router.get('/status', async (req, res) => {
  try {
    const estadisticas = await emailService.obtenerEstadisticas();
    
    res.json({
      success: true,
      data: estadisticas
    });
    
  } catch (error) {
    logger.error('Error obteniendo estado del servicio:', error);
    
    res.status(500).json({
      success: false,
      error: 'Error verificando estado del servicio',
      message: error.message
    });
  }
});

/**
 * GET /api/email/templates
 * Obtener lista de plantillas disponibles
 */
router.get('/templates', (req, res) => {
  const plantillas = [
    {
      tipo: 'actividad_pendiente',
      nombre: 'Actividad Pendiente',
      descripcion: 'Recordatorio cuando un niño no ha realizado actividades',
      campos: ['nombreNino', 'nombreTutor', 'horasSinActividad', 'urlPlataforma']
    },
    {
      tipo: 'logro_alcanzado',
      nombre: 'Logro Alcanzado',
      descripcion: 'Notificación cuando se desbloquea un nuevo logro',
      campos: ['nombreNino', 'nombreTutor', 'logro', 'puntos', 'descripcion']
    },
    {
      tipo: 'resumen_semanal',
      nombre: 'Resumen Semanal',
      descripcion: 'Resumen semanal de progreso',
      campos: ['nombreNino', 'nombreTutor', 'actividadesCompletadas', 'tiempoTotal', 'puntosTotales', 'racha']
    },
    {
      tipo: 'bienvenida',
      nombre: 'Bienvenida',
      descripcion: 'Correo de bienvenida para nuevos usuarios',
      campos: ['nombreTutor', 'nombreNino', 'urlPlataforma']
    },
    {
      tipo: 'recompensa_disponible',
      nombre: 'Recompensa Disponible',
      descripcion: 'Notificación cuando hay una recompensa disponible',
      campos: ['nombreNino', 'nombreTutor', 'recompensa', 'puntosRequeridos', 'puntosActuales']
    },
    {
      tipo: 'recordatorio_evaluacion',
      nombre: 'Recordatorio de Evaluación',
      descripcion: 'Recordatorio para realizar evaluaciones pendientes',
      campos: ['nombreNino', 'nombreTutor', 'tipoEvaluacion', 'fechaLimite']
    },
    {
      tipo: 'sesion_completada',
      nombre: 'Sesión Completada',
      descripcion: 'Notificación cuando se completa una sesión',
      campos: ['nombreNino', 'nombreTutor', 'duracion', 'actividades', 'puntos', 'precision']
    },
    {
      tipo: 'recordatorio_general',
      nombre: 'Recordatorio General',
      descripcion: 'Recordatorio personalizado general',
      campos: ['nombreNino', 'nombreTutor', 'titulo', 'mensaje', 'urlPlataforma']
    },
    {
      tipo: 'recordatorio_medicamento',
      nombre: 'Recordatorio de Medicamento',
      descripcion: 'Recordatorio específico para medicamentos',
      campos: ['nombreNino', 'nombreTutor', 'medicamento', 'dosis', 'hora', 'mensaje', 'urlPlataforma']
    },
    {
      tipo: 'recordatorio_cita_medica',
      nombre: 'Recordatorio de Cita Médica',
      descripcion: 'Recordatorio para citas médicas',
      campos: ['nombreNino', 'nombreTutor', 'especialista', 'fechaCita', 'hora', 'lugar', 'mensaje', 'urlPlataforma']
    },
    {
      tipo: 'recordatorio_tarea_escolar',
      nombre: 'Recordatorio de Tarea Escolar',
      descripcion: 'Recordatorio para tareas escolares',
      campos: ['nombreNino', 'nombreTutor', 'materia', 'fechaEntrega', 'descripcion', 'mensaje', 'urlPlataforma']
    }
  ];
  
  res.json({
    success: true,
    data: {
      total: plantillas.length,
      plantillas
    }
  });
});

/**
 * POST /api/email/test
 * Enviar correo de prueba
 */
router.post('/test', async (req, res) => {
  try {
    const { destinatario } = req.body;
    
    if (!destinatario) {
      return res.status(400).json({
        success: false,
        error: 'Destinatario requerido'
      });
    }
    
    const datosTest = {
      nombreNino: 'Juan',
      nombreTutor: 'María',
      urlPlataforma: 'https://pequenosgenios.com'
    };
    
    const resultado = await emailService.enviarCorreo(destinatario, 'bienvenida', datosTest);
    
    res.json({
      success: true,
      message: 'Correo de prueba enviado exitosamente',
      data: resultado
    });
    
  } catch (error) {
    logger.error('Error enviando correo de prueba:', error);
    
    res.status(500).json({
      success: false,
      error: 'Error enviando correo de prueba',
      message: error.message
    });
  }
});

module.exports = router;
