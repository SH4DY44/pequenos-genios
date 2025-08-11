// EJEMPLO DE USO DEL SISTEMA DE PROMOCIÓN DE NIVELES
// Ejecutar estos comandos en la consola del navegador para probar

import { SistemaPromocionNiveles } from './src/utils/nivelesProgresion/SistemaPromocionNiveles';
import { TareasPeriodicasNiveles } from './src/services/tareasPeriodicasNiveles';

// ================== EJEMPLOS DE USO ==================

// 1. EVALUAR MANUALMENTE UN PERFIL ESPECÍFICO
async function evaluarPerfil() {
  const profileId = 'ID_DEL_PERFIL_AQUI'; // Reemplazar con ID real
  
  const evaluacion = await SistemaPromocionNiveles.evaluarPromocion(profileId);
  
  console.log('📊 Resultado de evaluación:', evaluacion);
  
  if (evaluacion.puedePromoverse) {
    console.log(`🎉 ¡Listo para promoción! ${evaluacion.nivelActual} → ${evaluacion.nivelSiguiente}`);
    console.log(`✅ Criterios cumplidos: ${evaluacion.porcentajeCumplimiento}%`);
  } else {
    console.log(`📈 Progreso actual: ${evaluacion.porcentajeCumplimiento}%`);
    console.log('📋 Sugerencias:', evaluacion.sugerencias);
  }
}

// 2. PROMOVER MANUALMENTE UN PERFIL
async function promoverPerfil() {
  const profileId = 'ID_DEL_PERFIL_AQUI'; // Reemplazar con ID real
  
  const exito = await SistemaPromocionNiveles.promoverNivel(profileId);
  
  if (exito) {
    console.log('🎓 ¡Promoción exitosa!');
  } else {
    console.log('❌ No se pudo promover (no cumple criterios)');
  }
}

// 3. VERIFICAR TODOS LOS PERFILES AUTOMÁTICAMENTE
async function verificarTodos() {
  const promociones = await SistemaPromocionNiveles.verificarPromocionesAutomaticas();
  console.log(`🔄 Verificación completada. ${promociones} promociones realizadas.`);
}

// 4. EVALUAR USANDO EL SERVICIO DE TAREAS PERIÓDICAS
async function evaluarConServicio() {
  const profileId = 'ID_DEL_PERFIL_AQUI'; // Reemplazar con ID real
  
  const resultado = await TareasPeriodicasNiveles.evaluarPerfilManualmente(profileId);
  console.log('📊 Evaluación con servicio:', resultado);
}

// ================== DATOS DE PRUEBA ==================

// SIMULAR DATOS DE UN NIÑO PARA PROMOCIÓN DE BÁSICO A BÁSICO-ALTO
const datosPruebaBásico = {
  actividadesCompletadas: 20,    // ✅ > 15
  puntosTotales: 200,            // ✅ > 150
  racha: 5,                      // ✅ > 3
  actividadesPerfectas: 4,       // ✅ > 3
  // Tiempo en nivel: se calcula automáticamente
  // Precisión: se calcula de actividades recientes
};

// SIMULAR DATOS PARA PROMOCIÓN DE BÁSICO-ALTO A INTERMEDIO
const datosPruebaBasicoAlto = {
  actividadesCompletadas: 35,    // ✅ > 30
  puntosTotales: 450,            // ✅ > 400
  racha: 7,                      // ✅ > 5
  actividadesPerfectas: 6,       // ✅ > 5
  juegosCompletados: 12,         // ✅ > 10
};

// SIMULAR DATOS PARA PROMOCIÓN DE INTERMEDIO A AVANZADO
const datosPruebaIntermedio = {
  actividadesCompletadas: 55,    // ✅ > 50
  puntosTotales: 850,            // ✅ > 800
  racha: 10,                     // ✅ > 7
  actividadesPerfectas: 10,      // ✅ > 8
  juegosCompletados: 18,         // ✅ > 15
  logros: {                      // ✅ > 5 logros
    'primera_actividad': true,
    'cien_puntos': true,
    'diez_actividades': true,
    'primera_semana': true,
    'memorama_master': true,
    'cinco_perfecto': true
  }
};

// ================== FUNCIONES DE AYUDA ==================

// OBTENER CRITERIOS PARA UN NIVEL ESPECÍFICO
function obtenerCriterios(nivelActual) {
  const configuraciones = SistemaPromocionNiveles.CRITERIOS_PROMOCION;
  
  for (const [clave, config] of Object.entries(configuraciones)) {
    if (config.nivelActual === nivelActual) {
      console.log(`📋 Criterios para ${nivelActual} → ${config.nivelSiguiente}:`);
      console.table(config.criterios);
      return config.criterios;
    }
  }
  
  console.log(`❌ No se encontraron criterios para el nivel: ${nivelActual}`);
  return null;
}

// VER TODOS LOS CRITERIOS
function verTodosLosCriterios() {
  console.log('📚 Todos los criterios de promoción:');
  
  Object.entries(SistemaPromocionNiveles.CRITERIOS_PROMOCION).forEach(([clave, config]) => {
    console.log(`\n🎯 ${config.nivelActual.toUpperCase()} → ${config.nivelSiguiente.toUpperCase()}`);
    console.table(config.criterios);
  });
}

// ================== INSTRUCCIONES ==================

console.log(`
🎓 SISTEMA DE PROMOCIÓN DE NIVELES - GUÍA DE PRUEBAS

Para probar el sistema, ejecuta estas funciones en la consola:

1. Ver todos los criterios:
   verTodosLosCriterios()

2. Ver criterios para un nivel específico:
   obtenerCriterios('básico')
   obtenerCriterios('básico-alto')
   obtenerCriterios('intermedio')

3. Evaluar un perfil (reemplaza el ID):
   evaluarPerfil()

4. Promover un perfil manualmente:
   promoverPerfil()

5. Verificar todos los perfiles:
   verificarTodos()

⚠️  IMPORTANTE: 
- Reemplaza 'ID_DEL_PERFIL_AQUI' con un ID real de Firebase
- El sistema evalúa las últimas 4 semanas de actividad
- Todos los criterios deben cumplirse para la promoción

🔧 CONFIGURACIÓN:
- Los criterios se pueden modificar en SistemaPromocionNiveles.js
- El periodo de evaluación está en PERIODO_EVALUACION
- La verificación automática se ejecuta cada hora
`);

// Exportar funciones para uso en consola
window.evaluarPerfil = evaluarPerfil;
window.promoverPerfil = promoverPerfil;
window.verificarTodos = verificarTodos;
window.obtenerCriterios = obtenerCriterios;
window.verTodosLosCriterios = verTodosLosCriterios;
