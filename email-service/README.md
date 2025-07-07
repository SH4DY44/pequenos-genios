# Servicio de Correos - Pequeños Genios

Servicio backend independiente para el manejo de correos electrónicos de la plataforma Pequeños Genios.

## 🚀 Características

- 📧 Envío de correos con plantillas HTML profesionales
- 🔒 Autenticación segura con contraseña de aplicación de Google
- 🚀 Rate limiting para prevenir spam
- 📊 Logging detallado de operaciones
- 🛡️ Middleware de seguridad integrado
- 📱 Plantillas responsivas para móviles
- 🔄 Integración con React Frontend
- 📋 Panel de administración para pruebas

## 📋 Requisitos

- Node.js 14 o superior
- Cuenta de Gmail con verificación en 2 pasos
- Contraseña de aplicación de Google configurada

## 🛠️ Instalación Paso a Paso

### 1. Instalar Dependencias

```bash
cd email-service
npm install
```

### 2. Configurar Variables de Entorno

Crea el archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
# Puerto del servidor
PORT=3001

# Configuración de CORS
CORS_ORIGIN=http://localhost:3000

# Configuración de Gmail
GMAIL_EMAIL=tu-email@gmail.com
GMAIL_APP_PASSWORD=tu-contraseña-de-aplicacion

# Configuración de Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10

# Configuración de Logging
LOG_LEVEL=info
```

### 3. Configurar Gmail

Para obtener una contraseña de aplicación de Google:

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Selecciona "Seguridad"
3. Habilita la "Verificación en 2 pasos"
4. Busca "Contraseñas de aplicaciones"
5. Genera una nueva contraseña para "Correo"
6. Usa esta contraseña en `GMAIL_APP_PASSWORD`

## 🏃‍♂️ Ejecutar el Servicio

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

El servicio estará disponible en `http://localhost:3001`

## 🔗 Verificar Funcionamiento

### 1. Health Check
```bash
curl http://localhost:3001/health
```

### 2. Probar Envío de Correo
```bash
curl -X POST http://localhost:3001/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "destinatario": "tu-email@gmail.com",
    "tipo": "actividad_pendiente",
    "datos": {
      "nombreNino": "Juan",
      "nombreTutor": "María",
      "horasSinActividad": 24
    }
  }'
```

## 📋 API Endpoints

### POST /api/email/send
Envía un correo electrónico usando plantillas predefinidas.

**Request:**
```json
{
  "destinatario": "usuario@example.com",
  "tipo": "actividad_pendiente",
  "datos": {
    "nombreNino": "Juan",
    "nombreTutor": "María",
    "horasSinActividad": 24
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Correo enviado exitosamente",
  "messageId": "abc123..."
}
```

### GET /api/email/status
Verifica el estado del servicio de correos.

**Response:**
```json
{
  "status": "operational",
  "timestamp": "2024-01-15T10:30:00Z",
  "emailsToday": 45,
  "lastEmailSent": "2024-01-15T10:25:00Z"
}
```

### GET /health
Health check del servicio.

**Response:**
```json
{
  "status": "OK",
  "uptime": 86400,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 📧 Tipos de Plantillas

| Tipo | Descripción | Datos Requeridos |
|------|-------------|------------------|
| `actividad_pendiente` | Recordatorio de actividad | `nombreNino`, `nombreTutor`, `horasSinActividad` |
| `logro_alcanzado` | Notificación de nuevo logro | `nombreNino`, `nombreTutor`, `nombreLogro`, `descripcionLogro` |
| `resumen_semanal` | Resumen semanal de progreso | `nombreNino`, `nombreTutor`, `actividadesCompletadas`, `tiempoTotal` |
| `bienvenida` | Correo de bienvenida | `nombreNino`, `nombreTutor` |
| `recompensa_disponible` | Notificación de recompensa | `nombreNino`, `nombreTutor`, `nombreRecompensa`, `estrellas` |

## 🎯 Integración con Frontend

### 1. Configurar Frontend

En el archivo `.env` del frontend (directorio raíz):

```env
REACT_APP_EMAIL_SERVICE_URL=http://localhost:3001
```

### 2. Probar desde el Panel de Administración

1. Inicia el frontend: `npm start`
2. Ve a `http://localhost:3000`
3. Navega al Panel de Administración
4. Busca la sección "Demo de Correos"
5. Prueba el envío de diferentes tipos de correo

### 3. Acceso Directo al Demo

Para acceso rápido al demo de correos:
- URL: `http://localhost:3000/admin` (Panel de administración)
- Busca la sección "Email Service Admin"

## 🔧 Solución de Problemas

### Error: "Invalid login"
- Verifica que hayas habilitado la verificación en 2 pasos
- Asegúrate de usar la contraseña de aplicación, no tu contraseña normal
- Verifica que el email en `.env` sea correcto

### Error: "Connection timeout"
- Revisa tu conexión a internet
- Verifica que Gmail no esté bloqueando la conexión
- Asegúrate de que el puerto 587 esté abierto

### Error: "Rate limit exceeded"
- Espera un minuto antes de enviar otro correo
- Ajusta `RATE_LIMIT_MAX_REQUESTS` en `.env` si es necesario

### Error: "CORS"
- Verifica que `CORS_ORIGIN` en `.env` coincida con la URL del frontend
- Para desarrollo local, usa `http://localhost:3000`

## 📁 Estructura del Proyecto

```
email-service/
├── server.js              # Servidor principal
├── setup.js               # Script de configuración
├── package.json            # Dependencias
├── .env                    # Variables de entorno
├── .env.example           # Ejemplo de variables
├── README.md              # Este archivo
├── DOCUMENTATION.md       # Documentación técnica
├── logs/                  # Logs del sistema
│   ├── combined.log
│   └── error.log
└── src/
    ├── config/
    │   ├── config.js      # Configuración general
    │   └── logger.js      # Configuración de logging
    ├── middleware/
    │   └── index.js       # Middleware de seguridad
    ├── routes/
    │   └── email.js       # Rutas de email
    ├── services/
    │   ├── emailService.js # Servicio de envío
    │   └── emailTemplates.js # Plantillas HTML
```

## 🚀 Despliegue en Producción

### Heroku
```bash
heroku create pequenos-genios-email
heroku config:set GMAIL_EMAIL=tu-email@gmail.com
heroku config:set GMAIL_APP_PASSWORD=tu-contraseña
git push heroku main
```

### Railway
```bash
railway login
railway new
railway add
railway deploy
```

### Variables de Entorno en Producción
```env
PORT=3001
CORS_ORIGIN=https://tu-dominio.com
GMAIL_EMAIL=tu-email@gmail.com
GMAIL_APP_PASSWORD=tu-contraseña-de-aplicacion
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10
LOG_LEVEL=info
NODE_ENV=production
```

## 🔐 Seguridad

- **Rate limiting**: 10 correos por minuto por IP
- **Helmet**: Headers de seguridad HTTP
- **CORS**: Configurado para el frontend
- **Validación**: Datos validados con Joi
- **Logging**: Todas las operaciones registradas
- **Contraseña de aplicación**: Nunca uses tu contraseña real de Gmail

## 📊 Logs y Monitoreo

Los logs se guardan en:
- `logs/combined.log`: Todos los logs
- `logs/error.log`: Solo errores

Para monitorear en tiempo real:
```bash
tail -f logs/combined.log
```

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-caracteristica`
3. Commit: `git commit -m 'Agregar nueva característica'`
4. Push: `git push origin feature/nueva-caracteristica`
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas:
1. Revisa esta documentación
2. Verifica los logs en `logs/error.log`
3. Asegúrate de que todas las variables de entorno estén configuradas
4. Verifica que Gmail esté configurado correctamente

---

**¡Listo para usar! 🎉**

El servicio de correos está completamente funcional y listo para integrarse con tu aplicación.
