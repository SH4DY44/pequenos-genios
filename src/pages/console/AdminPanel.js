import React, { useState } from 'react';
import { crearActividades } from '../../utils/seedActividades';
import { toast } from 'react-toastify';
import EmailServiceAdmin from '../../components/admin/EmailServiceAdmin';
import EmailDemo from '../../components/demo/EmailDemo';

function AdminPanel() {
  const [seccionActiva, setSeccionActiva] = useState('general');

  const handleCrearActividades = async () => {
    const resultado = await crearActividades();
    if (resultado.success) {
      if (resultado.añadidas > 0) {
        toast.success(`Se añadieron ${resultado.añadidas} actividades nuevas. ${resultado.existentes} ya existían.`);
      } else {
        toast.info(`No se añadieron actividades nuevas. Todas las ${resultado.existentes} actividades ya existían.`);
      }
    } else {
      toast.error(`Error al crear las actividades: ${resultado.error}`);
    }
  };

  const secciones = [
    { id: 'general', nombre: 'General', icono: '⚙️' },
    { id: 'correos', nombre: 'Correos', icono: '📧' },
    { id: 'demo-email', nombre: 'Demo Email', icono: '🎬' },
    { id: 'usuarios', nombre: 'Usuarios', icono: '👥' },
    { id: 'estadisticas', nombre: 'Estadísticas', icono: '📊' }
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Panel de Administración</h2>
      
      {/* Navegación por pestañas */}
      <div className="mb-6">
        <nav className="flex space-x-4 border-b border-gray-200">
          {secciones.map((seccion) => (
            <button
              key={seccion.id}
              onClick={() => setSeccionActiva(seccion.id)}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
                seccionActiva === seccion.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {seccion.icono} {seccion.nombre}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido según la sección activa */}
      {seccionActiva === 'general' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Gestión de Datos</h3>
          <button 
            onClick={handleCrearActividades}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Crear/Actualizar Actividades
          </button>
        </div>
      )}

      {seccionActiva === 'correos' && (
        <EmailServiceAdmin />
      )}

      {seccionActiva === 'demo-email' && (
        <EmailDemo />
      )}

      {seccionActiva === 'usuarios' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Gestión de Usuarios</h3>
          <p className="text-gray-600">Funcionalidad de gestión de usuarios próximamente...</p>
        </div>
      )}

      {seccionActiva === 'estadisticas' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Estadísticas del Sistema</h3>
          <p className="text-gray-600">Estadísticas del sistema próximamente...</p>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;