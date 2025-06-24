export const ACTIVITY_ASSETS = {
    // Control de Impulsos
    'control-impulsos': {
      icon: '🎯',
      emoji: '🧠',
      gradient: 'from-red-400 to-pink-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      description: 'Mejora tu autocontrol',
      component: 'control-impulsos'
    },
  
    'clasificacion-formas': {
      icon: '🔷',
      emoji: '📐',
      gradient: 'from-purple-400 to-indigo-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-800',
      description: 'Clasifica formas geométricas',
      component: 'clasificacion-formas'
    },
  
    // Reconocimiento de Emociones
    'reconocimiento-emociones': {
      icon: '😊',
      emoji: '🎭',
      gradient: 'from-yellow-400 to-orange-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      description: 'Identifica emociones',
      component: 'reconocimiento-emociones'
    },
  
    // Memorama (si lo quieres incluir en actividades)
    'memorama': {
      icon: '🧩',
      emoji: '🎴',
      gradient: 'from-purple-400 to-pink-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-800',
      description: 'Ejercita tu memoria',
      component: 'memorama'
    },
  
    // Secuencias (Eco)
    'secuencias': {
      icon: '🎵',
      emoji: '🔄',
      gradient: 'from-green-400 to-teal-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      description: 'Repite las secuencias',
      component: 'secuencias'
    },
  
    // Halli Galli
    'halli-galli': {
      icon: '🔔',
      emoji: '🍓',
      gradient: 'from-pink-400 to-red-500',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      textColor: 'text-pink-800',
      description: 'Reacciona rápidamente',
      component: 'halli-galli'
    }
  };
  
  // Función para obtener assets de una actividad
  export const getActivityAsset = (activityKey) => {
    return ACTIVITY_ASSETS[activityKey] || {
      icon: '🎮',
      emoji: '⭐',
      gradient: 'from-gray-400 to-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-800',
      description: 'Actividad educativa',
      component: 'default'
    };
  };
  
  // Componente reutilizable para mostrar ilustraciones (versión simplificada)
  export const ActivityIllustrationWrapper = ({ activityKey, className = "" }) => {
    const asset = getActivityAsset(activityKey);
    
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <div className={`w-full h-32 bg-gradient-to-br ${asset.gradient} flex items-center justify-center rounded-lg relative`}>
          {/* Fondo decorativo con patrón */}
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full" style={{
              backgroundImage: `radial-gradient(circle at 20% 30%, rgba(255,255,255,0.3) 2px, transparent 2px),
                               radial-gradient(circle at 70% 60%, rgba(255,255,255,0.2) 1px, transparent 1px),
                               radial-gradient(circle at 90% 20%, rgba(255,255,255,0.4) 1.5px, transparent 1.5px)`,
              backgroundSize: '30px 30px, 50px 50px, 40px 40px'
            }} />
          </div>
          
          {/* Overlay sutil para mejorar legibilidad */}
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          
          {/* Icono principal flotante */}
          <div className="relative z-10 text-5xl animate-pulse drop-shadow-lg">
            {asset.icon}
          </div>
          
          {/* Emoji secundario */}
          <div className="absolute top-2 right-2 text-2xl opacity-70">
            {asset.emoji}
          </div>
          
          {/* Elementos decorativos */}
          <div className="absolute bottom-2 left-2 w-3 h-3 bg-white bg-opacity-30 rounded-full animate-ping"></div>
          <div className="absolute top-4 left-4 w-2 h-2 bg-white bg-opacity-40 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  };
  
  // Colores por categoría de actividad
  export const CATEGORY_COLORS = {
    'habilidades-sociales': {
      primary: 'bg-yellow-500',
      secondary: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200'
    },
    'atencion-concentracion': {
      primary: 'bg-blue-500',
      secondary: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200'
    },
    'control-impulsos': {
      primary: 'bg-red-500',
      secondary: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200'
    },
    'habilidades-motoras': {
      primary: 'bg-green-500',
      secondary: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200'
    },
    'habilidades-cognitivas': {
      primary: 'bg-purple-500',
      secondary: 'bg-purple-100',
      text: 'text-purple-800',
      border: 'border-purple-200'
    }
  };