// src/components/notifications/NotificationIndicator.js
import React, { useState, useRef, useEffect } from 'react';
import { FaBell, FaTimes } from 'react-icons/fa';
import { useNotifications } from '../../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

function NotificationIndicator({ onOpenCenter }) {
  const {
    notificaciones,
    estadisticas,
    marcarComoLeida,
    obtenerNoLeidas
  } = useNotifications();

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const notificacionesNoLeidas = obtenerNoLeidas();
  const tieneNoLeidas = notificacionesNoLeidas.length > 0;

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Obtener icono según tipo de notificación
  const obtenerIcono = (tipo) => {
    const iconos = {
      actividad_pendiente: '🎯',
      logro_alcanzado: '🏆',
      resumen_semanal: '📊',
      evaluacion_recomendada: '📋',
      recordatorio_uso: '⏰',
      default: '📢'
    };
    return iconos[tipo] || iconos.default;
  };

  const manejarClickNotificacion = async (notificacion) => {
    if (!notificacion.leida) {
      await marcarComoLeida(notificacion.id);
    }
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      {/* Botón de notificaciones */}
      <button
        ref={buttonRef}
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-full transition-all"
      >
        <FaBell className="text-xl" />
        
        {/* Badge de notificaciones no leídas */}
        {tieneNoLeidas && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
            {estadisticas?.noLeidas > 99 ? '99+' : estadisticas?.noLeidas}
          </span>
        )}
      </button>

      {/* Dropdown de notificaciones */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden"
        >
          {/* Header del dropdown */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">
              Notificaciones
              {tieneNoLeidas && (
                <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  {estadisticas?.noLeidas} nuevas
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  onOpenCenter && onOpenCenter();
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver todas
              </button>
              <button
                onClick={() => setShowDropdown(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-80 overflow-y-auto">
            {notificacionesNoLeidas.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FaBell className="text-3xl mx-auto mb-3 opacity-50" />
                <p className="text-sm">No tienes notificaciones nuevas</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notificacionesNoLeidas.slice(0, 5).map(notificacion => (
                  <div
                    key={notificacion.id}
                    onClick={() => manejarClickNotificacion(notificacion)}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg flex-shrink-0 mt-1">
                        {obtenerIcono(notificacion.tipo)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {notificacion.titulo}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {notificacion.mensaje}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {notificacion.fechaCreacion instanceof Date && !isNaN(notificacion.fechaCreacion.getTime())
                            ? formatDistanceToNow(notificacion.fechaCreacion, {
                                addSuffix: true,
                                locale: es
                              })
                            : 'Fecha desconocida'}
                        </p>
                      </div>
                      {notificacion.prioridad === 'alta' && (
                        <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Mostrar si hay más notificaciones */}
                {notificacionesNoLeidas.length > 5 && (
                  <div className="p-4 bg-gray-50 text-center">
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        onOpenCenter && onOpenCenter();
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Ver {notificacionesNoLeidas.length - 5} notificaciones más
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer del dropdown */}
          {tieneNoLeidas && (
            <div className="border-t border-gray-200 p-3 bg-gray-50">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  onOpenCenter && onOpenCenter();
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-1"
              >
                Ir al centro de notificaciones
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationIndicator;