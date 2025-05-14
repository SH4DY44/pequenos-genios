import React from 'react';
import { crearActividades } from '../../utils/seedActividades';
import { toast } from 'react-toastify';

function AdminPanel() {
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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Panel de Administración</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Gestión de Datos</h3>
        <button 
          onClick={handleCrearActividades}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Crear/Actualizar Actividades
        </button>
      </div>
    </div>
  );
}

export default AdminPanel;