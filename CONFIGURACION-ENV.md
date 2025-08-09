# 🚀 Configuración de Variables de Entorno

Este proyecto requiere configurar variables de entorno para funcionar correctamente.

## 📋 Pasos de Configuración

### 1. Frontend (Raíz del proyecto)

1. **Copia el archivo de ejemplo**:
   ```bash
   cp .env.example .env
   ```

2. **Configura Firebase**:
   - Ve a [Firebase Console](https://console.firebase.google.com)
   - Selecciona tu proyecto
   - Ve a Configuración → Configuración del proyecto
   - En la sección "Apps", copia las credenciales
   - Reemplaza los valores en tu archivo `.env`

### 2. Email Service

1. **Navega al directorio**:
   ```bash
   cd email-service
   ```

2. **Copia el archivo de ejemplo**:
   ```bash
   cp .env.example .env
   ```

3. **Configura Gmail**:
   - Habilita verificación en 2 pasos en tu cuenta de Google
   - Genera una contraseña de aplicación específica
   - Reemplaza `tu-email@gmail.com` con tu email real
   - Reemplaza `tu-contraseña-de-aplicacion-gmail` con la contraseña generada

## 🔒 Seguridad

- **NUNCA** hagas commit de archivos `.env` reales
- Los archivos `.env` están en `.gitignore`
- Solo sube archivos `.env.example` con datos de ejemplo
- Cada desarrollador debe configurar sus propias credenciales

## 🚀 Ejecución

1. **Frontend**:
   ```bash
   npm start
   ```

2. **Email Service**:
   ```bash
   cd email-service
   node server.js
   ```

## 📧 Verificación del Email Service

Verifica que el servicio esté funcionando:
```bash
curl http://localhost:3002/health
```
