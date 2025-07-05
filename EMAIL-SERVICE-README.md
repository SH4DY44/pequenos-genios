# 📧 Servicio de Correos Integrado

### 1. Configuración Manual
```bash
# Instalar dependencias
cd email-service
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu configuración
```

### 3. Iniciar Servicio
```bash
# Desde VS Code: Ctrl+Shift+P → "Tasks: Run Task" → "Email Service - Development"
# O desde terminal:
cd email-service
npm run dev
```

## 📋 Características Implementadas

### ✅ Backend Completo
- **Node.js + Express** con arquitectura profesional
- **Nodemailer** para envío con Gmail
- **Rate limiting** (10 correos/minuto)
- **Logging completo** con Winston
- **Middleware de seguridad** (Helmet, CORS)
- **Validación de datos** con Joi

### ✅ Plantillas Profesionales
- 🎉 **Bienvenida** - Para nuevos usuarios
- 🎯 **Actividad Pendiente** - Recordatorios automáticos
- 🏆 **Logro Alcanzado** - Celebrar achievements
- 📊 **Resumen Semanal** - Progreso semanal
- 🎁 **Recompensa Disponible** - Notificar recompensas
- 📋 **Recordatorio Evaluación** - Evaluaciones pendientes
- ✅ **Sesión Completada** - Confirmación de práctica

### ✅ Integración Frontend
- **Servicio de Email** (`emailService.js`)
- **NotificationService actualizado** con métodos de email
- **Panel de Administración** con gestión de correos
- **Componente Demo** para probar plantillas

### ✅ Seguridad y Monitoring
- **Contraseña de aplicación** de Google (no terceros)
- **Rate limiting** configurable
- **Logs detallados** para debugging
- **Health checks** y monitoreo

## 🎯 Uso en la Aplicación

### Desde el Panel de Admin
1. Ve a **Panel de Admin** → **Correos**
2. Verifica el estado del servicio
3. Prueba el envío con **Demo Email**

### Desde el Código
```javascript
// Método simple
await emailService.bienvenida('usuario@example.com', 'María', 'Juan');

// Notificación completa (Firebase + Email)
await NotificationService.enviarBienvenida(tutorId, profileId, {
  nombreTutor: 'María',
  nombreNino: 'Juan'
});
```

## 🔧 Configuración de Gmail

### Paso 1: Habilitar 2FA
1. Ve a tu cuenta de Google → Seguridad
2. Habilita "Verificación en 2 pasos"

### Paso 2: Generar Contraseña de Aplicación
1. Ve a https://myaccount.google.com/apppasswords
2. Selecciona "Correo" y "Otro"
3. Copia la contraseña generada

### Paso 3: Configurar .env
```env
GMAIL_USER=tu-email@gmail.com
GMAIL_APP_PASSWORD=tu-contraseña-de-aplicacion-aqui
```

## 📊 Monitoreo y Debugging

### Health Checks
- **http://localhost:3001/health** - Estado general
- **http://localhost:3001/info** - Información del servicio
- **http://localhost:3001/api/email/status** - Estado del servicio de email

### Logs
- `email-service/logs/combined.log` - Todos los logs
- `email-service/logs/error.log` - Solo errores
- Consola en desarrollo

## 🎨 Ejemplos de Correos

### Bienvenida
```javascript
await emailService.bienvenida('nuevo@example.com', 'María', 'Juan');
```

### Recordatorio de Actividad
```javascript
await emailService.recordatorioActividad('tutor@example.com', 'Juan', 'María', 24);
```

### Logro Alcanzado
```javascript
await emailService.notificarLogro(
  'tutor@example.com',
  'Juan',
  'María',
  'Maestro de Formas',
  150
);
```

## 🚀 Despliegue

### Heroku
```bash
heroku create tu-app-email
heroku config:set GMAIL_USER=tu-email@gmail.com
heroku config:set GMAIL_APP_PASSWORD=tu-contraseña
git push heroku main
```

### Railway
```bash
railway login
railway init
railway up
```

## 📱 Funcionalidades Automáticas

Una vez configurado, el sistema enviará automáticamente:
- **Bienvenida** al registrar nuevos usuarios
- **Recordatorios** cuando no hay actividad (24h)
- **Logros** cuando se desbloquean achievements
- **Resúmenes** semanales los domingos
- **Recompensas** cuando están disponibles

## 🛟 Soporte y Troubleshooting

### Problemas Comunes
1. **"Invalid credentials"** → Verificar contraseña de aplicación
2. **"Connection refused"** → Verificar que el servicio esté corriendo
3. **"Rate limit exceeded"** → Esperar 1 minuto entre envíos
4. **Correos no llegan** → Verificar spam, configuración Gmail

### Verificación Rápida
```bash
# Verificar servicio
curl http://localhost:3001/health

# Enviar correo de prueba
curl -X POST http://localhost:3001/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"destinatario": "tu-email@gmail.com"}'
```

## 📖 Documentación Completa

Ver `email-service/DOCUMENTATION.md` para documentación técnica completa.

---

**¡El servicio está listo para usar!** 🎉

Solo necesitas:
1. Configurar tu contraseña de aplicación de Gmail
2. Ejecutar el servicio
3. Probar desde el panel de admin

¿Necesitas ayuda con alguna configuración específica?
