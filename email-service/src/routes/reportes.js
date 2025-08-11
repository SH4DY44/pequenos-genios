const express = require('express');
const PDFDocument = require('pdfkit');
const router = express.Router();

// Función para generar contenido diferente según el tipo de reporte
const generarContenidoPorTipo = (doc, tipo, datos) => {
  switch (tipo) {
    case 'semanal':
      generarReporteSemanal(doc, datos);
      break;
    case 'mensual':
      generarReporteMensual(doc, datos);
      break;
    case 'completo':
      generarReporteCompleto(doc, datos);
      break;
    default:
      generarReporteGeneral(doc, datos);
      break;
  }
};

// Función para generar reporte semanal
const generarReporteSemanal = (doc, datos) => {
  doc.fontSize(20).text('📅 Reporte Semanal de Progreso', 50, 100);
  doc.fontSize(12).text(`Período: ${datos.periodo?.descripcion || 'Última semana'}`, 50, 140);
  
  // Estadísticas de la semana
  doc.fontSize(16).text('📊 Resumen de la Semana', 50, 180);
  
  doc.fontSize(12);
  doc.text(`• Actividades completadas: ${datos.estadisticas?.actividadesCompletadas || 0}`, 70, 210);
  doc.text(`• Tiempo de estudio: ${datos.estadisticas?.tiempoEstudioSemanal || '0 min'}`, 70, 230);
  doc.text(`• Puntos obtenidos: ${datos.estadisticas?.puntosTotales || 0}`, 70, 250);
  doc.text(`• Racha actual: ${datos.estadisticas?.racha || 0} días`, 70, 270);
  
  // Progreso diario
  doc.fontSize(16).text('📈 Progreso Diario', 50, 320);
  doc.fontSize(12);
  doc.text('• Lunes: 3 actividades completadas', 70, 350);
  doc.text('• Martes: 2 actividades completadas', 70, 370);
  doc.text('• Miércoles: 4 actividades completadas', 70, 390);
  doc.text('• Jueves: 1 actividad completada', 70, 410);
  doc.text('• Viernes: 3 actividades completadas', 70, 430);
  doc.text('• Sábado: 2 actividades completadas', 70, 450);
  doc.text('• Domingo: 1 actividad completada', 70, 470);
  
  // Recomendaciones
  doc.fontSize(16).text('💡 Recomendaciones para la próxima semana', 50, 520);
  doc.fontSize(12);
  doc.text('• Mantener constancia en las actividades diarias', 70, 550);
  doc.text('• Incrementar tiempo de estudio en matemáticas', 70, 570);
  doc.text('• Continuar con el excelente progreso en lectura', 70, 590);
};

// Función para generar reporte mensual
const generarReporteMensual = (doc, datos) => {
  doc.fontSize(20).text('📆 Reporte Mensual de Progreso', 50, 100);
  doc.fontSize(12).text(`Período: ${datos.periodo?.descripcion || 'Último mes'}`, 50, 140);
  
  // Estadísticas del mes
  doc.fontSize(16).text('📊 Resumen del Mes', 50, 180);
  
  doc.fontSize(12);
  doc.text(`• Total de actividades: ${(datos.estadisticas?.actividadesCompletadas || 0) * 4}`, 70, 210);
  doc.text(`• Promedio semanal: ${datos.estadisticas?.promedioSemanal || 0} actividades`, 70, 230);
  doc.text(`• Tiempo total de estudio: ${datos.estadisticas?.tiempoEstudioSemanal || '0 min'} aprox.`, 70, 250);
  doc.text(`• Puntos acumulados: ${datos.estadisticas?.puntosTotales || 0}`, 70, 270);
  doc.text(`• Mejor racha: ${datos.estadisticas?.racha || 0} días`, 70, 290);
  
  // Progreso por categorías
  doc.fontSize(16).text('📚 Progreso por Materias', 50, 340);
  doc.fontSize(12);
  doc.text('• Matemáticas: 85% completado', 70, 370);
  doc.text('• Lectura: 92% completado', 70, 390);
  doc.text('• Ciencias: 78% completado', 70, 410);
  doc.text('• Creatividad: 88% completado', 70, 430);
  
  // Logros obtenidos
  doc.fontSize(16).text('🏆 Logros del Mes', 50, 480);
  doc.fontSize(12);
  doc.text(`• Total de logros: ${datos.estadisticas?.logros || 0}`, 70, 510);
  doc.text('• "Lector Constante" - 7 días seguidos leyendo', 70, 530);
  doc.text('• "Matemático en Crecimiento" - 50 ejercicios resueltos', 70, 550);
  doc.text('• "Explorador Curioso" - 10 experimentos completados', 70, 570);
  
  // Recomendaciones
  doc.fontSize(16).text('💡 Recomendaciones para el próximo mes', 50, 620);
  doc.fontSize(12);
  doc.text('• Enfocarse en mejorar el área de ciencias', 70, 650);
  doc.text('• Mantener la excelente constancia en lectura', 70, 670);
  doc.text('• Intentar actividades más desafiantes en matemáticas', 70, 690);
};

// Función para generar reporte completo
const generarReporteCompleto = (doc, datos) => {
  doc.fontSize(20).text('📋 Reporte Completo de Progreso', 50, 100);
  doc.fontSize(12).text(`Período: ${datos.periodo?.descripcion || 'Histórico completo'}`, 50, 140);
  
  // Resumen general
  doc.fontSize(16).text('📊 Resumen General', 50, 180);
  
  doc.fontSize(12);
  doc.text(`• Actividades totales completadas: ${datos.estadisticas?.actividadesCompletadas || 0}`, 70, 210);
  doc.text(`• Puntos totales acumulados: ${datos.estadisticas?.puntosTotales || 0}`, 70, 230);
  doc.text(`• Estrellas obtenidas: ${datos.estadisticas?.estrellas || 0}`, 70, 250);
  doc.text(`• Total de logros: ${datos.estadisticas?.logros || 0}`, 70, 270);
  doc.text(`• Mejor racha registrada: ${datos.estadisticas?.racha || 0} días`, 70, 290);
  
  // Evolución temporal
  doc.fontSize(16).text('📈 Evolución Temporal', 50, 340);
  doc.fontSize(12);
  doc.text('• Primer mes: 45 actividades completadas', 70, 370);
  doc.text('• Segundo mes: 67 actividades completadas (+49%)', 70, 390);
  doc.text('• Tercer mes: 82 actividades completadas (+22%)', 70, 410);
  doc.text('• Mes actual: 94 actividades completadas (+15%)', 70, 430);
  
  // Análisis de fortalezas
  doc.fontSize(16).text('💪 Fortalezas Identificadas', 50, 480);
  doc.fontSize(12);
  doc.text('• Excelente constancia en actividades de lectura', 70, 510);
  doc.text('• Muy buen desempeño en resolución de problemas', 70, 530);
  doc.text('• Alta motivación y participación en juegos educativos', 70, 550);
  doc.text('• Capacidad de mantener la atención por períodos prolongados', 70, 570);
  
  // Áreas de mejora
  doc.fontSize(16).text('🎯 Áreas de Mejora', 50, 620);
  doc.fontSize(12);
  doc.text('• Desarrollar más habilidades en ciencias naturales', 70, 650);
  doc.text('• Practicar más ejercicios de cálculo mental', 70, 670);
  doc.text('• Explorar actividades de expresión artística', 70, 690);
  
  // Recomendaciones a largo plazo
  doc.addPage();
  doc.fontSize(16).text('🚀 Plan de Desarrollo Recomendado', 50, 100);
  doc.fontSize(12);
  doc.text('• Incrementar gradualmente la dificultad de las actividades', 70, 130);
  doc.text('• Introducir nuevos tipos de desafíos cada dos semanas', 70, 150);
  doc.text('• Mantener un equilibrio entre todas las áreas de aprendizaje', 70, 170);
  doc.text('• Celebrar los logros para mantener la motivación alta', 70, 190);
};

// Función para generar reporte general (fallback)
const generarReporteGeneral = (doc, datos) => {
  doc.fontSize(20).text('📄 Reporte de Progreso', 50, 100);
  doc.fontSize(12).text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, 50, 140);
  
  // Información del niño
  doc.fontSize(16).text('👤 Información del Estudiante', 50, 180);
  doc.fontSize(12);
  doc.text(`• Nombre: ${datos.perfil?.fullName || 'Estudiante'}`, 70, 210);
  doc.text(`• Edad: ${datos.perfil?.age || 'No especificada'} años`, 70, 230);
  
  // Estadísticas básicas
  doc.fontSize(16).text('📊 Estadísticas Generales', 50, 280);
  doc.fontSize(12);
  doc.text(`• Actividades completadas: ${datos.estadisticas?.actividadesCompletadas || 0}`, 70, 310);
  doc.text(`• Puntos totales: ${datos.estadisticas?.puntosTotales || 0}`, 70, 330);
  doc.text(`• Logros obtenidos: ${datos.estadisticas?.logros || 0}`, 70, 350);
  doc.text(`• Racha actual: ${datos.estadisticas?.racha || 0} días`, 70, 370);
  
  // Mensaje motivacional
  doc.fontSize(16).text('🌟 Mensaje Motivacional', 50, 420);
  doc.fontSize(12);
  doc.text('¡Excelente trabajo! Continúa así y seguirás creciendo y aprendiendo.', 70, 450);
  doc.text('Cada actividad completada te acerca más a tus metas. ¡Sigue adelante!', 70, 470);
};

// Ruta para generar PDF
router.post('/generate-pdf', async (req, res) => {
  try {
    console.log('📄 Generando reporte PDF...');
    console.log('Datos recibidos:', req.body);

    const { tipo = 'general', datos = {} } = req.body;

    // Crear documento PDF
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    // Configurar headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="reporte-${tipo}-${Date.now()}.pdf"`);

    // Stream del PDF
    doc.pipe(res);

    // Header del documento
    doc.fontSize(24).fillColor('#4F46E5').text('Pequeños Genios', 50, 50);
    doc.fontSize(10).fillColor('#666').text(`Reporte generado el ${new Date().toLocaleDateString('es-ES')}`, 450, 55);
    
    // Línea separadora
    doc.strokeColor('#4F46E5').lineWidth(2);
    doc.moveTo(50, 80).lineTo(550, 80).stroke();

    // Generar contenido según el tipo
    generarContenidoPorTipo(doc, tipo, datos);

    // Footer
    doc.fontSize(8).fillColor('#999').text(
      'Este reporte fue generado automáticamente por Pequeños Genios - Sistema de seguimiento educativo',
      50,
      750,
      { align: 'center' }
    );

    // Finalizar documento
    doc.end();

    console.log(`✅ PDF de tipo "${tipo}" generado exitosamente`);

  } catch (error) {
    console.error('❌ Error generando PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error generando el reporte PDF',
      error: error.message
    });
  }
});

// Ruta de estado
router.get('/status', (req, res) => {
  res.json({
    success: true,
    service: 'Reportes PDF',
    status: 'Operativo',
    timestamp: new Date().toISOString(),
    tipos_disponibles: ['semanal', 'mensual', 'completo', 'general']
  });
});

// Ruta para obtener tipos de reportes
router.get('/tipos', (req, res) => {
  res.json({
    success: true,
    tipos: [
      {
        id: 'semanal',
        nombre: 'Reporte Semanal',
        descripcion: 'Progreso de los últimos 7 días',
        icono: '📅'
      },
      {
        id: 'mensual',
        nombre: 'Reporte Mensual',
        descripcion: 'Resumen del mes actual',
        icono: '📆'
      },
      {
        id: 'completo',
        nombre: 'Reporte Completo',
        descripcion: 'Histórico completo de actividades',
        icono: '📋'
      }
    ]
  });
});

module.exports = router;
