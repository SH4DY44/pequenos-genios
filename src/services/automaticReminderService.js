import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import EmailService from './emailService';

export class AutomaticReminderService {
  
  /**
   * 🔍 Analizar actividad del usuario y disparar recordatorios automáticos
   */
  static async analizarYDispararRecordatorios(tutorId, profileId) {
    try {
      console.log('🤖 Analizando actividad para recordatorios automáticos...');
      
      const analisis = await this.analizarActividad(tutorId, profileId);
      const recordatoriosParaEnviar = [];

      // 1. 🎮 Inactividad en actividades (24h)
      if (analisis.horasSinActividad >= 24) {
        recordatoriosParaEnviar.push({
          tipo: 'recordatorio_inactividad',
          prioridad: 'media',
          datos: {
            horasSinActividad: analisis.horasSinActividad,
            ultimaActividad: analisis.ultimaActividad
          }
        });
      }

      // 2. 📈 Pérdida de racha
      if (analisis.rachaPerdida && analisis.rachaAnterior >= 3) {
        recordatoriosParaEnviar.push({
          tipo: 'recordatorio_racha_perdida',
          prioridad: 'alta',
          datos: {
            diasRacha: analisis.rachaAnterior,
            fechaPerdida: analisis.fechaPerdidaRacha
          }
        });
      }

      // 3. 🎯 Meta semanal no cumplida (solo viernes)
      const hoy = new Date();
      if (hoy.getDay() === 5 && analisis.actividadesSemana < analisis.metaSemanal) {
        recordatoriosParaEnviar.push({
          tipo: 'recordatorio_meta_semanal',
          prioridad: 'media',
          datos: {
            actividadesCompletadas: analisis.actividadesSemana,
            metaSemanal: analisis.metaSemanal,
            actividadesFaltantes: analisis.metaSemanal - analisis.actividadesSemana
          }
        });
      }

      // 4. 🌟 Actividad favorita abandonada (7 días)
      if (analisis.diasSinActividadFavorita >= 7) {
        recordatoriosParaEnviar.push({
          tipo: 'recordatorio_actividad_favorita',
          prioridad: 'media',
          datos: {
            actividadFavorita: analisis.actividadFavorita,
            diasSinActividad: analisis.diasSinActividadFavorita
          }
        });
      }

      // 5. 📚 Área de aprendizaje rezagada (5 días)
      if (analisis.areaRezagada) {
        recordatoriosParaEnviar.push({
          tipo: 'recordatorio_area_rezagada',
          prioridad: 'media',
          datos: {
            areaRezagada: analisis.areaRezagada.nombre,
            diasSinArea: analisis.areaRezagada.dias,
            areasActivas: analisis.areasActivas
          }
        });
      }

      // 6. 🎖️ Cerca de logro
      if (analisis.cercaDeLogro) {
        recordatoriosParaEnviar.push({
          tipo: 'recordatorio_cerca_logro',
          prioridad: 'alta',
          datos: {
            nombreLogro: analisis.cercaDeLogro.nombre,
            actividadesFaltantes: analisis.cercaDeLogro.faltantes,
            tiempoEstimado: analisis.cercaDeLogro.tiempoEstimado,
            recompensaLogro: analisis.cercaDeLogro.recompensa
          }
        });
      }

      // 7. ⭐ Estrellas acumuladas sin usar (7 días + 50 estrellas)
      if (analisis.estrellasAcumuladas >= 50 && analisis.diasSinUsarEstrellas >= 7) {
        recordatoriosParaEnviar.push({
          tipo: 'recordatorio_estrellas_acumuladas',
          prioridad: 'baja',
          datos: {
            cantidadEstrellas: analisis.estrellasAcumuladas,
            costoAvatar: 30,
            costeTema: 20,
            costoPoder: 40
          }
        });
      }

      // 8. 🎊 Celebración de progreso (10+ actividades semanales)
      if (analisis.actividadesSemana >= 10) {
        recordatoriosParaEnviar.push({
          tipo: 'felicitacion_progreso',
          prioridad: 'alta',
          datos: {
            actividadesCompletadas: analisis.actividadesSemana,
            estrellasGanadas: analisis.estrellasSemanales,
            logrosObtenidos: analisis.logrosSemanales,
            mejorArea: analisis.mejorArea,
            progresoMejorArea: analisis.progresoMejorArea,
            rachaActual: analisis.rachaActual,
            nivelActual: analisis.nivelActual,
            recompensaEspecial: '🎁 Avatar Especial + 50 Estrellas Bonus'
          }
        });
      }

      // Enviar recordatorios (máximo 1 por día, priorizando por importancia)
      if (recordatoriosParaEnviar.length > 0) {
        await this.enviarRecordatorioAutomatico(tutorId, profileId, recordatoriosParaEnviar);
      }

      return {
        success: true,
        recordatoriosDisparados: recordatoriosParaEnviar.length,
        analisis
      };

    } catch (error) {
      console.error('❌ Error analizando recordatorios automáticos:', error);
      throw error;
    }
  }

  /**
   * 📊 Analizar actividad del usuario
   */
  static async analizarActividad(tutorId, profileId) {
    try {
      // Obtener datos del perfil
      const perfilRef = doc(db, 'profiles', profileId);
      const perfilSnap = await getDoc(perfilRef);
      const perfil = perfilSnap.data();

      // Obtener actividades recientes (último mes)
      const actividadesQuery = query(
        collection(db, 'actividades'),
        where('profileId', '==', profileId),
        where('fechaCompletada', '>=', Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))),
        orderBy('fechaCompletada', 'desc'),
        limit(100)
      );
      
      const actividadesSnap = await getDocs(actividadesQuery);
      const actividades = actividadesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Obtener logros
      const logrosQuery = query(
        collection(db, 'logros'),
        where('profileId', '==', profileId),
        orderBy('fechaObtenido', 'desc'),
        limit(50)
      );
      
      const logrosSnap = await getDocs(logrosQuery);
      const logros = logrosSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const ahora = new Date();
      const hace24h = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);
      const hace7dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
      const inicioSemana = new Date(ahora.getTime() - ahora.getDay() * 24 * 60 * 60 * 1000);

      // Análisis de actividad
      const ultimaActividad = actividades[0]?.fechaCompletada?.toDate() || null;
      const horasSinActividad = ultimaActividad 
        ? Math.floor((ahora - ultimaActividad) / (1000 * 60 * 60))
        : 999;

      // Actividades de la semana
      const actividadesSemana = actividades.filter(
        a => a.fechaCompletada?.toDate() >= inicioSemana
      ).length;

      // Racha actual y pérdida de racha
      const rachaActual = this.calcularRachaActual(actividades);
      const rachaAnterior = this.calcularRachaAnterior(actividades);
      const rachaPerdida = rachaAnterior > rachaActual && rachaActual === 0;

      // Actividad favorita
      const actividadesPorTipo = {};
      actividades.forEach(a => {
        actividadesPorTipo[a.tipo] = (actividadesPorTipo[a.tipo] || 0) + 1;
      });
      
      const actividadFavorita = Object.keys(actividadesPorTipo).reduce((a, b) => 
        actividadesPorTipo[a] > actividadesPorTipo[b] ? a : b
      , null);

      const ultimaActividadFavorita = actividades.find(a => a.tipo === actividadFavorita);
      const diasSinActividadFavorita = ultimaActividadFavorita
        ? Math.floor((ahora - ultimaActividadFavorita.fechaCompletada.toDate()) / (1000 * 60 * 60 * 24))
        : 999;

      // Áreas de aprendizaje
      const areasRecientes = {};
      actividades.filter(a => a.fechaCompletada?.toDate() >= hace7dias).forEach(a => {
        areasRecientes[a.area] = (areasRecientes[a.area] || 0) + 1;
      });

      const todasLasAreas = ['matematicas', 'lenguaje', 'ciencias', 'arte'];
      const areaRezagada = todasLasAreas.find(area => {
        const ultimaEnArea = actividades.find(a => a.area === area);
        if (!ultimaEnArea) return true;
        const diasSinArea = Math.floor((ahora - ultimaEnArea.fechaCompletada.toDate()) / (1000 * 60 * 60 * 24));
        return diasSinArea >= 5;
      });

      // Cerca de logro (simulado - esto dependería de tu lógica de logros)
      const cercaDeLogro = this.verificarCercaDeLogro(perfil, actividades, logros);

      // Estrellas
      const estrellasAcumuladas = perfil?.estrellas || 0;
      const ultimoUsoEstrellas = perfil?.ultimoUsoEstrellas?.toDate() || new Date(0);
      const diasSinUsarEstrellas = Math.floor((ahora - ultimoUsoEstrellas) / (1000 * 60 * 60 * 24));

      return {
        horasSinActividad,
        ultimaActividad,
        rachaPerdida,
        rachaAnterior,
        rachaActual,
        actividadesSemana,
        metaSemanal: 5,
        actividadFavorita,
        diasSinActividadFavorita,
        areaRezagada: areaRezagada ? {
          nombre: areaRezagada,
          dias: Math.floor((ahora - actividades.find(a => a.area === areaRezagada)?.fechaCompletada?.toDate() || new Date(0)) / (1000 * 60 * 60 * 24))
        } : null,
        areasActivas: Object.keys(areasRecientes),
        cercaDeLogro,
        estrellasAcumuladas,
        diasSinUsarEstrellas,
        estrellasSemanales: actividades.filter(a => a.fechaCompletada?.toDate() >= inicioSemana).length * 5,
        logrosSemanales: logros.filter(l => l.fechaObtenido?.toDate() >= inicioSemana).length,
        mejorArea: Object.keys(areasRecientes)[0] || 'matematicas',
        progresoMejorArea: 25,
        nivelActual: perfil?.nivel || 1
      };

    } catch (error) {
      console.error('❌ Error analizando actividad:', error);
      return {};
    }
  }

  /**
   * 🔥 Calcular racha actual
   */
  static calcularRachaActual(actividades) {
    if (!actividades.length) return 0;

    let racha = 0;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const fecha = new Date(hoy.getTime() - i * 24 * 60 * 60 * 1000);
      const fechaSiguiente = new Date(fecha.getTime() + 24 * 60 * 60 * 1000);
      
      const tieneActividad = actividades.some(a => {
        const fechaActividad = a.fechaCompletada?.toDate();
        return fechaActividad >= fecha && fechaActividad < fechaSiguiente;
      });

      if (tieneActividad) {
        racha++;
      } else {
        break;
      }
    }

    return racha;
  }

  /**
   * 📈 Calcular racha anterior (antes de romperla)
   */
  static calcularRachaAnterior(actividades) {
    // Esta es una implementación simplificada
    // En realidad deberías almacenar las rachas en la base de datos
    return 0; // Por ahora, implementar según tu lógica de negocio
  }

  /**
   * 🎖️ Verificar si está cerca de conseguir un logro
   */
  static verificarCercaDeLogro(perfil, actividades, logros) {
    // Ejemplo: Logro "Explorador" - 50 actividades
    const totalActividades = actividades.length;
    if (totalActividades >= 48 && totalActividades < 50) {
      return {
        nombre: 'Explorador del Conocimiento',
        faltantes: 50 - totalActividades,
        tiempoEstimado: (50 - totalActividades) * 10,
        recompensa: '🏆 Medalla de Oro + 100 Estrellas'
      };
    }

    // Ejemplo: Logro "Matemático" - 20 actividades de matemáticas
    const actividadesMatematicas = actividades.filter(a => a.area === 'matematicas').length;
    if (actividadesMatematicas >= 18 && actividadesMatematicas < 20) {
      return {
        nombre: 'Genio Matemático',
        faltantes: 20 - actividadesMatematicas,
        tiempoEstimado: (20 - actividadesMatematicas) * 8,
        recompensa: '🧮 Avatar Matemático + 75 Estrellas'
      };
    }

    return null;
  }

  /**
   * 📧 Enviar recordatorio automático
   */
  static async enviarRecordatorioAutomatico(tutorId, profileId, recordatorios) {
    try {
      // Verificar si ya se envió un recordatorio hoy
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const recordatoriosHoyQuery = query(
        collection(db, 'recordatoriosAutomaticos'),
        where('tutorId', '==', tutorId),
        where('profileId', '==', profileId),
        where('fechaEnvio', '>=', Timestamp.fromDate(hoy))
      );

      const recordatoriosHoySnap = await getDocs(recordatoriosHoyQuery);
      
      if (recordatoriosHoySnap.size > 0) {
        console.log('⏰ Ya se envió un recordatorio automático hoy');
        return { success: false, razon: 'limite_diario' };
      }

      // Seleccionar recordatorio con mayor prioridad
      const prioridades = { 'alta': 3, 'media': 2, 'baja': 1 };
      const recordatorioSeleccionado = recordatorios.sort((a, b) => 
        prioridades[b.prioridad] - prioridades[a.prioridad]
      )[0];

      // Obtener datos del perfil y tutor
      const perfilRef = doc(db, 'profiles', profileId);
      const perfilSnap = await getDoc(perfilRef);
      const perfil = perfilSnap.data();

      const tutorRef = doc(db, 'users', tutorId);
      const tutorSnap = await getDoc(tutorRef);
      const tutor = tutorSnap.data();

      // Preparar datos para el email
      const emailData = {
        destinatario: tutor.email,
        tipo: recordatorioSeleccionado.tipo,
        datos: {
          nombreNino: perfil.fullName,
          nombreTutor: tutor.displayName || 'Tutor',
          ...recordatorioSeleccionado.datos
        }
      };

      // Enviar email
      const emailResult = await EmailService.enviarRecordatorioAutomatico(emailData);

      // Guardar registro del recordatorio enviado
      await addDoc(collection(db, 'recordatoriosAutomaticos'), {
        tutorId,
        profileId,
        tipo: recordatorioSeleccionado.tipo,
        datos: recordatorioSeleccionado.datos,
        fechaEnvio: Timestamp.fromDate(new Date()),
        emailEnviado: emailResult.success,
        messageId: emailResult.messageId
      });

      console.log('✅ Recordatorio automático enviado:', recordatorioSeleccionado.tipo);
      
      return {
        success: true,
        tipo: recordatorioSeleccionado.tipo,
        emailResult
      };

    } catch (error) {
      console.error('❌ Error enviando recordatorio automático:', error);
      throw error;
    }
  }

  /**
   * 🌅 Recordatorios de rutina programados
   */
  static async enviarRecordatoriosRutina() {
    try {
      const ahora = new Date();
      const hora = ahora.getHours();
      const dia = ahora.getDay(); // 0=domingo, 1=lunes, etc.

      // Recordatorio de rutina: Lunes/Miércoles/Viernes a las 4:00 PM
      if ([1, 3, 5].includes(dia) && hora === 16) {
        console.log('🌅 Enviando recordatorios de rutina diaria...');
        
        // Obtener todos los perfiles activos
        const perfilesQuery = query(
          collection(db, 'profiles'),
          where('activo', '==', true)
        );
        
        const perfilesSnap = await getDocs(perfilesQuery);
        
        for (const perfilDoc of perfilesSnap.docs) {
          const perfil = perfilDoc.data();
          const profileId = perfilDoc.id;
          
          try {
            const emailData = {
              destinatario: perfil.tutorEmail,
              tipo: 'recordatorio_rutina_diaria',
              datos: {
                nombreNino: perfil.fullName,
                nombreTutor: perfil.tutorName || 'Tutor',
                diaSemana: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][dia],
                actividadRecomendada: this.obtenerActividadRecomendada(perfil),
                areaEnfoque: this.obtenerAreaEnfoque(perfil),
                metaDiaria: '2-3 actividades'
              }
            };

            await EmailService.enviarRecordatorioAutomatico(emailData);
            console.log(`✅ Recordatorio rutina enviado a ${perfil.fullName}`);
            
          } catch (error) {
            console.error(`❌ Error enviando recordatorio rutina a ${perfil.fullName}:`, error);
          }
        }
      }

      // Recordatorio fin de semana: Sábado 10:00 AM
      if (dia === 6 && hora === 10) {
        console.log('🎉 Enviando recordatorios de fin de semana...');
        await this.enviarRecordatoriosFinDeSemana();
      }

    } catch (error) {
      console.error('❌ Error enviando recordatorios de rutina:', error);
    }
  }

  /**
   * 📅 Recordatorios de fin de semana
   */
  static async enviarRecordatoriosFinDeSemana() {
    // Implementar lógica similar para recordatorios de fin de semana
    console.log('🎊 Enviando recordatorios de fin de semana...');
  }

  /**
   * 🎯 Obtener actividad recomendada
   */
  static obtenerActividadRecomendada(perfil) {
    const actividades = [
      'Suma Divertida',
      'Lectura de Cuentos',
      'Experimentos Simples',
      'Arte Creativo',
      'Palabras Mágicas'
    ];
    
    return actividades[Math.floor(Math.random() * actividades.length)];
  }

  /**
   * 📚 Obtener área de enfoque
   */
  static obtenerAreaEnfoque(perfil) {
    const areas = ['Matemáticas', 'Lenguaje', 'Ciencias', 'Arte'];
    return areas[Math.floor(Math.random() * areas.length)];
  }

  /**
   * 📊 Obtener estadísticas de recordatorios automáticos
   */
  static async obtenerEstadisticas(tutorId) {
    try {
      const hace30dias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const estadisticasQuery = query(
        collection(db, 'recordatoriosAutomaticos'),
        where('tutorId', '==', tutorId),
        where('fechaEnvio', '>=', Timestamp.fromDate(hace30dias))
      );
      
      const estadisticasSnap = await getDocs(estadisticasQuery);
      const recordatorios = estadisticasSnap.docs.map(doc => doc.data());

      const estadisticas = {
        totalEnviados: recordatorios.length,
        emailsExitosos: recordatorios.filter(r => r.emailEnviado).length,
        porTipo: {},
        tendenciaSemanal: []
      };

      recordatorios.forEach(r => {
        estadisticas.porTipo[r.tipo] = (estadisticas.porTipo[r.tipo] || 0) + 1;
      });

      return estadisticas;

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return {};
    }
  }
}

export default AutomaticReminderService;
