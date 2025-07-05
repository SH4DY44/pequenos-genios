# ⏰ Cronograma de Envío de Correos - Pequeños Genios

## 📧 Momentos de Envío Automático

### 🏆 **LOGROS** (Inmediato)
- **Trigger:** Cuando se completa una actividad y se verifica un nuevo logro
- **Frecuencia:** Inmediato
- **Condición:** Solo si es un logro nuevo (no duplicados)
- **Plantilla:** `logro_alcanzado`

### ⏰ **INACTIVIDAD** (Escalonado)
- **24 horas:** Recordatorio suave - "¡Te extrañamos!"
- **48 horas:** Recordatorio medio - "Es hora de seguir aprendiendo"
- **72 horas:** Recordatorio fuerte - "No pierdas el progreso"
- **Condición:** Solo si no se ha enviado ese tipo de recordatorio recientemente
- **Plantilla:** `actividad_pendiente`

### 📊 **RESUMEN SEMANAL** (Programado)
- **Día:** Domingos
- **Hora:** Al final del día (cuando se ejecuta el monitoreo)
- **Condición:** Solo si hubo actividad durante la semana
- **Frecuencia:** Una vez por semana máximo
- **Plantilla:** `resumen_semanal`

### 📝 **EVALUACIÓN RECOMENDADA** (Periódico)
- **Frecuencia:** Cada 6 meses
- **Condición:** Si han pasado 6+ meses desde la última evaluación
- **Anti-spam:** No enviar si ya se envió en los últimos 30 días
- **Plantilla:** `evaluacion_recomendada`

## 🔄 Monitoreo en Tiempo Real

### Frontend (useNotificationAutomation)
```javascript
// DESARROLLO
- Logros: cada 30 segundos
- Actividad: cada 1 minuto

// PRODUCCIÓN  
- Logros: cada 5 minutos
- Actividad: cada 30 minutos
```

### Backend (NotificationScheduler)
- Se ejecuta cuando se detectan cambios
- Verifica condiciones antes de enviar
- Evita duplicados con timestamps

## 🛡️ Protecciones Anti-Spam

### ✅ Verificaciones Activas
1. **Timestamp de último envío:** No enviar el mismo tipo de notificación muy seguido
2. **Condiciones específicas:** Solo enviar si se cumplen criterios exactos
3. **Usuario activo:** Solo monitorear si el usuario está en la aplicación
4. **Estado de autenticación:** Solo para usuarios logueados

### ⏱️ Intervalos Mínimos
- **Logros:** Inmediato (pero solo nuevos logros)
- **Inactividad:** 24 horas entre tipos diferentes
- **Resumen:** 7 días mínimo
- **Evaluación:** 30 días mínimo

## 🎯 Triggers Específicos

### Automáticos
- ✅ Completar actividad → Verificar logros
- ✅ Pasar tiempo límite sin actividad → Recordatorio
- ✅ Domingo → Generar resumen (si hay actividad)
- ✅ 6 meses sin evaluación → Recordatorio evaluación

### Manuales (Disponibles)
- 🔧 `ejecutarVerificacionManual()` - Admin Panel
- 🔧 EmailDemo - Pruebas desde la interfaz
- 🔧 Botón "Enviar" en AdminPanel

## 📱 Estados de Envío

### Condiciones para Enviar
1. **Usuario autenticado:** `auth.currentUser` debe existir
2. **Email válido:** Tutor debe tener email configurado
3. **Servicio activo:** Email service debe estar corriendo (puerto 3001)
4. **Perfil válido:** Perfil del niño debe existir y estar activo

### Manejo de Errores
- Si falla el envío de email → Se registra error pero continúa
- Si falla Firebase → Se registra en logs
- Si no hay conexión → Se intenta más tarde

## 🔧 Configuración Actual

### Variables de Entorno
```bash
# Intervalos de desarrollo (más frecuentes para testing)
NODE_ENV=development → 30s/1min

# Intervalos de producción (optimizados)
NODE_ENV=production → 5min/30min
```

### Personalización
- Los intervalos se pueden ajustar en `useNotificationAutomation.js`
- Las plantillas están en `email-service/src/services/emailTemplates.js`
- Las condiciones se pueden modificar en `NotificationScheduler.js`
