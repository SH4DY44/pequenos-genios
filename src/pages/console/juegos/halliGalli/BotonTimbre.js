import React from 'react';

function BotonTimbre({ onClick, disabled, animating }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-24 h-24 md:w-32 md:h-32 
        bg-red-500 hover:bg-red-600 
        rounded-full shadow-lg 
        flex items-center justify-center
        transform transition-all duration-300
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        ${animating ? 'animate-ping' : ''}
      `}
    >
      <div className="w-20 h-20 md:w-28 md:h-28 bg-red-600 rounded-full flex items-center justify-center">
        <span className="text-3xl md:text-5xl text-white">🔔</span>
      </div>
    </button>
  );
}

export default BotonTimbre;