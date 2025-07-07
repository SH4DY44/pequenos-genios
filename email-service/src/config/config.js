require('dotenv').config();

const config = {
  // Configuración del servidor
  port: process.env.PORT || 3001,
  env: process.env.NODE_ENV || 'development',
  
  // Configuración de Gmail
  gmail: {
    user: process.env.GMAIL_USER,
    password: process.env.GMAIL_APP_PASSWORD
  },
  
  // Configuración de CORS
  cors: {
    origins: process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000']
  },
  
  // Configuración de rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10
  },
  
  // Configuración de correos
  email: {
    fromName: process.env.FROM_NAME || 'Pequeños Genios',
    fromEmail: process.env.FROM_EMAIL || process.env.GMAIL_USER
  },
  
  // Configuración de seguridad
  security: {
    jwtSecret: process.env.JWT_SECRET,
    apiKey: process.env.API_KEY
  }
};

// Validar configuración crítica
const validateConfig = () => {
  const required = [
    'GMAIL_USER',
    'GMAIL_APP_PASSWORD'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Variables de entorno requeridas faltantes: ${missing.join(', ')}`);
  }
};

// Validar solo en producción
if (config.env === 'production') {
  validateConfig();
}

module.exports = config;
