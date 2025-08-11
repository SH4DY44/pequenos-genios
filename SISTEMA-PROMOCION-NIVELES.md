# Sistema de Promoción Automática de Niveles

## 📋 Descripción

Este sistema evalúa automáticamente el progreso de los niños y los promueve al siguiente nivel cuando cumplen ciertos criterios específicos de desempeño.

## 🎯 Niveles Disponibles

1. **Básico** → **Básico Alto** → **Intermedio** → **Avanzado**

## 📊 Criterios de Promoción

### De Básico a Básico Alto
- ✅ **15+ actividades** completadas
- ✅ **150+ puntos** totales
- ✅ **70%+ precisión** promedio
- ✅ **3+ días** de racha consecutiva
- ✅ **7+ días** en el nivel actual
- ✅ **3+ actividades** perfectas (100%)

### De Básico Alto a Intermedio
- ✅ **30+ actividades** completadas
- ✅ **400+ puntos** totales
- ✅ **75%+ precisión** promedio
- ✅ **5+ días** de racha consecutiva
- ✅ **10+ días** en el nivel actual
- ✅ **5+ actividades** perfectas
- ✅ **10+ juegos** completados

### De Intermedio a Avanzado
- ✅ **50+ actividades** completadas
- ✅ **800+ puntos** totales
- ✅ **80%+ precisión** promedio
- ✅ **7+ días** de racha consecutiva
- ✅ **14+ días** en el nivel actual
- ✅ **8+ actividades** perfectas
- ✅ **15+ juegos** completados
- ✅ **5+ logros** obtenidos

## 🔄 Funcionamiento Automático

### Evaluación Continua
- El sistema evalúa automáticamente cada vez que se actualiza el perfil del niño
- Verifica las últimas 4 semanas de actividad (configurable)
- Calcula estadísticas de rendimiento en tiempo real

### Promoción Automática
- Cuando se cumplen TODOS los criterios, se activa la promoción
- El nivel se actualiza automáticamente en Firebase
- Se envían notificaciones de felicitación
- Se registra el historial de promociones

## 🛠️ Componentes del Sistema

### 1. `SistemaPromocionNiveles.js`
**Clase principal** que maneja toda la lógica de evaluación y promoción.

**Métodos principales:**
- `evaluarPromocion(profileId)` - Evalúa si puede promocionarse
- `promoverNivel(profileId)` - Realiza la promoción automática
- `verificarPromocionesAutomaticas()` - Verifica todos los perfiles

### 2. `usePromocionNiveles.js`
**Hook de React** para integrar el sistema en componentes.

**Proporciona:**
- Estado de evaluación actual
- Funciones para promover
- Datos de progreso
- Sugerencias de mejora

### 3. `ProgresoNivelComponent.js`
**Componente visual** que muestra el progreso hacia el siguiente nivel.

**Características:**
- Barra de progreso visual
- Lista de criterios con estado
- Botón para promoción manual
- Sugerencias para mejorar

### 4. `TareasPeriodicasNiveles.js`
**Servicio** para ejecutar verificaciones automáticas.

**Funciones:**
- Verificación periódica
- Evaluación manual
- Promoción manual

## 📈 Integración en TutorPanel

El sistema está integrado en la sección **"Progreso"** del TutorPanel:

1. **Header** con botón "Evaluar Progreso"
2. **Componente visual** que muestra criterios
3. **Evaluación automática** en tiempo real
4. **Promoción manual** disponible cuando se cumplen criterios

## 🎮 Cómo Usar el Sistema

### Para Tutores (Manual)
1. Ir al **TutorPanel** → sección **"Progreso"**
2. Ver el progreso hacia el siguiente nivel
3. Hacer clic en **"Evaluar Progreso"** para verificar manualmente
4. Si está listo, hacer clic en **"¡Promover Nivel!"**

### Automático (Recomendado)
El sistema funciona automáticamente:
- Se activa cada vez que el niño completa actividades
- Evalúa progreso en tiempo real
- Promueve automáticamente cuando se cumplen criterios

## 🔧 Configuración

### Modificar Criterios
Editar el objeto `CRITERIOS_PROMOCION` en `SistemaPromocionNiveles.js`:

```javascript
static CRITERIOS_PROMOCION = {
  'básico_a_básico-alto': {
    criterios: {
      actividadesCompletadas: 15,  // Cambiar aquí
      puntosTotales: 150,          // Cambiar aquí
      // ... más criterios
    }
  }
}
```

### Periodo de Evaluación
Modificar `PERIODO_EVALUACION` para cambiar el tiempo de análisis:

```javascript
static PERIODO_EVALUACION = {
  dias: 30,              // Evaluar últimos 30 días
  sesionesMinimas: 10    // Mínimo 10 sesiones
};
```

## 📊 Datos que se Evalúan

### Estadísticas del Perfil
- `actividadesCompletadas` - Total de actividades
- `puntosTotales` - Puntos acumulados
- `racha` - Días consecutivos de actividad
- `actividadesPerfectas` - Actividades con 100%
- `juegosCompletados` - Juegos terminados
- `logros` - Logros obtenidos

### Estadísticas Recientes (30 días)
- Precisión promedio
- Actividades exitosas
- Puntos obtenidos recientemente
- Consistencia en el tiempo

## 🐛 Solución de Problemas

### Error: "Perfil no encontrado"
- Verificar que el `profileId` sea correcto
- Comprobar permisos de Firebase

### Promoción no automática
- Verificar que todos los criterios se cumplan al 100%
- Revisar logs en consola del navegador
- Verificar datos de las últimas 4 semanas

### Componente no aparece
- Verificar imports en TutorPanel
- Comprobar que el hook esté correctamente configurado

## 🔍 Debugging

Para ver logs detallados, abrir la consola del navegador y buscar:
- `🎓 Iniciando evaluación de promoción`
- `📊 Criterios evaluados`
- `🎉 Promoción completada`

## 📞 Soporte

Si encuentras problemas con el sistema de promoción:
1. Revisar la consola del navegador
2. Verificar configuración de Firebase
3. Comprobar datos del perfil del niño
