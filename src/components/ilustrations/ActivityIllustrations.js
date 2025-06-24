// src/components/illustrations/ActivityIllustrations.js
import React from 'react';

// Ilustración para Búsqueda de Diferencias
export const BusquedaDiferenciasIllustration = ({ className = "" }) => (
  <div className={`relative w-full h-32 ${className}`}>
    <svg viewBox="0 0 200 120" className="w-full h-full">
      <defs>
        <linearGradient id="magnifierGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Imagen izquierda */}
      <rect x="20" y="25" width="60" height="45" rx="5" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth="2"/>
      <circle cx="35" cy="40" r="3" fill="#ef4444"/>
      <rect x="45" y="50" width="8" height="4" fill="#22c55e"/>
      <circle cx="60" cy="35" r="2" fill="#f59e0b"/>
      
      {/* Imagen derecha */}
      <rect x="120" y="25" width="60" height="45" rx="5" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth="2"/>
      <circle cx="135" cy="40" r="3" fill="#ef4444"/>
      <rect x="145" y="50" width="8" height="4" fill="#22c55e"/>
      <circle cx="160" cy="35" r="2" fill="#8b5cf6"/> {/* Diferencia: color cambiado */}
      <rect x="150" y="35" width="4" height="4" fill="#ef4444"/> {/* Diferencia: objeto extra */}
      
      {/* Lupa */}
      <circle cx="100" cy="85" r="15" fill="none" stroke="url(#magnifierGradient)" strokeWidth="3" filter="url(#glow)"/>
      <circle cx="100" cy="85" r="10" fill="rgba(59, 130, 246, 0.1)"/>
      <line x1="112" y1="97" x2="125" y2="110" stroke="url(#magnifierGradient)" strokeWidth="4" strokeLinecap="round" filter="url(#glow)"/>
      
      {/* Líneas de conexión */}
      <path d="M 80 47 Q 90 55 100 70" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" opacity="0.6">
        <animate attributeName="stroke-dashoffset" values="0;10" dur="2s" repeatCount="indefinite"/>
      </path>
      <path d="M 120 47 Q 110 55 100 70" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" opacity="0.6">
        <animate attributeName="stroke-dashoffset" values="0;10" dur="2s" repeatCount="indefinite"/>
      </path>
      
      {/* Partículas flotantes */}
      <circle cx="50" cy="15" r="1" fill="#fbbf24" opacity="0.8">
        <animate attributeName="cy" values="15;10;15" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="150" cy="12" r="1" fill="#ec4899" opacity="0.8">
        <animate attributeName="cy" values="12;7;12" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="100" cy="10" r="1" fill="#22c55e" opacity="0.8">
        <animate attributeName="cy" values="10;5;10" dur="2.8s" repeatCount="indefinite"/>
      </circle>
    </svg>
  </div>
);

// Ilustración para Control de Impulsos
export const ControlImpulsosIllustration = ({ className = "" }) => (
  <div className={`relative w-full h-32 ${className}`}>
    <svg viewBox="0 0 200 120" className="w-full h-full">
      <defs>
        <radialGradient id="targetGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#ef4444" />
          <stop offset="60%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#991b1b" />
        </radialGradient>
        <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      
      {/* Diana principal */}
      <circle cx="100" cy="60" r="35" fill="url(#targetGradient)" stroke="#991b1b" strokeWidth="2"/>
      <circle cx="100" cy="60" r="25" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.8"/>
      <circle cx="100" cy="60" r="15" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.8"/>
      <circle cx="100" cy="60" r="8" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2">
        <animate attributeName="r" values="8;10;8" dur="2s" repeatCount="indefinite"/>
      </circle>
      
      {/* Cerebro estilizado */}
      <path d="M 40 30 Q 45 20 60 25 Q 70 15 80 25 Q 85 30 80 40 Q 70 45 60 40 Q 45 45 40 30 Z" 
            fill="url(#brainGradient)" opacity="0.7" transform="scale(0.8)"/>
      <circle cx="55" cy="32" r="2" fill="#ffffff" opacity="0.8"/>
      <circle cx="65" cy="35" r="1.5" fill="#ffffff" opacity="0.8"/>
      
      {/* Ondas de concentración */}
      <circle cx="100" cy="60" r="45" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.3">
        <animate attributeName="r" values="45;55;45" dur="3s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.3;0.1;0.3" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="100" cy="60" r="50" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.2">
        <animate attributeName="r" values="50;60;50" dur="3.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.2;0.05;0.2" dur="3.5s" repeatCount="indefinite"/>
      </circle>
      
      {/* Flecha de precisión */}
      <path d="M 100 60 L 95 65 L 105 65 Z" fill="#fbbf24" transform="rotate(0 100 60)">
        <animateTransform attributeName="transform" type="rotate" values="0 100 60;360 100 60" dur="8s" repeatCount="indefinite"/>
      </path>
      
      {/* Indicadores de autocontrol */}
      <rect x="160" y="20" width="25" height="4" rx="2" fill="#22c55e" opacity="0.8">
        <animate attributeName="width" values="25;30;25" dur="2s" repeatCount="indefinite"/>
      </rect>
      <text x="162" y="18" fontSize="8" fill="#22c55e" fontWeight="bold">Control</text>
      
      <rect x="160" y="35" width="20" height="4" rx="2" fill="#f59e0b" opacity="0.8">
        <animate attributeName="width" values="20;25;20" dur="2.5s" repeatCount="indefinite"/>
      </rect>
      <text x="162" y="33" fontSize="8" fill="#f59e0b" fontWeight="bold">Focus</text>
    </svg>
  </div>
);

// Ilustración para Reconocimiento de Emociones
export const ReconocimientoEmocionesIllustration = ({ className = "" }) => (
  <div className={`relative w-full h-32 ${className}`}>
    <svg viewBox="0 0 200 120" className="w-full h-full">
      <defs>
        <linearGradient id="happyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="sadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="angryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
      </defs>
      
      {/* Cara feliz */}
      <circle cx="60" cy="45" r="20" fill="url(#happyGradient)" stroke="#f59e0b" strokeWidth="2">
        <animate attributeName="r" values="20;22;20" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="55" cy="40" r="2" fill="#000"/>
      <circle cx="65" cy="40" r="2" fill="#000"/>
      <path d="M 52 50 Q 60 58 68 50" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round"/>
      
      {/* Cara triste */}
      <circle cx="100" cy="75" r="18" fill="url(#sadGradient)" stroke="#1d4ed8" strokeWidth="2">
        <animate attributeName="r" values="18;20;18" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="96" cy="70" r="2" fill="#000"/>
      <circle cx="104" cy="70" r="2" fill="#000"/>
      <path d="M 108 82 Q 100 78 92 82" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M 94 68 L 96 66" stroke="#87ceeb" strokeWidth="1.5" strokeLinecap="round"> {/* Lágrima */}
        <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite"/>
      </path>
      
      {/* Cara enojada */}
      <circle cx="140" cy="45" r="20" fill="url(#angryGradient)" stroke="#dc2626" strokeWidth="2">
        <animate attributeName="r" values="20;21;20" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="135" cy="42" r="2" fill="#000"/>
      <circle cx="145" cy="42" r="2" fill="#000"/>
      <path d="M 132 38 L 138 40" stroke="#000" strokeWidth="2" strokeLinecap="round"/> {/* Ceja izquierda */}
      <path d="M 148 38 L 142 40" stroke="#000" strokeWidth="2" strokeLinecap="round"/> {/* Ceja derecha */}
      <path d="M 135 52 Q 140 48 145 52" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round"/>
      
      {/* Corazones flotantes */}
      <path d="M 70 25 C 70 22, 75 22, 75 25 C 75 22, 80 22, 80 25 C 80 30, 75 35, 75 35 C 75 35, 70 30, 70 25 Z" 
            fill="#ec4899" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite"/>
        <animateTransform attributeName="transform" type="translate" values="0,0;0,-10;0,0" dur="4s" repeatCount="indefinite"/>
      </path>
      
      {/* Ondas de emoción */}
      <circle cx="100" cy="60" r="60" fill="none" stroke="#8b5cf6" strokeWidth="1" opacity="0.2">
        <animate attributeName="r" values="60;80;60" dur="4s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.2;0.05;0.2" dur="4s" repeatCount="indefinite"/>
      </circle>
      
      {/* Texto descriptivo */}
      <text x="100" y="105" textAnchor="middle" fontSize="10" fill="#6b7280" fontWeight="bold">
        Identifica Emociones
      </text>
      
      {/* Estrellas decorativas */}
      <g transform="translate(30,15)">
        <polygon points="0,-4 1,-1 4,-1 2,1 3,4 0,2 -3,4 -2,1 -4,-1 -1,-1" fill="#fbbf24" opacity="0.6">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="rotate" values="0;360" dur="10s" repeatCount="indefinite"/>
        </polygon>
      </g>
      <g transform="translate(170,20)">
        <polygon points="0,-3 1,-1 3,-1 1,1 2,3 0,2 -2,3 -1,1 -3,-1 -1,-1" fill="#ec4899" opacity="0.6">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="rotate" values="360;0" dur="8s" repeatCount="indefinite"/>
        </polygon>
      </g>
    </svg>
  </div>
);

// Ilustración para Memorama
export const MemoramaIllustration = ({ className = "" }) => (
  <div className={`relative w-full h-32 ${className}`}>
    <svg viewBox="0 0 200 120" className="w-full h-full">
      <defs>
        <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <pattern id="cardPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="#f3f4f6"/>
          <circle cx="10" cy="10" r="2" fill="#8b5cf6" opacity="0.3"/>
        </pattern>
      </defs>
      
      {/* Cartas boca abajo */}
      <rect x="30" y="30" width="25" height="35" rx="4" fill="url(#cardPattern)" stroke="#6b7280" strokeWidth="1">
        <animate attributeName="y" values="30;25;30" dur="3s" repeatCount="indefinite"/>
      </rect>
      <rect x="65" y="30" width="25" height="35" rx="4" fill="url(#cardPattern)" stroke="#6b7280" strokeWidth="1">
        <animate attributeName="y" values="30;28;30" dur="2.5s" repeatCount="indefinite"/>
      </rect>
      <rect x="100" y="30" width="25" height="35" rx="4" fill="url(#cardPattern)" stroke="#6b7280" strokeWidth="1">
        <animate attributeName="y" values="30;27;30" dur="2.8s" repeatCount="indefinite"/>
      </rect>
      <rect x="135" y="30" width="25" height="35" rx="4" fill="url(#cardPattern)" stroke="#6b7280" strokeWidth="1">
        <animate attributeName="y" values="30;26;30" dur="3.2s" repeatCount="indefinite"/>
      </rect>
      
      {/* Cartas reveladas con animación de volteo */}
      <g transform="translate(42.5,47.5)">
        <rect x="-12.5" y="-17.5" width="25" height="35" rx="4" fill="url(#cardGradient)" stroke="#6366f1" strokeWidth="2">
          <animateTransform attributeName="transform" type="rotateY" values="0;180;360" dur="4s" repeatCount="indefinite"/>
        </rect>
        <text x="0" y="5" textAnchor="middle" fontSize="16" fill="#ffffff">🐱</text>
      </g>
      
      <g transform="translate(147.5,47.5)">
        <rect x="-12.5" y="-17.5" width="25" height="35" rx="4" fill="url(#cardGradient)" stroke="#6366f1" strokeWidth="2">
          <animateTransform attributeName="transform" type="rotateY" values="360;180;0" dur="4s" repeatCount="indefinite"/>
        </rect>
        <text x="0" y="5" textAnchor="middle" fontSize="16" fill="#ffffff">🐱</text>
      </g>
      
      {/* Línea de conexión entre cartas emparejadas */}
      <path d="M 55 47 Q 100 35 145 47" stroke="#22c55e" strokeWidth="3" fill="none" strokeDasharray="10,5" opacity="0.8">
        <animate attributeName="stroke-dashoffset" values="0;15" dur="1s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite"/>
      </path>
      
      {/* Efectos de partículas de éxito */}
      <circle cx="100" cy="20" r="2" fill="#22c55e" opacity="0.8">
        <animate attributeName="cy" values="20;10;20" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="110" cy="18" r="1.5" fill="#fbbf24" opacity="0.7">
        <animate attributeName="cy" values="18;8;18" dur="2.3s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2.3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="90" cy="22" r="1.5" fill="#ec4899" opacity="0.7">
        <animate attributeName="cy" values="22;12;22" dur="1.8s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.7;0.2;0.7" dur="1.8s" repeatCount="indefinite"/>
      </circle>
      
      {/* Cerebro con ondas de memoria */}
      <g transform="translate(100,85)">
        <path d="M -15 0 Q -15 -10 -5 -10 Q 5 -15 15 -10 Q 15 0 10 5 Q 0 10 -10 5 Q -15 0 -15 0 Z" 
              fill="#8b5cf6" opacity="0.6"/>
        <circle cx="0" cy="0" r="12" fill="none" stroke="#8b5cf6" strokeWidth="1" opacity="0.4">
          <animate attributeName="r" values="12;18;12" dur="3s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.4;0.1;0.4" dur="3s" repeatCount="indefinite"/>
        </circle>
        <circle cx="0" cy="0" r="15" fill="none" stroke="#8b5cf6" strokeWidth="1" opacity="0.3">
          <animate attributeName="r" values="15;21;15" dur="3.5s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.3;0.05;0.3" dur="3.5s" repeatCount="indefinite"/>
        </circle>
      </g>
      
      {/* Texto descriptivo */}
      <text x="100" y="110" textAnchor="middle" fontSize="9" fill="#6b7280" fontWeight="bold">
        Ejercita tu Memoria
      </text>
    </svg>
  </div>
);

// Componente principal que decide qué ilustración mostrar
export const ActivityIllustration = ({ type, className = "" }) => {
  switch (type) {
    case 'busqueda-diferencias':
      return <BusquedaDiferenciasIllustration className={className} />;
    case 'control-impulsos':
      return <ControlImpulsosIllustration className={className} />;
    case 'reconocimiento-emociones':
      return <ReconocimientoEmocionesIllustration className={className} />;
    case 'memorama':
      return <MemoramaIllustration className={className} />;
    default:
      return (
        <div className={`w-full h-32 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center ${className}`}>
          <span className="text-4xl text-white">🎮</span>
        </div>
      );
  }
};