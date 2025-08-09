const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const config = require('../config/config');
const logger = require('../config/logger');

/**
 * Configuración de CORS
 */
const corsConfig = {
  origin: (origin, callback) => {
    // Permitir requests sin origen (móviles, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Verificar si el origen está permitido
    if (config.cors.origins.includes(origin)) {
      return callback(null, true);
    }
    
    // En desarrollo, permitir localhost
    if (config.env === 'development' && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    logger.warn('Origen no permitido por CORS:', origin);
    callback(new Error('No permitido por CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'x-user-id']
};

/**
 * Rate limiting para correos
 */
const emailRateLimit = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    error: 'Demasiados correos enviados',
    message: 'Has excedido el límite de correos por minuto. Intenta nuevamente más tarde.',
    retryAfter: Math.ceil(config.rateLimit.windowMs / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit excedido:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path
    });
    
    res.status(429).json({
      success: false,
      error: 'Rate limit excedido',
      message: 'Demasiados correos enviados. Intenta en un minuto.',
      retryAfter: Math.ceil(config.rateLimit.windowMs / 1000)
    });
  }
});

/**
 * Rate limiting general más permisivo
 */
const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP cada 15 minutos
  message: {
    success: false,
    error: 'Demasiadas solicitudes',
    message: 'Has excedido el límite de solicitudes. Intenta nuevamente más tarde.'
  }
});

/**
 * Middleware de autenticación API Key (opcional)
 */
const apiKeyAuth = (req, res, next) => {
  // Log para debug
  logger.info('API Key Auth Debug:', {
    configuredKey: config.security.apiKey,
    providedKey: req.headers['x-api-key'],
    hasKey: !!config.security.apiKey
  });
  
  // Si no hay API key configurada, saltar autenticación
  if (!config.security.apiKey || config.security.apiKey === 'tu-api-key-aqui') {
    logger.info('API Key auth skipped - no key configured');
    return next();
  }
  
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API Key requerida'
    });
  }
  
  if (apiKey !== config.security.apiKey) {
    logger.warn('API Key inválida:', {
      ip: req.ip,
      providedKey: apiKey,
      expectedKey: config.security.apiKey,
      userAgent: req.get('User-Agent')
    });
    
    return res.status(401).json({
      success: false,
      error: 'API Key inválida'
    });
  }
  
  logger.info('API Key validation successful');
  next();
};

/**
 * Middleware de logging de requests
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('Request completado:', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  });
  
  next();
};

/**
 * Middleware de manejo de errores
 */
const errorHandler = (err, req, res, next) => {
  logger.error('Error no manejado:', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    body: req.body,
    ip: req.ip
  });
  
  // Error de CORS
  if (err.message === 'No permitido por CORS') {
    return res.status(403).json({
      success: false,
      error: 'Origen no permitido',
      message: 'Tu dominio no está autorizado para acceder a este servicio'
    });
  }
  
  // Error de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Datos inválidos',
      message: err.message
    });
  }
  
  // Error genérico
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: config.env === 'development' ? err.message : 'Ha ocurrido un error inesperado'
  });
};

/**
 * Middleware 404
 */
const notFoundHandler = (req, res) => {
  logger.warn('Ruta no encontrada:', {
    method: req.method,
    url: req.url,
    ip: req.ip
  });
  
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    message: `La ruta ${req.method} ${req.url} no existe`
  });
};

module.exports = {
  corsConfig,
  emailRateLimit,
  generalRateLimit,
  apiKeyAuth,
  requestLogger,
  errorHandler,
  notFoundHandler,
  
  // Middleware de seguridad
  security: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false
  }),
  
  // Compresión
  compression: compression(),
  
  // CORS
  cors: cors(corsConfig)
};
