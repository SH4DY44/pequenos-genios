const express = require('express');
const path = require('path');
const fs = require('fs');

// Configuración y servicios
const config = require('./src/config/config');
const logger = require('./src/config/logger');

// Middleware
const {
  security,
  cors,
  compression,
  generalRateLimit,
  emailRateLimit,
  requestLogger,
  errorHandler,
  notFoundHandler,
  apiKeyAuth
} = require('./src/middleware');

// Rutas
// Importar rutas
const emailRoutes = require('./src/routes/email');
const automaticEmailRoutes = require('./src/routes/automaticEmail');
const reportesRoutes = require('./src/routes/reportes');

// Crear directorio de logs si no existe
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Inicializar Express
const app = express();

// Configurar trust proxy para obtener IP real detrás de proxies
app.set('trust proxy', 1);

// Middleware básico
app.use(security);
app.use(cors);
app.use(compression);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging de requests
app.use(requestLogger);

// Rate limiting general
app.use(generalRateLimit);

// Health check (sin rate limiting estricto)
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Email Service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
    node_version: process.version
  });
});

// Información del servicio
app.get('/info', (req, res) => {
  res.json({
    service: 'Pequeños Genios Email Service',
    version: '1.0.0',
    description: 'Servicio de correos electrónicos para la plataforma Pequeños Genios',
    endpoints: [
      'GET /health - Health check',
      'GET /info - Información del servicio',
      'GET /api/email/status - Estado del servicio de correos',
      'GET /api/email/templates - Lista de plantillas disponibles',
      'POST /api/email/send - Enviar correo',
      'POST /api/email/send-multiple - Enviar múltiples correos',
      'POST /api/email/test - Enviar correo de prueba',
      'POST /api/email/automatic - Enviar recordatorio automático',
      'POST /api/email/bulk-automatic - Envío masivo de recordatorios automáticos',
      'GET /api/email/test-automatic/:tipo - Probar recordatorio automático',
      'GET /api/reportes/status - Estado del servicio de reportes',
      'GET /api/reportes/tipos - Tipos de reportes disponibles',
      'POST /api/reportes/generate-pdf - Generar reporte PDF'
    ],
    rateLimit: {
      general: '100 requests per 15 minutes',
      email: `${config.rateLimit.max} emails per ${config.rateLimit.windowMs / 1000} seconds`
    }
  });
});

// Rutas de email con rate limiting específico
app.use('/api/email', emailRateLimit, apiKeyAuth, emailRoutes);
app.use('/api/email', emailRateLimit, apiKeyAuth, automaticEmailRoutes);

// Rutas de reportes con rate limiting específico
app.use('/api/reportes', emailRateLimit, apiKeyAuth, reportesRoutes);

// Ruta de desarrollo para reportes (sin autenticación)
if (config.env === 'development') {
  app.use('/api/dev/reportes', emailRateLimit, reportesRoutes);
}

// Middleware de rutas no encontradas
app.use(notFoundHandler);

// Middleware de manejo de errores
app.use(errorHandler);

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', {
    error: err.message,
    stack: err.stack
  });
  
  // Dar tiempo al logger para escribir antes de salir
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', {
    reason: reason.toString(),
    promise: promise.toString()
  });
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  logger.info('Señal SIGTERM recibida. Cerrando servidor...');
  server.close(() => {
    logger.info('Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('Señal SIGINT recibida. Cerrando servidor...');
  server.close(() => {
    logger.info('Servidor cerrado correctamente');
    process.exit(0);
  });
});

// Iniciar servidor
const server = app.listen(config.port, () => {
  logger.info(`🚀 Email Service iniciado`, {
    port: config.port,
    environment: config.env,
    timestamp: new Date().toISOString()
  });
  
  logger.info(`📧 Configuración Gmail:`, {
    user: config.gmail.user,
    hasPassword: !!config.gmail.password
  });
  
  logger.info(`🌐 CORS habilitado para:`, {
    origins: config.cors.origins
  });
  
  logger.info(`⚡ Rate limiting configurado:`, {
    windowMs: config.rateLimit.windowMs,
    maxRequests: config.rateLimit.max
  });
});

module.exports = app;
