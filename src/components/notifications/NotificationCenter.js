// src/components/notifications/NotificationCenter.js
import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { FaBell, FaCheck, FaTrash, FaTimes, FaFilter } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useLocation } from 'react-router-dom';
import { doc, getDocs, collection } from 'firebase/firestore';
import { db } from '../../config/firebase';

function NotificationCenter() {
  const {
    notificaciones,
    loading,
    estadisticas,
    marcarComoLeida,
    marcarTodasComoLeidas,
    cargarNotificaciones
  } = useNotifications();

  const location = useLocation();
  const [perfiles, setPerfiles] = useState([]);
  const [perfilActivo, setPerfilActivo] = useState(null);

  const [filtroActivo, setFiltroActivo] = useState('todas');
  const [mostrarSoloNoLeidas, setMostrarSoloNoLeidas] = useState(false);

  // Cargar perfiles de niños del tutor
  useEffect(() => {
    async function fetchPerfiles() {
      // Suponiendo que el tutor está autenticado
      const user = JSON.parse(localStorage.getItem('firebase:authUser')) || {};
      const tutorId = user.uid || null;
      if (!tutorId) return;
      const snapshot = await getDocs(collection(db, 'childProfiles'));
      const perfilesTutor = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(p => p.tutorId === tutorId);
      setPerfiles(perfilesTutor);
      if (perfilesTutor.length > 0 && !perfilActivo) {
        setPerfilActivo(perfilesTutor[0].id);
      }
    }
    fetchPerfiles();
    // eslint-disable-next-line
  }, []);

  // Filtros disponibles
  const filtros = [
    { id: 'todas', nombre: 'Todas', icono: '📋' },
    { id: 'actividad_pendiente', nombre: 'Actividades', icono: '🎯' },
    { id: 'logro_alcanzado', nombre: 'Logros', icono: '🏆' },
    { id: 'resumen_semanal', nombre: 'Resúmenes', icono: '📊' },
    { id: 'evaluacion_recomendada', nombre: 'Evaluaciones', icono: '📋' },
    { id: 'recordatorio_uso', nombre: 'Recordatorios', icono: '⏰' }
  ];

  // Filtrar notificaciones
  const notificacionesFiltradas = notificaciones.filter(notif => {
    if (perfilActivo && notif.profileId !== perfilActivo) return false;
    if (filtroActivo !== 'todas' && notif.tipo !== filtroActivo) return false;
    if (mostrarSoloNoLeidas && notif.leida) return false;
    return true;
  });

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

  // Obtener color según prioridad
  const obtenerColorPrioridad = (prioridad) => {
    const colores = {
      alta: 'border-l-red-500 bg-red-50',
      normal: 'border-l-blue-500 bg-blue-50',
      baja: 'border-l-gray-500 bg-gray-50'
    };
    return colores[prioridad] || colores.normal;
  };

  // Handler para marcar todas como leídas y refrescar filtro
  const handleMarcarTodasComoLeidas = async () => {
    await marcarTodasComoLeidas();
    setMostrarSoloNoLeidas(false); // Desactiva el filtro para mostrar todas
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[var(--primary-blue)] flex items-center gap-2">
            <FaBell />
            Centro de Notificaciones
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => cargarNotificaciones()}
              className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-all"
            >
              Actualizar
            </button>
            {estadisticas?.noLeidas > 0 && (
              <button
                onClick={handleMarcarTodasComoLeidas}
                className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-all flex items-center gap-2"
              >
                <FaCheck />
                Marcar todas como leídas
              </button>
            )}
          </div>
        </div>

        {/* Estadísticas */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-700 font-medium">Total</div>
              <div className="text-2xl font-bold text-blue-800">{estadisticas.total}</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-sm text-yellow-700 font-medium">No leídas</div>
              <div className="text-2xl font-bold text-yellow-800">{estadisticas.noLeidas}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-700 font-medium">Esta semana</div>
              <div className="text-2xl font-bold text-green-800">{estadisticas.ultimaSemana}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-700 font-medium">Tipos diferentes</div>
              <div className="text-2xl font-bold text-purple-800">
                {Object.keys(estadisticas.porTipo).length}
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="flex flex-wrap gap-2">
          {filtros.map(filtro => (
            <button
              key={filtro.id}
              onClick={() => setFiltroActivo(filtro.id)}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                filtroActivo === filtro.id
                  ? 'bg-[var(--primary-blue)] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{filtro.icono}</span>
              <span>{filtro.nombre}</span>
              {filtro.id !== 'todas' && estadisticas?.porTipo[filtro.id] && (
                <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                  {estadisticas.porTipo[filtro.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Toggle solo no leídas */}
        <div className="mt-4 flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={mostrarSoloNoLeidas}
              onChange={(e) => setMostrarSoloNoLeidas(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Mostrar solo no leídas</span>
          </label>
        </div>

        {/* Selector de perfil */}
        {perfiles.length > 1 && (
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mr-2">Perfil:</label>
            <select
              value={perfilActivo || ''}
              onChange={e => setPerfilActivo(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300"
            >
              {perfiles.map(perfil => (
                <option key={perfil.id} value={perfil.id}>{perfil.fullName}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Lista de notificaciones */}
      <div className="max-h-96 overflow-y-auto">
        {notificacionesFiltradas.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FaBell className="text-4xl mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No hay notificaciones</h3>
            <p className="text-sm">
              {mostrarSoloNoLeidas 
                ? 'No tienes notificaciones sin leer'
                : 'Todas las notificaciones aparecerán aquí'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notificacionesFiltradas.map(notificacion => (
              <div
                key={notificacion.id}
                className={`p-4 border-l-4 hover:bg-gray-50 transition-colors ${
                  obtenerColorPrioridad(notificacion.prioridad)
                } ${!notificacion.leida ? 'bg-blue-25' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{obtenerIcono(notificacion.tipo)}</span>
                      <h4 className={`font-medium ${
                        !notificacion.leida ? 'text-blue-900 font-bold' : 'text-gray-900'
                      }`}>
                        {notificacion.titulo}
                      </h4>
                      {!notificacion.leida && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          Nuevo
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 text-sm mb-2">{notificacion.mensaje}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        {formatDistanceToNow(notificacion.fechaCreacion, { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </span>
                      <span className="capitalize">Prioridad: {notificacion.prioridad}</span>
                      {notificacion.profileId && (
                        <span>Perfil: {notificacion.datos?.nombreNino || 'N/A'}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {!notificacion.leida && (
                      <button
                        onClick={() => marcarComoLeida(notificacion.id)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                        title="Marcar como leída"
                      >
                        <FaCheck />
                      </button>
                    )}
                  </div>
                </div>

                {/* Datos adicionales si existen */}
                {notificacion.datos && Object.keys(notificacion.datos).length > 0 && (
                  <div className="mt-3 p-2 bg-gray-100 rounded text-xs">
                    <details>
                      <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                        Ver detalles
                      </summary>
                      <pre className="mt-2 text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(notificacion.datos, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationCenter;