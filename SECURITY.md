# 🔒 Guía de Seguridad - Pequeños Genios

## Variables de Entorno

Este proyecto utiliza variables de entorno para proteger las credenciales sensibles.

### Configuración Requerida

1. **Copia el archivo de ejemplo:**
   ```bash
   cp .env.example .env
   ```

2. **Configura las variables en `.env`:**
   ```
   REACT_APP_FIREBASE_API_KEY=tu_api_key_aqui
   REACT_APP_FIREBASE_AUTH_DOMAIN=tu_proyecto_id.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=tu_proyecto_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=tu_proyecto_id.firebasestorage.app
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=tu_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=tu_measurement_id
   ```

### Obtener Credenciales de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a Configuración del Proyecto > General
4. En "Tus apps", selecciona tu app web
5. Copia las credenciales del objeto `firebaseConfig`

## ⚠️ Importante

- **NUNCA** subas el archivo `.env` al repositorio
- **NUNCA** compartas las credenciales de Firebase
- **SIEMPRE** usa variables de entorno para credenciales sensibles

## Archivos Sensibles

Los siguientes archivos NO deben subirse al repositorio:
- `.env`
- `.env.local`
- `.env.development.local`
- `.env.test.local`
- `.env.production.local` 