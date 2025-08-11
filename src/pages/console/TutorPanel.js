import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { toast } from 'react-toastify';
import { enviarNotificacionConfiguracion } from '../../services/notificationEmailService';
import reportService from '../../services/reportService';
import { 
  FaChartLine, 
  FaClock, 
  FaBullseye, 
  FaFileAlt, 
  FaEnvelope,
  FaTrophy,
  FaStar,
  FaCalendarAlt,
  FaGamepad,
  FaBell,
  FaEdit,
  FaSave,
  FaPlus
} from 'react-icons/fa';

// Función para obtener información del día actual
const obtenerInfoDiaActual = () => {
  const hoy = new Date();
  const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const diaActual = diasSemana[hoy.getDay()];
  
  return {
    diaActual,
    fecha: hoy.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    hora: hoy.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  };
};

// Función para verificar si una rutina está activa hoy
const rutinActivaHoy = (diasSemana) => {
  const { diaActual } = obtenerInfoDiaActual();
  return diasSemana.includes(diaActual);
};

// Función para verificar si ya pasó la hora de una rutina hoy
const yaCompletoHoy = (hora) => {
  const ahora = new Date();
  const [horaRutina, minutoRutina] = hora.split(':').map(Number);
  const horaRutinaHoy = new Date();
  horaRutinaHoy.setHours(horaRutina, minutoRutina, 0, 0);
  
  return ahora > horaRutinaHoy;
};

function TutorPanel({ profileId: profileIdProp }) {
  const [seccionActiva, setSeccionActiva] = useState('progreso');
  const [perfilNino, setPerfilNino] = useState(null);
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState(null);
  const [actividadesRecientes, setActividadesRecientes] = useState([]);
  const [showNuevaRutinaModal, setShowNuevaRutinaModal] = useState(false);
  const [editingRutina, setEditingRutina] = useState(null);
  const [rutinasPersonalizadas, setRutinasPersonalizadas] = useState([]);
  const [tiempoActual, setTiempoActual] = useState(new Date());
  const [guardando, setGuardando] = useState(false);
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
  // Obtener profileId desde props o desde los parámetros de URL como fallback
  const urlParams = new URLSearchParams(location.search);
  const profileId = profileIdProp || urlParams.get('profileId') || location.state?.profileId;

  // Función para calcular estadísticas (sin dependencias para evitar bucles)
  const calcularEstadisticas = useCallback((datosNino, actividades = []) => {
    // Calcular actividades completadas hoy
    const hoy = new Date();
    const inicioHoy = new Date(hoy.setHours(0, 0, 0, 0));
    const actividadesHoy = actividades.filter(act => 
      new Date(act.timestamp?.toDate?.() || act.timestamp) >= inicioHoy
    ).length;

    // Calcular tiempo de estudio hoy (estimado en minutos)
    const tiempoHoy = actividadesHoy * 10; // Estimación: 10 min por actividad

    // Calcular puntos de la semana (estimación)
    const puntosEsaSemana = Math.floor((datosNino.puntosTotales || 0) * 0.3); // Estimación

    setEstadisticas({
      puntosTotales: datosNino.puntosTotales || 0,
      estrellas: datosNino.estrellas || 0,
      logros: Object.keys(datosNino.logros || {}).length,
      actividadesCompletadas: datosNino.actividadesCompletadas || 0,
      racha: datosNino.racha || 0,
      promedioSemanal: Math.round((datosNino.actividadesCompletadas || 0) / 4), // Aproximación
      tiempoEstudioSemanal: "2h 30min", // Calcular basado en sesiones reales
      metaCumplimiento: 85, // Porcentaje de cumplimiento de metas
      // Nuevos campos para metas
      actividadesCompletadasHoy: actividadesHoy,
      tiempoEstudioHoy: tiempoHoy,
      puntosSemana: puntosEsaSemana
    });
  }, []); // Sin dependencias para evitar bucles

  // Función para cargar actividades recientes (sin dependencias para evitar bucles)
  const cargarActividadesRecientes = useCallback(async () => {
    if (!profileId) return [];
    
    try {
      console.log('🔄 Cargando actividades recientes...');
      const actividadesRef = collection(db, "activitySessions");
      
      // Intentar query optimizada primero
      try {
        const q = query(
          actividadesRef,
          where("childProfileId", "==", profileId),
          orderBy("timestamp", "desc"),
          limit(10)
        );
        
        // Agregar timeout para evitar cuelgue
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 10000)
        );
        
        const queryPromise = getDocs(q);
        const snapshot = await Promise.race([queryPromise, timeoutPromise]);
        
        const actividades = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('✅ Actividades cargadas:', actividades.length);
        return actividades;
        
      } catch (queryError) {
        console.warn('⚠️ Error con query optimizada, usando fallback simple:', queryError.message);
        
        // Fallback: query simple sin orderBy para evitar problemas de índice
        const qSimple = query(actividadesRef, limit(100));
        const snapshotSimple = await getDocs(qSimple);
        
        const actividadesFiltradas = snapshotSimple.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(act => act.childProfileId === profileId)
          .sort((a, b) => {
            const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp);
            const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp);
            return timeB - timeA;
          })
          .slice(0, 10);
        
        console.log('✅ Actividades cargadas (fallback):', actividadesFiltradas.length);
        return actividadesFiltradas;
      }
      
    } catch (error) {
      console.error('❌ Error cargando actividades recientes:', error);
      toast.warning('No se pudieron cargar las actividades recientes');
      return [];
    }
  }, [profileId]); // Solo depende de profileId

  // Función para cargar datos principales del niño
  const cargarDatosNino = useCallback(async () => {
    try {
      console.log('📂 Iniciando carga de datos del niño:', profileId);
      setLoading(true);
      
      // Cargar perfil del niño con timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout loading profile')), 10000)
      );
      
      const perfilRef = doc(db, "childProfiles", profileId);
      const perfilPromise = getDoc(perfilRef);
      
      const perfilDoc = await Promise.race([perfilPromise, timeoutPromise]);
      
      if (perfilDoc.exists()) {
        const datosNino = { ...perfilDoc.data(), id: profileId };
        console.log('✅ Datos del perfil cargados:', datosNino);
        
        setPerfilNino(datosNino);
        
        // Cargar configuración guardada o usar por defecto
        if (datosNino.configuracionTutor) {
          setConfiguracion(datosNino.configuracionTutor);
        }
        
        // Cargar rutinas personalizadas
        if (datosNino.rutinasPersonalizadas) {
          setRutinasPersonalizadas(datosNino.rutinasPersonalizadas);
        }
        
        // Cargar actividades recientes de forma asíncrona y actualizar estado
        cargarActividadesRecientes().then(actividades => {
          setActividadesRecientes(actividades);
          // Recalcular estadísticas con las actividades cargadas
          calcularEstadisticas(datosNino, actividades);
        }).catch(error => {
          console.warn('⚠️ Error cargando actividades, continuando sin ellas:', error);
          setActividadesRecientes([]);
        });
        
      } else {
        console.error('❌ No se encontró el perfil del niño');
        toast.error('No se encontró el perfil del niño');
      }
      
    } catch (error) {
      console.error('❌ Error cargando datos del niño:', error);
      if (error.message === 'Timeout loading profile') {
        toast.error('La carga está tomando demasiado tiempo. Verifica tu conexión.');
      } else {
        toast.error('Error al cargar los datos del niño');
      }
    } finally {
      setLoading(false);
      console.log('🏁 Carga de datos finalizada');
    }
  }, [profileId, calcularEstadisticas, cargarActividadesRecientes]);

  // Actualizar tiempo cada minuto para vista en tiempo real
  useEffect(() => {
    const intervalo = setInterval(() => {
      setTiempoActual(new Date());
    }, 60000); // Actualizar cada minuto

    return () => clearInterval(intervalo);
  }, []);

  // Cargar datos cuando cambie el profileId (solo una vez por profileId)
  useEffect(() => {
    if (profileId) {
      console.log('🎯 ProfileId detectado, iniciando carga de datos:', profileId);
      cargarDatosNino();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]); // Solo depende de profileId para evitar bucles infinitos

  const actualizarConfiguracion = async (nuevaConfig) => {
    try {
      setGuardando(true);
      const perfilRef = doc(db, "childProfiles", profileId);
      await updateDoc(perfilRef, {
        configuracionTutor: nuevaConfig
      });
      setConfiguracion(nuevaConfig);
      
      // Enviar notificación por email si está habilitada
      if (nuevaConfig.recordatorios.notificacionesEmail) {
        console.log('📧 Intentando enviar notificación por email...');
        
        // Verificar que existe tutorId en el perfil del niño
        if (!perfilNino.tutorId) {
          console.warn('⚠️ No se encontró tutorId en el perfil del niño');
          toast.warning('Configuración guardada, pero no se pudo enviar email (tutor no asignado)');
          return;
        }
        
        const tutorDoc = await getDoc(doc(db, "tutors", perfilNino.tutorId));
        if (tutorDoc.exists()) {
          const tutorData = tutorDoc.data();
          
          // Verificar que el tutor tiene email
          if (!tutorData.email) {
            console.warn('⚠️ El tutor no tiene email configurado');
            toast.warning('Configuración guardada, pero no se pudo enviar email (tutor sin email)');
            return;
          }
          
          console.log('📧 Enviando notificación a:', tutorData.email);
          const resultado = await enviarNotificacionConfiguracion(
            nuevaConfig, 
            perfilNino, 
            tutorData
          );
          
          if (resultado.success) {
            console.log('✅ Notificación enviada:', resultado.message);
            toast.success('Configuración actualizada y notificación enviada por email 📧');
          } else {
            console.warn('⚠️ No se pudo enviar la notificación:', resultado.error);
            toast.warning('Configuración guardada, pero hubo un problema enviando el email');
          }
        } else {
          console.warn('⚠️ No se encontró el documento del tutor');
          toast.warning('Configuración guardada, pero no se encontró información del tutor');
        }
      } else {
        toast.success('Configuración actualizada correctamente');
      }
    } catch (error) {
      console.error('Error actualizando configuración:', error);
      toast.error('Error al actualizar la configuración');
    } finally {
      setGuardando(false);
    }
  };

  const guardarRutina = async (datosRutina) => {
    try {
      const nuevasRutinas = editingRutina 
        ? rutinasPersonalizadas.map(r => r.id === editingRutina.id ? { ...datosRutina, id: editingRutina.id } : r)
        : [...rutinasPersonalizadas, { ...datosRutina, id: Date.now(), activa: true }];
      
      setRutinasPersonalizadas(nuevasRutinas);
      
      // Guardar en Firebase
      const perfilRef = doc(db, "childProfiles", profileId);
      await updateDoc(perfilRef, {
        rutinasPersonalizadas: nuevasRutinas
      });
      
      setShowNuevaRutinaModal(false);
      setEditingRutina(null);
      toast.success(editingRutina ? 'Rutina actualizada exitosamente' : 'Nueva rutina creada exitosamente');
    } catch (error) {
      console.error('Error guardando rutina:', error);
      toast.error('Error al guardar la rutina');
    }
  };

  const toggleRutina = async (rutinaId) => {
    try {
      const nuevasRutinas = rutinasPersonalizadas.map(r => 
        r.id === rutinaId ? { ...r, activa: !r.activa } : r
      );
      
      setRutinasPersonalizadas(nuevasRutinas);
      
      const perfilRef = doc(db, "childProfiles", profileId);
      await updateDoc(perfilRef, {
        rutinasPersonalizadas: nuevasRutinas
      });
      
      toast.success('Rutina actualizada');
    } catch (error) {
      console.error('Error actualizando rutina:', error);
      toast.error('Error al actualizar la rutina');
    }
  };

  const eliminarRutina = async (rutinaId) => {
    try {
      const nuevasRutinas = rutinasPersonalizadas.filter(r => r.id !== rutinaId);
      setRutinasPersonalizadas(nuevasRutinas);
      
      const perfilRef = doc(db, "childProfiles", profileId);
      await updateDoc(perfilRef, {
        rutinasPersonalizadas: nuevasRutinas
      });
      
      toast.success('Rutina eliminada exitosamente');
    } catch (error) {
      console.error('Error eliminando rutina:', error);
      toast.error('Error al eliminar la rutina');
    }
  };

  // Función para generar reportes en PDF
  const generarReporte = async (tipoReporte) => {
    try {
      setLoading(true);
      console.log(`📄 Generando reporte ${tipoReporte}...`);
      
      // Mostrar toast de inicio
      toast.info(`Generando reporte ${tipoReporte}... ⏳`);
      
      // Preparar datos para el reporte usando el servicio
      const datosReporte = {
        tipoReporte,
        profileId,
        perfilNino,
        estadisticas,
        configuracion,
        actividadesRecientes,
        fechaGeneracion: new Date().toISOString(),
        metadata: {
          nombreTutor: 'Tutor', // Obtener del usuario autenticado
          tiempoGeneracion: new Date().toLocaleString('es-ES'),
          version: '1.0.0'
        }
      };

      // Agregar datos específicos según el tipo
      switch (tipoReporte) {
        case 'semanal':
          datosReporte.periodo = {
            inicio: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            fin: new Date(),
            descripcion: 'Últimos 7 días'
          };
          break;
          
        case 'mensual':
          datosReporte.periodo = {
            inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            fin: new Date(),
            descripcion: 'Mes actual'
          };
          break;
          
        case 'completo':
          datosReporte.incluirTodo = true;
          datosReporte.periodo = {
            inicio: new Date(2024, 0, 1), // Desde enero 2024
            fin: new Date(),
            descripcion: 'Histórico completo'
          };
          break;
          
        default:
          datosReporte.periodo = {
            inicio: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            fin: new Date(),
            descripcion: 'Período estándar'
          };
          break;
      }

      console.log('📊 Datos del reporte preparados:', datosReporte);
      
      // Generar PDF usando el servicio
      const pdfBlob = await reportService.generarPDF(datosReporte);
      
      // Crear nombre del archivo
      const nombreArchivo = `reporte-${tipoReporte}-${perfilNino?.fullName?.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Descargar el archivo
      reportService.descargarPDF(pdfBlob, nombreArchivo);
      
      toast.success(`✅ Reporte ${tipoReporte} descargado exitosamente`);
      
    } catch (error) {
      console.error('❌ Error generando reporte:', error);
      toast.error(`Error al generar el reporte ${tipoReporte}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const secciones = [
    { id: 'progreso', nombre: 'Progreso', icono: <FaChartLine className="text-lg" />, color: 'bg-blue-500' },
    { id: 'horarios', nombre: 'Horarios', icono: <FaClock className="text-lg" />, color: 'bg-green-500' },
    { id: 'metas', nombre: 'Metas', icono: <FaBullseye className="text-lg" />, color: 'bg-purple-500' },
    { id: 'reportes', nombre: 'Reportes', icono: <FaFileAlt className="text-lg" />, color: 'bg-orange-500' }
  ];

  if (loading) {
    return (
      <div className="min-h-[400px] bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-blue)] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando panel de tutor...</p>
          <p className="mt-2 text-sm text-gray-400">Esto puede tomar unos segundos</p>
        </div>
      </div>
    );
  }

  if (!profileId) {
    return (
      <div className="min-h-[400px] bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">ID de perfil no encontrado</h2>
          <p className="text-gray-600 mb-4">No se pudo identificar el perfil del niño.</p>
          <button 
            onClick={() => window.history.back()}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
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
                <h1 className="text-xl font-bold text-gray-900">Supervisando a {perfilNino?.fullName}</h1>
                <p className="text-gray-600 text-sm">Panel de control y seguimiento</p>
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

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Sección: Progreso */}
        {seccionActiva === 'progreso' && (
          <div className="space-y-6">
            {/* Tarjetas de estadísticas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <FaTrophy className="text-2xl text-yellow-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Actividades Completadas</p>
                    <p className="text-2xl font-bold text-gray-900">{estadisticas?.actividadesCompletadas || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <FaStar className="text-2xl text-purple-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Promedio Semanal</p>
                    <p className="text-2xl font-bold text-gray-900">{estadisticas?.promedioSemanal || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <FaClock className="text-2xl text-blue-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tiempo de Estudio</p>
                    <p className="text-2xl font-bold text-gray-900">{estadisticas?.tiempoEstudioSemanal || "0h"}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <FaBullseye className="text-2xl text-green-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cumplimiento de Metas</p>
                    <p className="text-2xl font-bold text-gray-900">{estadisticas?.metaCumplimiento || 0}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actividades recientes */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividades Recientes</h3>
              <div className="space-y-3">
                {actividadesRecientes.length > 0 ? (
                  actividadesRecientes.slice(0, 5).map((actividad, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FaGamepad className="text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{actividad.activityType || 'Actividad'}</p>
                          <p className="text-xs text-gray-500">
                            {actividad.timestamp ? new Date(actividad.timestamp.toDate()).toLocaleDateString() : 'Fecha no disponible'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">+{actividad.score || 0} pts</p>
                        <p className="text-xs text-gray-500">{actividad.duration || '00:00'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No hay actividades recientes</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sección: Horarios */}
        {seccionActiva === 'horarios' && (
          <div className="space-y-6">
            {/* Header de la sección */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Gestión de Horarios</h3>
                  <p className="text-sm text-gray-600 mt-1">Configura los horarios de estudio y actividades para {perfilNino?.fullName}</p>
                </div>
                <FaClock className="text-3xl text-green-500" />
              </div>

              {/* Configuración de horario de estudio principal */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <FaBell className="mr-2 text-blue-500" />
                    Horario de Estudio Principal
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora de inicio
                      </label>
                      <input
                        type="time"
                        value={configuracion.recordatorios.horaEstudio}
                        onChange={(e) => setConfiguracion({
                          ...configuracion,
                          recordatorios: {
                            ...configuracion.recordatorios,
                            horaEstudio: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duración estimada
                      </label>
                      <select 
                        value={configuracion.metas.tiempoEstudioDiario}
                        onChange={(e) => setConfiguracion({
                          ...configuracion,
                          metas: {
                            ...configuracion.metas,
                            tiempoEstudioDiario: parseInt(e.target.value)
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={15}>15 minutos</option>
                        <option value={30}>30 minutos</option>
                        <option value={45}>45 minutos</option>
                        <option value={60}>1 hora</option>
                        <option value={90}>1 hora 30 min</option>
                        <option value={120}>2 horas</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Días de la semana
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'lunes', nombre: 'Lunes' },
                          { id: 'martes', nombre: 'Martes' },
                          { id: 'miercoles', nombre: 'Miércoles' },
                          { id: 'jueves', nombre: 'Jueves' },
                          { id: 'viernes', nombre: 'Viernes' },
                          { id: 'sabado', nombre: 'Sábado' },
                          { id: 'domingo', nombre: 'Domingo' }
                        ].map((dia) => (
                          <label key={dia.id} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={configuracion.recordatorios.diasSemana.includes(dia.id)}
                              onChange={(e) => {
                                const diasActuales = configuracion.recordatorios.diasSemana;
                                const nuevosDias = e.target.checked
                                  ? [...diasActuales, dia.id]
                                  : diasActuales.filter(d => d !== dia.id);
                                
                                setConfiguracion({
                                  ...configuracion,
                                  recordatorios: {
                                    ...configuracion.recordatorios,
                                    diasSemana: nuevosDias
                                  }
                                });
                              }}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{dia.nombre}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vista del calendario semanal */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <FaCalendarAlt className="mr-2 text-purple-500" />
                    Vista Semanal
                  </h4>
                  
                  {/* Información del día actual */}
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-800">Hoy es {obtenerInfoDiaActual().fecha}</p>
                        <p className="text-xs text-blue-600">Son las {obtenerInfoDiaActual().hora}</p>
                      </div>
                      <div className="text-blue-600">
                        <FaClock className="text-lg" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: 'lunes', nombre: 'Lun', completo: 'Lunes' },
                        { id: 'martes', nombre: 'Mar', completo: 'Martes' },
                        { id: 'miercoles', nombre: 'Mié', completo: 'Miércoles' },
                        { id: 'jueves', nombre: 'Jue', completo: 'Jueves' },
                        { id: 'viernes', nombre: 'Vie', completo: 'Viernes' },
                        { id: 'sabado', nombre: 'Sáb', completo: 'Sábado' },
                        { id: 'domingo', nombre: 'Dom', completo: 'Domingo' }
                      ].map((dia) => {
                        const esActivo = configuracion.recordatorios.diasSemana.includes(dia.id);
                        const esHoy = dia.id === obtenerInfoDiaActual().diaActual;
                        const yaCompleto = esHoy && esActivo && yaCompletoHoy(configuracion.recordatorios.horaEstudio);
                        
                        return (
                          <div key={dia.id} className={`p-3 rounded-lg border-2 transition-all relative ${
                            esHoy 
                              ? 'border-blue-500 bg-blue-100 shadow-md' 
                              : esActivo 
                                ? 'border-green-300 bg-green-50' 
                                : 'border-gray-200 bg-white'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className={`font-medium ${
                                  esHoy ? 'text-blue-700' : 'text-gray-900'
                                }`}>
                                  {dia.completo}
                                </span>
                                {esHoy && (
                                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                                    HOY
                                  </span>
                                )}
                              </div>
                              
                              {esActivo && (
                                <div className="text-right">
                                  <div className={`text-sm font-medium ${
                                    esHoy ? 'text-blue-700' : 'text-green-700'
                                  }`}>
                                    {configuracion.recordatorios.horaEstudio}
                                  </div>
                                  <div className={`text-xs ${
                                    esHoy ? 'text-blue-600' : 'text-green-600'
                                  }`}>
                                    {configuracion.metas.tiempoEstudioDiario} min
                                  </div>
                                  {esHoy && (
                                    <div className={`text-xs mt-1 font-medium ${
                                      yaCompleto ? 'text-green-600' : 'text-orange-600'
                                    }`}>
                                      {yaCompleto ? '✓ Completado' : '⏰ Pendiente'}
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {!esActivo && (
                                <span className="text-xs text-gray-400">Descanso</span>
                              )}
                            </div>
                            
                            {/* Indicador de progreso para el día actual */}
                            {esHoy && esActivo && (
                              <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-1">
                                  <div 
                                    className={`h-1 rounded-full transition-all ${
                                      yaCompleto ? 'bg-green-500' : 'bg-orange-500'
                                    }`}
                                    style={{ width: yaCompleto ? '100%' : '0%' }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Configuración de notificaciones */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                  <FaEnvelope className="mr-2 text-red-500" />
                  Configuración de Recordatorios
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={configuracion.recordatorios.notificacionesEmail}
                      onChange={(e) => setConfiguracion({
                        ...configuracion,
                        recordatorios: {
                          ...configuracion.recordatorios,
                          notificacionesEmail: e.target.checked
                        }
                      })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-medium text-gray-700">Notificaciones por Email</span>
                      <p className="text-sm text-gray-500">Recibe recordatorios en tu correo electrónico</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={configuracion.recordatorios.recordatoriosMovil}
                      onChange={(e) => setConfiguracion({
                        ...configuracion,
                        recordatorios: {
                          ...configuracion.recordatorios,
                          recordatoriosMovil: e.target.checked
                        }
                      })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-medium text-gray-700">Recordatorios Móviles</span>
                      <p className="text-sm text-gray-500">Notificaciones push en el dispositivo</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Botón para guardar */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => actualizarConfiguracion(configuracion)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
                >
                  <FaSave />
                  <span>Guardar Configuración</span>
                </button>
              </div>
            </div>

            {/* Rutinas personalizadas */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Rutinas Personalizadas</h4>
                <button 
                  onClick={() => {
                    setEditingRutina(null);
                    setShowNuevaRutinaModal(true);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
                >
                  <FaPlus />
                  <span>Nueva Rutina</span>
                </button>
              </div>

              <div className="space-y-3">
                {/* Rutinas predefinidas */}
                <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-gray-900">Rutina Matutina</h5>
                      <p className="text-sm text-gray-600">Actividades de concentración después del desayuno</p>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">8:00 AM</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">30 min</span>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Lun-Vie</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <FaEdit />
                      </button>
                      <label className="flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-gray-900">Sesión de Tarde</h5>
                      <p className="text-sm text-gray-600">Refuerzo académico y actividades lúdicas</p>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{configuracion.recordatorios.horaEstudio}</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">{configuracion.metas.tiempoEstudioDiario} min</span>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          {configuracion.recordatorios.diasSemana.length} días/semana
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <FaEdit />
                      </button>
                      <label className="flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors opacity-60">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-gray-900">Rutina de Fin de Semana</h5>
                      <p className="text-sm text-gray-600">Actividades más relajadas y creativas</p>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">10:00 AM</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">45 min</span>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Sáb-Dom</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <FaEdit />
                      </button>
                      <label className="flex items-center cursor-pointer">
                        <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Rutinas personalizadas */}
                {rutinasPersonalizadas.map((rutina) => {
                  const esActivaHoy = rutinActivaHoy(rutina.diasSemana || []);
                  const rutinaCompletaHoy = esActivaHoy && yaCompletoHoy(rutina.hora);
                  
                  return (
                    <div key={rutina.id} className={`p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors relative ${
                      !rutina.activa ? 'opacity-60' : ''
                    } ${esActivaHoy ? 'ring-2 ring-blue-200' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h5 className="font-medium text-gray-900">{rutina.nombre}</h5>
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">Personalizada</span>
                            {esActivaHoy && (
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                rutinaCompletaHoy 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-orange-100 text-orange-700'
                              }`}>
                                {rutinaCompletaHoy ? '✓ Hoy completado' : '⏰ Programado hoy'}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{rutina.descripcion}</p>
                          <div className="flex items-center mt-2 space-x-4">
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{rutina.hora}</span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">{rutina.duracion} min</span>
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                              {rutina.diasSemana?.length || 0} días/semana
                            </span>
                          </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => {
                            setEditingRutina(rutina);
                            setShowNuevaRutinaModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          onClick={() => eliminarRutina(rutina.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          ×
                        </button>
                        <label className="flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={rutina.activa}
                            onChange={() => toggleRutina(rutina.id)}
                            className="rounded text-blue-600 focus:ring-blue-500" 
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  );
                })}

                {rutinasPersonalizadas.length === 0 && (
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <p className="text-gray-500 text-sm">
                      No hay rutinas personalizadas. ¡Crea la primera haciendo clic en "Nueva Rutina"!
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 <strong>Consejo:</strong> Mantén rutinas consistentes para ayudar a {perfilNino?.fullName} a desarrollar hábitos de estudio saludables.
                </p>
              </div>
            </div>

            {/* Resumen de la configuración actual */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                <FaBullseye className="mr-2 text-green-600" />
                Resumen de Configuración Actual
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {configuracion.recordatorios.diasSemana.length}
                  </div>
                  <div className="text-sm text-gray-600">Días activos por semana</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(configuracion.metas.tiempoEstudioDiario * configuracion.recordatorios.diasSemana.length / 60 * 10) / 10}h
                  </div>
                  <div className="text-sm text-gray-600">Horas totales semanales</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {configuracion.recordatorios.horaEstudio}
                  </div>
                  <div className="text-sm text-gray-600">Hora principal de estudio</div>
                </div>
              </div>

              {/* Estado de notificaciones */}
              <div className="border-t border-green-200 pt-4">
                <h5 className="font-medium text-gray-900 mb-2">Estado de Notificaciones</h5>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    configuracion.recordatorios.notificacionesEmail 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    📧 {configuracion.recordatorios.notificacionesEmail ? 'Email Activo' : 'Email Desactivado'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    configuracion.recordatorios.recordatoriosMovil 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    📱 {configuracion.recordatorios.recordatoriosMovil ? 'Móvil Activo' : 'Móvil Desactivado'}
                  </span>
                </div>
                
                {/* Última actualización */}
                <div className="mt-2 text-xs text-gray-500">
                  Última actualización: {tiempoActual.toLocaleString('es-ES', {
                    day: '2-digit',
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {seccionActiva === 'metas' && (
          <div className="space-y-6">
            {/* Header con estadísticas de metas */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-2">🎯 Gestión de Metas</h3>
              <p className="text-purple-100">Establece objetivos de aprendizaje para {perfilNino?.nombre || 'tu niño'}</p>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{configuracion.metas.actividadesPorDia}</div>
                  <div className="text-xs text-purple-200">Actividades/día</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{configuracion.metas.tiempoEstudioDiario}m</div>
                  <div className="text-xs text-purple-200">Tiempo/día</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{configuracion.metas.puntosSemanales}</div>
                  <div className="text-xs text-purple-200">Puntos/semana</div>
                </div>
              </div>
            </div>

            {/* Configuración de metas principales */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-800">Metas Principales</h4>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaBullseye className="text-purple-500" />
                  <span>Objetivos diarios y semanales</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Meta: Actividades por día */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FaGamepad className="text-blue-500" />
                    Actividades por día
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={configuracion.metas.actividadesPorDia}
                      onChange={(e) => setConfiguracion({
                        ...configuracion,
                        metas: {
                          ...configuracion.metas,
                          actividadesPorDia: parseInt(e.target.value) || 1
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Número de actividades que debe completar diariamente
                    </div>
                  </div>
                </div>

                {/* Meta: Tiempo de estudio diario */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FaClock className="text-green-500" />
                    Tiempo de estudio (minutos)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="10"
                      max="180"
                      step="5"
                      value={configuracion.metas.tiempoEstudioDiario}
                      onChange={(e) => setConfiguracion({
                        ...configuracion,
                        metas: {
                          ...configuracion.metas,
                          tiempoEstudioDiario: parseInt(e.target.value) || 30
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Tiempo dedicado al aprendizaje cada día
                    </div>
                  </div>
                </div>

                {/* Meta: Puntos semanales */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FaTrophy className="text-yellow-500" />
                    Puntos semanales
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="100"
                      max="2000"
                      step="50"
                      value={configuracion.metas.puntosSemanales}
                      onChange={(e) => setConfiguracion({
                        ...configuracion,
                        metas: {
                          ...configuracion.metas,
                          puntosSemanales: parseInt(e.target.value) || 500
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Puntos objetivo para alcanzar cada semana
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progreso actual de metas */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">📊 Progreso de Metas</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Progreso de actividades */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-800">Actividades Hoy</span>
                    <FaGamepad className="text-blue-600" />
                  </div>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-2xl font-bold text-blue-900">
                      {estadisticas?.actividadesCompletadasHoy || 0}
                    </span>
                    <span className="text-sm text-blue-700">
                      / {configuracion.metas.actividadesPorDia}
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(100, ((estadisticas?.actividadesCompletadasHoy || 0) / configuracion.metas.actividadesPorDia) * 100)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-blue-700 mt-1">
                    {((estadisticas?.actividadesCompletadasHoy || 0) / configuracion.metas.actividadesPorDia * 100).toFixed(0)}% completado
                  </div>
                </div>

                {/* Progreso de tiempo */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-800">Tiempo Hoy</span>
                    <FaClock className="text-green-600" />
                  </div>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-2xl font-bold text-green-900">
                      {estadisticas?.tiempoEstudioHoy || 0}m
                    </span>
                    <span className="text-sm text-green-700">
                      / {configuracion.metas.tiempoEstudioDiario}m
                    </span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(100, ((estadisticas?.tiempoEstudioHoy || 0) / configuracion.metas.tiempoEstudioDiario) * 100)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-green-700 mt-1">
                    {((estadisticas?.tiempoEstudioHoy || 0) / configuracion.metas.tiempoEstudioDiario * 100).toFixed(0)}% completado
                  </div>
                </div>

                {/* Progreso de puntos */}
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-yellow-800">Puntos Semana</span>
                    <FaTrophy className="text-yellow-600" />
                  </div>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-2xl font-bold text-yellow-900">
                      {estadisticas?.puntosSemana || 0}
                    </span>
                    <span className="text-sm text-yellow-700">
                      / {configuracion.metas.puntosSemanales}
                    </span>
                  </div>
                  <div className="w-full bg-yellow-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(100, ((estadisticas?.puntosSemana || 0) / configuracion.metas.puntosSemanales) * 100)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-yellow-700 mt-1">
                    {((estadisticas?.puntosSemana || 0) / configuracion.metas.puntosSemanales * 100).toFixed(0)}% completado
                  </div>
                </div>
              </div>
            </div>

            {/* Configuración de notificaciones para metas */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">🔔 Notificaciones de Metas</h4>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <FaEnvelope className="text-purple-500" />
                    <div>
                      <div className="font-medium text-gray-800">Recordatorios de progreso</div>
                      <div className="text-sm text-gray-600">Notificar cuando se alcancen las metas diarias</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={configuracion.notificaciones?.recordatoriosProgreso || false}
                    onChange={(e) => setConfiguracion({
                      ...configuracion,
                      notificaciones: {
                        ...configuracion.notificaciones,
                        recordatoriosProgreso: e.target.checked
                      }
                    })}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <FaBell className="text-orange-500" />
                    <div>
                      <div className="font-medium text-gray-800">Alertas de objetivos pendientes</div>
                      <div className="text-sm text-gray-600">Recordar si no se han cumplido las metas del día</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={configuracion.notificaciones?.alertasObjetivos || false}
                    onChange={(e) => setConfiguracion({
                      ...configuracion,
                      notificaciones: {
                        ...configuracion.notificaciones,
                        alertasObjetivos: e.target.checked
                      }
                    })}
                    className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                  />
                </label>
              </div>
            </div>

            {/* Botón para guardar configuración */}
            <div className="flex justify-end">
              <button
                onClick={() => actualizarConfiguracion(configuracion)}
                disabled={guardando}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {guardando ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Guardar Configuración de Metas
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {seccionActiva === 'reportes' && (
          <div className="space-y-6">
            {/* Header de reportes */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-2">📄 Reportes de Progreso</h3>
              <p className="text-orange-100">Genera y descarga reportes detallados del progreso de {perfilNino?.fullName}</p>
            </div>

            {/* Tipos de reportes disponibles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Reporte Semanal */}
              <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FaCalendarAlt className="text-xl text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Reporte Semanal</h4>
                      <p className="text-sm text-gray-600">Actividades de los últimos 7 días</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Actividades:</span>
                    <span className="font-medium">{actividadesRecientes.length} completadas</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tiempo total:</span>
                    <span className="font-medium">{Math.round(actividadesRecientes.length * 10)} minutos</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Puntos obtenidos:</span>
                    <span className="font-medium">{estadisticas?.puntosSemana || 0} pts</span>
                  </div>
                </div>

                <button 
                  onClick={() => generarReporte('semanal')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FaFileAlt />
                  Descargar PDF
                </button>
              </div>

              {/* Reporte Mensual */}
              <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <FaChartLine className="text-xl text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Reporte Mensual</h4>
                      <p className="text-sm text-gray-600">Progreso de todo el mes</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Días activos:</span>
                    <span className="font-medium">12 de 30 días</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Promedio diario:</span>
                    <span className="font-medium">2.3 actividades</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Logros nuevos:</span>
                    <span className="font-medium">{estadisticas?.logros || 0} logros</span>
                  </div>
                </div>

                <button 
                  onClick={() => generarReporte('mensual')}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FaFileAlt />
                  Descargar PDF
                </button>
              </div>

              {/* Reporte Completo */}
              <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <FaTrophy className="text-xl text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Reporte Completo</h4>
                      <p className="text-sm text-gray-600">Todos los datos históricos</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total actividades:</span>
                    <span className="font-medium">{estadisticas?.actividadesCompletadas || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total puntos:</span>
                    <span className="font-medium">{estadisticas?.puntosTotales || 0} pts</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Racha máxima:</span>
                    <span className="font-medium">{estadisticas?.racha || 0} días</span>
                  </div>
                </div>

                <button 
                  onClick={() => generarReporte('completo')}
                  className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FaFileAlt />
                  Descargar PDF
                </button>
              </div>
            </div>

            {/* Panel de estadísticas rápidas */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">📊 Vista Previa de Datos</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{actividadesRecientes.length}</div>
                  <div className="text-sm text-blue-700">Actividades esta semana</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{Math.round(actividadesRecientes.length * 10)}</div>
                  <div className="text-sm text-green-700">Minutos de estudio</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{estadisticas?.puntosSemana || 0}</div>
                  <div className="text-sm text-purple-700">Puntos ganados</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{estadisticas?.racha || 0}</div>
                  <div className="text-sm text-yellow-700">Días de racha</div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium text-gray-800 mb-3">📈 Tendencias Recientes</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Progreso semanal</span>
                      <span className="text-sm font-medium text-green-600">+15%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Cumplimiento de metas</span>
                      <span className="text-sm font-medium text-blue-600">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Historial de reportes generados */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">📁 Historial de Reportes</h4>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Fecha</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Tipo</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Período</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-2 text-gray-900">10/08/2025</td>
                      <td className="px-4 py-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Semanal</span>
                      </td>
                      <td className="px-4 py-2 text-gray-600">03/08 - 10/08</td>
                      <td className="px-4 py-2">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Disponible</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-gray-900">03/08/2025</td>
                      <td className="px-4 py-2">
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Completo</span>
                      </td>
                      <td className="px-4 py-2 text-gray-600">Julio 2025</td>
                      <td className="px-4 py-2">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Disponible</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Los reportes se mantienen disponibles por 90 días. 
                  <button className="text-blue-600 hover:text-blue-800 underline ml-1">
                    Ver política de retención
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal para Nueva/Editar Rutina */}
      {showNuevaRutinaModal && (
        <ModalNuevaRutina
          isOpen={showNuevaRutinaModal}
          onClose={() => {
            setShowNuevaRutinaModal(false);
            setEditingRutina(null);
          }}
          onSave={guardarRutina}
          rutina={editingRutina}
        />
      )}
    </div>
  );
}

// Componente Modal para Nueva Rutina
function ModalNuevaRutina({ isOpen, onClose, onSave, rutina }) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    hora: '16:00',
    duracion: 30,
    diasSemana: [],
    activa: true
  });

  useEffect(() => {
    if (rutina) {
      setFormData(rutina);
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        hora: '16:00',
        duracion: 30,
        diasSemana: [],
        activa: true
      });
    }
  }, [rutina]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      toast.error('El nombre de la rutina es obligatorio');
      return;
    }
    if (formData.diasSemana.length === 0) {
      toast.error('Selecciona al menos un día de la semana');
      return;
    }
    onSave(formData);
  };

  const toggleDia = (dia) => {
    setFormData(prev => ({
      ...prev,
      diasSemana: prev.diasSemana.includes(dia)
        ? prev.diasSemana.filter(d => d !== dia)
        : [...prev.diasSemana, dia]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="sticky top-0 bg-white border-b p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {rutina ? 'Editar Rutina' : 'Nueva Rutina Personalizada'}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-6 space-y-6">
            {/* Información básica */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Información Básica</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Rutina *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej: Rutina Vespertina, Estudio de Matemáticas..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Describe qué actividades incluye esta rutina..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Configuración de horario */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Configuración de Horario</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora de inicio *
                  </label>
                  <input
                    type="time"
                    value={formData.hora}
                    onChange={(e) => setFormData(prev => ({ ...prev, hora: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duración (minutos) *
                  </label>
                  <select
                    value={formData.duracion}
                    onChange={(e) => setFormData(prev => ({ ...prev, duracion: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>1 hora</option>
                    <option value={90}>1 hora 30 min</option>
                    <option value={120}>2 horas</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Días de la semana *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { id: 'lunes', nombre: 'Lunes' },
                    { id: 'martes', nombre: 'Martes' },
                    { id: 'miercoles', nombre: 'Miércoles' },
                    { id: 'jueves', nombre: 'Jueves' },
                    { id: 'viernes', nombre: 'Viernes' },
                    { id: 'sabado', nombre: 'Sábado' },
                    { id: 'domingo', nombre: 'Domingo' }
                  ].map((dia) => {
                    const esHoy = dia.id === obtenerInfoDiaActual().diaActual;
                    const estaSeleccionado = formData.diasSemana.includes(dia.id);
                    
                    return (
                      <label 
                        key={dia.id} 
                        className={`relative flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          estaSeleccionado
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${esHoy ? 'ring-2 ring-orange-300' : ''}`}
                      >
                        {esHoy && (
                          <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-1 py-0.5 rounded-full font-bold">
                            HOY
                          </div>
                        )}
                        <input
                          type="checkbox"
                          checked={estaSeleccionado}
                          onChange={() => toggleDia(dia.id)}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium">{dia.nombre}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Vista previa */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Vista Previa</h4>
              <div className="p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900">{formData.nombre || 'Nueva Rutina'}</h5>
                    <p className="text-sm text-gray-600">{formData.descripcion || 'Sin descripción'}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{formData.hora}</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">{formData.duracion} min</span>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        {formData.diasSemana.length} días/semana
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">Personalizada</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
            >
              <FaSave />
              <span>{rutina ? 'Actualizar' : 'Crear'} Rutina</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TutorPanel;
