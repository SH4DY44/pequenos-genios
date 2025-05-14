import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';

function Actividades({ perfilNino }) {
  const [actividades, setActividades] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas');
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  const categorias = [
    { id: 'todas', nombre: 'Todas las actividades' },
    { id: 'habilidades-sociales', nombre: 'Habilidades Sociales' },
    { id: 'atencion', nombre: 'Atención y Concentración' },
    { id: 'control-impulsos', nombre: 'Control de Impulsos' },
    { id: 'habilidades-motoras', nombre: 'Habilidades Motoras' },
    { id: 'habilidades-cognitivas', nombre: 'Habilidades Cognitivas' }
  ];

  useEffect(() => {
    const cargarActividades = async () => {
      setCargando(true);
      try {
        // Usar un nivel predeterminado si no hay perfil
        const nivelNino = perfilNino?.resultadosEvaluacion?.nivelAsignado?.nivel || 'básico';
        
        let actividadesQuery = collection(db, 'actividades');
        
        // Si hay una categoría seleccionada diferente a 'todas', filtramos
        if (categoriaSeleccionada !== 'todas') {
          actividadesQuery = query(
            actividadesQuery, 
            where('categoria', '==', categoriaSeleccionada)
          );
        }
        
        const snapshot = await getDocs(actividadesQuery);
        
        // Filtrar por nivel recomendado en el cliente o mostrar todas si incluye "todos"
        const actividadesFiltradas = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(actividad => 
            actividad.nivelRecomendado.includes(nivelNino) || 
            actividad.nivelRecomendado.includes('todos')
          );
          
        setActividades(actividadesFiltradas);
      } catch (error) {
        console.error("Error al cargar actividades:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarActividades();
  }, [categoriaSeleccionada, perfilNino]);

  const iniciarActividad = (actividadId, componente) => {
    console.log('Iniciando actividad:', actividadId);
    console.log('Perfil del niño:', perfilNino);
    
    navigate(`/console/actividad/${actividadId}`, { 
      state: { 
        perfilNino,
        componente 
      },
      replace: false  // Asegura que no reemplace la historia de navegación
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-[var(--primary-blue)] mb-6">
        Actividades Educativas
      </h2>
      
      {/* Filtro de categorías */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex space-x-2 pb-2">
          {categorias.map(categoria => (
            <button
              key={categoria.id}
              onClick={() => setCategoriaSeleccionada(categoria.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                categoriaSeleccionada === categoria.id
                  ? 'bg-[var(--primary-blue)] text-white'
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              }`}
            >
              {categoria.nombre}
            </button>
          ))}
        </div>
      </div>
      
      {/* Lista de actividades */}
      {cargando ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-md p-4 animate-pulse">
              <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : actividades.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {actividades.map(actividad => (
            <div 
              key={actividad.id} 
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div 
                className="h-40 bg-cover bg-center" 
                style={{ backgroundImage: `url(${actividad.imagenPortada})` }}
              ></div>
              <div className="p-4">
                <div className="flex items-center mb-2">
                  <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {categorias.find(c => c.id === actividad.categoria)?.nombre || actividad.categoria}
                  </span>
                  <span className="text-xs font-medium bg-purple-100 text-purple-800 px-2 py-1 rounded-full ml-2">
                    {actividad.duracionEstimada} min
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">{actividad.titulo}</h3>
                <p className="text-sm text-gray-600 mb-4">{actividad.descripcion}</p>
                <button
                  onClick={() => iniciarActividad(actividad.id, actividad.componente)}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 rounded-lg 
                            hover:from-blue-600 hover:to-indigo-700 transition-all font-medium"
                >
                  Comenzar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">No se encontraron actividades</h3>
          <p className="text-gray-500">
            No hay actividades disponibles para esta categoría en el nivel actual.
          </p>
        </div>
      )}
    </div>
  );
}

export default Actividades;