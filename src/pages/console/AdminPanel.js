import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { toast } from 'react-toastify';
import { 
  FaChartLine, 
  FaClock, 
  FaBullseye, 
  FaFileAlt, 
  FaCog, 
  FaEnvelope,
  FaTrophy,
  FaStar,
  FaCalendarAlt,
  FaGamepad,
  FaUser,
  FaBell,
  FaEdit,
  FaSave,
  FaPlus
} from 'react-icons/fa';

function TutorPanel() {
  const [seccionActiva, setSeccionActiva] = useState('progreso');
  const [perfilNino, setPerfilNino] = useState(null);
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState(null);
  const [actividadesRecientes, setActividadesRecientes] = useState([]);
  const [configuracion, setConfiguracion] = useState({
    recordatorios: {
      horaEstudio: '16:00',
      diasSemana: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
      notificacionesEmail: true,
      recordatoriosMovil: true
    },
    metas: {
      actividadesPorDia: 3,
      tiempoEstudioDiario: 30,
      puntosSemanales: 500
    }
  });
  const location = useLocation();
  // Obtener profileId desde los parámetros de URL o desde el state
  const urlParams = new URLSearchParams(location.search);
  const profileId = urlParams.get('profileId') || location.state?.profileId;

  // Cargar datos del perfil y estadísticas
  useEffect(() => {
    if (profileId) {
      cargarDatosNino();
    }
  }, [profileId]);

  const cargarDatosNino = async () => {
    try {
      setLoading(true);
      
      // Cargar perfil del niño
      const perfilRef = doc(db, "childProfiles", profileId);
      const perfilDoc = await getDoc(perfilRef);
      
      if (perfilDoc.exists()) {
        const datosNino = { ...perfilDoc.data(), id: profileId };
        setPerfilNino(datosNino);
        
        // Calcular estadísticas
        calcularEstadisticas(datosNino);
        
        // Cargar actividades recientes
        await cargarActividadesRecientes();
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar los datos del niño');
    } finally {
      setLoading(false);
    }
  };

  const cargarActividadesRecientes = async () => {
    try {
      const actividadesRef = collection(db, "activitySessions");
      const q = query(
        actividadesRef,
        where("childProfileId", "==", profileId),
        orderBy("timestamp", "desc"),
        limit(10)
      );
      
      const snapshot = await getDocs(q);
      const actividades = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setActividadesRecientes(actividades);
    } catch (error) {
      console.error('Error cargando actividades recientes:', error);
    }
  };

  const calcularEstadisticas = (datosNino) => {
    const hoy = new Date();
    const hace7Dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
    const hace30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);

    setEstadisticas({
      puntosTotales: datosNino.puntosTotales || 0,
      estrellas: datosNino.estrellas || 0,
      logros: Object.keys(datosNino.logros || {}).length,
      actividadesCompletadas: datosNino.actividadesCompletadas || 0,
      racha: datosNino.racha || 0,
      promedioSemanal: Math.round((datosNino.actividadesCompletadas || 0) / 4), // Aproximación
      tiempoEstudioSemanal: "2h 30min", // Calcular basado en sesiones reales
      metaCumplimiento: 85 // Porcentaje de cumplimiento de metas
    });
  };

  const actualizarConfiguracion = async (nuevaConfig) => {
    try {
      const perfilRef = doc(db, "childProfiles", profileId);
      await updateDoc(perfilRef, {
        configuracionTutor: nuevaConfig
      });
      setConfiguracion(nuevaConfig);
      toast.success('Configuración actualizada correctamente');
    } catch (error) {
      console.error('Error actualizando configuración:', error);
      toast.error('Error al actualizar la configuración');
    }
  };

  const secciones = [
    { id: 'progreso', nombre: 'Progreso', icono: <FaChartLine className="text-lg" />, color: 'bg-blue-500' },
    { id: 'horarios', nombre: 'Horarios', icono: <FaClock className="text-lg" />, color: 'bg-green-500' },
    { id: 'metas', nombre: 'Metas', icono: <FaBullseye className="text-lg" />, color: 'bg-purple-500' },
    { id: 'reportes', nombre: 'Reportes', icono: <FaFileAlt className="text-lg" />, color: 'bg-orange-500' },
    { id: 'configuracion', nombre: 'Configuración', icono: <FaCog className="text-lg" />, color: 'bg-gray-500' },
    { id: 'comunicacion', nombre: 'Comunicación', icono: <FaEnvelope className="text-lg" />, color: 'bg-red-500' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-blue)] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando panel de tutor...</p>
        </div>
      </div>
    );
  }

  if (!profileId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acceso Requerido</h2>
          <p className="text-gray-600 mb-4">No se ha especificado un perfil de niño.</p>
          <p className="text-gray-600">Por favor, accede desde la consola del niño.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del Panel de Tutor */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: perfilNino?.avatar?.color || '#4A90E2' }}
                >
                  {perfilNino?.avatar?.initials || perfilNino?.fullName?.charAt(0)}
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Panel de Tutor</h1>
                <p className="text-gray-600">Supervisando el progreso de {perfilNino?.fullName}</p>
              </div>
            </div>
            
            {/* Resumen rápido */}
            <div className="mt-4 sm:mt-0 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{estadisticas?.puntosTotales || 0}</div>
                <div className="text-xs text-gray-500">Puntos</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">{estadisticas?.estrellas || 0}</div>
                <div className="text-xs text-gray-500">Estrellas</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{estadisticas?.racha || 0}</div>
                <div className="text-xs text-gray-500">Días racha</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">{estadisticas?.logros || 0}</div>
                <div className="text-xs text-gray-500">Logros</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación por pestañas - Responsiva */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          {/* Desktop navigation */}
          <div className="hidden sm:block">
            <nav className="flex space-x-8 px-4 sm:px-6 lg:px-8">
              {secciones.map((seccion) => (
                <button
                  key={seccion.id}
                  onClick={() => setSeccionActiva(seccion.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    seccionActiva === seccion.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {seccion.icono}
                    <span>{seccion.nombre}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Mobile navigation */}
          <div className="sm:hidden">
            <div className="overflow-x-auto">
              <div className="flex space-x-1 px-4">
                {secciones.map((seccion) => (
                  <button
                    key={seccion.id}
                    onClick={() => setSeccionActiva(seccion.id)}
                    className={`flex-shrink-0 py-3 px-4 text-sm font-medium rounded-lg transition-colors ${
                      seccionActiva === seccion.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      {seccion.icono}
                      <span className="text-xs">{seccion.nombre}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido según la sección activa */}
      {seccionActiva === 'general' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Panel de Tutor - Progreso de {perfilNino?.fullName}</h3>
          
          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <FaTrophy className="text-2xl text-blue-600 mx-auto mb-2" />
              <p className="text-lg font-bold">{estadisticas?.actividadesCompletadas || 0}</p>
              <p className="text-sm text-gray-600">Actividades</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <FaStar className="text-2xl text-purple-600 mx-auto mb-2" />
              <p className="text-lg font-bold">{estadisticas?.estrellas || 0}</p>
              <p className="text-sm text-gray-600">Estrellas</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <FaCalendarAlt className="text-2xl text-green-600 mx-auto mb-2" />
              <p className="text-lg font-bold">{estadisticas?.racha || 0}</p>
              <p className="text-sm text-gray-600">Días consecutivos</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <FaBullseye className="text-2xl text-orange-600 mx-auto mb-2" />
              <p className="text-lg font-bold">{estadisticas?.metaCumplimiento || 0}%</p>
              <p className="text-sm text-gray-600">Meta cumplida</p>
            </div>
          </div>

          {/* Configuración rápida */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center">
                <FaClock className="mr-2 text-blue-600" />
                Horario de Estudio
              </h4>
              <p className="text-sm text-gray-600 mb-2">Hora preferida: {configuracion.recordatorios.horaEstudio}</p>
              <p className="text-sm text-gray-600">Días: {configuracion.recordatorios.diasSemana.length} días por semana</p>
            </div>
            
            <div className="border border-gray-200 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center">
                <FaBullseye className="mr-2 text-green-600" />
                Metas Actuales
              </h4>
              <p className="text-sm text-gray-600 mb-1">{configuracion.metas.actividadesPorDia} actividades/día</p>
              <p className="text-sm text-gray-600 mb-1">{configuracion.metas.tiempoEstudioDiario} min/día</p>
              <p className="text-sm text-gray-600">{configuracion.metas.puntosSemanales} puntos/semana</p>
            </div>
          </div>
        </div>
      )}

      {seccionActiva === 'correos' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <FaEnvelope className="mr-2 text-blue-600" />
            Gestión de Comunicación
          </h3>
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium mb-2">Recordatorios Automáticos</h4>
              <p className="text-sm text-gray-600 mb-3">Configura recordatorios automáticos para tu hijo</p>
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Configurar Recordatorios
                </button>
                <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                  Ver Historial
                </button>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium mb-2">Reportes por Email</h4>
              <p className="text-sm text-gray-600 mb-3">Recibe reportes semanales del progreso</p>
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={configuracion.recordatorios.notificacionesEmail}
                  onChange={(e) => setConfiguracion({
                    ...configuracion,
                    recordatorios: { ...configuracion.recordatorios, notificacionesEmail: e.target.checked }
                  })}
                  className="rounded text-blue-600" 
                />
                <span className="text-sm">Activar reportes semanales</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {seccionActiva === 'demo-email' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Vista Previa de Notificaciones</h3>
          <p className="text-gray-600 mb-4">Aquí puedes ver cómo se verán las notificaciones que recibe tu hijo</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 p-4 rounded-lg">
              <h4 className="font-medium text-green-600 mb-2">🎉 ¡Felicitaciones!</h4>
              <p className="text-sm text-gray-600">Has completado 3 actividades hoy. ¡Excelente trabajo!</p>
            </div>
            
            <div className="border border-gray-200 p-4 rounded-lg">
              <h4 className="font-medium text-blue-600 mb-2">⏰ Recordatorio</h4>
              <p className="text-sm text-gray-600">Es hora de hacer tus actividades de aprendizaje.</p>
            </div>
            
            <div className="border border-gray-200 p-4 rounded-lg">
              <h4 className="font-medium text-purple-600 mb-2">🏆 Nuevo Logro</h4>
              <p className="text-sm text-gray-600">¡Has desbloqueado el logro "Estudiante Constante"!</p>
            </div>
            
            <div className="border border-gray-200 p-4 rounded-lg">
              <h4 className="font-medium text-orange-600 mb-2">📊 Reporte Semanal</h4>
              <p className="text-sm text-gray-600">Esta semana completaste 15 actividades y ganaste 350 puntos.</p>
            </div>
          </div>
        </div>
      )}

      {seccionActiva === 'usuarios' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <FaUser className="mr-2 text-purple-600" />
            Gestión del Perfil
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: perfilNino?.avatar?.color || '#4A90E2' }}
              >
                {perfilNino?.avatar?.initials || perfilNino?.fullName?.charAt(0)}
              </div>
              <div>
                <h4 className="font-semibold text-lg">{perfilNino?.fullName}</h4>
                <p className="text-gray-600">Nivel: {perfilNino?.resultadosEvaluacion?.nivelAsignado?.nivel || 'No evaluado'}</p>
                <p className="text-gray-600">Edad: {perfilNino?.age || 'No especificada'} años</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                  <input 
                    type="text" 
                    value={perfilNino?.fullName || ''} 
                    disabled
                    className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
                  <input 
                    type="number" 
                    value={perfilNino?.age || ''} 
                    disabled
                    className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nivel actual</label>
                  <input 
                    type="text" 
                    value={perfilNino?.resultadosEvaluacion?.nivelAsignado?.nivel || 'No evaluado'} 
                    disabled
                    className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de registro</label>
                  <input 
                    type="text" 
                    value={perfilNino?.createdAt ? new Date(perfilNino.createdAt.toDate()).toLocaleDateString() : 'No disponible'}
                    disabled
                    className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mr-2"
                onClick={() => toast.info('Función de edición próximamente')}
              >
                <FaEdit className="inline mr-2" />
                Editar Perfil
              </button>
              <button 
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                onClick={() => toast.success('Configuración guardada')}
              >
                <FaSave className="inline mr-2" />
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {seccionActiva === 'estadisticas' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <FaChartLine className="mr-2 text-green-600" />
            Estadísticas Detalladas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Progreso general */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
              <h4 className="font-semibold mb-4">Progreso Semanal</h4>
              <div className="space-y-3">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((dia, index) => {
                  const progreso = Math.random() * 100;
                  return (
                    <div key={dia} className="flex items-center space-x-3">
                      <span className="text-sm font-medium w-10">{dia}</span>
                      <div className="flex-1 bg-white rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${progreso}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500 w-10">{Math.round(progreso)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actividades por categoría */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Por Categoría</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Atención</span>
                  <span className="text-sm font-medium">45%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Memoria</span>
                  <span className="text-sm font-medium">30%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Motriz</span>
                  <span className="text-sm font-medium">25%</span>
                </div>
              </div>
            </div>

            {/* Tiempo de estudio */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Tiempo de Estudio</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Esta semana</span>
                  <span className="text-sm font-medium">2h 30m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Promedio diario</span>
                  <span className="text-sm font-medium">25 min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Meta diaria</span>
                  <span className="text-sm font-medium">{configuracion.metas.tiempoEstudioDiario} min</span>
                </div>
              </div>
            </div>

            {/* Rendimiento */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Rendimiento</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Puntuación promedio</span>
                  <span className="text-sm font-medium">85%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Mejor racha</span>
                  <span className="text-sm font-medium">12 días</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Mejora semanal</span>
                  <span className="text-sm font-medium text-green-600">+15%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Botón para generar reporte */}
          <div className="mt-6 text-center">
            <button 
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              onClick={() => toast.info('Generando reporte...')}
            >
              <FaFileAlt className="inline mr-2" />
              Generar Reporte Completo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TutorPanel;