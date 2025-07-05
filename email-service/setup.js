#!/usr/bin/env node

/**
 * Script de configuración para el servicio de email
 * Configura las dependencias y variables de entorno necesarias
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Configurando servicio de email para Pequeños Genios...\n');

// Directorio del servicio de email
const emailServiceDir = path.join(__dirname, 'email-service');

// Verificar que el directorio existe
if (!fs.existsSync(emailServiceDir)) {
  console.error('❌ Error: Directorio email-service no encontrado');
  process.exit(1);
}

// Cambiar al directorio del servicio
process.chdir(emailServiceDir);

try {
  // Instalar dependencias
  console.log('📦 Instalando dependencias...');
  execSync('npm install', { stdio: 'inherit' });

  // Crear archivo .env si no existe
  const envPath = path.join(emailServiceDir, '.env');
  if (!fs.existsSync(envPath)) {
    console.log('⚙️  Creando archivo .env...');
    
    const envContent = `# Configuración del servicio de email
# Copiado de .env.example - CONFIGURA TUS VALORES

# Configuración del servidor
PORT=3001
NODE_ENV=development

# Configuración de Gmail - IMPORTANTE: Configura estos valores
GMAIL_USER=tu-email@gmail.com
GMAIL_APP_PASSWORD=tu-contraseña-de-aplicacion-aqui

# URLs permitidas (separadas por comas)
ALLOWED_ORIGINS=http://localhost:3000,https://tu-dominio.com

# Configuración de rate limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10

# Configuración de logging
LOG_LEVEL=info
LOG_FILE=logs/email-service.log

# Configuración de correos
FROM_NAME=Pequeños Genios
FROM_EMAIL=noreply@pequenosgenios.com

# Configuración de seguridad (opcional)
# JWT_SECRET=tu-jwt-secret-aqui
# API_KEY=tu-api-key-aqui
`;

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Archivo .env creado');
  }

  // Crear directorio de logs
  const logsDir = path.join(emailServiceDir, 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
    console.log('📁 Directorio de logs creado');
  }

  // Mostrar instrucciones
  console.log('\n🎉 ¡Servicio de email configurado exitosamente!');
  console.log('\n📋 Próximos pasos:');
  console.log('1. Configura tu cuenta de Gmail:');
  console.log('   - Habilita la verificación en 2 pasos');
  console.log('   - Genera una contraseña de aplicación');
  console.log('   - Ve a: https://myaccount.google.com/apppasswords');
  console.log('\n2. Edita el archivo .env con tus credenciales:');
  console.log(`   - ${envPath}`);
  console.log('\n3. Inicia el servicio:');
  console.log('   - cd email-service');
  console.log('   - npm run dev (desarrollo)');
  console.log('   - npm start (producción)');
  console.log('\n4. Prueba el servicio:');
  console.log('   - http://localhost:3001/health');
  console.log('   - http://localhost:3001/info');
  console.log('\n⚠️  IMPORTANTE: No olvides configurar GMAIL_USER y GMAIL_APP_PASSWORD');

} catch (error) {
  console.error('❌ Error durante la configuración:', error.message);
  process.exit(1);
}
