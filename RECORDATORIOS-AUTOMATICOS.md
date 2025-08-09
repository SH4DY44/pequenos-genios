# 🤖 Recordatorios Automáticos Inteligentes

## 📋 **Tipos de Recordatorios Automáticos**

### 1. **🎮 Inactividad en Actividades** 
**Trigger**: 24 horas sin hacer actividades
**Frecuencia**: Cada 24h hasta que haga actividad
**Plantilla**: `recordatorio_inactividad`

**Mensaje**:
```
¡Hola! 👋

Hemos notado que {nombreNino} no ha hecho actividades en Pequeños Genios en las últimas 24 horas. 

🎯 **Recuerda que cada día cuenta para el aprendizaje**
- Solo 10-15 minutos pueden marcar la diferencia
- {nombreNino} puede continuar donde se quedó
- Hay nuevas actividades esperándolo

🌟 **¿Sabías que?** Los niños que practican a diario mejoran 3x más rápido.

👆 **¡Ingresa ahora y continúa la aventura de aprender!**

---
Con cariño,
El equipo de Pequeños Genios 💙
```

### 2. **📈 Pérdida de Racha**
**Trigger**: Tenía racha de 3+ días consecutivos y la perdió
**Frecuencia**: Una vez al perder la racha
**Plantilla**: `recordatorio_racha_perdida`

**Mensaje**:
```
¡Oh no! 😔

{nombreNino} tenía una increíble racha de {diasRacha} días consecutivos practicando, pero se rompió ayer.

🔥 **¡Pero no todo está perdido!**
- Las rachas se pueden recuperar
- Cada día es una nueva oportunidad
- {nombreNino} ya demostró que puede hacerlo

🎯 **Consejo**: Empezar con solo 5 minutos hoy puede reactivar la motivación.

💪 **¡Vamos {nombreNino}, a comenzar una nueva racha aún mejor!**

---
¡Tú puedes! 🌟
Pequeños Genios
```

### 3. **🎯 Meta Semanal no Cumplida**
**Trigger**: Viernes y no completó meta semanal (ej: 5 actividades)
**Frecuencia**: Una vez por semana
**Plantilla**: `recordatorio_meta_semanal`

**Mensaje**:
```
¡Fin de semana a la vista! 🎉

{nombreNino} hizo {actividadesCompletadas} de {metaSemanal} actividades esta semana.

📊 **Estado actual**:
- Completadas: {actividadesCompletadas}
- Faltan: {actividadesFaltantes}
- Tiempo restante: Fin de semana

🚀 **¡Aún hay tiempo!**
- El fin de semana es perfecto para ponerse al día
- Actividades cortas de 10 minutos cuentan
- Cada actividad suma al progreso

🎁 **Recompensa especial** si completa la meta antes del domingo.

---
¡A por esa meta! 💪
Pequeños Genios
```

### 4. **🌟 Actividad Favorita Abandonada**
**Trigger**: 7 días sin hacer su actividad favorita
**Frecuencia**: Semanal
**Plantilla**: `recordatorio_actividad_favorita`

**Mensaje**:
```
¡Extrañamos verte en {actividadFavorita}! 💙

Hace {diasSinActividad} días que {nombreNino} no practica {actividadFavorita}, que era su actividad favorita.

🎮 **¿Qué pasó?**
- ¿Necesita un nuevo desafío?
- ¿Prefiere explorar otras áreas?
- ¿Perdió el interés temporal?

✨ **Tenemos novedades**:
- Nuevos niveles en {actividadFavorita}
- Desafíos más divertidos
- Recompensas especiales

🎯 **Sugerencia**: Prueba solo 5 minutos hoy, ¡te sorprenderás!

---
Te esperamos de vuelta 🌟
Pequeños Genios
```

### 5. **📚 Área de Aprendizaje Rezagada**
**Trigger**: 5+ días sin avanzar en matemáticas/lectura/etc
**Frecuencia**: Cada 5 días
**Plantilla**: `recordatorio_area_rezagada`

**Mensaje**:
```
¡Hora de equilibrar el aprendizaje! ⚖️

{nombreNino} ha estado genial en {areasActivas}, pero hace {diasSinArea} días que no practica {areaRezagada}.

📚 **¿Por qué es importante {areaRezagada}?**
- Desarrollo integral del cerebro
- Mejor rendimiento escolar
- Habilidades complementarias

🎨 **Nuevas formas de practicar {areaRezagada}**:
- Juegos interactivos
- Actividades de 5 minutos
- Retos divertidos y fáciles

🏆 **Bonus**: Completar una actividad de {areaRezagada} hoy da estrellas extra.

---
¡Aprendizaje balanceado! 🌈
Pequeños Genios
```

### 6. **🎖️ Cerca de Logro**
**Trigger**: A 1-2 actividades de conseguir una medalla
**Frecuencia**: Una vez cuando esté cerca
**Plantilla**: `recordatorio_cerca_logro`

**Mensaje**:
```
¡Estás súper cerca! 🎯

{nombreNino} está a solo {actividadesFaltantes} actividades de conseguir "{nombreLogro}"

🏆 **Lo que falta**:
- {actividadesFaltantes} actividades más
- Tiempo estimado: {tiempoEstimado} minutos
- Recompensa: {recompensaLogro}

⭐ **Este logro te dará**:
- {recompensaLogro}
- Puntos extra
- ¡Mucho orgullo!

🚀 **¡Es el momento perfecto para completarlo!**

---
¡Tú puedes lograrlo! 💪
Pequeños Genios
```

### 7. **⭐ Estrellas sin Canjear**
**Trigger**: Tiene 50+ estrellas sin usar por 7 días
**Frecuencia**: Semanal
**Plantilla**: `recordatorio_estrellas_acumuladas`

**Mensaje**:
```
¡Tienes un tesoro guardado! 💰

{nombreNino} ha acumulado {cantidadEstrellas} estrellas que están esperando ser canjeadas.

🛍️ **¿Qué puedes conseguir?**
- Nuevos avatares
- Temas especiales
- Poderes extras
- Recompensas sorpresa

💡 **Consejo**: Las estrellas no expiran, pero ¡es más divertido usarlas!

🎁 **Ofertas especiales disponibles**:
- Avatar legendario: {costoAvatar} estrellas
- Tema especial: {costeTema} estrellas
- Poder especial: {costoPoder} estrellas

---
¡A gastar esas estrellas! ✨
Pequeños Genios
```

### 8. **🌅 Recordatorio de Rutina**
**Trigger**: Lunes/Miércoles/Viernes a las 4:00 PM
**Frecuencia**: 3 veces por semana
**Plantilla**: `recordatorio_rutina_diaria`

**Mensaje**:
```
¡Hora de la aventura diaria! 🚀

Es {diaSemana} y es momento de que {nombreNino} practique en Pequeños Genios.

⏰ **Rutina perfecta**:
- 15 minutos de práctica
- 2-3 actividades
- Diversión garantizada

🎯 **Sugerencias para hoy**:
- Actividad recomendada: {actividadRecomendada}
- Área de enfoque: {areaEnfoque}
- Meta del día: {metaDiaria}

🌟 **Recuerda**: La constancia es la clave del éxito.

---
¡Vamos a aprender! 📚
Pequeños Genios
```

### 9. **📅 Fin de Semana Activo**
**Trigger**: Sábado 10:00 AM si no hizo actividades el viernes
**Frecuencia**: Fines de semana
**Plantilla**: `recordatorio_fin_semana`

**Mensaje**:
```
¡Feliz fin de semana! 🎉

{nombreNino} terminó la semana escolar, ¡es momento de relajarse Y seguir aprendiendo!

🏖️ **Aprendizaje divertido de fin de semana**:
- Sin presión escolar
- Actividades más relajadas
- Tiempo libre para explorar

🎮 **Actividades perfectas para el fin de semana**:
- Juegos de matemáticas divertidos
- Cuentos interactivos
- Experimentos virtuales

⏰ **Solo 10-15 minutos** para mantener el cerebro activo.

---
¡Que tengas un gran fin de semana! 🌞
Pequeños Genios
```

### 10. **🎊 Celebración de Progreso**
**Trigger**: Completó 10 actividades en la semana
**Frecuencia**: Al lograr hito
**Plantilla**: `felicitacion_progreso`

**Mensaje**:
```
¡INCREÍBLE! 🎉🎉🎉

{nombreNino} completó {actividadesCompletadas} actividades esta semana. ¡Eso es fantástico!

🏆 **Logros de esta semana**:
- {actividadesCompletadas} actividades completadas
- {estrellasGanadas} estrellas ganadas
- {logrosObtenidos} logros desbloqueados

📈 **Progreso destacado**:
- Mejor área: {mejorArea} ({progresoMejorArea}% mejorado)
- Racha actual: {rachaActual} días
- Nivel actual: {nivelActual}

🎁 **Recompensa especial**: {recompensaEspecial}

¡Sigue así, {nombreNino}! Estás haciendo un trabajo increíble.

---
¡Felicidades! 🌟
El equipo de Pequeños Genios
```

## ⚙️ **Configuración Técnica**

### **Frecuencias Sugeridas**
```javascript
const FRECUENCIAS_RECORDATORIOS = {
  inactividad: 'cada_24h',
  racha_perdida: 'una_vez',
  meta_semanal: 'viernes_tarde',
  actividad_favorita: 'semanal',
  area_rezagada: 'cada_5_dias',
  cerca_logro: 'una_vez_cerca',
  estrellas_acumuladas: 'semanal',
  rutina_diaria: 'lun_mie_vie_4pm',
  fin_semana: 'sabado_10am',
  felicitacion: 'al_lograr_hito'
};
```

### **Prioridades de Envío**
1. **Alta**: Cerca de logro, Felicitaciones
2. **Media**: Inactividad, Racha perdida, Meta semanal
3. **Baja**: Rutina diaria, Fin de semana

### **Límites de Frecuencia**
- Máximo 1 email automático por día
- No enviar si el niño ya fue activo hoy
- Pausar recordatorios durante vacaciones escolares
