// src/components/notifications/NotificationCenter.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { FaBell, FaCheck, FaTimes, FaExclamationTriangle, FaSync } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { auth, db } from '../../config/firebase';
import { query, where, getDocs, collection } from 'firebase/firestore';
import { TutorService } from '../../services/tutorService';
import { NotificationService } from '../../services/notificationService';

function NotificationCenter() {
  const {
    notificaciones,
    loading,
    estadisticas,
    marcarComoLeida,
    marcarTodasComoLeidas,
    cargarNotificaciones
  } = useNotifications();

  // Estados locales
  const [perfiles, setPerfiles] = useState([]);
  const [perfilActivo, setPerfilActivo] = useState('todos');
  const [filtroActivo, setFiltroActivo] = useState('todas');
  const [mostrarSoloNoLeidas, setMostrarSoloNoLeidas] = useState(false);
  const [loadingMarcarTodas, setLoadingMarcarTodas] = useState(false);
  const [loadingPerfiles, setLoadingPerfiles] = useState(false);
  const [errorPerfiles, setErrorPerfiles] = useState(null);

  // ✅ CORREGIDO: Cargar perfiles de forma segura y eficiente
  const fetchPerfiles = useCallback(async () => {
    // ✅ SEGURIDAD: Usar Firebase Auth oficial
    if (!auth.currentUser) {
      setPerfiles([]);
      setErrorPerfiles('Usuario no autenticado');
      return;
    }

    setLoadingPerfiles(true);
    setErrorPerfiles(null);

    try {
      // ✅ PERFORMANCE: Query optimizada - solo perfiles del tutor
      const q = query(
        collection(db, 'childProfiles'),
        where('tutorId', '==', auth.currentUser.uid)
      );
      
      const snapshot = await getDocs(q);
      const perfilesTutor = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setPerfiles(perfilesTutor);
      
      // ✅ MEJORADO: Mantener selección o usar default
      if (perfilesTutor.length > 0 && perfilActivo === 'todos' && perfilesTutor.length === 1) {
        setPerfilActivo(perfilesTutor[0].id);
      }

    } catch (error) {
      console.error('Error cargando perfiles:', error);
      setErrorPerfiles('Error al cargar los perfiles de los niños');
      setPerfiles([]);
    } finally {
      setLoadingPerfiles(false);
    }
  }, [perfilActivo]);

  // ✅ CORREGIDO: useEffect con dependencias correctas
  useEffect(() => {
    // Solo cargar si hay usuario autenticado
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchPerfiles();
      } else {
        setPerfiles([]);
        setPerfilActivo('todos');
        setErrorPerfiles(null);
      }
    });

    return unsubscribe;
  }, [fetchPerfiles]);

  // ✅ CORREGIDO: Handler optimizado sin recarga duplicada
  const handleMarcarTodasComoLeidas = async () => {
    if (!auth.currentUser || loadingMarcarTodas) return;
    
    setLoadingMarcarTodas(true);
    try {
      await marcarTodasComoLeidas();
      setMostrarSoloNoLeidas(false); // Desactiva el filtro
      // ✅ NO RECARGAMOS - el hook ya actualiza el estado
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
    } finally {
      setLoadingMarcarTodas(false);
    }
  };



  // ✅ AGREGADO: Handler para marcar individual con feedback
  const handleMarcarComoLeida = async (notificacionId) => {
    if (!notificacionId) return;
    
    try {
      await marcarComoLeida(notificacionId);
      // El hook ya actualiza el estado, no necesitamos hacer nada más
    } catch (error) {
      console.error('Error marcando como leída:', error);
    }
  };

  // Filtros disponibles
  const filtros = [
    { id: 'todas', nombre: 'Todas', icono: '📋' },
    { id: 'actividad_pendiente', nombre: 'Actividades', icono: '🎯' },
    { id: 'logro_alcanzado', nombre: 'Logros', icono: '🏆' },
    { id: 'resumen_semanal', nombre: 'Resúmenes', icono: '📊' },
    { id: 'evaluacion_recomendada', nombre: 'Evaluaciones', icono: '📋' },
    { id: 'recordatorio_uso', nombre: 'Recordatorios', icono: '⏰' }
  ];

  // ✅ CORREGIDO: Filtrar notificaciones con validación
  const notificacionesFiltradas = notificaciones.filter(notif => {
    // ✅ VALIDACIÓN: Verificar que notif existe
    if (!notif) return false;
    
    // Filtrar por perfil
    if (perfilActivo && perfilActivo !== 'todos') {
      // ✅ CORREGIDO: Manejo seguro de profileId undefined
      if (notif.profileId !== perfilActivo) return false;
    }
    
    // Filtrar por tipo
    if (filtroActivo !== 'todas' && notif.tipo !== filtroActivo) return false;
    
    // Filtrar solo no leídas
    if (mostrarSoloNoLeidas && notif.leida) return false;
    
    return true;
  });

  // ✅ CORREGIDO: Funciones con validación
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

  const obtenerColorPrioridad = (prioridad) => {
    const colores = {
      alta: 'border-l-red-500 bg-red-50',
      normal: 'border-l-blue-500 bg-blue-50',
      baja: 'border-l-gray-500 bg-gray-50'
    };
    return colores[prioridad] || colores.normal;
  };

  // ✅ AGREGADO: Formatear fecha de forma segura
  const formatearFecha = (fecha) => {
    try {
      if (!fecha) return 'Fecha no disponible';
      
      // Convertir a Date si es necesario
      const fechaDate = fecha instanceof Date ? fecha : new Date(fecha);
      
      // Validar que es una fecha válida
      if (isNaN(fechaDate.getTime())) return 'Fecha inválida';
      
      return formatDistanceToNow(fechaDate, { 
        addSuffix: true, 
        locale: es 
      });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Fecha no disponible';
    }
  };

  // ✅ MEJORADO: Loading state con mejor UX
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="grid grid-cols-4 gap-4 mb-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg">
      {/* ✅ MEJORADO: Header con mejor UX */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[var(--primary-blue)] flex items-center gap-2">
            <FaBell />
            Centro de Notificaciones
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => cargarNotificaciones()}
              disabled={loading}
              className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 
                       transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <FaSync className={loading ? 'animate-spin' : ''} />
              {loading ? 'Cargando...' : 'Actualizar'}
            </button>
            
            {estadisticas?.noLeidas > 0 && (
              <button
                onClick={handleMarcarTodasComoLeidas}
                disabled={loadingMarcarTodas}
                className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 
                         transition-all flex items-center gap-2 disabled:opacity-60"
              >
                {loadingMarcarTodas ? (
                  <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FaCheck />
                )}
                {loadingMarcarTodas ? 'Marcando...' : 'Marcar todas como leídas'}
              </button>
            )}

            <button 
              onClick={async () => {
                try {
                  const notifId = await NotificationService.crearRecordatorioManual(
                    auth.currentUser.uid,
                    'test-profile-id',
                    {
                      titulo: 'Prueba de recordatorio',
                      mensaje: 'Este es un recordatorio de prueba',
                      nombreNino: 'Niño de Prueba'
                    }
                  );
                  alert(`✅ Recordatorio creado con ID: ${notifId}`);
                } catch (error) {
                  alert(`❌ Error: ${error.message}`);
                }
              }}
              className="px-4 py-2 bg-purple-500 text-white rounded ml-2"
            >
              🧪 Probar Recordatorio
            </button>
          </div>
        </div>

        {/* ✅ MEJORADO: Estadísticas con validación */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-700 font-medium">Total</div>
              <div className="text-2xl font-bold text-blue-800">{estadisticas.total || 0}</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-sm text-yellow-700 font-medium">No leídas</div>
              <div className="text-2xl font-bold text-yellow-800">{estadisticas.noLeidas || 0}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-700 font-medium">Esta semana</div>
              <div className="text-2xl font-bold text-green-800">{estadisticas.ultimaSemana || 0}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-700 font-medium">Tipos diferentes</div>
              <div className="text-2xl font-bold text-purple-800">
                {estadisticas.porTipo ? Object.keys(estadisticas.porTipo).length : 0}
              </div>
            </div>
          </div>
        )}

        {/* ✅ MEJORADO: Selector de perfil con manejo de errores */}
        {errorPerfiles ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
            <FaExclamationTriangle className="text-red-500" />
            <span className="text-red-700 text-sm">{errorPerfiles}</span>
            <button
              onClick={fetchPerfiles}
              className="ml-auto px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        ) : perfiles.length > 0 && (
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mr-2">Filtrar por perfil:</label>
            <select
              value={perfilActivo}
              onChange={e => setPerfilActivo(e.target.value)}
              disabled={loadingPerfiles}
              className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50"
            >
              <option value="todos">Todos los perfiles</option>
              {perfiles.map(perfil => (
                <option key={perfil.id} value={perfil.id}>
                  {perfil.fullName || 'Perfil sin nombre'}
                </option>
              ))}
            </select>
            {loadingPerfiles && (
              <span className="ml-2 text-sm text-gray-500">Cargando perfiles...</span>
            )}
          </div>
        )}

        {/* Filtros por tipo */}
        <div className="flex flex-wrap gap-2 mb-4">
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
              {filtro.id !== 'todas' && estadisticas?.porTipo?.[filtro.id] && (
                <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                  {estadisticas.porTipo[filtro.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Toggle solo no leídas */}
        <div className="flex items-center gap-2">
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
      </div>

      {/* ✅ MEJORADO: Lista de notificaciones con validación */}
      <div className="max-h-96 overflow-y-auto">
        {notificacionesFiltradas.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FaBell className="text-4xl mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No hay notificaciones</h3>
            <p className="text-sm">
              {mostrarSoloNoLeidas 
                ? 'No tienes notificaciones sin leer'
                : filtroActivo !== 'todas' 
                  ? `No hay notificaciones del tipo "${filtros.find(f => f.id === filtroActivo)?.nombre}"`
                  : 'Todas las notificaciones aparecerán aquí'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notificacionesFiltradas.map(notificacion => {
              // ✅ VALIDACIÓN: Verificar que la notificación existe
              if (!notificacion || !notificacion.id) return null;
              
              return (
                <div
                  key={notificacion.id}
                  className={`p-4 border-l-4 hover:bg-gray-50 transition-colors ${
                    obtenerColorPrioridad(notificacion.prioridad)
                  } ${!notificacion.leida ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{obtenerIcono(notificacion.tipo)}</span>
                        <h4 className={`font-medium ${
                          !notificacion.leida ? 'text-blue-900 font-bold' : 'text-gray-900'
                        }`}>
                          {notificacion.titulo || 'Sin título'}
                        </h4>
                        {!notificacion.leida && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            Nuevo
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 text-sm mb-2">
                        {notificacion.mensaje || 'Sin mensaje'}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{formatearFecha(notificacion.fechaCreacion)}</span>
                        <span className="capitalize">
                          Prioridad: {notificacion.prioridad || 'normal'}
                        </span>
                        {notificacion.profileId && (
                          <span>
                            Perfil: {notificacion.datos?.nombreNino || 'N/A'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {!notificacion.leida && (
                        <button
                          onClick={() => handleMarcarComoLeida(notificacion.id)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                          title="Marcar como leída"
                        >
                          <FaCheck />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ✅ MEJORADO: Datos adicionales con validación */}
                  {notificacion.datos && typeof notificacion.datos === 'object' && 
                   Object.keys(notificacion.datos).length > 0 && (
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationCenter;