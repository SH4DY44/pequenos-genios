export const TipoRecompensa = {
    INSIGNIA: 'insignia',
    TROFEO: 'trofeo',
    AVATAR: 'avatar',
    TEMA: 'tema',
    MARCO: 'marco',
    EFECTO: 'efecto'
  };
  
  // Categorías de logros
  export const CategoriaLogro = {
    PROGRESO: 'progreso',
    HABILIDAD: 'habilidad',
    CONSISTENCIA: 'consistencia',
    VELOCIDAD: 'velocidad',
    PRECISION: 'precision',
    SOCIAL: 'social',
    ESPECIAL: 'especial'
  };
  
  // Rareza de las recompensas
  export const RarezaRecompensa = {
    COMUN: 'comun',
    RARO: 'raro',
    EPICO: 'epico',
    LEGENDARIO: 'legendario'
  };
  
  // Tipos de monedas del sistema
  export const TipoMoneda = {
    PUNTOS: 'puntos',           // Moneda principal
    ESTRELLAS: 'estrellas',     // Moneda premium
    GEMAS: 'gemas'              // Moneda especial
  };
  
  // Logros predefinidos del sistema
  export const LogrosDisponibles = {
    // LOGROS DE PROGRESO
    primera_actividad: {
      id: 'primera_actividad',
      nombre: '¡Primer Paso!',
      descripcion: 'Completaste tu primera actividad',
      categoria: CategoriaLogro.PROGRESO,
      icono: '🎯',
      rareza: RarezaRecompensa.COMUN,
      recompensa: {
        puntos: 50,
        estrellas: 1
      },
      condicion: (data) => (data.actividadesCompletadas || 0) >= 1
    },
    
    diez_actividades: {
      id: 'diez_actividades',
      nombre: 'Estudiante Dedicado',
      descripcion: 'Completaste 10 actividades',
      categoria: CategoriaLogro.PROGRESO,
      icono: '📚',
      rareza: RarezaRecompensa.COMUN,
      recompensa: {
        puntos: 100,
        estrellas: 2
      },
      condicion: (data) => (data.actividadesCompletadas || 0) >= 10
    },
    
    cincuenta_actividades: {
      id: 'cincuenta_actividades',
      nombre: 'Aprendiz Avanzado',
      descripcion: 'Completaste 50 actividades',
      categoria: CategoriaLogro.PROGRESO,
      icono: '🏆',
      rareza: RarezaRecompensa.RARO,
      recompensa: {
        puntos: 300,
        estrellas: 5,
        recompensaEspecial: {
          tipo: TipoRecompensa.INSIGNIA,
          id: 'insignia_aprendiz'
        }
      },
      condicion: (data) => (data.actividadesCompletadas || 0) >= 50
    },
  
    // LOGROS DE PUNTOS
    cien_puntos: {
      id: 'cien_puntos',
      nombre: 'Centenario',
      descripcion: 'Alcanzaste 100 puntos totales',
      categoria: CategoriaLogro.PROGRESO,
      icono: '💯',
      rareza: RarezaRecompensa.COMUN,
      recompensa: {
        puntos: 50,
        estrellas: 1
      },
      condicion: (data) => (data.puntosTotales || 0) >= 100
    },
    
    mil_puntos: {
      id: 'mil_puntos',
      nombre: 'Maestro de Puntos',
      descripcion: 'Alcanzaste 1000 puntos totales',
      categoria: CategoriaLogro.PROGRESO,
      icono: '⭐',
      rareza: RarezaRecompensa.RARO,
      recompensa: {
        puntos: 200,
        estrellas: 5,
        recompensaEspecial: {
          tipo: TipoRecompensa.TROFEO,
          id: 'trofeo_maestro_puntos'
        }
      },
      condicion: (data) => (data.puntosTotales || 0) >= 1000
    },
  
    // LOGROS DE CONSISTENCIA
    primera_semana: {
      id: 'primera_semana',
      nombre: 'Una Semana Completa',
      descripcion: 'Completaste actividades durante 7 días seguidos',
      categoria: CategoriaLogro.CONSISTENCIA,
      icono: '📅',
      rareza: RarezaRecompensa.RARO,
      recompensa: {
        puntos: 150,
        estrellas: 3
      },
      condicion: (data) => (data.racha || 0) >= 7
    },
    
    un_mes_consistente: {
      id: 'un_mes_consistente',
      nombre: 'Súper Constante',
      descripcion: 'Completaste actividades durante 30 días seguidos',
      categoria: CategoriaLogro.CONSISTENCIA,
      icono: '🔥',
      rareza: RarezaRecompensa.EPICO,
      recompensa: {
        puntos: 500,
        estrellas: 10,
        recompensaEspecial: {
          tipo: TipoRecompensa.EFECTO,
          id: 'efecto_fuego'
        }
      },
      condicion: (data) => (data.racha || 0) >= 30
    },
  
    // LOGROS DE JUEGOS ESPECÍFICOS
    memorama_master: {
      id: 'memorama_master',
      nombre: 'Maestro del Memorama',
      descripcion: 'Ganaste 10 partidas de Memorama',
      categoria: CategoriaLogro.HABILIDAD,
      icono: '🧠',
      rareza: RarezaRecompensa.RARO,
      recompensa: {
        puntos: 200,
        estrellas: 4
      },
      condicion: (data) => (data.estadisticasJuegos?.memorama?.victorias || 0) >= 10
    },
    
    velocista_eco: {
      id: 'velocista_eco',
      nombre: 'Eco Velocista',
      descripcion: 'Completaste 5 niveles de ECO en tiempo récord',
      categoria: CategoriaLogro.VELOCIDAD,
      icono: '⚡',
      rareza: RarezaRecompensa.RARO,
      recompensa: {
        puntos: 180,
        estrellas: 3
      },
      condicion: (data) => (data.estadisticasJuegos?.eco?.tiemposRecord || 0) >= 5
    },
  
    // LOGROS ESPECIALES
    perfeccionista: {
      id: 'perfeccionista',
      nombre: 'Perfeccionista',
      descripcion: 'Completaste 5 actividades sin ningún error',
      categoria: CategoriaLogro.PRECISION,
      icono: '💎',
      rareza: RarezaRecompensa.EPICO,
      recompensa: {
        puntos: 300,
        estrellas: 7,
        recompensaEspecial: {
          tipo: TipoRecompensa.MARCO,
          id: 'marco_diamante'
        }
      },
      condicion: (data) => (data.actividadesPerfectas || 0) >= 5
    },
    
    explorador: {
      id: 'explorador',
      nombre: 'Gran Explorador',
      descripcion: 'Probaste todas las categorías de actividades',
      categoria: CategoriaLogro.ESPECIAL,
      icono: '🗺️',
      rareza: RarezaRecompensa.EPICO,
      recompensa: {
        puntos: 250,
        estrellas: 6,
        recompensaEspecial: {
          tipo: TipoRecompensa.AVATAR,
          id: 'avatar_explorador'
        }
      },
      condicion: (data) => {
        const categorias = Object.keys(data.estadisticasCategorias || {});
        return categorias.length >= 5; // Todas las categorías disponibles
      }
    }
  };
  
  // Recompensas especiales disponibles en la tienda
  export const RecompensasEspeciales = {
    // INSIGNIAS
    insignias: {
      insignia_aprendiz: {
        id: 'insignia_aprendiz',
        nombre: 'Insignia de Aprendiz',
        descripcion: 'Demuestra tu dedicación al aprendizaje',
        tipo: TipoRecompensa.INSIGNIA,
        rareza: RarezaRecompensa.RARO,
        icono: '🎓',
        costo: { estrellas: 5 },
        desbloqueadoPor: 'cincuenta_actividades'
      },
      
      insignia_velocidad: {
        id: 'insignia_velocidad',
        nombre: 'Insignia de Velocidad',
        descripcion: 'Para los más rápidos del oeste',
        tipo: TipoRecompensa.INSIGNIA,
        rareza: RarezaRecompensa.RARO,
        icono: '🏃‍♂️',
        costo: { puntos: 500, estrellas: 3 }
      }
    },
  
    // TROFEOS
    trofeos: {
      trofeo_maestro_puntos: {
        id: 'trofeo_maestro_puntos',
        nombre: 'Trofeo Maestro de Puntos',
        descripcion: 'Reconocimiento por excelencia en puntuación',
        tipo: TipoRecompensa.TROFEO,
        rareza: RarezaRecompensa.EPICO,
        icono: '🏆',
        desbloqueadoPor: 'mil_puntos'
      },
      
      trofeo_oro: {
        id: 'trofeo_oro',
        nombre: 'Trofeo de Oro',
        descripcion: 'El trofeo más prestigioso',
        tipo: TipoRecompensa.TROFEO,
        rareza: RarezaRecompensa.LEGENDARIO,
        icono: '🥇',
        costo: { estrellas: 20 }
      }
    },
  
    // AVATARES
    avatares: {
      avatar_explorador: {
        id: 'avatar_explorador',
        nombre: 'Avatar Explorador',
        descripcion: 'Un valiente explorador de conocimientos',
        tipo: TipoRecompensa.AVATAR,
        rareza: RarezaRecompensa.EPICO,
        icono: '🧭',
        preview: '👨‍🚀',
        desbloqueadoPor: 'explorador'
      },
      
      avatar_cientifico: {
        id: 'avatar_cientifico',
        nombre: 'Avatar Científico',
        descripcion: 'Para los amantes de la ciencia',
        tipo: TipoRecompensa.AVATAR,
        rareza: RarezaRecompensa.RARO,
        icono: '🔬',
        preview: '👩‍🔬',
        costo: { estrellas: 8 }
      }
    },
  
    // TEMAS
    temas: {
      tema_espacio: {
        id: 'tema_espacio',
        nombre: 'Tema Espacial',
        descripcion: 'Convierte tu consola en una nave espacial',
        tipo: TipoRecompensa.TEMA,
        rareza: RarezaRecompensa.EPICO,
        icono: '🚀',
        preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        costo: { estrellas: 12 }
      },
      
      tema_oceano: {
        id: 'tema_oceano',
        nombre: 'Tema Océano',
        descripcion: 'Sumérgete en las profundidades marinas',
        tipo: TipoRecompensa.TEMA,
        rareza: RarezaRecompensa.RARO,
        icono: '🌊',
        preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        costo: { estrellas: 8 }
      }
    },
  
    // MARCOS
    marcos: {
      marco_diamante: {
        id: 'marco_diamante',
        nombre: 'Marco de Diamante',
        descripcion: 'Un marco brillante para tu avatar',
        tipo: TipoRecompensa.MARCO,
        rareza: RarezaRecompensa.LEGENDARIO,
        icono: '💎',
        preview: 'border: 3px solid #b8860b; box-shadow: 0 0 10px #ffd700;',
        desbloqueadoPor: 'perfeccionista'
      }
    },
  
    // EFECTOS
    efectos: {
      efecto_fuego: {
        id: 'efecto_fuego',
        nombre: 'Efecto de Fuego',
        descripcion: 'Añade llamas a tus logros',
        tipo: TipoRecompensa.EFECTO,
        rareza: RarezaRecompensa.LEGENDARIO,
        icono: '🔥',
        desbloqueadoPor: 'un_mes_consistente'
      }
    }
  };
  
  // Configuración de la tienda
  export const ConfiguracionTienda = {
    // Rotación diaria de ofertas especiales
    ofertasEspeciales: {
      frecuenciaRotacion: 24, // horas
      descuentoMaximo: 0.3,   // 30% de descuento
      itemsEnOferta: 3
    },
    
    // Paquetes especiales
    paquetes: {
      paquete_inicio: {
        id: 'paquete_inicio',
        nombre: 'Paquete de Inicio',
        descripcion: 'Todo lo que necesitas para empezar',
        items: ['avatar_cientifico', 'tema_oceano'],
        costo: { estrellas: 12 },
        descuento: 0.25
      }
    }
  };
  
  // Utilidades para el sistema de recompensas
  export const RewardsUtils = {
    // Calcular color según rareza
    getColorRareza: (rareza) => {
      const colores = {
        [RarezaRecompensa.COMUN]: '#9CA3AF',     // Gris
        [RarezaRecompensa.RARO]: '#3B82F6',      // Azul
        [RarezaRecompensa.EPICO]: '#8B5CF6',     // Púrpura
        [RarezaRecompensa.LEGENDARIO]: '#F59E0B' // Dorado
      };
      return colores[rareza] || colores[RarezaRecompensa.COMUN];
    },
  
    // Obtener brillo según rareza
    getGlowRareza: (rareza) => {
      const brillos = {
        [RarezaRecompensa.COMUN]: 'none',
        [RarezaRecompensa.RARO]: '0 0 10px rgba(59, 130, 246, 0.5)',
        [RarezaRecompensa.EPICO]: '0 0 15px rgba(139, 92, 246, 0.6)',
        [RarezaRecompensa.LEGENDARIO]: '0 0 20px rgba(245, 158, 11, 0.8)'
      };
      return brillos[rareza] || brillos[RarezaRecompensa.COMUN];
    },
  
    // Formatear números grandes
    formatearNumero: (numero) => {
      if (numero >= 1000000) {
        return (numero / 1000000).toFixed(1) + 'M';
      } else if (numero >= 1000) {
        return (numero / 1000).toFixed(1) + 'K';
      }
      return numero.toString();
    }
  };
  
  export default {
    TipoRecompensa,
    CategoriaLogro,
    RarezaRecompensa,
    TipoMoneda,
    LogrosDisponibles,
    RecompensasEspeciales,
    ConfiguracionTienda,
    RewardsUtils
  };