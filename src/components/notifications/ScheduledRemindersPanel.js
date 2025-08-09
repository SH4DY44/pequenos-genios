// src/components/notifications/ScheduledRemindersPanel.js
import React, { useState, useEffect } from 'react';
import { FaClock, FaCheck, FaPlay, FaPause, FaInfoCircle } from 'react-icons/fa';
import { ReminderProcessor } from '../../utils/reminderProcessor';
import { toast } from 'react-toastify';

function ScheduledRemindersPanel() {
  const [estadisticas, setEstadisticas] = useState({
    programados: 0,
    enviados: 0,
    fallidos: 0,
    total: 0,
    procesador: { ejecutandose: false }
  });
  const [loading, setLoading] = useState(true);

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    cargarEstadisticas();
    
    // Actualizar estadísticas cada 30 segundos
    const interval = setInterval(cargarEstadisticas, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const stats = await ReminderProcessor.obtenerEstadisticas();
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const iniciarProcesador = async () => {
    try {
      ReminderProcessor.iniciar();
      toast.success('✅ Procesador de recordatorios iniciado');
      await cargarEstadisticas();
    } catch (error) {
      console.error('Error iniciando procesador:', error);
      toast.error('❌ Error iniciando procesador');
    }
  };

  const detenerProcesador = async () => {
    try {
      ReminderProcessor.detener();
      toast.info('⏹️ Procesador de recordatorios detenido');
      await cargarEstadisticas();
    } catch (error) {
      console.error('Error deteniendo procesador:', error);
      toast.error('❌ Error deteniendo procesador');
    }
  };

  const ejecutarManual = async () => {
    try {
      setLoading(true);
      await ReminderProcessor.ejecutarManual();
      toast.success('✅ Procesamiento manual completado');
      await cargarEstadisticas();
    } catch (error) {
      console.error('Error en procesamiento manual:', error);
      toast.error('❌ Error en procesamiento manual');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaClock className="text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-800">
              Recordatorios Programados
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              estadisticas.procesador.ejecutandose 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                estadisticas.procesador.ejecutandose ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              {estadisticas.procesador.ejecutandose ? 'Activo' : 'Inactivo'}
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {estadisticas.programados}
            </div>
            <div className="text-sm text-blue-800">Programados</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {estadisticas.enviados}
            </div>
            <div className="text-sm text-green-800">Enviados</div>
          </div>
          
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {estadisticas.fallidos}
            </div>
            <div className="text-sm text-red-800">Fallidos</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">
              {estadisticas.total}
            </div>
            <div className="text-sm text-gray-800">Total</div>
          </div>
        </div>

        {/* Controles */}
        <div className="flex flex-wrap gap-2 justify-center">
          {!estadisticas.procesador.ejecutandose ? (
            <button
              onClick={iniciarProcesador}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <FaPlay className="text-sm" />
              Iniciar Procesador
            </button>
          ) : (
            <button
              onClick={detenerProcesador}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <FaPause className="text-sm" />
              Detener Procesador
            </button>
          )}
          
          <button
            onClick={ejecutarManual}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <FaCheck className="text-sm" />
            Ejecutar Ahora
          </button>
          
          <button
            onClick={cargarEstadisticas}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            <FaInfoCircle className="text-sm" />
            Actualizar
          </button>
        </div>

        {/* Información */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">📋 Cómo funciona:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Citas médicas:</strong> Se envía recordatorio 1 día antes a las 7:00 PM</li>
            <li>• <strong>Tareas escolares:</strong> Se envía recordatorio 1 día antes a las 6:00 PM</li>
            <li>• <strong>Medicamentos:</strong> Se envía recordatorio diario a las 8:00 AM</li>
            <li>• <strong>Procesamiento:</strong> Cada 5 minutos se verifican recordatorios pendientes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ScheduledRemindersPanel;
