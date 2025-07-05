import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import emailService from '../../services/emailService';

const EmailServiceAdmin = () => {
  const [estado, setEstado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [plantillas, setPlantillas] = useState([]);
  const [correoTest, setCorreoTest] = useState('');
  const [enviandoTest, setEnviandoTest] = useState(false);

  useEffect(() => {
    cargarEstadoServicio();
    cargarPlantillas();
  }, []);

  const cargarEstadoServicio = async () => {
    setCargando(true);
    try {
      const estadoServicio = await emailService.verificarEstado();
      setEstado(estadoServicio);
    } catch (error) {
      console.error('Error cargando estado del servicio:', error);
      setEstado({ estado: 'ERROR', error: error.message });
    } finally {
      setCargando(false);
    }
  };

  const cargarPlantillas = async () => {
    try {
      const plantillasData = await emailService.obtenerPlantillas();
      setPlantillas(plantillasData.plantillas || []);
    } catch (error) {
      console.error('Error cargando plantillas:', error);
      setPlantillas([]);
    }
  };

  const enviarCorreoPrueba = async () => {
    if (!correoTest) {
      toast.error('Ingresa un correo electrónico');
      return;
    }

    setEnviandoTest(true);
    try {
      await emailService.enviarCorreoPrueba(correoTest);
      toast.success('Correo de prueba enviado exitosamente');
      setCorreoTest('');
    } catch (error) {
      console.error('Error enviando correo de prueba:', error);
      toast.error('Error enviando correo de prueba: ' + error.message);
    } finally {
      setEnviandoTest(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'ACTIVO':
        return 'text-green-600 bg-green-100';
      case 'INACTIVO':
        return 'text-yellow-600 bg-yellow-100';
      case 'ERROR':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              📧 Administrador de Correos
            </h1>
            <p className="text-gray-600">
              Gestiona el servicio de correos electrónicos de Pequeños Genios
            </p>
          </div>
          <button
            onClick={cargarEstadoServicio}
            disabled={cargando}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* Estado del Servicio */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Estado del Servicio</h2>
        
        {estado ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(estado.estado)}`}>
                  {estado.estado}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Servicio:</span>
                <span className="font-medium">{estado.servicio || 'Email Service'}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Última actualización:</span>
                <span className="font-medium text-sm">
                  {estado.timestamp ? new Date(estado.timestamp).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>

            {estado.configuracion && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700">Configuración</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Usuario:</span>
                    <span className="font-mono">{estado.configuracion.usuario}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Servidor:</span>
                    <span>{estado.configuracion.servidor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Puerto:</span>
                    <span>{estado.configuracion.puerto}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seguridad:</span>
                    <span>{estado.configuracion.seguridad}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No se pudo cargar el estado del servicio
          </div>
        )}

        {estado?.error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md">
            <p className="text-red-700 text-sm">
              <strong>Error:</strong> {estado.error}
            </p>
          </div>
        )}
      </div>

      {/* Prueba de Correo */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Prueba de Correo</h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico de prueba
            </label>
            <input
              type="email"
              value={correoTest}
              onChange={(e) => setCorreoTest(e.target.value)}
              placeholder="ejemplo@gmail.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={enviarCorreoPrueba}
              disabled={enviandoTest || !correoTest}
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enviandoTest ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </span>
              ) : (
                '📧 Enviar Prueba'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Plantillas Disponibles */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Plantillas Disponibles</h2>
        
        {plantillas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plantillas.map((plantilla) => (
              <div key={plantilla.tipo} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">
                  {plantilla.nombre}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {plantilla.descripcion}
                </p>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500">Campos:</p>
                  <div className="flex flex-wrap gap-1">
                    {plantilla.campos.map((campo) => (
                      <span
                        key={campo}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                      >
                        {campo}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No se pudieron cargar las plantillas
          </div>
        )}
      </div>

      {/* Instrucciones */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">
          📋 Instrucciones de Configuración
        </h2>
        
        <div className="space-y-3 text-sm text-blue-700">
          <div>
            <strong>1. Configurar Gmail:</strong>
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>Habilitar verificación en 2 pasos</li>
              <li>Generar contraseña de aplicación</li>
              <li>Configurar en archivo .env del servicio</li>
            </ul>
          </div>
          
          <div>
            <strong>2. Iniciar el servicio:</strong>
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>cd email-service</li>
              <li>npm install</li>
              <li>npm run dev</li>
            </ul>
          </div>
          
          <div>
            <strong>3. Verificar funcionamiento:</strong>
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>Estado del servicio debe ser "ACTIVO"</li>
              <li>Enviar correo de prueba</li>
              <li>Verificar logs en consola</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailServiceAdmin;
