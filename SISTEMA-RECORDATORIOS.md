# 📅 Sistema de Recordatorios Programados Automáticos

## ✨ Funcionalidades Implementadas

### 🎯 **Validación de Fechas Futuras**
- ✅ Usa la fecha/hora actual del sistema dinámicamente (no fecha fija)
- ✅ No permite seleccionar fechas pasadas (mínimo 1 minuto en el futuro)
- ✅ Validación tanto en frontend (Yup) como en campos HTML (`min` attribute)
- ✅ Mensajes de error aparecen solo cuando hay validación fallida
- ✅ Adaptable a cualquier zona horaria del usuario

### 📧 **Envío Dual de Recordatorios**
1. **Inmediato**: Al crear el recordatorio se envía un email de confirmación
2. **Programado**: Se programa automáticamente un recordatorio para la fecha especificada

### 🔄 **Programación Automática por Tipo**

#### 🏥 **Cita Médica**
- **Recordatorio inmediato**: Al crear
- **Recordatorio automático**: 1 día antes a las 7:00 PM
- **Ejemplo**: Si la cita es mañana, se envía recordatorio hoy a las 19:00

#### 📚 **Tarea Escolar**
- **Recordatorio inmediato**: Al crear
- **Recordatorio automático**: 1 día antes a las 6:00 PM
- **Ejemplo**: Si la entrega es mañana, se envía recordatorio hoy a las 18:00

#### 💊 **Medicamento**
- **Recordatorio inmediato**: Al crear
- **Recordatorio automático**: Diario a las 8:00 AM
- **Ejemplo**: Se programa para mañana y días subsecuentes

#### 🔔 **General**
- **Solo recordatorio inmediato**: No se programa automáticamente

## 🛠️ **Componentes Técnicos**

### 📁 **Archivos Creados/Modificados**

1. **`/src/services/reminderScheduler.js`**
   - Gestión de recordatorios programados en Firestore
   - Procesamiento de recordatorios pendientes
   - Manejo de errores y reintentos

2. **`/src/utils/reminderProcessor.js`**
   - Procesador que se ejecuta cada 5 minutos
   - Auto-inicio en producción
   - Gestión del ciclo de vida

3. **`/src/components/notifications/ScheduledRemindersPanel.js`**
   - Panel de administración de recordatorios
   - Estadísticas en tiempo real
   - Controles manuales

4. **`CreateReminderModal.js`** (Modificado)
   - Validación de fechas futuras
   - Integración con programación automática
   - Mejor UX con mensajes informativos

5. **Email Service** (Mejorado)
   - 4 nuevas plantillas específicas por tipo
   - Validación actualizada en rutas
   - Diseños personalizados con colores temáticos

## 🚀 **Cómo Usar el Sistema**

### 1. **Crear Recordatorio**
```javascript
// El usuario llena el formulario con:
- Tipo: Cita Médica
- Especialista: Dr. García - Psicólogo  
- Fecha: 15/08/2025 10:30 AM
- Mensaje personalizado
```

### 2. **Flujo Automático**
```
✅ Validación → Fechas futuras obligatorias
📧 Email inmediato → Confirmación de creación
📅 Programación → Recordatorio 1 día antes
💾 Almacenamiento → Firestore: recordatoriosProgramados
```

### 3. **Procesamiento Automático**
```
🔄 Cada 5 minutos → ReminderProcessor verifica pendientes
📤 Envío automático → Emails en fecha/hora programada
✅ Estado actualizado → "enviado", "fallido", etc.
🧹 Limpieza → Recordatorios antiguos eliminados
```

## 📊 **Estructura de Datos**

### **recordatoriosProgramados (Firestore)**
```javascript
{
  tutorId: "user_123",
  profileId: "profile_456", 
  nombreNino: "Ana",
  tipo: "cita_medica",
  fechaProgramada: "2025-08-14T19:00:00Z",
  datos: {
    titulo: "Cita con psicólogo",
    especialista: "Dr. García",
    fechaCita: "2025-08-15T10:30:00Z",
    // ... otros campos específicos
  },
  estado: "programado", // "enviado", "fallido", "cancelado"
  fechaCreacion: "2025-08-08T20:30:00Z",
  intentosEnvio: 0,
  maxIntentos: 3
}
```

## 🎨 **Plantillas de Email Personalizadas**

### 💊 **Medicamento**
- Color: Rojo (#e74c3c)
- Campos: medicamento, dosis, hora
- Emoji: 💊
- Consejos: Seguir indicaciones médicas

### 🏥 **Cita Médica**  
- Color: Verde (#2ecc71)
- Campos: especialista, fecha, hora, lugar
- Emoji: 🏥
- Lista: Documentos a llevar

### 📚 **Tarea Escolar**
- Color: Morado (#f39c12) 
- Campos: materia, fecha entrega, descripción
- Emoji: 📚
- Consejos: Tips de estudio

### 🔔 **General**
- Color: Azul (#6c5ce7)
- Campos: título, mensaje personalizado
- Emoji: 🔔
- Uso: Recordatorios genéricos

## ⚙️ **Configuración**

### **Variables de Entorno (.env)**
```bash
# Servicio de Email
REACT_APP_EMAIL_SERVICE_URL=http://localhost:3002/api/email
REACT_APP_EMAIL_API_KEY=

# Firebase (para recordatorios programados)
REACT_APP_FIREBASE_PROJECT_ID=pequenos-genios-94b29
# ... otras variables Firebase
```

### **Firestore Rules** (Agregar)
```javascript
// Permitir acceso a recordatorios programados
match /recordatoriosProgramados/{document=**} {
  allow read, write: if request.auth != null 
    && request.auth.uid == resource.data.tutorId;
}
```

## 🔧 **Administración**

### **Panel de Control** (`ScheduledRemindersPanel`)
- ✅ Ver estadísticas en tiempo real
- ▶️ Iniciar/detener procesador
- 🔄 Ejecutar procesamiento manual  
- 📊 Monitor de estado del servicio

### **Comandos Útiles**
```bash
# Verificar estado del email service
curl http://localhost:3002/health

# Ver logs del procesador
console.log(ReminderProcessor.obtenerEstado())

# Estadísticas completas  
const stats = await ReminderProcessor.obtenerEstadisticas()
```

## 🐛 **Resolución de Problemas**

### **Recordatorios no se envían**
1. Verificar email service en puerto 3002
2. Comprobar procesador: `ReminderProcessor.obtenerEstado()`
3. Verificar fecha programada no sea pasada
4. Revisar límite de intentos (máx 3)

### **Fechas no válidas**
1. Verificar zona horaria del navegador
2. Validar formato de fecha en Firestore
3. Comprobar configuración `min` en campos HTML

### **Emails no llegan**
1. Verificar credenciales Gmail en `.env`
2. Comprobar límites de rate limiting
3. Revisar logs del email service
4. Validar formato de plantillas

## 📈 **Métricas de Éxito**

- ✅ **4 plantillas personalizadas** funcionando
- ✅ **Validación de fechas futuras** implementada  
- ✅ **Doble envío** (inmediato + programado)
- ✅ **Procesamiento automático** cada 5 minutos
- ✅ **Manejo de errores** con reintentos
- ✅ **Panel de administración** funcional
- ✅ **Limpieza automática** de datos antiguos

## 🎉 **Beneficios para el Usuario**

1. **Mayor efectividad**: Recordatorios en el momento oportuno
2. **Menos olvidos**: Notificaciones anticipadas automáticas  
3. **Personalización**: Contenido específico por tipo de recordatorio
4. **Confiabilidad**: Sistema robusto con reintentos y monitoreo
5. **Facilidad de uso**: Configuración automática, sin intervención manual
