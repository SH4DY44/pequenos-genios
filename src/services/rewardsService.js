import { doc, updateDoc, getDoc, increment, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  LogrosDisponibles, 
  RecompensasEspeciales, 
  TipoMoneda, 
  RarezaRecompensa,
  TipoRecompensa,
  LogroCondiciones
} from '../utils/rewards/rewardsTypes';
import { NotificationService } from './notificationService';

export class RewardsService {
  
  // ============== GESTIÓN DE LOGROS ==============
  
  /**
   * Verificar y otorgar nuevos logros basados en el progreso del niño
   * @param {string} profileId - ID del perfil del niño
   * @param {object} datosProgreso - Datos actuales del progreso
   * @returns {Array} - Lista de nuevos logros obtenidos
   */
  static async verificarYOtorgarLogros(profileId, datosProgreso) {
    try {
      const perfilRef = doc(db, 'childProfiles', profileId);
      const perfilDoc = await getDoc(perfilRef);
      
      if (!perfilDoc.exists()) {
        throw new Error('Perfil no encontrado');
      }
      
      const perfilData = perfilDoc.data();
      const logrosActuales = perfilData.logros || {};
      const nuevosLogros = [];
      
      // Verificar cada logro disponible
      for (const [logroId, logro] of Object.entries(LogrosDisponibles)) {
        // Saltar si ya tiene este logro
        if (logrosActuales[logroId]) continue;
        
        // Obtener la función de condición por separado
        const condicionFn = LogroCondiciones[logroId];
        
        // Verificar si cumple la condición
        if (condicionFn && condicionFn(datosProgreso)) {
          // Otorgar el logro
          await this.otorgarLogro(profileId, logro);
          nuevosLogros.push(logro);
          
          console.log(`✅ Logro otorgado: ${logro.nombre} a perfil ${profileId}`);
        }
      }
      
      return nuevosLogros;
    } catch (error) {
      console.error('Error verificando logros:', error);
      return [];
    }
  }
  
  /**
   * Otorgar un logro específico a un niño
   * @param {string} profileId - ID del perfil
   * @param {object} logro - Objeto del logro a otorgar
   */
  static async otorgarLogro(profileId, logro) {
    try {
      console.log("DEBUG: Objeto logro al inicio de otorgarLogro:", logro);
      const perfilRef = doc(db, 'childProfiles', profileId);
      const timestamp = Timestamp.now();
      
      // Crear una copia del objeto logro y eliminar explícitamente la función 'condicion'
      const logroParaGuardar = { ...logro };
      if (logroParaGuardar.condicion) {
        delete logroParaGuardar.condicion;
        console.log("DEBUG: Condición eliminada de logroParaGuardar");
      }
      
      // Preparar las actualizaciones
      const actualizaciones = {
        [`logros.${logro.id}`]: {
          ...logroParaGuardar,
          fechaObtenido: timestamp,
          nuevo: true // Marca para mostrar animación
        }
      };
      
      // Agregar puntos y estrellas de recompensa
      if (logro.recompensa.puntos) {
        actualizaciones.puntosTotales = increment(logro.recompensa.puntos);
      }
      
      if (logro.recompensa.estrellas) {
        actualizaciones.estrellas = increment(logro.recompensa.estrellas);
      }
      
      // Si hay recompensa especial, agregarla al inventario
      if (logro.recompensa.recompensaEspecial) {
        const recompensa = logro.recompensa.recompensaEspecial;
        actualizaciones[`inventario.${recompensa.tipo}.${recompensa.id}`] = {
          obtenido: timestamp,
          desbloqueadoPor: logro.id
        };
      }
      
      // Actualizar contadores de logros por categoría
      actualizaciones[`estadisticasLogros.${logro.categoria}`] = increment(1);
      actualizaciones['estadisticasLogros.total'] = increment(1);
      
      await updateDoc(perfilRef, actualizaciones);
      
      // Enviar notificación de logro
      const perfilDoc = await getDoc(perfilRef);
      const perfilData = perfilDoc.data();
      
      if (perfilData.tutorId) {
        await NotificationService.notificarLogroAlcanzado(
          perfilData.tutorId,
          profileId,
          {
            nombreNino: perfilData.fullName,
            logro: logro.nombre,
            descripcion: logro.descripcion,
            puntos: logro.recompensa.puntos || 0,
            estrellas: logro.recompensa.estrellas || 0,
            icono: logro.icono
          }
        );
      }
      
    } catch (error) {
      console.error('Error otorgando logro:', error);
      throw error;
    }
  }
  
  // ============== GESTIÓN DE MONEDAS ==============
  
  /**
   * Agregar puntos a un perfil
   * @param {string} profileId - ID del perfil
   * @param {number} cantidad - Cantidad de puntos a agregar
   * @param {string} razon - Razón del otorgamiento
   */
  static async agregarPuntos(profileId, cantidad, razon = '') {
    try {
      const perfilRef = doc(db, 'childProfiles', profileId);
      
      await updateDoc(perfilRef, {
        puntosTotales: increment(cantidad),
        [`historicoMonedas.puntos`]: arrayUnion({
          cantidad,
          razon,
          fecha: Timestamp.now(),
          tipo: 'ganancia'
        })
      });
      
      console.log(`✅ Agregados ${cantidad} puntos a ${profileId}: ${razon}`);
    } catch (error) {
      console.error('Error agregando puntos:', error);
      throw error;
    }
  }
  
  /**
   * Agregar estrellas a un perfil
   * @param {string} profileId - ID del perfil
   * @param {number} cantidad - Cantidad de estrellas a agregar
   * @param {string} razon - Razón del otorgamiento
   */
  static async agregarEstrellas(profileId, cantidad, razon = '') {
    try {
      const perfilRef = doc(db, 'childProfiles', profileId);
      
      await updateDoc(perfilRef, {
        estrellas: increment(cantidad),
        [`historicoMonedas.estrellas`]: arrayUnion({
          cantidad,
          razon,
          fecha: Timestamp.now(),
          tipo: 'ganancia'
        })
      });
      
      console.log(`⭐ Agregadas ${cantidad} estrellas a ${profileId}: ${razon}`);
    } catch (error) {
      console.error('Error agregando estrellas:', error);
      throw error;
    }
  }
  
  // ============== SISTEMA DE CANJE ==============
  
  /**
   * Canjear puntos/estrellas por una recompensa
   * @param {string} profileId - ID del perfil
   * @param {string} recompensaId - ID de la recompensa
   * @param {string} categoria - Categoría de la recompensa
   */
  static async canjearRecompensa(profileId, recompensaId, categoria) {
    try {
      const perfilRef = doc(db, 'childProfiles', profileId);
      const perfilDoc = await getDoc(perfilRef);
      
      if (!perfilDoc.exists()) {
        throw new Error('Perfil no encontrado');
      }
      
      const perfilData = perfilDoc.data();
      const recompensa = RecompensasEspeciales[categoria]?.[recompensaId];
      
      if (!recompensa) {
        throw new Error('Recompensa no encontrada');
      }
      
      // Verificar si ya tiene la recompensa
      if (perfilData.inventario?.[recompensa.tipo]?.[recompensaId]) {
        throw new Error('Ya posees esta recompensa');
      }
      
      // Verificar si está desbloqueada por logro
      if (recompensa.desbloqueadoPor) {
        if (!perfilData.logros?.[recompensa.desbloqueadoPor]) {
          throw new Error('Recompensa no desbloqueada');
        }
      }
      
      // Verificar si tiene suficientes monedas
      const costo = recompensa.costo || {};
      
      if (costo.puntos && (perfilData.puntosTotales || 0) < costo.puntos) {
        throw new Error(`Necesitas ${costo.puntos} puntos`);
      }
      
      if (costo.estrellas && (perfilData.estrellas || 0) < costo.estrellas) {
        throw new Error(`Necesitas ${costo.estrellas} estrellas`);
      }
      
      // Realizar el canje
      const actualizaciones = {
        [`inventario.${recompensa.tipo}.${recompensaId}`]: {
          obtenido: Timestamp.now(),
          canjeado: true,
          costo: costo
        }
      };
      
      // Descontar monedas
      if (costo.puntos) {
        actualizaciones.puntosTotales = increment(-costo.puntos);
        actualizaciones[`historicoMonedas.puntos`] = arrayUnion({
          cantidad: -costo.puntos,
          razon: `Canje: ${recompensa.nombre}`,
          fecha: Timestamp.now(),
          tipo: 'gasto',
          recompensaId
        });
      }
      
      if (costo.estrellas) {
        actualizaciones.estrellas = increment(-costo.estrellas);
        actualizaciones[`historicoMonedas.estrellas`] = arrayUnion({
          cantidad: -costo.estrellas,
          razon: `Canje: ${recompensa.nombre}`,
          fecha: Timestamp.now(),
          tipo: 'gasto',
          recompensaId
        });
      }
      
      await updateDoc(perfilRef, actualizaciones);
      
      console.log(`🎁 Recompensa canjeada: ${recompensa.nombre} por ${profileId}`);
      
      return {
        exito: true,
        recompensa,
        mensaje: `¡${recompensa.nombre} agregado a tu inventario!`
      };
      
    } catch (error) {
      console.error('Error canjeando recompensa:', error);
      return {
        exito: false,
        error: error.message
      };
    }
  }
  
  // ============== GESTIÓN DE INVENTARIO ==============
  
  /**
   * Obtener el inventario completo de un perfil
   * @param {string} profileId - ID del perfil
   * @returns {object} - Inventario organizado por categorías
   */
  static async obtenerInventario(profileId) {
    try {
      const perfilRef = doc(db, 'childProfiles', profileId);
      const perfilDoc = await getDoc(perfilRef);
      
      if (!perfilDoc.exists()) {
        throw new Error('Perfil no encontrado');
      }
      
      const perfilData = perfilDoc.data();
      const inventario = perfilData.inventario || {};
      
      // Organizar inventario con información completa
      const inventarioCompleto = {};
      
      for (const [tipo, items] of Object.entries(inventario)) {
        inventarioCompleto[tipo] = {};
        
        for (const [itemId, itemData] of Object.entries(items)) {
          // Buscar información completa del item
          const itemCompleto = this.buscarRecompensaPorId(itemId);
          
          inventarioCompleto[tipo][itemId] = {
            ...itemCompleto,
            ...itemData,
            equipado: perfilData.equipamiento?.[tipo] === itemId
          };
        }
      }
      
      return inventarioCompleto;
    } catch (error) {
      console.error('Error obteniendo inventario:', error);
      return {};
    }
  }
  
  /**
   * Equipar/Desequipar un item del inventario
   * @param {string} profileId - ID del perfil
   * @param {string} tipo - Tipo de item (avatar, tema, etc.)
   * @param {string} itemId - ID del item (null para desequipar)
   */
  static async equiparItem(profileId, tipo, itemId = null) {
    try {
      const perfilRef = doc(db, 'childProfiles', profileId);
      const perfilDoc = await getDoc(perfilRef);
      
      if (!perfilDoc.exists()) {
        throw new Error('Perfil no encontrado');
      }
      
      const perfilData = perfilDoc.data();
      
      // Verificar que posee el item si se está equipando
      if (itemId && !perfilData.inventario?.[tipo]?.[itemId]) {
        throw new Error('No posees este item');
      }
      
      const actualizaciones = {};
      
      if (itemId) {
        actualizaciones[`equipamiento.${tipo}`] = itemId;
      } else {
        // Desequipar (Firebase no permite eliminar campos directamente en actualizaciones)
        actualizaciones[`equipamiento.${tipo}`] = null;
      }
      
      await updateDoc(perfilRef, actualizaciones);
      
      const accion = itemId ? 'equipado' : 'desequipado';
      console.log(`🎮 Item ${accion}: ${tipo}/${itemId} para ${profileId}`);
      
      return { exito: true, accion, tipo, itemId };
      
    } catch (error) {
      console.error('Error equipando item:', error);
      return { exito: false, error: error.message };
    }
  }
  
  // ============== UTILIDADES ==============
  
  /**
   * Buscar una recompensa por ID en todas las categorías
   * @param {string} recompensaId - ID de la recompensa
   * @returns {object|null} - Objeto de la recompensa o null
   */
  static buscarRecompensaPorId(recompensaId) {
    for (const [categoria, items] of Object.entries(RecompensasEspeciales)) {
      if (items[recompensaId]) {
        return items[recompensaId];
      }
    }
    return null;
  }
  
  /**
   * Calcular progreso hacia el siguiente logro
   * @param {object} datosProgreso - Datos actuales del progreso
   * @returns {Array} - Lista de próximos logros con progreso
   */
  static calcularProgresoLogros(datosProgreso) {
    const proximosLogros = [];
    const logrosActuales = datosProgreso.logros || {};
    
    for (const [logroId, logro] of Object.entries(LogrosDisponibles)) {
      // Saltar logros ya obtenidos
      if (logrosActuales[logroId]) continue;
      
      // Calcular progreso específico según el tipo de logro
      let progreso = 0;
      let objetivo = 1;
      let valorActual = 0;
      
      // Determinar progreso basado en la condición del logro
      if (logroId.includes('actividades')) {
        valorActual = datosProgreso.actividadesCompletadas || 0;
        if (logroId === 'primera_actividad') objetivo = 1;
        else if (logroId === 'diez_actividades') objetivo = 10;
        else if (logroId === 'cincuenta_actividades') objetivo = 50;
      } else if (logroId.includes('puntos')) {
        valorActual = datosProgreso.puntosTotales || 0;
        if (logroId === 'cien_puntos') objetivo = 100;
        else if (logroId === 'mil_puntos') objetivo = 1000;
      } else if (logroId.includes('semana') || logroId.includes('mes')) {
        valorActual = datosProgreso.racha || 0;
        if (logroId === 'primera_semana') objetivo = 7;
        else if (logroId === 'un_mes_consistente') objetivo = 30;
      }
      
      progreso = Math.min((valorActual / objetivo) * 100, 100);
      
      if (progreso > 0 && progreso < 100) {
        proximosLogros.push({
          ...logro,
          progreso: Math.round(progreso),
          valorActual,
          objetivo,
          porcentaje: progreso
        });
      }
    }
    
    // Ordenar por progreso descendente
    return proximosLogros.sort((a, b) => b.progreso - a.progreso).slice(0, 5);
  }
  
  /**
   * Obtener estadísticas de recompensas de un perfil
   * @param {string} profileId - ID del perfil
   * @returns {object} - Estadísticas completas
   */
  static async obtenerEstadisticasRecompensas(profileId) {
    try {
      const perfilRef = doc(db, 'childProfiles', profileId);
      const perfilDoc = await getDoc(perfilRef);
      
      if (!perfilDoc.exists()) {
        throw new Error('Perfil no encontrado');
      }
      
      const perfilData = perfilDoc.data();
      const logros = perfilData.logros || {};
      const inventario = perfilData.inventario || {};
      
      // Contar logros por rareza
      const logrosPorRareza = {
        comun: 0,
        raro: 0,
        epico: 0,
        legendario: 0
      };
      
      for (const logroId of Object.keys(logros)) {
        const logro = LogrosDisponibles[logroId];
        if (logro && logro.rareza) {
          logrosPorRareza[logro.rareza]++;
        }
      }
      
      // Contar items por tipo
      const itemsPorTipo = {};
      for (const [tipo, items] of Object.entries(inventario)) {
        itemsPorTipo[tipo] = Object.keys(items).length;
      }
      
      return {
        puntosTotales: perfilData.puntosTotales || 0,
        estrellas: perfilData.estrellas || 0,
        totalLogros: Object.keys(logros).length,
        logrosPorRareza,
        totalItems: Object.values(itemsPorTipo).reduce((a, b) => a + b, 0),
        itemsPorTipo,
        estadisticasLogros: perfilData.estadisticasLogros || {},
        ultimoLogro: this.obtenerUltimoLogro(logros),
        proximosLogros: this.calcularProgresoLogros(perfilData)
      };
      
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return null;
    }
  }
  
  /**
   * Obtener el último logro obtenido
   * @param {object} logros - Objeto de logros del perfil
   * @returns {object|null} - Último logro o null
   */
  static obtenerUltimoLogro(logros) {
    let ultimoLogro = null;
    let fechaMasReciente = null;
    
    for (const [logroId, logroData] of Object.entries(logros)) {
      if (logroData.fechaObtenido) {
        const fecha = logroData.fechaObtenido.toDate();
        if (!fechaMasReciente || fecha > fechaMasReciente) {
          fechaMasReciente = fecha;
          ultimoLogro = { id: logroId, ...logroData };
        }
      }
    }
    
    return ultimoLogro;
  }
  
  // ============== EVENTOS ESPECIALES ==============
  
  /**
   * Aplicar multiplicador de eventos especiales
   * @param {number} puntos - Puntos base
   * @param {string} tipoEvento - Tipo de evento
   * @returns {number} - Puntos con multiplicador aplicado
   */
  static aplicarMultiplicadorEvento(puntos, tipoEvento = null) {
    // Verificar si hay algún evento activo
    const eventoActivo = this.obtenerEventoActivo();
    
    if (!eventoActivo) return puntos;
    
    // Aplicar multiplicador según el tipo de evento
    const multiplicadores = {
      'fin_de_semana': 1.5,
      'vacaciones': 2.0,
      'cumpleanos': 3.0,
      'especial': 2.5
    };
    
    const multiplicador = multiplicadores[eventoActivo.tipo] || 1.0;
    return Math.round(puntos * multiplicador);
  }
  
  /**
   * Obtener evento activo (simulado por ahora)
   * @returns {object|null} - Evento activo o null
   */
  static obtenerEventoActivo() {
    // Por ahora retorna null, pero aquí se implementaría
    // la lógica para verificar eventos en la base de datos
    return null;
  }
  
  // ============== MÉTODOS DE INICIALIZACIÓN ==============
  
  /**
   * Inicializar estructura de recompensas para un nuevo perfil
   * @param {string} profileId - ID del perfil
   */
  static async inicializarSistemaRecompensas(profileId) {
    try {
      const perfilRef = doc(db, 'childProfiles', profileId);
      
      const estructuraInicial = {
        puntosTotales: 0,
        estrellas: 3, // Estrellas iniciales de regalo
        logros: {},
        inventario: {},
        equipamiento: {},
        estadisticasLogros: {
          total: 0,
          progreso: 0,
          habilidad: 0,
          consistencia: 0,
          velocidad: 0,
          precision: 0,
          social: 0,
          especial: 0
        },
        historicoMonedas: {
          puntos: [],
          estrellas: [{
            cantidad: 3,
            razon: 'Regalo de bienvenida',
            fecha: Timestamp.now(),
            tipo: 'regalo'
          }]
        }
      };
      
      await updateDoc(perfilRef, estructuraInicial);
      
      console.log(`🎁 Sistema de recompensas inicializado para ${profileId}`);
      
    } catch (error) {
      console.error('Error inicializando sistema de recompensas:', error);
      throw error;
    }
  }

  static async otorgarRecompensaActividad(profileId, actividadId, resultado) {
    try {
      const perfilRef = doc(db, 'childProfiles', profileId);
      const perfilDoc = await getDoc(perfilRef);
      
      if (!perfilDoc.exists()) {
        throw new Error('Perfil no encontrado');
      }
      
      const perfilData = perfilDoc.data();
      const recompensa = {
        puntos: 0,
        estrellas: 0
      };
      
      // Estrellas por completar actividad
      recompensa.estrellas += 1;
      
      // Estrellas por perfección
      if (resultado.porcentajeCorrecto === 100) {
        recompensa.estrellas += 1;
      }
      
      // Estrellas por velocidad
      if (resultado.tiempo < resultado.tiempoObjetivo) {
        recompensa.estrellas += 1;
      }
      
      // Otorgar recompensas
      if (recompensa.estrellas > 0) {
        await this.agregarEstrellas(
          profileId,
          recompensa.estrellas,
          'Completar actividad'
        );
      }
      
      return recompensa;
    } catch (error) {
      console.error('Error otorgando recompensa de actividad:', error);
      throw error;
    }
  }
}


export default RewardsService;
