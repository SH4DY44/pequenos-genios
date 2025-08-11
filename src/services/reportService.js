// src/services/reportService.js
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Servicio para generar reportes en PDF
 * Maneja la recopilación de datos y generación de reportes
 */
class ReportService {
  constructor() {
    this.API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  }

  /**
   * Recopila datos para el reporte
   * @param {string} profileId - ID del perfil del niño
   * @param {Object} configuracion - Configuración de reportes
   * @returns {Object} Datos completos para el reporte
   */
  async recopilarDatos(profileId, configuracion = {}) {
    try {
      console.log('📊 Recopilando datos para reporte...', { profileId, configuracion });
      
      const datos = {
        perfil: null,
        actividades: [],
        estadisticas: {},
        progreso: {},
        metas: {},
        fechaRecopilacion: new Date().toISOString()
      };

      // 1. Obtener datos del perfil
      try {
        const perfilRef = collection(db, "childProfiles");
        const perfilQuery = query(perfilRef, where("__name__", "==", profileId));
        const perfilSnapshot = await getDocs(perfilQuery);
        
        if (!perfilSnapshot.empty) {
          datos.perfil = { id: profileId, ...perfilSnapshot.docs[0].data() };
        }
      } catch (error) {
        console.warn('⚠️ Error obteniendo perfil:', error);
      }

      // 2. Obtener actividades recientes
      try {
        const actividadesRef = collection(db, "activitySessions");
        
        // Intentar query con índice compuesto
        try {
          const actividadesQuery = query(
            actividadesRef,
            where("childProfileId", "==", profileId),
            orderBy("timestamp", "desc"),
            limit(50)
          );
          
          const actividadesSnapshot = await getDocs(actividadesQuery);
          datos.actividades = actividadesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        } catch (indexError) {
          console.warn('⚠️ Error con query indexada, usando query simple:', indexError.message);
          
          // Fallback: obtener todas las actividades y filtrar en cliente
          const actividadesQuery = query(actividadesRef, limit(1000));
          const actividadesSnapshot = await getDocs(actividadesQuery);
          
          datos.actividades = actividadesSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(act => act.childProfileId === profileId)
            .sort((a, b) => {
              const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp);
              const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp);
              return timeB - timeA;
            })
            .slice(0, 50);
        }
      } catch (error) {
        console.warn('⚠️ Error obteniendo actividades:', error.message);
        datos.actividades = []; // Continuar sin actividades
      }

      // 3. Calcular estadísticas
      datos.estadisticas = this.calcularEstadisticas(datos.actividades, datos.perfil);
      
      // 4. Calcular progreso de metas si hay configuración
      if (configuracion.metas) {
        datos.progreso = this.calcularProgresoMetas(datos.actividades, configuracion.metas);
      }

      console.log('✅ Datos recopilados:', {
        perfil: !!datos.perfil,
        actividades: datos.actividades.length,
        estadisticas: Object.keys(datos.estadisticas).length
      });

      return datos;
    } catch (error) {
      console.error('❌ Error recopilando datos:', error);
      throw new Error(`Error recopilando datos: ${error.message}`);
    }
  }

  /**
   * Calcula estadísticas basadas en las actividades
   * @param {Array} actividades - Lista de actividades
   * @param {Object} perfil - Datos del perfil
   * @returns {Object} Estadísticas calculadas
   */
  calcularEstadisticas(actividades, perfil) {
    const hoy = new Date();
    const hace7Dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
    const hace30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Filtrar actividades por períodos
    const actividadesHoy = actividades.filter(act => {
      const fechaAct = new Date(act.timestamp?.toDate?.() || act.timestamp);
      return fechaAct.toDateString() === hoy.toDateString();
    });

    const actividadesSemana = actividades.filter(act => {
      const fechaAct = new Date(act.timestamp?.toDate?.() || act.timestamp);
      return fechaAct >= hace7Dias;
    });

    const actividadesMes = actividades.filter(act => {
      const fechaAct = new Date(act.timestamp?.toDate?.() || act.timestamp);
      return fechaAct >= hace30Dias;
    });

    // Calcular métricas
    const estadisticas = {
      // Métricas generales
      totalActividades: actividades.length,
      actividadesHoy: actividadesHoy.length,
      actividadesSemana: actividadesSemana.length,
      actividadesMes: actividadesMes.length,

      // Puntuación
      puntosHoy: actividadesHoy.reduce((sum, act) => sum + (act.score || 0), 0),
      puntosSemana: actividadesSemana.reduce((sum, act) => sum + (act.score || 0), 0),
      puntosMes: actividadesMes.reduce((sum, act) => sum + (act.score || 0), 0),
      puntosTotales: perfil?.puntosTotales || actividades.reduce((sum, act) => sum + (act.score || 0), 0),

      // Tiempo de estudio (estimado)
      tiempoHoy: actividadesHoy.length * 10, // 10 min por actividad
      tiempoSemana: actividadesSemana.length * 10,
      tiempoMes: actividadesMes.length * 10,

      // Promedios
      promedioActividadesDiarias: Math.round(actividadesSemana.length / 7 * 10) / 10,
      promedioPuntosDiarios: Math.round(actividadesSemana.reduce((sum, act) => sum + (act.score || 0), 0) / 7),

      // Racha y logros
      racha: perfil?.racha || 0,
      logros: Object.keys(perfil?.logros || {}).length,
      estrellas: perfil?.estrellas || 0,

      // Análisis de patrones
      diaConMasActividad: this.analizarPatronesDiarios(actividadesSemana),
      actividadFavorita: this.analizarActividadesFavoritas(actividades),
      tendencia: this.calcularTendencia(actividadesSemana)
    };

    return estadisticas;
  }

  /**
   * Calcula el progreso de las metas establecidas
   * @param {Array} actividades - Lista de actividades
   * @param {Object} metas - Configuración de metas
   * @returns {Object} Progreso de metas
   */
  calcularProgresoMetas(actividades, metas) {
    const hoy = new Date();
    const hace7Dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);

    const actividadesHoy = actividades.filter(act => {
      const fechaAct = new Date(act.timestamp?.toDate?.() || act.timestamp);
      return fechaAct.toDateString() === hoy.toDateString();
    });

    const actividadesSemana = actividades.filter(act => {
      const fechaAct = new Date(act.timestamp?.toDate?.() || act.timestamp);
      return fechaAct >= hace7Dias;
    });

    const progreso = {
      // Meta: Actividades por día
      actividadesDiarias: {
        actual: actividadesHoy.length,
        objetivo: metas.actividadesPorDia || 3,
        porcentaje: Math.min(100, (actividadesHoy.length / (metas.actividadesPorDia || 3)) * 100)
      },

      // Meta: Tiempo de estudio diario
      tiempoEstudio: {
        actual: actividadesHoy.length * 10, // Estimación: 10 min por actividad
        objetivo: metas.tiempoEstudioDiario || 30,
        porcentaje: Math.min(100, (actividadesHoy.length * 10 / (metas.tiempoEstudioDiario || 30)) * 100)
      },

      // Meta: Puntos semanales
      puntosSemanales: {
        actual: actividadesSemana.reduce((sum, act) => sum + (act.score || 0), 0),
        objetivo: metas.puntosSemanales || 500,
        porcentaje: Math.min(100, (actividadesSemana.reduce((sum, act) => sum + (act.score || 0), 0) / (metas.puntosSemanales || 500)) * 100)
      },

      // Resumen general
      cumplimientoGeneral: 0 // Se calculará como promedio
    };

    // Calcular cumplimiento general
    progreso.cumplimientoGeneral = (
      progreso.actividadesDiarias.porcentaje +
      progreso.tiempoEstudio.porcentaje +
      progreso.puntosSemanales.porcentaje
    ) / 3;

    return progreso;
  }

  /**
   * Analiza patrones de actividad por días de la semana
   * @param {Array} actividades - Actividades de la semana
   * @returns {Object} Análisis de patrones diarios
   */
  analizarPatronesDiarios(actividades) {
    const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const actividadesPorDia = {};

    // Inicializar contadores
    diasSemana.forEach(dia => {
      actividadesPorDia[dia] = 0;
    });

    // Contar actividades por día
    actividades.forEach(act => {
      const fecha = new Date(act.timestamp?.toDate?.() || act.timestamp);
      const diaSemana = diasSemana[fecha.getDay()];
      actividadesPorDia[diaSemana]++;
    });

    // Encontrar el día con más actividad
    const diaConMasActividad = Object.entries(actividadesPorDia)
      .reduce((max, [dia, count]) => count > max.count ? { dia, count } : max, { dia: 'lunes', count: 0 });

    return {
      distribucion: actividadesPorDia,
      diaFavorito: diaConMasActividad.dia,
      actividadesEnDiaFavorito: diaConMasActividad.count
    };
  }

  /**
   * Analiza las actividades más realizadas
   * @param {Array} actividades - Lista de actividades
   * @returns {Object} Análisis de actividades favoritas
   */
  analizarActividadesFavoritas(actividades) {
    const conteoActividades = {};

    actividades.forEach(act => {
      const tipo = act.activityType || 'actividad-general';
      conteoActividades[tipo] = (conteoActividades[tipo] || 0) + 1;
    });

    const actividadFavorita = Object.entries(conteoActividades)
      .reduce((max, [tipo, count]) => count > max.count ? { tipo, count } : max, { tipo: 'ninguna', count: 0 });

    return {
      distribucion: conteoActividades,
      favorita: actividadFavorita.tipo,
      vecesRealizada: actividadFavorita.count,
      diversidad: Object.keys(conteoActividades).length
    };
  }

  /**
   * Calcula la tendencia de progreso
   * @param {Array} actividades - Actividades recientes
   * @returns {Object} Análisis de tendencia
   */
  calcularTendencia(actividades) {
    if (actividades.length < 2) {
      return { direccion: 'estable', porcentaje: 0, descripcion: 'Insuficientes datos' };
    }

    // Dividir la semana en dos mitades
    const mitadSemana = new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000);
    
    const actividadesPrimeraMetad = actividades.filter(act => {
      const fecha = new Date(act.timestamp?.toDate?.() || act.timestamp);
      return fecha < mitadSemana;
    });

    const actividadesSegundaMetad = actividades.filter(act => {
      const fecha = new Date(act.timestamp?.toDate?.() || act.timestamp);
      return fecha >= mitadSemana;
    });

    const promedioPrimera = actividadesPrimeraMetad.length / 3.5;
    const promedioSegunda = actividadesSegundaMetad.length / 3.5;

    let direccion = 'estable';
    let porcentaje = 0;
    let descripcion = 'Actividad estable';

    if (promedioSegunda > promedioPrimera) {
      direccion = 'creciente';
      porcentaje = ((promedioSegunda - promedioPrimera) / promedioPrimera * 100);
      descripcion = `Incremento del ${porcentaje.toFixed(1)}%`;
    } else if (promedioSegunda < promedioPrimera) {
      direccion = 'decreciente';
      porcentaje = ((promedioPrimera - promedioSegunda) / promedioPrimera * 100);
      descripcion = `Disminución del ${porcentaje.toFixed(1)}%`;
    }

    return { direccion, porcentaje: Math.abs(porcentaje), descripcion };
  }

  /**
   * Genera un reporte en PDF
   * @param {Object} datosReporte - Datos para el reporte
   * @returns {Promise<Blob>} PDF generado
   */
  async generarPDF(datosReporte) {
    try {
      console.log('📄 Generando PDF...', datosReporte.tipoReporte);

      // Recopilar datos completos
      const datos = await this.recopilarDatos(datosReporte.profileId, datosReporte.configuracion);

      // Preparar payload para el endpoint
      const payload = {
        ...datosReporte,
        datosCompletos: datos,
        configuracionPDF: {
          incluirGraficos: true,
          incluirAnalisis: true,
          formatoProfesional: datosReporte.tipoReporte === 'especialista',
          idioma: 'es'
        }
      };

      console.log('📤 Enviando solicitud al endpoint de PDF...');

      // Preparar headers para la petición
      const headers = {
        'Content-Type': 'application/json',
      };

      // Intentar con API Key si está disponible (opcional para desarrollo)
      const apiKey = process.env.REACT_APP_API_KEY || 'dev-key-123';
      if (apiKey) {
        headers['X-API-Key'] = apiKey;
      }

      // Llamar al endpoint de generación de PDF
      // Usar ruta de desarrollo si estamos en modo desarrollo
      const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.REACT_APP_API_KEY;
      const endpoint = isDevelopment 
        ? `${this.API_BASE_URL}/api/dev/reportes/generate-pdf`
        : `${this.API_BASE_URL}/api/reportes/generate-pdf`;

      console.log(`📤 Usando endpoint: ${endpoint}`);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        // Si hay error de autenticación, intentar generar PDF simulado
        if (response.status === 401) {
          console.log('🔑 Error de autenticación, generando PDF simulado...');
          return this.generarPDFSimulado(datosReporte);
        }
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
      }

      const pdfBlob = await response.blob();
      console.log('✅ PDF generado exitosamente');
      
      return pdfBlob;
    } catch (error) {
      console.error('❌ Error generando PDF:', error);
      
      // Si no hay endpoint disponible o hay error de conexión, generar PDF simulado
      if (error.message.includes('Failed to fetch') || 
          error.message.includes('ERR_CONNECTION_REFUSED') ||
          error.message.includes('401 Unauthorized')) {
        console.log('📄 Generando PDF simulado como fallback...');
        return this.generarPDFSimulado(datosReporte);
      }
      
      throw error;
    }
  }

  /**
   * Genera un PDF simulado para desarrollo
   * @param {Object} datosReporte - Datos del reporte
   * @returns {Promise<Blob>} PDF simulado
   */
  async generarPDFSimulado(datosReporte) {
    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generar contenido del reporte simulado en formato PDF-like
    const contenido = this.generarContenidoReporte(datosReporte);
    
    // Crear blob como si fuera PDF (pero será texto para desarrollo)
    const blob = new Blob([contenido], { 
      type: 'text/plain' // En desarrollo usamos texto, en producción sería 'application/pdf'
    });
    
    console.log('✅ PDF simulado generado correctamente');
    return blob;
  }

  /**
   * Genera el contenido textual del reporte
   * @param {Object} datosReporte - Datos del reporte
   * @returns {string} Contenido del reporte
   */
  generarContenidoReporte(datosReporte) {
    const fecha = new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
REPORTE DE PROGRESO - ${datosReporte.tipoReporte.toUpperCase()}
${'='.repeat(50)}

Niño: ${datosReporte.perfilNino?.fullName || 'Sin nombre'}
Fecha de generación: ${fecha}
Período: ${datosReporte.periodo?.descripcion || 'Sin período específico'}

RESUMEN EJECUTIVO
${'='.repeat(20)}

Actividades completadas: ${datosReporte.estadisticas?.actividadesCompletadas || 0}
Puntos totales: ${datosReporte.estadisticas?.puntosTotales || 0}
Racha actual: ${datosReporte.estadisticas?.racha || 0} días
Logros obtenidos: ${datosReporte.estadisticas?.logros || 0}

ANÁLISIS DE METAS
${'='.repeat(20)}

${datosReporte.progreso ? `
• Actividades diarias: ${datosReporte.progreso.actividadesDiarias}% completado
• Tiempo de estudio: ${datosReporte.progreso.tiempoEstudio}% completado  
• Puntos semanales: ${datosReporte.progreso.puntosSemanales}% completado
` : 'No hay datos de progreso de metas disponibles'}

ACTIVIDADES RECIENTES
${'='.repeat(20)}

${datosReporte.actividadesRecientes?.slice(0, 5).map((act, i) => 
  `${i + 1}. ${act.activityType || 'Actividad'} - ${act.score || 0} pts`
).join('\n') || 'No hay actividades recientes'}

RECOMENDACIONES
${'='.repeat(20)}

• Continuar con la rutina establecida
• Mantener horarios regulares de estudio
• Celebrar los logros alcanzados
• Ajustar metas según el progreso observado

${datosReporte.tipoReporte === 'especialista' ? `

INFORMACIÓN CLÍNICA
${'='.repeat(20)}

Este reporte incluye datos objetivos sobre:
- Patrones de actividad y concentración
- Progreso en habilidades cognitivas
- Adherencia a rutinas terapéuticas
- Evolución temporal del desempeño

Generado para uso profesional médico/terapéutico.
` : ''}

---
Reporte generado por Pequeños Genios
Versión: ${datosReporte.metadata?.version || '1.0.0'}
Hora: ${new Date().toLocaleTimeString('es-ES')}
    `.trim();
  }

  /**
   * Descarga un archivo PDF
   * @param {Blob} pdfBlob - Blob del PDF
   * @param {string} nombreArchivo - Nombre del archivo
   */
  descargarPDF(pdfBlob, nombreArchivo) {
    try {
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      
      // Ajustar extensión según el tipo de blob
      const extension = pdfBlob.type === 'text/plain' ? '.txt' : '.pdf';
      const fileName = nombreArchivo.replace('.pdf', extension);
      
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log(`📥 Archivo descargado: ${fileName}`);
    } catch (error) {
      console.error('❌ Error descargando archivo:', error);
      throw new Error(`Error al descargar: ${error.message}`);
    }
  }

  /**
   * Obtiene el historial de reportes (simulado)
   * @param {string} profileId - ID del perfil
   * @returns {Array} Lista de reportes históricos
   */
  async obtenerHistorialReportes(profileId) {
    // Por ahora retornamos datos simulados
    // En el futuro esto vendría de una base de datos
    return [
      {
        id: '1',
        fecha: '2025-08-10',
        tipo: 'semanal',
        periodo: '03/08 - 10/08',
        estado: 'disponible',
        nombreArchivo: 'reporte-semanal-2025-08-10.pdf'
      },
      {
        id: '2',
        fecha: '2025-08-08',
        tipo: 'metas',
        periodo: 'Agosto 2025',
        estado: 'disponible',
        nombreArchivo: 'reporte-metas-2025-08-08.pdf'
      },
      {
        id: '3',
        fecha: '2025-08-05',
        tipo: 'especialista',
        periodo: '01/08 - 05/08',
        estado: 'disponible',
        nombreArchivo: 'reporte-especialista-2025-08-05.pdf'
      }
    ];
  }
}

// Crear instancia singleton
const reportService = new ReportService();

export default reportService;
export { ReportService };
