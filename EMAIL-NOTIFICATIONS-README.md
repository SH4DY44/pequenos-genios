# 📧 Sistema de Notificaciones Automáticas con Email

Este documento explica cómo funciona el nuevo sistema de notificaciones automáticas integrado con el servicio de email de Pequeños Genios.

## 🚀 Características Principales

### ✅ Notificaciones Automáticas
- **Actividad Pendiente**: Se envía cuando un niño no ha realizado actividades en 24+ horas
- **Logros Alcanzados**: Notificación automática cuando se desbloquea un nuevo logro
- **Resúmenes Semanales**: Reportes automáticos del progreso semanal
- **Recordatorios Personalizados**: Sistema para crear recordatorios manuales

### ✅ Integración con Email Service
- **Reemplaza WhatsApp**: Ahora usa el servicio de email en lugar de WhatsApp
- **Plantillas Profesionales**: Emails con diseño atractivo y responsive
- **Envío Automático**: Las notificaciones se envían automáticamente por email
- **Estado del Servicio**: Monitoreo en tiempo real del estado del email service

## 🛠️ Configuración

### 1. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con:

```env
# Configuración del Email Service
REACT_APP_EMAIL_SERVICE_URL=http://localhost:3001
REACT_APP_EMAIL_API_KEY=tu-api-key-aqui
```

### 2. Iniciar el Email Service

```bash
# Navegar al directorio del email service
cd email-service

# Instalar dependencias
npm install

# Configurar credenciales de Gmail
# Editar src/config/config.js con tus credenciales

# Iniciar el servicio
npm start
```

### 3. Configurar Credenciales de Gmail

En `email-service/src/config/config.js`:

```javascript
module.exports = {
  gmail: {
    user: 'tu-email@gmail.com',
    password: 'tu-contraseña-de-aplicacion' // Usar contraseña de aplicación, NO la contraseña normal
  }
  // ... otras configuraciones
};
```

## 📋 Uso del Sistema

### Crear Recordatorios Manuales

1. **Ir a Notificaciones**: Navega a la sección de notificaciones
2. **Crear Recordatorio**: Haz clic en "Crear Recordatorio"
3. **Seleccionar Tipo**:
   - 🔔 Recordatorio General
   - 🏥 Cita Médica
   - 💊 Medicamento
   - 📚 Tarea Escolar
4. **Configurar Detalles**: Completa título, mensaje y datos específicos
5. **Enviar por Email**: Marca la opción para enviar también por email
6. **Crear**: El recordatorio se guarda y se envía el email

### Notificaciones Automáticas

El sistema verifica automáticamente:

- **Cada 30 minutos** (configurable)
- **Actividades pendientes** de todos los perfiles
- **Evita duplicados** (no envía la misma notificación en 6 horas)
- **Envío automático** de emails al tutor

### Panel de Desarrollo

En modo desarrollo, puedes acceder al panel de pruebas:

1. **Verificar Estado**: Comprobar si el email service está funcionando
2. **Probar Notificaciones**: Ejecutar verificaciones manuales
3. **Enviar Correo de Prueba**: Probar el envío de emails
4. **Ver Resultados**: Monitorear el estado de las notificaciones

## 🔧 Servicios Principales

### EmailService (`src/services/emailService.js`)

```javascript
import EmailService from '../services/emailService';

// Enviar correo
await EmailService.enviarCorreo(destinatario, tipo, datos);

// Verificar estado
const status = await EmailService.verificarEstado();

// Enviar prueba
await EmailService.enviarPrueba(emailTutor);
```

### AutomaticNotificationService (`src/services/automaticNotificationService.js`)

```javascript
import AutomaticNotificationService from '../services/automaticNotificationService';

// Verificar actividad pendiente
const actividad = await AutomaticNotificationService.verificarActividadPendiente(profileId);

// Enviar notificación automática
await AutomaticNotificationService.enviarNotificacionActividadPendiente(profileId, datos);

// Verificar todos los perfiles
const resultados = await AutomaticNotificationService.verificarYEnviarNotificacionesAutomaticas();
```

### Setup Automático (`src/utils/setupAutomaticNotifications.js`)

```javascript
import automaticNotificationsSetup from '../utils/setupAutomaticNotifications';

// Iniciar sistema automático
await automaticNotificationsSetup.start(30); // 30 minutos

// Detener sistema
automaticNotificationsSetup.stop();

// Verificar estado
const status = automaticNotificationsSetup.getStatus();
```

## 📧 Tipos de Plantillas de Email

### 1. Actividad Pendiente
- **Cuándo**: Niño no ha realizado actividades en 24+ horas
- **Contenido**: Recordatorio amigable con enlace a la plataforma

### 2. Logro Alcanzado
- **Cuándo**: Se desbloquea un nuevo logro
- **Contenido**: Felicitaciones y detalles del logro

### 3. Resumen Semanal
- **Cuándo**: Reporte semanal de progreso
- **Contenido**: Estadísticas y logros de la semana

### 4. Recordatorio Personalizado
- **Cuándo**: Recordatorio creado manualmente por el tutor
- **Contenido**: Mensaje personalizado según el tipo seleccionado

## 🎯 Ventajas del Nuevo Sistema

### ✅ Sobre WhatsApp
- **Más Profesional**: Emails con diseño profesional
- **Más Confiable**: No depende de WhatsApp Web
- **Más Información**: Puede incluir más detalles y enlaces
- **Mejor Seguimiento**: Historial completo en la base de datos

### ✅ Automatización
- **Sin Intervención**: Funciona automáticamente
- **Inteligente**: Evita notificaciones duplicadas
- **Escalable**: Puede manejar múltiples perfiles
- **Configurable**: Intervalos y tipos personalizables

## 🚨 Solución de Problemas

### Error de Credenciales Gmail
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

**Solución**:
1. Activar verificación en dos pasos en tu cuenta de Google
2. Generar contraseña de aplicación en: https://myaccount.google.com/apppasswords
3. Usar la contraseña de aplicación en lugar de la contraseña normal

### Email Service No Responde
```
Error: Failed to fetch
```

**Solución**:
1. Verificar que el email service esté ejecutándose
2. Comprobar la URL en las variables de entorno
3. Verificar que el puerto 3001 esté disponible

### Notificaciones No Se Envían
```
Error: No se pudo obtener el email del tutor
```

**Solución**:
1. Verificar que el usuario esté autenticado
2. Comprobar que el email del tutor esté configurado
3. Verificar permisos de Firebase

## 📊 Monitoreo y Logs

### Logs del Email Service
```bash
# Ver logs en tiempo real
cd email-service
tail -f logs/app.log
```

### Logs del Frontend
```javascript
// En la consola del navegador
console.log('🔍 Verificando notificaciones automáticas...');
console.log('📧 Email enviado correctamente');
console.log('⚠️ Error enviando email:', error);
```

## 🔄 Migración desde WhatsApp

### Cambios Realizados
1. **Reemplazado WhatsAppService** por EmailService
2. **Actualizado CreateReminderModal** para usar email
3. **Agregado AutomaticNotificationService** para automatización
4. **Creado panel de pruebas** para desarrollo

### Compatibilidad
- **Recordatorios existentes**: Se mantienen en la base de datos
- **Notificaciones**: Se siguen mostrando en la app
- **Configuración**: Solo cambia el método de envío

## 🎉 Próximos Pasos

### Mejoras Futuras
1. **Plantillas Personalizables**: Permitir que los tutores personalicen plantillas
2. **Programación Avanzada**: Recordatorios programados para fechas específicas
3. **Múltiples Destinatarios**: Enviar a múltiples emails
4. **Analytics**: Métricas de envío y apertura de emails
5. **Integración con Calendario**: Sincronizar con Google Calendar

### Configuración en Producción
1. **Servidor Dedicado**: Email service en servidor separado
2. **Base de Datos**: Configurar base de datos para logs
3. **Monitoreo**: Sistema de alertas para fallos
4. **Backup**: Respaldos automáticos de configuración

---

## 📞 Soporte

Si tienes problemas con el sistema de notificaciones:

1. **Verificar logs** en la consola del navegador
2. **Comprobar estado** del email service
3. **Revisar credenciales** de Gmail
4. **Contactar soporte** con los logs de error

¡El nuevo sistema de notificaciones automáticas está listo para usar! 🚀 